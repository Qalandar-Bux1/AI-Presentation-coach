"""
Transcription Module
Converts speech to text using OpenAI Whisper
"""

import whisper
import os
import tempfile


# Global model instance (loaded once for efficiency)
_whisper_model = None


def load_whisper_model(model_size: str = "tiny"):
    """
    Load Whisper model (lazy loading for efficiency).
    
    Args:
        model_size: Model size (tiny, base, small, medium, large)
                   tiny is faster and smaller (~75MB vs ~150MB for base)
                   Good for short videos and faster analysis
    """
    global _whisper_model
    if _whisper_model is None:
        print(f"[Whisper] Loading model: {model_size}...")
        print(f"[Whisper] Note: First-time download may take a few minutes (~75MB for tiny model)")
        print(f"[Whisper] Model will be cached for future use")
        try:
            _whisper_model = whisper.load_model(model_size)
            print(f"[Whisper] ✅ Model '{model_size}' loaded successfully!")
        except Exception as e:
            print(f"[Whisper] ❌ Error loading model: {str(e)}")
            raise Exception(f"Failed to load Whisper model: {str(e)}")
    return _whisper_model


def transcribe_audio(audio_path: str, model_size: str = "tiny") -> dict:
    """
    Transcribe audio to text using Whisper.
    
    Args:
        audio_path: Path to the audio file
        model_size: Whisper model size (tiny, base, small, medium, large)
    
    Returns:
        Dictionary containing:
        - text: Full transcribed text
        - segments: List of segments with timestamps
        - language: Detected language
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    try:
        # Load model
        model = load_whisper_model(model_size)
        
        # Transcribe audio (optimized for speed)
        print(f"Transcribing audio: {audio_path}")
        try:
            result = model.transcribe(
                audio_path,
                language="en",  # Force English (faster than auto-detect)
                task="transcribe",
                verbose=False,
                temperature=0.0,  # Use deterministic decoding for faster processing
                condition_on_previous_text=False,  # Disable for faster processing
                fp16=True  # Use half precision for faster inference (if GPU available)
            )
        except Exception as fp16_error:
            # Fallback if fp16 is not supported (e.g., CPU-only systems)
            print(f"[Whisper] fp16 not supported, using default precision: {str(fp16_error)}")
            result = model.transcribe(
                audio_path,
                language="en",
                task="transcribe",
                verbose=False,
                temperature=0.0,
                condition_on_previous_text=False
            )
        
        return {
            "text": result["text"].strip(),
            "segments": result.get("segments", []),
            "language": result.get("language", "en")
        }
    
    except Exception as e:
        raise Exception(f"Transcription failed: {str(e)}")


def get_transcription_with_timestamps(audio_path: str) -> list:
    """
    Get transcription with word-level timestamps.
    
    Args:
        audio_path: Path to the audio file
    
    Returns:
        List of dictionaries with word, start, and end times
    """
    try:
        model = load_whisper_model()
        result = model.transcribe(audio_path, word_timestamps=True)
        
        words = []
        for segment in result.get("segments", []):
            for word_info in segment.get("words", []):
                words.append({
                    "word": word_info["word"].strip(),
                    "start": word_info["start"],
                    "end": word_info["end"]
                })
        
        return words
    
    except Exception as e:
        raise Exception(f"Failed to get word timestamps: {str(e)}")
