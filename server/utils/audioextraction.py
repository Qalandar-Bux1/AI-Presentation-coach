"""
Audio Extraction Module
Extracts audio from video files using ffmpeg
"""

import os
import subprocess
import tempfile
from pathlib import Path


def extract_audio(video_path: str, output_format: str = "wav") -> str:
    """
    Extract audio from video file using ffmpeg.
    
    Args:
        video_path: Path to the input video file
        output_format: Output audio format (wav, mp3, etc.)
    
    Returns:
        Path to the extracted audio file
    
    Raises:
        Exception: If audio extraction fails
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")
    
    # Create temporary directory for audio output
    temp_dir = tempfile.gettempdir()
    video_name = Path(video_path).stem
    audio_path = os.path.join(temp_dir, f"{video_name}_audio.{output_format}")
    
    try:
        # Use ffmpeg to extract audio
        # -i: input file
        # -vn: disable video
        # -acodec: audio codec (pcm_s16le for wav)
        # -ar: sample rate (16000 Hz for Whisper)
        # -ac: audio channels (mono)
        command = [
            "ffmpeg",
            "-i", video_path,
            "-vn",  # No video
            "-acodec", "pcm_s16le" if output_format == "wav" else "libmp3lame",
            "-ar", "16000",  # Sample rate for Whisper
            "-ac", "1",  # Mono channel
            "-y",  # Overwrite output file
            audio_path
        ]
        
        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg error: {result.stderr}")
        
        if not os.path.exists(audio_path):
            raise Exception("Audio file was not created")
        
        return audio_path
    
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found. Please install FFmpeg: "
            "https://ffmpeg.org/download.html"
        )
    except Exception as e:
        raise Exception(f"Failed to extract audio: {str(e)}")


def get_audio_duration(audio_path: str) -> float:
    """
    Get the duration of an audio file in seconds.
    
    Args:
        audio_path: Path to the audio file
    
    Returns:
        Duration in seconds
    """
    try:
        command = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            audio_path
        ]
        
        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if result.returncode == 0:
            return float(result.stdout.strip())
        else:
            raise Exception(f"Failed to get audio duration: {result.stderr}")
    
    except Exception as e:
        raise Exception(f"Error getting audio duration: {str(e)}")
