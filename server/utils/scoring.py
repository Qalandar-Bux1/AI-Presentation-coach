"""
Scoring Module
Calculates weighted scores for different presentation aspects
"""

from typing import Dict


def calculate_voice_delivery_score(audio_analysis: Dict) -> Dict:
    """
    Calculate Voice & Delivery score (30% weight).
    
    Components:
    - Speaking speed (WPM): optimal range 120-160
    - Filler words: fewer is better
    - Pitch stability: consistent pitch
    - Volume stability: consistent volume
    
    Args:
        audio_analysis: Dictionary from audio_analyzer.analyze_audio_complete()
    
    Returns:
        Dictionary with score breakdown (null if invalid data)
    """
    wpm = audio_analysis.get("speaking_speed", {}).get("wpm")
    filler_percentage = audio_analysis.get("filler_words", {}).get("percentage")
    pitch_stability = audio_analysis.get("pitch", {}).get("stability_score")
    volume_stability = audio_analysis.get("volume", {}).get("stability_score")
    volume_level = audio_analysis.get("volume", {}).get("level_score")
    
    # Check if any required values are null
    if wpm is None or filler_percentage is None or pitch_stability is None or volume_stability is None or volume_level is None:
        return {
            "overall_score": None,
            "components": {
                "wpm_score": None,
                "filler_score": None,
                "pitch_stability": pitch_stability,
                "volume_stability": volume_stability,
                "volume_level": volume_level
            },
            "weight": 0.30,
            "label": "N/A"
        }
    
    # WPM score (0-100)
    if 120 <= wpm <= 160:
        wpm_score = 100
    elif 100 <= wpm < 120:
        wpm_score = 80
    elif 160 < wpm <= 180:
        wpm_score = 80
    elif 80 <= wpm < 100:
        wpm_score = 60
    elif 180 < wpm <= 200:
        wpm_score = 60
    else:
        wpm_score = 40
    
    # Filler words score (0-100): lower percentage is better
    if filler_percentage < 2:
        filler_score = 100
    elif filler_percentage < 5:
        filler_score = 80
    elif filler_percentage < 10:
        filler_score = 60
    else:
        filler_score = 40
    
    # Weighted components
    voice_score = (
        wpm_score * 0.3 +
        filler_score * 0.3 +
        pitch_stability * 0.2 +
        volume_stability * 0.1 +
        volume_level * 0.1
    )
    
    return {
        "overall_score": round(voice_score, 2),
        "components": {
            "wpm_score": round(wpm_score, 2),
            "filler_score": round(filler_score, 2),
            "pitch_stability": round(pitch_stability, 2),
            "volume_stability": round(volume_stability, 2),
            "volume_level": round(volume_level, 2)
        },
        "weight": 0.30
    }


def calculate_content_quality_score(text_analysis: Dict) -> Dict:
    """
    Calculate Content Quality score (30% weight).
    
    Components:
    - Grammar quality
    - Repetition (lower is better)
    - Structure (intro, body, conclusion)
    
    Args:
        text_analysis: Dictionary from text_analyzer.analyze_text_complete()
    
    Returns:
        Dictionary with score breakdown (null if invalid data)
    """
    grammar_score = text_analysis.get("grammar", {}).get("score")
    repetition_score = text_analysis.get("repetition", {}).get("repetition_score")
    structure_score = text_analysis.get("structure", {}).get("structure_score")
    
    # Check if any required values are null
    if grammar_score is None or repetition_score is None or structure_score is None:
        return {
            "overall_score": None,
            "components": {
                "grammar_score": grammar_score,
                "repetition_score": repetition_score,
                "structure_score": structure_score
            },
            "weight": 0.30,
            "label": "N/A"
        }
    
    # Weighted components
    content_score = (
        grammar_score * 0.4 +
        repetition_score * 0.3 +
        structure_score * 0.3
    )
    
    return {
        "overall_score": round(content_score, 2),
        "components": {
            "grammar_score": round(grammar_score, 2),
            "repetition_score": round(repetition_score, 2),
            "structure_score": round(structure_score, 2)
        },
        "weight": 0.30
    }


def calculate_confidence_body_language_score(video_analysis: Dict, face_detected: bool = True) -> Dict:
    """
    Calculate Confidence & Body Language score (25% weight) - Evidence-based.
    
    Components (evidence-based):
    - Face presence: Percentage of frames with face detected
    - Eye contact: Ratio of forward-facing gaze frames (evidence: face mesh landmarks)
    - Posture: Shoulder alignment consistency (evidence: pose landmarks)
    - Gestures: Hand gesture frequency (evidence: hand landmarks)
    
    Args:
        video_analysis: Dictionary from video_analyzer.analyze_video_file()
        face_detected: Whether face was detected in video
    
    Returns:
        Dictionary with score breakdown (null if face not detected or pose landmarks missing)
    """
    if not face_detected:
        return {
            "overall_score": None,
            "components": {
                "face_presence": None,
                "eye_contact": None,
                "posture": None,
                "gesture_score": None
            },
            "weight": 0.25,
            "label": "Not Evaluated",
            "skipped": True,
            "reason": "No face detected - insufficient data for confidence evaluation"
        }
    
    # Check if pose landmarks are available (required for posture and gesture evaluation)
    pose_landmarks_available = video_analysis.get("pose_landmarks_detected", True)  # Default True for backward compat
    if not pose_landmarks_available:
        return {
            "overall_score": None,
            "components": {
                "face_presence": video_analysis.get("face_presence", {}).get("percentage"),
                "eye_contact": video_analysis.get("eye_contact", {}).get("score"),
                "posture": None,
                "gesture_score": None
            },
            "weight": 0.25,
            "label": "Not Evaluated",
            "skipped": True,
            "reason": "Pose landmarks not detected - posture and gesture evaluation unavailable"
        }
    
    # Get evidence-based metrics (all must be present)
    face_presence = video_analysis.get("face_presence", {}).get("percentage")
    eye_contact = video_analysis.get("eye_contact", {}).get("score")
    posture = video_analysis.get("posture", {}).get("score")
    gesture_freq = video_analysis.get("gestures", {}).get("frequency_percentage")
    
    # If any critical metric is None, cannot calculate score
    if face_presence is None or eye_contact is None or posture is None or gesture_freq is None:
        return {
            "overall_score": None,
            "components": {
                "face_presence": face_presence,
                "eye_contact": eye_contact,
                "posture": posture,
                "gesture_score": None
            },
            "weight": 0.25,
            "label": "Insufficient data",
            "skipped": True,
            "reason": "Missing evidence for one or more confidence metrics"
        }
    
    # Evidence-based gesture score: optimal range is 20-50% (derived from hand landmark frequency)
    if 20 <= gesture_freq <= 50:
        gesture_score = 100
    elif 10 <= gesture_freq < 20 or 50 < gesture_freq <= 60:
        gesture_score = 70
    else:
        gesture_score = 50
    
    # Weighted components (all evidence-based)
    confidence_score = (
        face_presence * 0.25 +
        eye_contact * 0.35 +
        posture * 0.25 +
        gesture_score * 0.15
    )
    
    return {
        "overall_score": round(confidence_score, 2),
        "components": {
            "face_presence": round(face_presence, 2),
            "eye_contact": round(eye_contact, 2),
            "posture": round(posture, 2),
            "gesture_score": round(gesture_score, 2)
        },
        "weight": 0.25
    }


def calculate_engagement_score(audio_analysis: Dict, video_analysis: Dict, speech_detected: bool = True, face_detected: bool = True) -> Dict:
    """
    Calculate Engagement score (15% weight).
    
    Components:
    - Speaking speed variation (some variation is good)
    - Volume variation (some variation is good)
    - Gesture frequency
    - Eye contact consistency
    
    Args:
        audio_analysis: Dictionary from audio_analyzer
        video_analysis: Dictionary from video_analyzer
        speech_detected: Whether speech was detected
        face_detected: Whether face was detected
    
    Returns:
        Dictionary with score breakdown (null if both speech and face missing)
    """
    if not speech_detected and not face_detected:
        return {
            "overall_score": None,
            "components": {
                "volume_variation": None,
                "gesture_engagement": None,
                "eye_contact": None
            },
            "weight": 0.15,
            "label": "Not Evaluated",
            "skipped": True,
            "reason": "No speech and no face detected - insufficient data for engagement evaluation"
        }
    
    # Volume variation (some variation = more engaging) - only if speech detected
    if speech_detected:
        volume_std = audio_analysis.get("volume", {}).get("std_db", 0)
        if volume_std is not None:
            # Optimal variation: 3-8 dB
            if 3 <= volume_std <= 8:
                volume_variation_score = 100
            elif 1 <= volume_std < 3 or 8 < volume_std <= 12:
                volume_variation_score = 70
            else:
                volume_variation_score = 50
        else:
            volume_variation_score = None
    else:
        volume_variation_score = None
    
    # Gesture frequency (appropriate gestures = engaging) - only if face detected
    if face_detected:
        gesture_freq = video_analysis.get("gestures", {}).get("frequency_percentage", 0)
        if gesture_freq is not None:
            if 20 <= gesture_freq <= 50:
                gesture_engagement_score = 100
            elif 10 <= gesture_freq < 20:
                gesture_engagement_score = 80
            else:
                gesture_engagement_score = 60
        else:
            gesture_engagement_score = None
    else:
        gesture_engagement_score = None
    
    # Eye contact consistency - only if face detected
    if face_detected:
        eye_contact = video_analysis.get("eye_contact", {}).get("score", 0)
        eye_contact = eye_contact if eye_contact is not None else None
    else:
        eye_contact = None
    
    # Calculate weighted score only if we have at least one valid component
    valid_components = []
    weights = []
    
    if volume_variation_score is not None:
        valid_components.append(volume_variation_score)
        weights.append(0.4)
    if gesture_engagement_score is not None:
        valid_components.append(gesture_engagement_score)
        weights.append(0.4)
    if eye_contact is not None:
        valid_components.append(eye_contact)
        weights.append(0.2)
    
    if not valid_components:
        return {
            "overall_score": None,
            "components": {
                "volume_variation": volume_variation_score,
                "gesture_engagement": gesture_engagement_score,
                "eye_contact": eye_contact
            },
            "weight": 0.15,
            "label": "Insufficient data",
            "skipped": True,
            "reason": "No valid engagement components - missing audio energy or facial motion evidence"
        }
    
    # Normalize weights
    total_weight = sum(weights)
    normalized_weights = [w / total_weight for w in weights]
    
    engagement_score = sum(comp * weight for comp, weight in zip(valid_components, normalized_weights))
    
    return {
        "overall_score": round(engagement_score, 2),
        "components": {
            "volume_variation": round(volume_variation_score, 2) if volume_variation_score is not None else None,
            "gesture_engagement": round(gesture_engagement_score, 2) if gesture_engagement_score is not None else None,
            "eye_contact": round(eye_contact, 2) if eye_contact is not None else None
        },
        "weight": 0.15
    }


def calculate_final_score(
    voice_score: Dict,
    content_score: Dict,
    confidence_score: Dict,
    engagement_score: Dict
) -> Dict:
    """
    Calculate final weighted score out of 100.
    
    Args:
        voice_score: Voice & Delivery score
        content_score: Content Quality score
        confidence_score: Confidence & Body Language score
        engagement_score: Engagement score
    
    Returns:
        Dictionary with final score and breakdown
    """
    final_score = (
        voice_score["overall_score"] * voice_score["weight"] +
        content_score["overall_score"] * content_score["weight"] +
        confidence_score["overall_score"] * confidence_score["weight"] +
        engagement_score["overall_score"] * engagement_score["weight"]
    )
    
    # Determine grade/rating
    if final_score >= 90:
        grade = "Excellent"
        rating = "A+"
    elif final_score >= 80:
        grade = "Very Good"
        rating = "A"
    elif final_score >= 70:
        grade = "Good"
        rating = "B"
    elif final_score >= 60:
        grade = "Fair"
        rating = "C"
    else:
        grade = "Needs Improvement"
        rating = "D"
    
    return {
        "final_score": round(final_score, 2),
        "grade": grade,
        "rating": rating,
        "breakdown": {
            "voice_delivery": {
                "score": voice_score["overall_score"],
                "weight": voice_score["weight"],
                "contribution": round(voice_score["overall_score"] * voice_score["weight"], 2)
            },
            "content_quality": {
                "score": content_score["overall_score"],
                "weight": content_score["weight"],
                "contribution": round(content_score["overall_score"] * content_score["weight"], 2)
            },
            "confidence_body_language": {
                "score": confidence_score["overall_score"],
                "weight": confidence_score["weight"],
                "contribution": round(confidence_score["overall_score"] * confidence_score["weight"], 2)
            },
            "engagement": {
                "score": engagement_score["overall_score"],
                "weight": engagement_score["weight"],
                "contribution": round(engagement_score["overall_score"] * engagement_score["weight"], 2)
            }
        }
    }


def calculate_final_score_with_validation(
    voice_score: Dict,
    content_score: Dict,
    confidence_score: Dict,
    engagement_score: Dict,
    speech_detected: bool,
    face_detected: bool
) -> Dict:
    """
    Calculate final weighted score with validation.
    
    Returns null if fewer than 2 valid categories exist.
    
    Args:
        voice_score: Voice & Delivery score
        content_score: Content Quality score
        confidence_score: Confidence & Body Language score
        engagement_score: Engagement score
        speech_detected: Whether sufficient speech was detected
        face_detected: Whether face was detected
    
    Returns:
        Dictionary with final score and breakdown (null if insufficient data)
    """
    # Count valid categories
    valid_categories = []
    
    if speech_detected and voice_score.get("overall_score") is not None:
        valid_categories.append(("voice_delivery", voice_score))
    if speech_detected and content_score.get("overall_score") is not None:
        valid_categories.append(("content_quality", content_score))
    if face_detected and confidence_score.get("overall_score") is not None:
        valid_categories.append(("confidence_body_language", confidence_score))
    if engagement_score.get("overall_score") is not None:
        valid_categories.append(("engagement", engagement_score))
    
    # Need at least 2 valid categories
    if len(valid_categories) < 2:
        return {
            "final_score": None,
            "grade": None,
            "rating": None,
            "warning": "Not enough data for reliable analysis",
            "breakdown": {
                "voice_delivery": {
                    "score": voice_score.get("overall_score"),
                    "weight": voice_score.get("weight", 0.30),
                    "contribution": None,
                    "skipped": not speech_detected or voice_score.get("overall_score") is None,
                    "reason": "No speech detected" if not speech_detected else ("N/A" if voice_score.get("overall_score") is None else None)
                },
                "content_quality": {
                    "score": content_score.get("overall_score"),
                    "weight": content_score.get("weight", 0.30),
                    "contribution": None,
                    "skipped": not speech_detected or content_score.get("overall_score") is None,
                    "reason": "No speech detected" if not speech_detected else ("N/A" if content_score.get("overall_score") is None else None)
                },
                "confidence_body_language": {
                    "score": confidence_score.get("overall_score"),
                    "weight": confidence_score.get("weight", 0.25),
                    "contribution": None,
                    "skipped": not face_detected or confidence_score.get("overall_score") is None,
                    "reason": "No face detected" if not face_detected else ("N/A" if confidence_score.get("overall_score") is None else None)
                },
                "engagement": {
                    "score": engagement_score.get("overall_score"),
                    "weight": engagement_score.get("weight", 0.15),
                    "contribution": None,
                    "skipped": engagement_score.get("overall_score") is None,
                    "reason": "N/A" if engagement_score.get("overall_score") is None else None
                }
            }
        }
    
    # Calculate weighted score from valid categories
    total_weight = sum(score.get("weight", 0) for _, score in valid_categories)
    
    if total_weight == 0:
        return {
            "final_score": None,
            "grade": None,
            "rating": None,
            "warning": "Not enough data for reliable analysis",
            "breakdown": {}
        }
    
    # Normalize weights
    normalized_scores = []
    for name, score in valid_categories:
        weight = score.get("weight", 0) / total_weight
        normalized_scores.append((name, score.get("overall_score"), weight))
    
    final_score = sum(score * weight for _, score, weight in normalized_scores)
    
    # Determine grade/rating
    if final_score >= 90:
        grade = "Excellent"
        rating = "A+"
    elif final_score >= 80:
        grade = "Very Good"
        rating = "A"
    elif final_score >= 70:
        grade = "Good"
        rating = "B"
    elif final_score >= 60:
        grade = "Fair"
        rating = "C"
    else:
        grade = "Needs Improvement"
        rating = "D"
    
    # Build breakdown
    breakdown = {}
    for name, score_dict in [("voice_delivery", voice_score), ("content_quality", content_score), 
                              ("confidence_body_language", confidence_score), ("engagement", engagement_score)]:
        score_val = score_dict.get("overall_score")
        weight_val = score_dict.get("weight", 0)
        contribution = score_val * weight_val if score_val is not None else None
        
        breakdown[name] = {
            "score": score_val,
            "weight": weight_val,
            "contribution": round(contribution, 2) if contribution is not None else None,
            "skipped": score_val is None,
            "reason": score_dict.get("reason") if score_val is None else None
        }
    
    return {
        "final_score": round(final_score, 2),
        "grade": grade,
        "rating": rating,
        "breakdown": breakdown
    }


def calculate_final_score_with_speech_validation(
    voice_score: Dict,
    content_score: Dict,
    confidence_score: Dict,
    engagement_score: Dict,
    speech_detected: bool,
    face_detected: bool = True
) -> Dict:
    """
    Legacy alias for calculate_final_score_with_validation.
    Maintained for backward compatibility.
    
    Args:
        voice_score: Voice & Delivery score
        content_score: Content Quality score
        confidence_score: Confidence & Body Language score
        engagement_score: Engagement score
        speech_detected: Whether sufficient speech was detected
        face_detected: Whether face was detected (defaults to True)
    
    Returns:
        Dictionary with final score and breakdown (null if insufficient data)
    """
    return calculate_final_score_with_validation(
        voice_score, content_score, confidence_score, engagement_score, speech_detected, face_detected
    )
