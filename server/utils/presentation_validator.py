"""
Presentation Validity Validator
Validates presentation quality before scoring to ensure evidence-based evaluation.
"""

from typing import Dict, Tuple, Optional


# Validation thresholds (evidence-based)
MIN_VIDEO_DURATION_SECONDS = 10.0  # Minimum 10 seconds for valid presentation
MIN_SPEECH_PERCENTAGE = 30.0  # At least 30% of video duration must have speech
MIN_FACE_PRESENCE_PERCENTAGE = 50.0  # Face must be visible in at least 50% of frames


def validate_presentation(
    video_duration: float,
    transcription_segments: list,
    face_presence_percentage: Optional[float],
    total_frames_analyzed: int = 0
) -> Tuple[bool, Optional[str], Dict]:
    """
    Validate presentation before scoring.
    
    Rejects evaluation if:
    - Video duration < 10 seconds
    - Total detected speech < 30% of video duration
    - Face visible in < 50% of frames
    
    Args:
        video_duration: Total video duration in seconds
        transcription_segments: List of transcription segments with timestamps
        face_presence_percentage: Percentage of frames with face detected (None if not analyzed yet)
        total_frames_analyzed: Total number of frames analyzed (for validation)
    
    Returns:
        Tuple of (is_valid: bool, rejection_reason: Optional[str], validation_details: Dict)
    """
    validation_details = {
        "video_duration_seconds": round(video_duration, 2),
        "speech_duration_seconds": 0.0,
        "speech_percentage": 0.0,
        "face_presence_percentage": face_presence_percentage,
        "meets_duration_threshold": False,
        "meets_speech_threshold": False,
        "meets_face_threshold": False
    }
    
    reasons = []
    
    # Validation 1: Video duration >= 10 seconds
    if video_duration < MIN_VIDEO_DURATION_SECONDS:
        reasons.append(f"Video is too short. Minimum presentation length is {int(MIN_VIDEO_DURATION_SECONDS)} seconds.")
        validation_details["meets_duration_threshold"] = False
    else:
        validation_details["meets_duration_threshold"] = True
    
    # Validation 2: Speech detected >= 30% of video duration
    # Calculate total speech duration from transcription segments
    speech_duration = 0.0
    if transcription_segments:
        for segment in transcription_segments:
            # Segment format: {"start": float, "end": float, "text": str}
            start = segment.get("start", 0)
            end = segment.get("end", 0)
            if end > start:
                speech_duration += (end - start)
    
    validation_details["speech_duration_seconds"] = round(speech_duration, 2)
    
    if video_duration > 0:
        speech_percentage = (speech_duration / video_duration) * 100.0
        validation_details["speech_percentage"] = round(speech_percentage, 2)
    else:
        speech_percentage = 0.0
    
    if speech_percentage < MIN_SPEECH_PERCENTAGE:
        reasons.append(
            f"Speech detected in only {speech_percentage:.1f}% of video duration "
            f"({speech_duration:.1f}s / {video_duration:.1f}s), "
            f"minimum {MIN_SPEECH_PERCENTAGE}% required"
        )
        validation_details["meets_speech_threshold"] = False
    else:
        validation_details["meets_speech_threshold"] = True
    
    # Validation 3: Face visible >= 50% of frames
    if face_presence_percentage is None:
        # Face analysis not yet performed - will be checked after video analysis
        validation_details["meets_face_threshold"] = None  # Pending
    elif face_presence_percentage < MIN_FACE_PRESENCE_PERCENTAGE:
        reasons.append(
            f"Face visible in only {face_presence_percentage:.1f}% of frames, "
            f"minimum {MIN_FACE_PRESENCE_PERCENTAGE}% required"
        )
        validation_details["meets_face_threshold"] = False
    else:
        validation_details["meets_face_threshold"] = True
    
    # If any validation fails, presentation is invalid
    is_valid = len(reasons) == 0
    
    rejection_reason = None if is_valid else "; ".join(reasons)
    
    return is_valid, rejection_reason, validation_details


def validate_face_presence_post_analysis(
    face_presence_percentage: Optional[float]
) -> Tuple[bool, Optional[str]]:
    """
    Validate face presence after video analysis completes.
    
    Args:
        face_presence_percentage: Percentage of frames with face detected
    
    Returns:
        Tuple of (meets_threshold: bool, reason: Optional[str])
    """
    if face_presence_percentage is None:
        return False, "Face detection analysis failed or not available"
    
    if face_presence_percentage < MIN_FACE_PRESENCE_PERCENTAGE:
        return False, (
            f"Face visible in only {face_presence_percentage:.1f}% of frames, "
            f"minimum {MIN_FACE_PRESENCE_PERCENTAGE}% required"
        )
    
    return True, None
