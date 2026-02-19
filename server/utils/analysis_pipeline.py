"""
Main Analysis Pipeline
Orchestrates the complete video analysis workflow
"""

import os
import tempfile
from typing import Dict
from utils.audioextraction import extract_audio, get_audio_duration
from utils.transcription import transcribe_audio
from utils.audio_analyzer import analyze_audio_complete
from utils.text_analyzer import analyze_text_complete
from utils.video_analyzer import analyze_video_file
from utils.scoring import (
    calculate_voice_delivery_score,
    calculate_content_quality_score,
    calculate_confidence_body_language_score,
    calculate_engagement_score,
    calculate_final_score
)
from utils.feedback_generator import generate_feedback


class AnalysisPipeline:
    """Main pipeline for analyzing presentation videos."""
    
    def __init__(self):
        """Initialize the analysis pipeline."""
        self.temp_files = []  # Track temp files for cleanup
    
    def analyze_video(self, video_path: str) -> Dict:
        """
        Complete video analysis pipeline.
        
        Steps:
        1. Extract audio from video
        2. Transcribe audio to text
        3. Analyze audio (WPM, fillers, pitch, volume)
        4. Analyze text (grammar, repetition, structure)
        5. Analyze video (face, posture, gestures, eye contact)
        6. Calculate scores
        7. Generate feedback
        
        Args:
            video_path: Path to the video file
        
        Returns:
            Complete analysis report as dictionary
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        try:
            print(f"Starting analysis pipeline for: {video_path}")
            
            # Step 1: Extract audio
            print("Step 1: Extracting audio...")
            audio_path = extract_audio(video_path)
            self.temp_files.append(audio_path)
            duration = get_audio_duration(audio_path)
            print(f"Audio extracted. Duration: {duration:.2f} seconds")
            
            # Step 2: Transcribe audio
            print("Step 2: Transcribing audio...")
            transcription = transcribe_audio(audio_path)
            text = transcription["text"]
            print(f"Transcription complete. Text length: {len(text)} characters")
            
            # Step 3: Analyze audio
            print("Step 3: Analyzing audio characteristics...")
            audio_analysis = analyze_audio_complete(audio_path, text, duration)
            print("Audio analysis complete.")
            
            # Step 4: Analyze text
            print("Step 4: Analyzing text quality...")
            text_analysis = analyze_text_complete(text)
            print("Text analysis complete.")
            
            # Step 5: Analyze video
            print("Step 5: Analyzing video (face, posture, gestures, eye contact)...")
            video_analysis = analyze_video_file(video_path)
            print("Video analysis complete.")
            
            # Step 6: Calculate scores
            print("Step 6: Calculating scores...")
            voice_score = calculate_voice_delivery_score(audio_analysis)
            content_score = calculate_content_quality_score(text_analysis)
            confidence_score = calculate_confidence_body_language_score(video_analysis)
            engagement_score = calculate_engagement_score(audio_analysis, video_analysis)
            final_scores = calculate_final_score(
                voice_score, content_score, confidence_score, engagement_score
            )
            print("Scoring complete.")
            
            # Step 7: Generate feedback
            print("Step 7: Generating feedback...")
            feedback = generate_feedback(audio_analysis, text_analysis, video_analysis, final_scores)
            print("Feedback generation complete.")
            
            # Compile complete report
            report = {
                "transcription": {
                    "text": text,
                    "language": transcription.get("language", "en"),
                    "segments_count": len(transcription.get("segments", []))
                },
                "audio_analysis": audio_analysis,
                "text_analysis": text_analysis,
                "video_analysis": video_analysis,
                "scores": final_scores,
                "feedback": feedback,
                "metadata": {
                    "video_path": video_path,
                    "duration_seconds": round(duration, 2),
                    "analysis_timestamp": None  # Will be set by route handler
                }
            }
            
            print("Analysis pipeline complete!")
            return report
        
        except Exception as e:
            print(f"Analysis pipeline error: {str(e)}")
            raise Exception(f"Analysis failed: {str(e)}")
        
        finally:
            # Cleanup temporary files
            self._cleanup_temp_files()
    
    def _cleanup_temp_files(self):
        """Remove temporary files created during analysis."""
        for temp_file in self.temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    print(f"Cleaned up temp file: {temp_file}")
            except Exception as e:
                print(f"Warning: Could not delete temp file {temp_file}: {str(e)}")
        self.temp_files = []


def analyze_presentation_video(video_path: str) -> Dict:
    """
    Convenience function to analyze a presentation video.
    
    Args:
        video_path: Path to the video file
    
    Returns:
        Complete analysis report
    """
    pipeline = AnalysisPipeline()
    return pipeline.analyze_video(video_path)
