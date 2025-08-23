import os
from gtts import gTTS
from pathlib import Path
import pygame
import io

class GTTSConverter:
    def __init__(self):
        """
        Initialize the Google TTS converter
        """
        # Language code mapping for gTTS
        self.language_codes = {
            "English": "en",
            "Hindi": "hi",
            "Bengali": "bn", 
            "Tamil": "ta",
            "Telugu": "te",
            "Marathi": "mr",
            "Gujarati": "gu",
            "Punjabi": "pa",
            "Kannada": "kn",
            "Malayalam": "ml"
        }
        
        # Available TLD (Top Level Domain) options for better pronunciation
        self.tld_options = {
            "English": "com",
            "Hindi": "co.in",
            "Bengali": "co.in",
            "Tamil": "co.in", 
            "Telugu": "co.in",
            "Marathi": "co.in",
            "Gujarati": "co.in",
            "Punjabi": "co.in",
            "Kannada": "co.in",
            "Malayalam": "co.in"
        }

    def read_text_file(self, file_path):
        """
        Read text from file
        
        Args:
            file_path (str): Path to the text file
            
        Returns:
            str: Content of the file
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read().strip()
                if not content:
                    raise ValueError("Text file is empty")
                return content
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {file_path}")
        except Exception as e:
            raise Exception(f"Error reading file: {str(e)}")

    def convert_text_to_audio(self, text, language, slow=False):
        """
        Convert text to audio using Google TTS
        
        Args:
            text (str): Text to convert
            language (str): Language name (e.g., "Hindi", "English")
            slow (bool): Whether to use slow speech
            
        Returns:
            gTTS: gTTS object with audio data
        """
        if language not in self.language_codes:
            raise ValueError(f"Unsupported language: {language}. Supported: {list(self.language_codes.keys())}")
        
        language_code = self.language_codes[language]
        tld = self.tld_options.get(language, "com")
        
        try:
            print(f"Converting text to audio using Google TTS...")
            print(f"Language: {language} ({language_code})")
            print(f"Text length: {len(text)} characters")
            print(f"Slow speech: {slow}")
            
            # Create gTTS object
            tts = gTTS(
                text=text,
                lang=language_code,
                slow=slow,
                tld=tld
            )
            
            return tts
            
        except Exception as e:
            raise Exception(f"Error during conversion: {str(e)}")

    def save_audio(self, tts_object, output_path):
        """
        Save gTTS audio to file
        
        Args:
            tts_object (gTTS): gTTS object
            output_path (str): Path to save the audio file
        """
        try:
            # Ensure output directory exists
            output_dir = os.path.dirname(output_path)
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
            
            # Save the audio file
            tts_object.save(output_path)
            
            # Get file size
            file_size = os.path.getsize(output_path)
            
            print(f"Audio saved successfully: {output_path}")
            print(f"File size: {file_size} bytes")
            
        except Exception as e:
            raise Exception(f"Error saving audio file: {str(e)}")

    def play_audio(self, audio_path):
        """
        Play audio file using pygame
        
        Args:
            audio_path (str): Path to audio file
        """
        try:
            pygame.mixer.init()
            pygame.mixer.music.load(audio_path)
            pygame.mixer.music.play()
            
            print(f"Playing audio: {audio_path}")
            print("Press Enter to stop playback...")
            
            # Wait for user input to stop
            while pygame.mixer.music.get_busy():
                if input() == "":
                    pygame.mixer.music.stop()
                    break
                    
        except Exception as e:
            print(f"Error playing audio: {str(e)}")
            print("Install pygame to enable audio playback: pip install pygame")

    def convert_file_to_audio(self, text_file_path, language, output_path=None, slow=False, play_after=False):
        """
        Complete workflow: read text file and convert to audio
        
        Args:
            text_file_path (str): Path to input text file
            language (str): Language name
            output_path (str, optional): Path for output audio file
            slow (bool): Use slow speech
            play_after (bool): Play audio after conversion
            
        Returns:
            str: Path to the generated audio file
        """
        # Read text from file
        print(f"Reading text file: {text_file_path}")
        text = self.read_text_file(text_file_path)
        print(f"Text loaded successfully ({len(text)} characters)")
        
        # Generate output path if not provided
        if output_path is None:
            input_path = Path(text_file_path)
            output_path = str(input_path.parent / f"{input_path.stem}_{language.lower()}_audio.mp3")
        
        # Convert text to audio
        tts_object = self.convert_text_to_audio(text, language, slow)
        
        # Save audio file
        self.save_audio(tts_object, output_path)
        
        # Play audio if requested
        if play_after:
            try:
                self.play_audio(output_path)
            except:
                print("Could not play audio automatically")
        
        return output_path

    def text_to_speech_direct(self, text, language, slow=False, play_immediately=True):
        """
        Convert text to speech and play immediately without saving
        
        Args:
            text (str): Text to convert
            language (str): Language name
            slow (bool): Use slow speech
            play_immediately (bool): Play audio immediately
        """
        try:
            tts = self.convert_text_to_audio(text, language, slow)
            
            # Save to temporary memory buffer
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            
            if play_immediately:
                # Save temporarily and play
                temp_file = "temp_audio.mp3"
                with open(temp_file, "wb") as f:
                    f.write(fp.read())
                
                self.play_audio(temp_file)
                
                # Clean up temp file
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            
            return fp
            
        except Exception as e:
            raise Exception(f"Error in direct text-to-speech: {str(e)}")

    def get_supported_languages(self):
        """
        Get list of supported languages
        
        Returns:
            list: Supported language names
        """
        return list(self.language_codes.keys())


def main():
    """
    Example usage of the GTTSConverter
    """
    # Configuration
    TEXT_FILE_PATH = "prescription_transcription_hindi.txt"  # Path to your text file
    LANGUAGE = "Hindi"  # Choose from supported languages
    OUTPUT_PATH = "output_audio.mp3"  # Optional: specify output path
    SLOW_SPEECH = False  # Set to True for slower speech
    
    try:
        # Initialize converter
        converter = GTTSConverter()
        
        # Show supported languages
        print("Supported languages:", converter.get_supported_languages())
        print()
        
        # Convert file to audio
        output_file = converter.convert_file_to_audio(
            text_file_path='prescription_transcription_hindi.txt',
            language=LANGUAGE,
            output_path=OUTPUT_PATH,
            slow=SLOW_SPEECH,
            play_after=False  # Set to True to play after conversion
        )
        
        print(f"\n Conversion completed successfully!")
        print(f"Audio file saved: {output_file}")
        
        # Ask if user wants to play the audio
        play_choice = input("\nDo you want to play the audio? (y/n): ").lower().strip()
        if play_choice in ['y', 'yes']:
            converter.play_audio(output_file)
        
    except Exception as e:
        print(f"\nError: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Make sure the text file exists and is readable")
        print("2. Check your internet connection (gTTS requires internet)")
        print("3. Verify the language is supported")
        print("4. Install required packages: pip install gtts pygame")


def interactive_mode():
    """
    Interactive mode for quick text-to-speech conversion
    """
    converter = GTTSConverter()
    
    print("Interactive Text-to-Speech Mode")
    print("Supported languages:", ", ".join(converter.get_supported_languages()))
    print("Type 'quit' to exit\n")
    
    while True:
        try:
            # Get text input
            text = input("Enter text to convert: ").strip()
            if text.lower() == 'quit':
                break
            
            if not text:
                print("Please enter some text!")
                continue
            
            # Get language
            language = input("Enter language (default: English): ").strip()
            if not language:
                language = "English"
            
            # Convert and play
            print(f"Converting '{text[:50]}...' to {language}")
            converter.text_to_speech_direct(text, language, play_immediately=True)
            
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {str(e)}")


if __name__ == "__main__":
    # Uncomment the mode you want to use:
    
    # 1. File conversion mode
    main()
    
    # 2. Interactive mode
    # interactive_mode()
    
    