"""
Thread-Safe Analysis Manager
Manages background video analysis with progress tracking
"""

import threading
import time
from typing import Dict, Optional
from bson import ObjectId
from datetime import datetime
import os
from utils.analysis_pipeline import analyze_presentation_video


class AnalysisManager:
    """Thread-safe manager for video analysis tasks."""
    
    def __init__(self):
        # Thread-safe storage for analysis progress
        # Format: {session_id: {"status": "running|completed|failed", "progress": 0-100, "error": None}}
        self._progress = {}
        self._lock = threading.Lock()
        self._threads = {}  # Track running threads
    
    def start_analysis(self, session_id: str, video_path: str, user_id: str, db_collection):
        """
        Start analysis in background thread.
        
        Args:
            session_id: Session ID
            video_path: Path to video file
            user_id: User ID
            db_collection: MongoDB collection for sessions
        """
        with self._lock:
            # Check if analysis already running
            if session_id in self._progress:
                status = self._progress[session_id].get("status")
                if status == "running":
                    return False  # Already running
            
            # Initialize progress
            self._progress[session_id] = {
                "status": "running",
                "progress": 0,
                "error": None,
                "started_at": datetime.now().isoformat()
            }
        
        # Start background thread
        thread = threading.Thread(
            target=self._run_analysis,
            args=(session_id, video_path, user_id, db_collection),
            daemon=False,  # Not a daemon thread (survives Flask reload)
            name=f"AnalysisThread-{session_id}"
        )
        thread.start()
        print(f"[Analysis Manager] Started background thread '{thread.name}' for session {session_id}")
        
        with self._lock:
            self._threads[session_id] = thread
        
        return True
    
    def _run_analysis(self, session_id: str, video_path: str, user_id: str, db_collection):
        """Run analysis in background thread with progress updates."""
        MIN_WORDS_FOR_SPEECH = 10  # Minimum words to consider speech detected
        
        try:
            print(f"[Analysis Thread] Starting analysis for session {session_id}")
            session_obj_id = ObjectId(session_id)
            
            # Update status to processing in DB
            db_collection.update_one(
                {"_id": session_obj_id},
                {"$set": {"analysis_status": "processing"}}
            )
            self._update_progress(session_id, 5, "Extracting audio...")
            print(f"[Analysis Thread] Progress: 5% - Extracting audio...")
            
            # Step 1: Extract audio (5-15%)
            from utils.audioextraction import extract_audio, get_audio_duration
            print(f"[Analysis Thread] Extracting audio from {video_path}")
            audio_path = extract_audio(video_path)
            duration = get_audio_duration(audio_path)
            audio_present = duration > 0
            print(f"[Analysis Thread] Audio extracted. Duration: {duration}s, Audio present: {audio_present}")
            self._update_progress(session_id, 15, "Transcribing audio...")
            print(f"[Analysis Thread] Progress: 15% - Transcribing audio...")
            
            # Step 2: Transcribe (15-30%)
            from utils.transcription import transcribe_audio, load_whisper_model
            print(f"[Analysis Thread] Loading Whisper model (may download on first use)...")
            try:
                load_whisper_model("tiny")
                print(f"[Analysis Thread] Whisper model ready")
            except Exception as model_error:
                print(f"[Analysis Thread] Warning: Model load error: {model_error}")
            self._update_progress(session_id, 20, "Transcribing audio (this may take a moment)...")
            print(f"[Analysis Thread] Starting transcription...")
            transcription = transcribe_audio(audio_path, model_size="tiny")
            text = transcription["text"].strip()
            word_count = len(text.split()) if text else 0
            print(f"[Analysis Thread] Transcription complete. Text: '{text}' ({word_count} words)")
            
            # ANALYSIS ELIGIBILITY LAYER - Hard rules check
            from utils.analysis_eligibility import check_analysis_eligibility
            import cv2
            
            # Get total frames for eligibility check
            cap_temp = cv2.VideoCapture(video_path)
            total_frames = int(cap_temp.get(cv2.CAP_PROP_FRAME_COUNT)) if cap_temp.isOpened() else 0
            fps_temp = cap_temp.get(cv2.CAP_PROP_FPS) if cap_temp.isOpened() else 30
            cap_temp.release()
            
            # SANITIZE FRAME COUNT: If OpenCV reports invalid/overflow values, calculate from duration
            if total_frames <= 0 or total_frames > 1000000: # Check for overflow/negative
                if duration > 0 and fps_temp > 0:
                     print(f"[Analysis Thread] ⚠️ Sanitizing frame count: OpenCV reported {total_frames}, using duration calculation")
                     total_frames = int(duration * fps_temp)
                else:
                     total_frames = 0
            
            print(f"[Analysis Thread] Frame check: {total_frames} frames, {duration}s duration")
            
            print(f"[Analysis Thread] Checking analysis eligibility...")
            is_eligible, eligibility_warnings, eligibility_details = check_analysis_eligibility(
                video_duration=duration,
                audio_present=audio_present,
                word_count=word_count,
                total_frames=total_frames
            )
            
            # Check if speech is detected (for metric calculation)
            speech_detected = word_count >= MIN_WORDS_FOR_SPEECH
            
            # If not eligible, set warning status but continue with limited analysis
            warning_message = None
            if not is_eligible:
                warning_message = "; ".join(eligibility_warnings)
                print(f"[Analysis Thread] ⚠️  ELIGIBILITY WARNINGS: {warning_message}")
                print(f"[Analysis Thread] Will continue with limited analysis (some metrics may be unavailable)")
            
            if not speech_detected:
                print(f"[Analysis Thread] ⚠️  WARNING: Insufficient speech detected ({word_count} words < {MIN_WORDS_FOR_SPEECH} minimum)")
                print(f"[Analysis Thread] Speech-based metrics will be marked as 'Not Evaluated'")
            
            self._update_progress(session_id, 30, "Analyzing audio...")
            print(f"[Analysis Thread] Progress: 30% - Analyzing audio...")
            
            # Step 3: Analyze audio (30-45%) - Only if speech detected
            from utils.audio_analyzer import analyze_audio_complete
            if speech_detected:
                print(f"[Analysis Thread] Analyzing audio characteristics...")
                audio_analysis = analyze_audio_complete(audio_path, text, duration)
                print(f"[Analysis Thread] Audio analysis complete")
            else:
                print(f"[Analysis Thread] Skipping audio analysis (no speech detected)")
                audio_analysis = {
                    "speaking_speed": {"wpm": None, "assessment": "N/A", "label": "N/A"},
                    "filler_words": {"total": 0, "percentage": None, "breakdown": {}, "label": "N/A"},
                    "pitch": {"mean": None, "stability_score": None, "std": None, "label": "N/A"},
                    "volume": {"mean_db": None, "stability_score": None, "level_score": None, "label": "N/A"},
                    "duration_seconds": round(duration, 2)
                }
            self._update_progress(session_id, 45, "Analyzing text...")
            print(f"[Analysis Thread] Progress: 45% - Analyzing text...")
            
            # Step 4: Analyze text (45-60%) - Only if speech detected
            from utils.text_analyzer import analyze_text_complete
            if speech_detected:
                print(f"[Analysis Thread] Analyzing text quality...")
                text_analysis = analyze_text_complete(text)
                print(f"[Analysis Thread] Text analysis complete")
            else:
                print(f"[Analysis Thread] Skipping text analysis (no speech detected)")
                text_analysis = {
                    "grammar": {"score": None, "errors": [], "feedback": "N/A", "label": "N/A"},
                    "repetition": {"repetition_score": None, "repeated_phrases": [], "feedback": "N/A", "label": "N/A"},
                    "structure": {"structure_score": None, "has_intro": False, "has_body": False, "has_conclusion": False, "feedback": "N/A", "label": "N/A"},
                    "text_length": 0,
                    "word_count": 0
                }
            self._update_progress(session_id, 60, "Analyzing video...")
            print(f"[Analysis Thread] Progress: 60% - Analyzing video...")
            
            # Step 5: Analyze video (60-85%) - Always run (visual analysis)
            from utils.video_analyzer import analyze_video_file, VideoAnalyzer
            print(f"[Analysis Thread] Analyzing video (this may take a while)...")
            try:
                # Update progress at start of video analysis
                self._update_progress(session_id, 65, "Processing video frames...")
                
                # Pass known duration (from FFmpeg audio extraction) to handle OpenCV metadata issues
                analyzer = VideoAnalyzer()
                
                # Update progress during video analysis
                self._update_progress(session_id, 70, "Detecting faces and poses...")
                video_analysis = analyzer.analyze_video(video_path, known_duration=duration)
                
                # Update progress after video analysis
                self._update_progress(session_id, 80, "Finalizing video analysis...")
                
                face_presence_pct = video_analysis.get("face_presence", {}).get("percentage")
                face_detected = video_analysis.get("face_detected", False)
                print(f"[Analysis Thread] Video analysis complete. Face detected: {face_detected} ({face_presence_pct}% of frames)")
                
                # Quality metrics from video analysis
                quality_metrics = video_analysis.get("quality_metrics", {})
                lighting_quality = quality_metrics.get("lighting_quality")
                noise_level = quality_metrics.get("noise_level")
                camera_angle = quality_metrics.get("camera_angle")
                
                if not face_detected:
                    print(f"[Analysis Thread] ⚠️  WARNING: Face not detected or below threshold")
                    print(f"[Analysis Thread] Face-based metrics will be marked as 'Not Evaluated'")
                    if not warning_message:
                        warning_message = "Face not detected in video. Body language metrics unavailable."
                    else:
                        warning_message += "; Face not detected in video. Body language metrics unavailable."
            except Exception as video_error:
                print(f"[Analysis Thread] Video analysis error: {str(video_error)}")
                face_detected = False
                face_presence_pct = None
                video_analysis = {
                    "face_detected": False,
                    "face_presence": {"percentage": None, "frames_analyzed": 0, "label": "N/A"},
                    "eye_contact": {"score": None, "assessment": "N/A", "label": "N/A"},
                    "posture": {"score": None, "assessment": "N/A", "label": "N/A"},
                    "gestures": {"frequency_percentage": None, "assessment": "N/A", "label": "N/A"},
                    "confidence_estimate": None,
                    "quality_metrics": {
                        "lighting_quality": None,
                        "noise_level": None,
                        "camera_angle": None
                    },
                    "duration_seconds": duration # Preserve duration even on error
                }
                lighting_quality = None
                noise_level = None
                camera_angle = None
                
                if not warning_message:
                    warning_message = f"Video analysis encountered errors: {str(video_error)}"
                else:
                    warning_message += f"; Video analysis errors: {str(video_error)}"
            self._update_progress(session_id, 85, "Calculating scores...")
            print(f"[Analysis Thread] Progress: 85% - Calculating scores...")
            
            # Step 6: Calculate scores (85-95%) - Re-weight if no speech
            from utils.scoring import (
                calculate_voice_delivery_score,
                calculate_content_quality_score,
                calculate_confidence_body_language_score,
                calculate_engagement_score,
                calculate_final_score_with_validation
            )
            
            if speech_detected:
                voice_score = calculate_voice_delivery_score(audio_analysis)
                content_score = calculate_content_quality_score(text_analysis)
            else:
                # Set speech-based scores to null/N/A
                voice_score = {
                    "overall_score": None,
                    "components": {
                        "wpm_score": None,
                        "filler_score": None,
                        "pitch_stability": None,
                        "volume_stability": None,
                        "volume_level": None
                    },
                    "weight": 0.30,
                    "skipped": True,
                    "label": "N/A",
                    "reason": "No speech detected"
                }
                content_score = {
                    "overall_score": None,
                    "components": {
                        "grammar_score": None,
                        "repetition_score": None,
                        "structure_score": None
                    },
                    "weight": 0.30,
                    "skipped": True,
                    "label": "N/A",
                    "reason": "No speech detected"
                }
            
            # Get face_detected and pose_landmarks_detected from video_analysis
            face_detected = video_analysis.get("face_detected", False)
            pose_landmarks_detected = video_analysis.get("pose_landmarks_detected", True)  # Default True for backward compat
            
            # Pass pose_landmarks_detected flag to video_analysis for scoring
            video_analysis["pose_landmarks_detected"] = pose_landmarks_detected
            
            confidence_score = calculate_confidence_body_language_score(video_analysis, face_detected)
            engagement_score = calculate_engagement_score(audio_analysis, video_analysis, speech_detected, face_detected)
            
            # Calculate final score with validation
            final_scores = calculate_final_score_with_validation(
                voice_score, content_score, confidence_score, engagement_score, speech_detected, face_detected
            )
            
            self._update_progress(session_id, 95, "Generating feedback...")
            
            # Step 7: Generate feedback (95-100%)
            from utils.feedback_generator import generate_feedback
            print(f"[Analysis Thread] Generating feedback...")
            feedback = generate_feedback(audio_analysis, text_analysis, video_analysis, final_scores, speech_detected)
            print(f"[Analysis Thread] Feedback generated")
            
            # Determine metric availability
            metric_availability = {
                "speech": speech_detected,
                "body_language": face_detected
            }
            
            # Determine analysis status
            if warning_message:
                analysis_status = "completed_with_warning"
                print(f"[Analysis Thread] ⚠️  Analysis completed with warnings: {warning_message}")
            else:
                analysis_status = "completed"
                print(f"[Analysis Thread] ✅ Analysis completed successfully")
            
            # Compile complete report with standardized format
            analysis_report = {
                "status": "Valid Presentation" if not warning_message else "Presentation with Limitations",
                "eligibility_details": eligibility_details,
                "transcription": {
                    "text": text,
                    "language": transcription.get("language", "en"),
                    "segments_count": len(transcription.get("segments", [])),
                    "word_count": word_count
                },
                "audio_analysis": audio_analysis,
                "text_analysis": text_analysis,
                "video_analysis": video_analysis,
                "scores": final_scores,
                "feedback": feedback,
                "metadata": {
                    "video_path": video_path,
                    "duration_seconds": round(duration, 2),
                    "analysis_timestamp": datetime.now().isoformat(),
                    "speech_detected": speech_detected,
                    "audio_present": audio_present,
                    "word_count": word_count,
                    "face_detected": face_detected,
                    "pose_landmarks_detected": pose_landmarks_detected,
                    "min_words_required": MIN_WORDS_FOR_SPEECH,
                    "quality_metrics": {
                        "lighting_quality": lighting_quality,
                        "noise_level": noise_level,
                        "camera_angle": camera_angle
                    }
                },
                # STANDARDIZED RESPONSE CONTRACT
                "analysis_status": analysis_status,
                "audio_present": audio_present,
                "speech_detected": speech_detected,
                "face_detected": face_detected,
                "word_count": word_count,
                "metric_availability": metric_availability,
                "warning_message": warning_message
            }
            
            # Save to database with standardized fields
            print(f"[Analysis Thread] Saving results to database...")
            session_obj_id = ObjectId(session_id)
            db_collection.update_one(
                {"_id": session_obj_id},
                {"$set": {
                    "analysis_report": analysis_report,
                    "feedback": feedback,
                    "analyzed_at": datetime.now().isoformat(),
                    "analysis_status": analysis_status,  # Use new status
                    "score": final_scores.get("final_score"),  # May be None
                    "grade": final_scores.get("grade"),  # May be None
                    "speech_detected": speech_detected,
                    "face_detected": face_detected,
                    "word_count": word_count,
                    "audio_present": audio_present,
                    "metric_availability": metric_availability,
                    "warning_message": warning_message
                }}
            )
            print(f"[Analysis Thread] Results saved to database")
            
            # Cleanup temp audio file
            try:
                if os.path.exists(audio_path):
                    os.remove(audio_path)
                    print(f"[Analysis Thread] Cleaned up temp audio file")
            except Exception as cleanup_error:
                print(f"[Analysis Thread] Warning: Could not delete temp file: {cleanup_error}")
            
            # Mark as completed
            self._update_progress(session_id, 100, "Analysis complete!", completed=True)
            print(f"[Analysis Thread] ✅ Analysis completed successfully for session {session_id}")
            
        except Exception as e:
            error_msg = str(e)
            import traceback
            print(f"[Analysis Thread] ❌ Analysis error for session {session_id}: {error_msg}")
            print(f"[Analysis Thread] Traceback: {traceback.format_exc()}")
            
            # Update status to failed in DB
            try:
                session_obj_id = ObjectId(session_id)
                db_collection.update_one(
                    {"_id": session_obj_id},
                    {"$set": {"analysis_status": "failed", "analysis_error": error_msg}}
                )
            except:
                pass
            
            self._update_progress(session_id, 0, f"Analysis failed: {error_msg}", failed=True)
    
    def _update_progress(self, session_id: str, progress: int, message: str = "", completed: bool = False, failed: bool = False):
        """Update progress for a session."""
        with self._lock:
            if session_id not in self._progress:
                self._progress[session_id] = {}
            
            self._progress[session_id]["progress"] = progress
            self._progress[session_id]["message"] = message
            self._progress[session_id]["updated_at"] = datetime.now().isoformat()
            
            if completed:
                self._progress[session_id]["status"] = "completed"
            elif failed:
                self._progress[session_id]["status"] = "failed"
                self._progress[session_id]["error"] = message
            else:
                self._progress[session_id]["status"] = "running"
        
        # Log progress update
        print(f"[Progress] Session {session_id}: {progress}% - {message}")
    
    def get_progress(self, session_id: str) -> Optional[Dict]:
        """Get current progress for a session."""
        with self._lock:
            return self._progress.get(session_id, None)
    
    def is_running(self, session_id: str) -> bool:
        """Check if analysis is running for a session."""
        with self._lock:
            progress = self._progress.get(session_id)
            if not progress:
                return False
            return progress.get("status") == "running"
    
    def cleanup(self, session_id: str):
        """Clean up progress data for a session (after some time)."""
        with self._lock:
            if session_id in self._progress:
                del self._progress[session_id]
            if session_id in self._threads:
                del self._threads[session_id]


# Global instance (survives Flask reloads on Windows)
_analysis_manager = None

def get_analysis_manager():
    """Get or create global analysis manager instance."""
    global _analysis_manager
    if _analysis_manager is None:
        _analysis_manager = AnalysisManager()
    return _analysis_manager
