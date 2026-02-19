"""
Analysis Eligibility Validator
Hard rules that determine if a video is eligible for analysis.
Returns warnings instead of failures for poor quality videos.
"""

from typing import Dict, Tuple, List, Optional


# Hard eligibility thresholds
MIN_VIDEO_DURATION_SECONDS = 10.0
MIN_WORD_COUNT = 10
MIN_TOTAL_FRAMES = 50


def check_analysis_eligibility(
    video_duration: float,
    audio_present: bool,
    word_count: int,
    total_frames: int
) -> Tuple[bool, List[str], Dict]:
    """
    Check if video meets hard eligibility requirements for analysis.
    
    Hard Rules:
    - video_duration >= 10 seconds
    - audio track exists
    - speech_detected == true AND word_count >= 10
    - total_video_frames >= 50
    
    Args:
        video_duration: Video duration in seconds
        audio_present: Whether audio track exists
        word_count: Number of words detected in transcription
        total_frames: Total number of frames in video
    
    Returns:
        Tuple of (is_eligible: bool, warnings: List[str], eligibility_details: Dict)
    """
    warnings = []
    eligibility_details = {
        "video_duration_seconds": round(video_duration, 2),
        "audio_present": audio_present,
        "word_count": word_count,
        "total_frames": total_frames,
        "meets_duration_requirement": False,
        "meets_audio_requirement": False,
        "meets_speech_requirement": False,
        "meets_frames_requirement": False
    }
    
    # Rule 1: Video duration >= 10 seconds
    if video_duration < MIN_VIDEO_DURATION_SECONDS:
        warnings.append(f"Video duration ({video_duration:.1f}s) is less than minimum required ({MIN_VIDEO_DURATION_SECONDS}s)")
        eligibility_details["meets_duration_requirement"] = False
    else:
        eligibility_details["meets_duration_requirement"] = True
    
    # Rule 2: Audio track exists
    if not audio_present:
        warnings.append("No audio track detected in video")
        eligibility_details["meets_audio_requirement"] = False
    else:
        eligibility_details["meets_audio_requirement"] = True
    
    # Rule 3: Speech detected AND word_count >= 10
    speech_detected = word_count >= MIN_WORD_COUNT
    if not speech_detected:
        warnings.append(f"Insufficient speech detected ({word_count} words, minimum {MIN_WORD_COUNT} required)")
        eligibility_details["meets_speech_requirement"] = False
    else:
        eligibility_details["meets_speech_requirement"] = True
    
    # Rule 4: Total frames >= 50
    if total_frames < MIN_TOTAL_FRAMES:
        warnings.append(f"Insufficient video frames ({total_frames} frames, minimum {MIN_TOTAL_FRAMES} required)")
        eligibility_details["meets_frames_requirement"] = False
    else:
        eligibility_details["meets_frames_requirement"] = True
    
    # Video is eligible if ALL rules pass
    is_eligible = len(warnings) == 0
    
    return is_eligible, warnings, eligibility_details
