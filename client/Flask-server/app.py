from flask import Flask, request, jsonify, render_template
import os
from werkzeug.utils import secure_filename
import google.generativeai as genai
import PIL.Image
from PIL import ImageEnhance, ImageFilter
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
import tempfile

# Load environment variables from .env file
load_dotenv()

# Your PrescriptionOCR class
class PrescriptionOCR:
    def __init__(self, api_key):
        """Initialize Prescription OCR with API key"""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    def preprocess_image(self, image_path, enhance=True):
        """Preprocess prescription image for better OCR results"""
        image = PIL.Image.open(image_path) 
        
        if enhance:
            if image.mode != 'L':
                image = image.convert('L')
            
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(2.0)
            
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(2.0)
            
            image = image.filter(ImageFilter.GaussianBlur(radius=0.5))
        
        return image
    
    def extract_prescription_details(self, image_path, enhance_image=True):
        """Extract detailed prescription information from doctor's handwriting"""
        try:
            if enhance_image:
                image = self.preprocess_image(image_path)
            else:
                image = PIL.Image.open(image_path)
            
            prompt = """
            You are a medical transcription expert. Analyze this prescription image and extract information in JSON format.
            
            Return ONLY a valid JSON object with this exact structure:
            {
                "doctor": {
                    "name": "doctor name or null",
                    "qualifications": "degrees/qualifications or null",
                    "registration_number": "reg number or null",
                    "clinic_name": "clinic/hospital name or null",
                    "address": "clinic address or null",
                    "phone": "phone number or null"
                },
                "patient": {
                    "name": "patient name or null",
                    "age": "age or null",
                    "gender": "gender or null",
                    "address": "patient address or null",
                    "prescription_date": "date or null"
                },
                "medications": [
                    {
                        "name": "medicine name",
                        "dosage": "strength/dosage",
                        "quantity": "quantity prescribed",
                        "frequency": "how often to take",
                        "duration": "how long to take",
                        "instructions": "special instructions",
                        "uncertain": false
                    }
                ],
                "additional_notes": {
                    "special_instructions": "any special instructions or null",
                    "follow_up": "follow-up date or instructions or null",
                    "warnings": "warnings or precautions or null"
                },
                "extraction_notes": "any unclear text or reading difficulties"
            }
            
            Rules:
            
            1. Use **null** for fields that are absent or unreadable.  
            2. If any reading is doubtful, copy the raw text into `instructions` and set `"uncertain": true`.

            3. **Interpreting timing codes**

            • `1` or `X`  =  **take**  
            • `0` or `O`  =  **skip** **unless** the code has **only O-O**, then treat each O as **take**.  
            • Code length → times:  
                - 1 slot → once daily  
                - 2 slots → morning & night  
                - 3 slots → morning, afternoon, night  
                - 4 slots → every 6 hours  
            • Expand the code into clear English in `frequency`, repeating any fractional dose in each phrase.

            4. If brand name is given in prescription, output brand name. Don't convert it to generic drug name.
                If dosage is mentioned with name, let it be mentioned in the name, besides giving it seperately in the output. For example, if "Rantac 300" is given, output that, not "Rantac" or "Ranitidine".
            5. Output only the final JSON – no other text, commentary, or markup.
            """
            
            response = self.model.generate_content([prompt, image])
            
            # Try to parse the JSON response
            try:
                json_data = json.loads(response.text.strip())
                return {
                    'success': True,
                    'data': json_data,
                    'extraction_date': datetime.now().isoformat(),
                    'image_path': os.path.basename(image_path)
                }
            except json.JSONDecodeError:
                # If JSON parsing fails, return raw text as fallback
                return {
                    'success': True,
                    'data': {
                        'raw_response': response.text,
                        'note': 'Could not parse as JSON, returning raw text'
                    },
                    'extraction_date': datetime.now().isoformat(),
                    'image_path': os.path.basename(image_path)
                }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Error processing prescription: {str(e)}"
            }

# GeminiTranslator class
class GeminiTranslator:
    def __init__(self, api_key):
        """Initialize Gemini Translator with API key"""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    def translate_text_with_context(self, text, target_language, context_info=""):
        """
        Translate text with additional context for better accuracy
        
        Args:
            text (str): Text to translate
            target_language (str): Target language
            context_info (str): Additional context (e.g., "medical document", "technical manual")
        
        Returns:
            dict: Translation result with success status and translated text
        """
        try:
            context_prompt = ""
            if context_info:
                context_prompt = f"This is a {context_info}. Please translate accordingly with appropriate terminology."
            
            prompt = f"""
            Please translate the following English text to {target_language}.
            {context_prompt}
            
            Maintain the original formatting, paragraph breaks, and style.
            Provide a natural, fluent translation that preserves the meaning and tone.
            
            Text to translate:
            {text}
            """
            
            response = self.model.generate_content(prompt)
            translated_text = response.text
            
            return {
                'success': True,
                'original_text': text,
                'translated_text': translated_text,
                'target_language': target_language,
                'context_info': context_info,
                'translation_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Error in translation: {str(e)}"
            }

# Flask app setup
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create uploads directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Get API key from environment variable
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")

# Initialize OCR and Translator with API key from environment
ocr = PrescriptionOCR(GEMINI_API_KEY)
translator = GeminiTranslator(GEMINI_API_KEY)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Serve the main page with upload form"""
    return render_template('index.html')

@app.route('/api/extract', methods=['POST'])
def extract_prescription():
    """API endpoint to extract prescription details from uploaded image"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract prescription details
        result = ocr.extract_prescription_details(filepath)
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """API endpoint to translate text with context using Gemini"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        text = data.get('text')
        target_language = data.get('target_language')
        
        if not text:
            return jsonify({'success': False, 'error': 'Text field is required'}), 400
        
        if not target_language:
            return jsonify({'success': False, 'error': 'Target language field is required'}), 400
        
        # Optional context information
        context_info = data.get('context_info', '')
        
        # Perform translation
        result = translator.translate_text_with_context(
            text=text,
            target_language=target_language,
            context_info=context_info
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/translate-file', methods=['POST'])
def translate_file():
    """API endpoint to translate text file with context"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Check if file is a text file
        if not file.filename.lower().endswith('.txt'):
            return jsonify({'success': False, 'error': 'Only .txt files are allowed'}), 400
        
        # Get form data
        target_language = request.form.get('target_language')
        context_info = request.form.get('context_info', '')
        
        if not target_language:
            return jsonify({'success': False, 'error': 'Target language is required'}), 400
        
        # Read file content
        file_content = file.read().decode('utf-8')
        
        # Perform translation
        result = translator.translate_text_with_context(
            text=file_content,
            target_language=target_language,
            context_info=context_info
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/languages', methods=['GET'])
def get_supported_languages():
    """API endpoint to get list of supported languages"""
    languages = [
        "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", 
        "Gujarati", "Punjabi", "Kannada", "Malayalam",
        "Spanish", "French", "German", "Italian", "Portuguese",
        "Chinese", "Japanese", "Korean", "Russian", "Arabic"
    ]
    
    return jsonify({
        'success': True,
        'languages': languages,
        'total': len(languages)
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    print("Starting Prescription OCR & Translation Flask Server...")
    app.run(debug=True, host='0.0.0.0', port=5000)