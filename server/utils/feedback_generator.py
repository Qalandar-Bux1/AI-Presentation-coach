"""
Feedback Generation Module
Generates human-like feedback using LLM (OpenAI GPT)
"""

import os
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

# Try to import OpenAI, fallback to simple template if not available
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Warning: OpenAI library not available. Using template-based feedback.")


def generate_feedback(
    audio_analysis: Dict,
    text_analysis: Dict,
    video_analysis: Dict,
    scores: Dict,
    speech_detected: bool = True
) -> Dict:
    """
    Generate comprehensive feedback using LLM or template.
    
    Args:
        audio_analysis: Audio analysis results
        text_analysis: Text analysis results
        video_analysis: Video analysis results
        scores: Scoring results
        speech_detected: Whether sufficient speech was detected
    
    Returns:
        Dictionary with strengths, improvements, and detailed feedback
    """
    if OPENAI_AVAILABLE and os.getenv("OPENAI_API_KEY"):
        return _generate_llm_feedback(audio_analysis, text_analysis, video_analysis, scores, speech_detected)
    else:
        return _generate_template_feedback(audio_analysis, text_analysis, video_analysis, scores, speech_detected)


def _generate_llm_feedback(
    audio_analysis: Dict,
    text_analysis: Dict,
    video_analysis: Dict,
    scores: Dict,
    speech_detected: bool = True
) -> Dict:
    """Generate feedback using OpenAI GPT."""
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        if not speech_detected:
            # Special prompt for no speech detected
            prompt = f"""You are an expert presentation coach. This video had NO SPEECH DETECTED (silent video or insufficient audio).

VISUAL ANALYSIS ONLY:
- Final Score: {scores['final_score']}/55 (Limited Analysis - only visual metrics)
- Eye Contact: {video_analysis.get('eye_contact', {}).get('score', 0)}/100
- Posture: {video_analysis.get('posture', {}).get('score', 0)}/100
- Gestures: {video_analysis.get('gestures', {}).get('frequency_percentage', 0)}% frequency
- Face Presence: {video_analysis.get('face_presence', {}).get('percentage', 0)}%

NOTE: Speech-based metrics (speaking speed, grammar, content quality) were NOT evaluated due to lack of speech.

Please provide:
1. 2-3 key STRENGTHS (what they did well visually - posture, gestures, presence)
2. 2-3 key IMPROVEMENTS (specific, actionable advice for visual presentation)
3. A brief OVERALL ASSESSMENT mentioning that speech analysis was not possible

Format your response as JSON with keys: "strengths" (array), "improvements" (array), "overall_assessment" (string).
Be encouraging, specific, and actionable."""
        else:
            # Normal prompt with all metrics
            prompt = f"""You are an expert presentation coach. Analyze the following presentation metrics and provide constructive feedback.

PRESENTATION ANALYSIS:
- Final Score: {scores['final_score']}/100 ({scores['grade']})
- Speaking Speed: {audio_analysis.get('speaking_speed', {}).get('wpm', 0)} WPM
- Filler Words: {audio_analysis.get('filler_words', {}).get('total', 0)} occurrences ({audio_analysis.get('filler_words', {}).get('percentage', 0)}%)
- Pitch Stability: {audio_analysis.get('pitch', {}).get('stability_score', 0)}/100
- Volume Stability: {audio_analysis.get('volume', {}).get('stability_score', 0)}/100
- Grammar Quality: {text_analysis.get('grammar', {}).get('score', 0)}/100
- Repetition Score: {text_analysis.get('repetition', {}).get('repetition_score', 0)}/100
- Structure: Intro: {text_analysis.get('structure', {}).get('has_intro', False)}, Body: {text_analysis.get('structure', {}).get('has_body', False)}, Conclusion: {text_analysis.get('structure', {}).get('has_conclusion', False)}
- Eye Contact: {video_analysis.get('eye_contact', {}).get('score', 0)}/100
- Posture: {video_analysis.get('posture', {}).get('score', 0)}/100
- Gestures: {video_analysis.get('gestures', {}).get('frequency_percentage', 0)}% frequency

SCORE BREAKDOWN:
- Voice & Delivery: {scores['breakdown']['voice_delivery']['score']}/100
- Content Quality: {scores['breakdown']['content_quality']['score']}/100
- Confidence & Body Language: {scores['breakdown']['confidence_body_language']['score']}/100
- Engagement: {scores['breakdown']['engagement']['score']}/100

Please provide:
1. 2-3 key STRENGTHS (what they did well)
2. 2-3 key IMPROVEMENTS (specific, actionable advice)
3. A brief OVERALL ASSESSMENT (2-3 sentences)

Format your response as JSON with keys: "strengths" (array), "improvements" (array), "overall_assessment" (string).
Be encouraging, specific, and actionable."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional presentation coach. Provide constructive, encouraging feedback in JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        import json
        feedback_text = response.choices[0].message.content.strip()
        
        # Try to parse JSON from response
        try:
            # Remove markdown code blocks if present
            if feedback_text.startswith("```"):
                feedback_text = feedback_text.split("```")[1]
                if feedback_text.startswith("json"):
                    feedback_text = feedback_text[4:]
            feedback_json = json.loads(feedback_text)
            
            return {
                "strengths": feedback_json.get("strengths", []),
                "improvements": feedback_json.get("improvements", []),
                "overall_assessment": feedback_json.get("overall_assessment", ""),
                "generated_by": "openai_gpt"
            }
        except json.JSONDecodeError:
            # Fallback to template if JSON parsing fails
            return _generate_template_feedback(audio_analysis, text_analysis, video_analysis, scores, speech_detected)
    
    except Exception as e:
        print(f"LLM feedback generation error: {str(e)}")
        return _generate_template_feedback(audio_analysis, text_analysis, video_analysis, scores, speech_detected)


def _generate_template_feedback(
    audio_analysis: Dict,
    text_analysis: Dict,
    video_analysis: Dict,
    scores: Dict,
    speech_detected: bool = True
) -> Dict:
    """Generate feedback using templates (fallback method)."""
    strengths = []
    improvements = []
    
    # Helper for safe score access
    def get_val(data, *keys, default=None):
        val = data
        for k in keys:
            if isinstance(val, dict):
                val = val.get(k)
            else:
                return default
        return val if val is not None else default

    # Extract common metrics safely
    eye_contact_score = get_val(video_analysis, 'eye_contact', 'score')
    posture_score = get_val(video_analysis, 'posture', 'score')
    gesture_freq = get_val(video_analysis, 'gestures', 'frequency_percentage')
    
    if not speech_detected:
        # Feedback for videos without speech
        strengths.append("You completed the video recording successfully.")
        
        if eye_contact_score is not None and eye_contact_score >= 70:
            strengths.append("You maintained good eye contact throughout the video.")
        if posture_score is not None and posture_score >= 70:
            strengths.append("Your posture demonstrates confidence and professionalism.")
        if gesture_freq is not None and 20 <= gesture_freq <= 50:
            strengths.append("Your gesture usage is appropriate and engaging.")
        
        if eye_contact_score is not None and eye_contact_score < 60:
            improvements.append("Improve eye contact by looking directly at the camera more frequently.")
        if posture_score is not None and posture_score < 70:
            improvements.append("Work on maintaining an upright, confident posture.")
        if gesture_freq is not None:
            if gesture_freq < 20:
                improvements.append("Use more hand gestures to emphasize key points.")
            elif gesture_freq > 60:
                improvements.append("Reduce excessive gestures. Use them strategically.")
        
        improvements.append("⚠️ Note: No speech was detected in this video. For complete analysis, ensure your microphone is working and you speak clearly.")
        
        final_score = scores.get('final_score')
        final_score_str = str(final_score) if final_score is not None else "N/A"
        overall_assessment = f"This analysis is based on visual metrics only (posture, gestures, eye contact). No speech was detected, so voice and content quality metrics were not evaluated. Final score: {final_score_str}/55 (limited analysis)."
    else:
        # Normal feedback with all metrics
        voice_score = get_val(scores, 'breakdown', 'voice_delivery', 'score')
        content_score = get_val(scores, 'breakdown', 'content_quality', 'score')
        
        if voice_score is not None and voice_score >= 75:
            strengths.append("Your voice delivery is strong with good pacing and clarity.")
        
        if content_score is not None and content_score >= 75:
            strengths.append("Your content is well-structured and grammatically sound.")
        
        if eye_contact_score is not None and eye_contact_score >= 70:
            strengths.append("You maintained good eye contact throughout the presentation.")
        
        if posture_score is not None and posture_score >= 70:
            strengths.append("Your posture demonstrates confidence and professionalism.")
        
        filler_pct = get_val(audio_analysis, 'filler_words', 'percentage')
        if filler_pct is not None and filler_pct < 5:
            strengths.append("You used minimal filler words, showing good speech control.")
        
        # Default strengths if none found
        if not strengths:
            strengths.append("You completed the presentation successfully.")
            strengths.append("Your effort to improve is commendable.")
        
        # Analyze improvements
        wpm = get_val(audio_analysis, 'speaking_speed', 'wpm')
        if wpm is not None and wpm > 0:
            if wpm < 120:
                improvements.append(f"Your speaking speed ({wpm} WPM) is too slow. Aim for 120-160 WPM for better engagement.")
            elif wpm > 180:
                improvements.append(f"Your speaking speed ({wpm} WPM) is too fast. Slow down to 120-160 WPM for better clarity.")
        
        if filler_pct is not None and filler_pct >= 5:
            improvements.append(f"Reduce filler words (currently {filler_pct}%). Practice pausing instead of using 'um' or 'uh'.")
        
        grammar_score = get_val(text_analysis, 'grammar', 'score')
        if grammar_score is not None and grammar_score < 70:
            improvements.append("Review your grammar and sentence structure. Consider practicing your script beforehand.")
        
        has_intro = get_val(text_analysis, 'structure', 'has_intro', default=False)
        if has_intro is False:
            improvements.append("Add a clear introduction to set context and engage your audience from the start.")
        
        has_conclusion = get_val(text_analysis, 'structure', 'has_conclusion', default=False)
        if has_conclusion is False:
            improvements.append("Include a conclusion to summarize key points and provide closure.")
        
        if eye_contact_score is not None and eye_contact_score < 60:
            improvements.append("Improve eye contact by looking directly at the camera/audience more frequently.")
        
        if posture_score is not None and posture_score < 70:
            improvements.append("Work on maintaining an upright, confident posture throughout your presentation.")
        
        if gesture_freq is not None:
            if gesture_freq < 20:
                improvements.append("Use more hand gestures to emphasize key points and make your presentation more engaging.")
            elif gesture_freq > 60:
                improvements.append("Reduce excessive gestures. Use them strategically to emphasize important points.")
        
        # Default improvements if none found
        if not improvements:
            improvements.append("Continue practicing to refine your presentation skills.")
        
        # Generate overall assessment
        final_score = scores.get('final_score')
        grade = scores.get('grade')
        
        fs_str = str(final_score) if final_score is not None else "N/A"
        grade_str = str(grade) if grade is not None else "N/A"
        
        overall_assessment = f"Your presentation scored {fs_str}/100 ({grade_str}). Focus on the suggested improvements to enhance your performance."
    
    return {
        "strengths": strengths[:3],  # Limit to top 3
        "improvements": improvements[:3],  # Limit to top 3
        "overall_assessment": overall_assessment,
        "generated_by": "template"
    }
