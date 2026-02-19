"""
Audio Analysis Module
Analyzes audio characteristics: WPM, filler words, pitch, volume stability
"""

import librosa
import numpy as np
from typing import Dict, List, Tuple
import re


# Common filler words to detect
FILLER_WORDS = [
    "um", "uh", "er", "ah", "like", "you know", "so", "well",
    "actually", "basically", "literally", "right", "okay", "ok"
]


def calculate_wpm(text: str, duration_seconds: float) -> float:
    """
    Calculate Words Per Minute (WPM).
    
    Args:
        text: Transcribed text
        duration_seconds: Audio duration in seconds
    
    Returns:
        Words per minute
    """
    if duration_seconds <= 0:
        return 0.0
    
    # Count words (split by whitespace)
    words = text.split()
    word_count = len(words)
    
    # Calculate WPM
    wpm = (word_count / duration_seconds) * 60
    
    return round(wpm, 2)


def count_filler_words(text: str) -> Dict[str, int]:
    """
    Count occurrences of filler words in the text.
    
    Args:
        text: Transcribed text (lowercase for matching)
    
    Returns:
        Dictionary with filler word counts and total
    """
    text_lower = text.lower()
    
    filler_counts = {}
    total_fillers = 0
    
    for filler in FILLER_WORDS:
        # Count occurrences (word boundaries to avoid partial matches)
        pattern = r'\b' + re.escape(filler) + r'\b'
        count = len(re.findall(pattern, text_lower))
        if count > 0:
            filler_counts[filler] = count
            total_fillers += count
    
    return {
        "breakdown": filler_counts,
        "total": total_fillers,
        "percentage": round((total_fillers / max(len(text.split()), 1)) * 100, 2)
    }


def analyze_pitch(audio_path: str) -> Dict[str, float]:
    """
    Analyze pitch characteristics of the audio.
    
    Args:
        audio_path: Path to the audio file
    
    Returns:
        Dictionary with pitch statistics
    """
    try:
        # Load audio
        y, sr = librosa.load(audio_path, sr=16000)
        
        # Extract pitch using librosa's pitch tracking
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        
        # Get pitch values (Hz) where magnitude is significant
        pitch_values = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:  # Valid pitch
                pitch_values.append(pitch)
        
        if not pitch_values:
            return {
                "mean": 0.0,
                "std": 0.0,
                "stability_score": 0.0,
                "min": 0.0,
                "max": 0.0
            }
        
        pitch_array = np.array(pitch_values)
        
        # Calculate statistics
        mean_pitch = np.mean(pitch_array)
        std_pitch = np.std(pitch_array)
        min_pitch = np.min(pitch_array)
        max_pitch = np.max(pitch_array)
        
        # Stability score: lower std = more stable (0-100 scale)
        # Normalize: assume std < 50 Hz is good stability
        stability_score = max(0, 100 - (std_pitch / 50) * 100)
        stability_score = min(100, stability_score)
        
        return {
            "mean": round(float(mean_pitch), 2),
            "std": round(float(std_pitch), 2),
            "stability_score": round(float(stability_score), 2),
            "min": round(float(min_pitch), 2),
            "max": round(float(max_pitch), 2)
        }
    
    except Exception as e:
        print(f"Pitch analysis error: {str(e)}")
        return {
            "mean": 0.0,
            "std": 0.0,
            "stability_score": 50.0,  # Default neutral score
            "min": 0.0,
            "max": 0.0
        }


def analyze_volume(audio_path: str) -> Dict[str, float]:
    """
    Analyze volume characteristics of the audio.
    
    Args:
        audio_path: Path to the audio file
    
    Returns:
        Dictionary with volume statistics
    """
    try:
        # Load audio
        y, sr = librosa.load(audio_path, sr=16000)
        
        # Calculate RMS energy (volume)
        frame_length = 2048
        hop_length = 512
        rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
        
        # Convert to decibels
        rms_db = librosa.power_to_db(rms**2)
        
        # Calculate statistics
        mean_volume = np.mean(rms_db)
        std_volume = np.std(rms_db)
        min_volume = np.min(rms_db)
        max_volume = np.max(rms_db)
        
        # Stability score: lower std = more stable (0-100 scale)
        # Normalize: assume std < 10 dB is good stability
        stability_score = max(0, 100 - (std_volume / 10) * 100)
        stability_score = min(100, stability_score)
        
        # Volume level score (0-100): optimal range is -20 to -12 dB
        if mean_volume < -30:
            volume_level_score = 30  # Too quiet
        elif mean_volume < -20:
            volume_level_score = 60  # Slightly quiet
        elif mean_volume <= -12:
            volume_level_score = 100  # Optimal
        elif mean_volume <= -6:
            volume_level_score = 80  # Slightly loud
        else:
            volume_level_score = 50  # Too loud
        
        return {
            "mean_db": round(float(mean_volume), 2),
            "std_db": round(float(std_volume), 2),
            "stability_score": round(float(stability_score), 2),
            "level_score": round(float(volume_level_score), 2),
            "min": round(float(min_volume), 2),
            "max": round(float(max_volume), 2)
        }
    
    except Exception as e:
        print(f"Volume analysis error: {str(e)}")
        return {
            "mean_db": 0.0,
            "std_db": 0.0,
            "stability_score": 50.0,
            "level_score": 50.0,
            "min": 0.0,
            "max": 0.0
        }


def analyze_audio_complete(audio_path: str, text: str, duration: float) -> Dict:
    """
    Complete audio analysis combining all metrics.
    
    Args:
        audio_path: Path to the audio file
        text: Transcribed text
        duration: Audio duration in seconds
    
    Returns:
        Complete audio analysis dictionary
    """
    wpm = calculate_wpm(text, duration)
    filler_analysis = count_filler_words(text)
    pitch_analysis = analyze_pitch(audio_path)
    volume_analysis = analyze_volume(audio_path)
    
    return {
        "speaking_speed": {
            "wpm": wpm,
            "assessment": _assess_wpm(wpm)
        },
        "filler_words": filler_analysis,
        "pitch": pitch_analysis,
        "volume": volume_analysis,
        "duration_seconds": round(duration, 2)
    }


def _assess_wpm(wpm: float) -> str:
    """Assess WPM and return feedback category."""
    if wpm < 120:
        return "too_slow"
    elif wpm <= 160:
        return "optimal"
    elif wpm <= 180:
        return "slightly_fast"
    else:
        return "too_fast"
