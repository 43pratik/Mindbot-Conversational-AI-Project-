import whisper
import warnings
import os

# Suppress annoying warnings
warnings.filterwarnings("ignore")

print("Loading Whisper model into memory... (This takes a few seconds)")
# We load it globally here so it only loads once when the server starts, making API calls instant
model = whisper.load_model("base")

def transcribe_audio(file_path: str) -> str:
    """
    Takes an audio file path, transcribes it using Whisper, and returns the text.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found at {file_path}")
    
    # Transcribe the audio
    result = model.transcribe(file_path)
    return result["text"].strip()