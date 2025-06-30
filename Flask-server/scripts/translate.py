import google.generativeai as genai
import os
from pathlib import Path
import time
from datetime import datetime

class GeminiTranslator:
    def __init__(self, api_key):
        """Initialize Gemini Translator with API key"""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    
    
    def translate_with_context(self, input_file, target_language, context_info="", output_file=None):
        """
        Translate with additional context for better accuracy
        
        Args:
            input_file (str): Input file path
            target_language (str): Target language
            context_info (str): Additional context (e.g., "medical document", "technical manual")
            output_file (str): Output file path
        
        Returns:
            str: Translated text
        """
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                original_text = f.read()
            
            context_prompt = ""
            if context_info:
                context_prompt = f"This is a {context_info}. Please translate accordingly with appropriate terminology."
            
            prompt = f"""
            Please translate the following English text to {target_language}.
            {context_prompt}
            
            Maintain the original formatting, paragraph breaks, and style.
            Provide a natural, fluent translation that preserves the meaning and tone.
            
            Text to translate:
            {original_text}
            """
            
            print(f"Translating with context: {context_info}")
            print(f"Target language: {target_language}")
            
            response = self.model.generate_content(prompt)
            translated_text = response.text
            
            # Print and save
            print(f"Translated Text:")
            print("=" * 50)
            print(translated_text)
            print("=" * 50)
            
            if output_file is None:
                input_path = Path(input_file)
                output_file = f"{input_path.stem}_{target_language.lower()}_contextual{input_path.suffix}"
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(translated_text)
            
            print(f"Translation saved to: {output_file}")
            return translated_text
            
        except Exception as e:
            print(f"Error in contextual translation: {str(e)}")
            return None
        
# Example usage
def main():
    # Initialize translator with your API key
    api_key = os.getenv("GEMINI_API_KEY")
    translator = GeminiTranslator(api_key)
    
    lang = input("Enter language to translate into: ")
    # Example 3: Translation with context
    print("\nExample 3: Contextual Translation")
    translator.translate_with_context(
        input_file="prescription_transcription.txt",
        target_language = lang,
        context_info="medical document",
        output_file=f"prescription_transcription_{lang.lower()}.txt"
    )
    
if __name__ == "__main__":  
    languages = ["Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Punjabi", "Kannada", "Malayalam"]
    main()