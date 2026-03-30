"""
Transcription Module
Converts speech to text using OpenAI Whisper
"""

import os
import whisper
from pathlib import Path

from utils.path_utils import get_whisper_models_dir, is_packaged

_whisper_model = None
_loaded_size = None


def resolve_whisper_model_size() -> str:
    """
    Whisper model name to load.
    - If WHISPER_MODEL_SIZE is set, use it (tiny, base, small, ...).
    - Else if bundled base.pt exists under server/models/whisper/, use base.
    - Else default to tiny (fastest dev experience).
    """
    env = (os.getenv("WHISPER_MODEL_SIZE") or "").strip().lower()
    if env:
        return env
    base_pt = Path(get_whisper_models_dir()) / "base.pt"
    if base_pt.is_file():
        return "base"
    return "tiny"


def load_whisper_model(model_size: str | None = None):
    """
    Load Whisper model (lazy loading for efficiency).
    Uses download_root pointing at bundled server/models/whisper for offline-capable packaged builds.
    """
    global _whisper_model, _loaded_size

    if model_size is None:
        model_size = resolve_whisper_model_size()

    if _whisper_model is not None and _loaded_size == model_size:
        return _whisper_model

    download_root = get_whisper_models_dir()
    os.makedirs(download_root, exist_ok=True)

    # Offline-capable behavior: in packaged mode, fail fast if model weights are missing.
    expected_file = Path(download_root) / f"{model_size}.pt"
    if is_packaged() and not expected_file.is_file():
        raise FileNotFoundError(
            f"Whisper model file not found: {expected_file}\n"
            f"Place the model weights under: {expected_file.parent} (e.g., base.pt or tiny.pt) before building the desktop app.\n"
            f"You can generate them with: scripts\\download_bundled_assets.py --whisper-only --whisper {model_size}"
        )

    print(f"[Whisper] Loading model: {model_size}...")
    print(f"[Whisper] download_root={download_root}")
    print("[Whisper] Note: first run may download weights if the .pt file is not present yet")

    try:
        _whisper_model = whisper.load_model(model_size, download_root=download_root)
        _loaded_size = model_size
        print(f"[Whisper] OK: Model '{model_size}' loaded successfully!")
    except Exception as e:
        print(f"[Whisper] ERROR: Error loading model: {str(e)}")
        _whisper_model = None
        _loaded_size = None
        raise Exception(f"Failed to load Whisper model: {str(e)}") from e

    return _whisper_model


def transcribe_audio(audio_path: str, model_size: str | None = None) -> dict:
    """
    Transcribe audio to text using Whisper.

    Args:
        audio_path: Path to the audio file
        model_size: Whisper model size (optional; defaults to resolve_whisper_model_size())

    Returns:
        Dictionary containing text, segments, language
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    if model_size is None:
        model_size = resolve_whisper_model_size()

    try:
        model = load_whisper_model(model_size)

        print(f"Transcribing audio: {audio_path}")
        try:
            result = model.transcribe(
                audio_path,
                language="en",
                task="transcribe",
                verbose=False,
                temperature=0.0,
                condition_on_previous_text=False,
                fp16=True,
            )
        except Exception as fp16_error:
            print(f"[Whisper] fp16 not supported, using default precision: {str(fp16_error)}")
            result = model.transcribe(
                audio_path,
                language="en",
                task="transcribe",
                verbose=False,
                temperature=0.0,
                condition_on_previous_text=False,
            )

        return {
            "text": result["text"].strip(),
            "segments": result.get("segments", []),
            "language": result.get("language", "en"),
        }

    except Exception as e:
        raise Exception(f"Transcription failed: {str(e)}") from e


def get_transcription_with_timestamps(audio_path: str) -> list:
    """
    Get transcription with word-level timestamps.
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
                    "end": word_info["end"],
                })

        return words

    except Exception as e:
        raise Exception(f"Failed to get word timestamps: {str(e)}") from e
