"""
Video Analysis Module
Analyzes video: face presence, posture, gestures, eye contact using OpenCV and MediaPipe
"""

import cv2
import numpy as np
from typing import Dict, List, Tuple, Optional
from collections import Counter
import os

# Try to import MediaPipe, handle gracefully if it fails
try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except Exception as e:
    print(f"Warning: MediaPipe not available: {str(e)}")
    MEDIAPIPE_AVAILABLE = False
    mp = None


class VideoAnalyzer:
    """Analyzer for video presentation metrics."""
    
    def __init__(self):
        """Initialize MediaPipe models."""
        if not MEDIAPIPE_AVAILABLE:
            self.face_detection = None
            self.face_mesh = None
            self.pose = None
            self.hands = None
            return
        
        try:
            # Initialize MediaPipe solutions
            self.mp_face_detection = mp.solutions.face_detection
            self.mp_face_mesh = mp.solutions.face_mesh
            self.mp_pose = mp.solutions.pose
            self.mp_hands = mp.solutions.hands
            
            # Create MediaPipe instances (optimized for speed)
            self.face_detection = self.mp_face_detection.FaceDetection(
                model_selection=0,  # 0 for short-range (faster), 1 for full-range
                min_detection_confidence=0.4  # Reduced from 0.5 for faster processing
            )
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=False,  # Disable refinement for faster processing
                min_detection_confidence=0.4,  # Reduced from 0.5
                min_tracking_confidence=0.4    # Reduced from 0.5
            )
            self.pose = self.mp_pose.Pose(
                static_image_mode=False,
                min_detection_confidence=0.4,  # Reduced from 0.5
                min_tracking_confidence=0.4,   # Reduced from 0.5
                model_complexity=0  # Use fastest model (reduced from 1 for speed)
            )
            self.hands = self.mp_hands.Hands(
                static_image_mode=False,
                max_num_hands=2,
                min_detection_confidence=0.4,  # Reduced from 0.5
                min_tracking_confidence=0.4,   # Reduced from 0.5
                model_complexity=0  # Use simplest model for faster processing
            )
        except Exception as e:
            print(f"Warning: Failed to initialize MediaPipe: {str(e)}")
            self.face_detection = None
            self.face_mesh = None
            self.pose = None
            self.hands = None
    
    def analyze_video(self, video_path: str, sample_rate: int = None, known_duration: float = None) -> Dict:
        """
        Analyze video for presentation metrics.
        
        Args:
            video_path: Path to the video file
            sample_rate: Analyze every Nth frame (None = auto-calculate based on duration)
            known_duration: Optional known duration in seconds (from reliable source like FFmpeg)
        
        Returns:
            Dictionary with video analysis results
        """
        if not MEDIAPIPE_AVAILABLE or not self.face_detection:
            # Return null values if MediaPipe is not available (no face detection possible)
            print("MediaPipe not available, returning null video analysis")
            return {
                "face_detected": False,
                "face_presence": {"percentage": None, "frames_analyzed": 0, "label": "N/A"},
                "eye_contact": {"score": None, "assessment": "N/A", "label": "N/A"},
                "posture": {"score": None, "assessment": "N/A", "label": "N/A"},
                "gestures": {"frequency_percentage": None, "assessment": "N/A", "label": "N/A"},
                "confidence_estimate": None,
                "duration_seconds": known_duration or 0,
                "frames_analyzed": 0
            }
        
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception(f"Could not open video file: {video_path}")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Sanitize FPS
        if fps <= 0 or fps > 120:  # Invalid or unreasonable FPS
            fps = 30.0  # Fallback assumption
        
        # Sanitize total_frames
        # Fix for OpenCV returning negative values (overflow) or zero
        if total_frames <= 0 or total_frames > 1000000:
            if known_duration and known_duration > 0:
                print(f"[Video Analyzer] ⚠️ Invalid frame count ({total_frames}) from OpenCV. Using known duration ({known_duration}s) * FPS ({fps})")
                total_frames = int(known_duration * fps)
            else:
                print(f"[Video Analyzer] ⚠️ Invalid frame count ({total_frames}) and no known duration. Will rely on actual frames read.")
                total_frames = 0
                
        # Calculate duration if not provided
        if known_duration and known_duration > 0:
            duration = known_duration
        else:
            duration = total_frames / fps if fps > 0 else 0
        
        # Adaptive sample rate based on video duration for better performance
        # OPTIMIZED: Target ~40-60 frames total for faster analysis while maintaining accuracy
        if sample_rate is None:
            if duration <= 0: # Unknown duration
                 sample_rate = 15 # Default safe fallback (reduced from 10)
            elif duration <= 20:
                sample_rate = 8  # Short videos: every 8th frame (reduced from 5 for speed)
            elif duration <= 40:
                sample_rate = 15  # Medium videos (40s): every 15th frame (increased from 10)
            elif duration <= 60:
                sample_rate = 25  # Longer videos: every 25th frame (increased from 15)
            elif duration <= 120:
                sample_rate = 35  # 2-min videos: every 35th frame (new tier)
            elif duration <= 180:
                sample_rate = 45  # 3-min videos: every 45th frame (new tier)
            else:
                sample_rate = 60  # Very long videos: every 60th frame (increased from 20)
        print(f"[Video Analyzer] Using sample_rate={sample_rate} for {duration:.1f}s video (OPTIMIZED)")
        
        # Target resolution for processing (downscale for speed)
        TARGET_WIDTH = 480  # Reduced from 640px for faster MediaPipe processing
        
        # Analysis metrics (evidence-based tracking)
        face_detections = []
        eye_contact_scores = []  # Evidence: forward-facing gaze frames
        posture_scores = []  # Evidence: shoulder alignment consistency
        gesture_detections = []
        pose_landmarks_detected_frames = 0  # Track frames with pose landmarks
        total_analyzed_frames = 0
        frame_count = 0
        
        # Quality metrics tracking
        lighting_qualities = []
        noise_levels = []
        camera_angles = []
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Sample frames for efficiency
                if frame_count % sample_rate != 0:
                    frame_count += 1
                    continue
                
                # Downscale frame for faster processing (maintain aspect ratio)
                original_height, original_width = frame.shape[:2]
                if original_width > TARGET_WIDTH:
                    scale = TARGET_WIDTH / original_width
                    new_width = TARGET_WIDTH
                    new_height = int(original_height * scale)
                    frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
                
                # Convert BGR to RGB for MediaPipe
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame_height, frame_width = frame.shape[:2]
                
                # 1. Face Detection
                face_results = self.face_detection.process(rgb_frame)
                has_face = face_results.detections is not None and len(face_results.detections) > 0
                face_detections.append(1 if has_face else 0)
                
                # 2. Eye Contact Analysis (using face mesh)
                if has_face:
                    face_mesh_results = self.face_mesh.process(rgb_frame)
                    eye_contact = self._analyze_eye_contact(face_mesh_results, frame_width, frame_height)
                    eye_contact_scores.append(eye_contact)
                else:
                    eye_contact_scores.append(0)
                
                # 3. Posture Analysis (evidence-based: shoulder alignment)
                pose_results = self.pose.process(rgb_frame)
                has_pose_landmarks = pose_results.pose_landmarks is not None
                if has_pose_landmarks:
                    pose_landmarks_detected_frames += 1
                    posture_score = self._analyze_posture(pose_results, frame_height)
                    posture_scores.append(posture_score)
                else:
                    posture_scores.append(None)  # No pose landmarks = no posture evidence
                
                # 4. Gesture Detection (evidence-based: hand landmarks)
                hands_results = self.hands.process(rgb_frame)
                has_gesture = self._detect_gestures(hands_results)
                gesture_detections.append(1 if has_gesture else 0)
                
                # 5. Quality Metrics Detection
                lighting_quality = self._assess_lighting_quality(frame)
                noise_level = self._assess_noise_level(frame)
                camera_angle = self._assess_camera_angle(face_results, pose_results) if has_face or pose_results.pose_landmarks else None
                
                if lighting_quality:
                    lighting_qualities.append(lighting_quality)
                if noise_level:
                    noise_levels.append(noise_level)
                if camera_angle:
                    camera_angles.append(camera_angle)
                
                total_analyzed_frames += 1
                frame_count += 1
        
        finally:
            cap.release()
        
        # Calculate final metrics (evidence-based)
        face_presence = (sum(face_detections) / len(face_detections) * 100) if face_detections else 0
        
        # Eye contact: ratio of forward-facing gaze frames (evidence-based)
        valid_eye_contact_scores = [s for s in eye_contact_scores if s is not None and s > 0]
        if valid_eye_contact_scores:
            # Calculate ratio of frames with forward-facing gaze (score > 60 = forward-facing)
            forward_facing_frames = sum(1 for s in valid_eye_contact_scores if s > 60)
            avg_eye_contact = np.mean(valid_eye_contact_scores) if valid_eye_contact_scores else None
            eye_contact_ratio = (forward_facing_frames / len(valid_eye_contact_scores) * 100) if valid_eye_contact_scores else None
        else:
            avg_eye_contact = None
            eye_contact_ratio = None
        
        # Posture: shoulder alignment consistency (evidence-based)
        valid_posture_scores = [s for s in posture_scores if s is not None]
        if valid_posture_scores:
            avg_posture = np.mean(valid_posture_scores)
            # Posture consistency = standard deviation (lower = more consistent)
            posture_std = np.std(valid_posture_scores)
            posture_consistency_score = max(0, 100 - (posture_std * 2))  # Penalize high variance
        else:
            avg_posture = None
            posture_consistency_score = None
        
        # Gesture frequency (evidence-based: hand landmark detections)
        gesture_frequency = (sum(gesture_detections) / len(gesture_detections) * 100) if gesture_detections else None
        
        # Determine if face was detected (at least 10% of frames for basic detection)
        face_detected = face_presence >= 10.0
        
        # Check if pose landmarks were detected (required for posture/gesture evaluation)
        pose_landmarks_detected = pose_landmarks_detected_frames > 0
        pose_landmarks_percentage = (pose_landmarks_detected_frames / total_analyzed_frames * 100) if total_analyzed_frames > 0 else 0
        
        # Confidence estimation (evidence-based combination) - only if face detected
        if face_detected and avg_eye_contact is not None and avg_posture is not None:
            confidence_score = (
                face_presence * 0.3 +
                avg_eye_contact * 0.3 +
                avg_posture * 0.2 +
                (min(gesture_frequency, 50) * 0.2 if gesture_frequency is not None else 0)
            )
        else:
            confidence_score = None
        
        # Aggregate quality metrics
        lighting_quality = self._aggregate_lighting_quality(lighting_qualities) if lighting_qualities else None
        noise_level = self._aggregate_noise_level(noise_levels) if noise_levels else None
        camera_angle = self._aggregate_camera_angle(camera_angles) if camera_angles else None
        
        return {
            "face_detected": face_detected,
            "face_presence": {
                "percentage": round(face_presence, 2) if face_detected else None,
                "frames_analyzed": len(face_detections),
                "label": "Not Evaluated" if not face_detected else None
            },
            "eye_contact": {
                "score": round(avg_eye_contact, 2) if avg_eye_contact is not None else None,
                "forward_facing_ratio": round(eye_contact_ratio, 2) if eye_contact_ratio is not None else None,  # Evidence: ratio of forward-facing frames
                "assessment": "good" if (avg_eye_contact is not None and avg_eye_contact > 60) else ("low_confidence" if (avg_eye_contact is not None and avg_eye_contact < 40) else ("Not Evaluated" if avg_eye_contact is None else "needs_improvement")),
                "label": "Not Evaluated" if avg_eye_contact is None else None
            },
            "posture": {
                "score": round(avg_posture, 2) if avg_posture is not None else None,
                "consistency_score": round(posture_consistency_score, 2) if posture_consistency_score is not None else None,  # Evidence: shoulder alignment consistency
                "assessment": "good" if (avg_posture is not None and avg_posture > 70) else ("Not Evaluated" if avg_posture is None else "needs_improvement"),
                "label": "Not Evaluated" if avg_posture is None else None
            },
            "gestures": {
                "frequency_percentage": round(gesture_frequency, 2) if gesture_frequency is not None else None,
                "assessment": "appropriate" if (gesture_frequency is not None and 20 <= gesture_frequency <= 50) else ("Not Evaluated" if gesture_frequency is None else "needs_adjustment"),
                "label": "Not Evaluated" if gesture_frequency is None else None
            },
            "pose_landmarks_detected": pose_landmarks_detected,  # Evidence flag for posture/gesture evaluation
            "pose_landmarks_percentage": round(pose_landmarks_percentage, 2) if pose_landmarks_percentage > 0 else None,
            "confidence_estimate": round(confidence_score, 2) if confidence_score is not None else None,
            "duration_seconds": round(duration, 2),
            "frames_analyzed": frame_count,
            "quality_metrics": {
                "lighting_quality": lighting_quality,
                "noise_level": noise_level,
                "camera_angle": camera_angle
            }
        }
    
    def _analyze_eye_contact(self, face_mesh_results, frame_width: int, frame_height: int) -> float:
        """
        Analyze eye contact by checking if face is looking at camera.
        
        Returns:
            Score from 0-100 (higher = better eye contact)
        """
        if not face_mesh_results.multi_face_landmarks:
            return 0.0
        
        try:
            # Get face landmarks
            landmarks = face_mesh_results.multi_face_landmarks[0]
            
            # Key points for eye contact detection
            # Left eye center (approximate)
            left_eye = landmarks.landmark[33]  # Left eye center
            right_eye = landmarks.landmark[263]  # Right eye center
            
            # Nose tip
            nose_tip = landmarks.landmark[4]
            
            # Calculate face orientation
            # If face is centered and looking forward, eye contact is good
            face_center_x = (left_eye.x + right_eye.x) / 2
            frame_center_x = 0.5
            
            # Calculate deviation from center
            x_deviation = abs(face_center_x - frame_center_x)
            
            # Check if face is looking forward (nose position relative to eyes)
            eye_center_y = (left_eye.y + right_eye.y) / 2
            nose_y = nose_tip.y
            
            # Simple heuristic: if face is centered and upright, assume good eye contact
            if x_deviation < 0.15 and nose_y > eye_center_y:  # Face is centered and upright
                return 80.0
            elif x_deviation < 0.25:
                return 60.0
            else:
                return 40.0
        
        except Exception as e:
            print(f"Eye contact analysis error: {str(e)}")
            return None  # No evidence available - return None instead of default
    
    def _analyze_posture(self, pose_results, frame_height: int) -> float:
        """
        Analyze posture quality.
        
        Returns:
            Score from 0-100 (higher = better posture)
        """
        if not pose_results.pose_landmarks:
            return None  # No pose landmarks = no posture evidence
        
        try:
            landmarks = pose_results.pose_landmarks.landmark
            
            # Key points for posture analysis
            left_shoulder = landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER]
            nose = landmarks[mp.solutions.pose.PoseLandmark.NOSE]
            
            # Check if shoulders are level (good posture indicator)
            shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
            
            # Check if head is above shoulders (upright posture)
            head_above_shoulders = nose.y < (left_shoulder.y + right_shoulder.y) / 2
            
            # Calculate posture score
            score = 100.0
            
            # Penalize for uneven shoulders
            if shoulder_diff > 0.05:  # Threshold
                score -= 20
            
            # Penalize if head is not above shoulders
            if not head_above_shoulders:
                score -= 30
            
            return max(0, min(100, score))
        
        except Exception as e:
            print(f"Posture analysis error: {str(e)}")
            return None  # No evidence available - return None instead of default
    
    def _detect_gestures(self, hands_results) -> bool:
        """
        Detect if hands are visible (indicating gestures).
        
        Returns:
            True if hands are detected
        """
        return hands_results.multi_hand_landmarks is not None and len(hands_results.multi_hand_landmarks) > 0
    
    def _assess_lighting_quality(self, frame) -> Optional[str]:
        """
        Assess lighting quality of the frame.
        
        Returns:
            "good" or "poor" based on brightness and contrast
        """
        try:
            # Convert to grayscale for brightness analysis
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Calculate mean brightness
            mean_brightness = np.mean(gray)
            
            # Calculate contrast (standard deviation)
            contrast = np.std(gray)
            
            # Good lighting: brightness between 80-200, contrast > 30
            if 80 <= mean_brightness <= 200 and contrast > 30:
                return "good"
            else:
                return "poor"
        except:
            return None
    
    def _assess_noise_level(self, frame) -> Optional[str]:
        """
        Assess noise level in the frame.
        
        Returns:
            "low", "medium", or "high" based on image variance
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Apply Laplacian to detect edges (high variance = more detail, low variance = blur/noise)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Low noise: high variance (> 100), High noise: low variance (< 50)
            if laplacian_var > 100:
                return "low"
            elif laplacian_var < 50:
                return "high"
            else:
                return "medium"
        except:
            return None
    
    def _assess_camera_angle(self, face_results, pose_results) -> Optional[str]:
        """
        Assess camera angle relative to subject.
        
        Returns:
            "front", "partial", or "side" based on face/pose detection
        """
        try:
            has_face = face_results.detections is not None and len(face_results.detections) > 0
            has_pose = pose_results.pose_landmarks is not None
            
            if has_face and has_pose:
                # Check if face is centered and pose is visible
                # This is a simplified heuristic
                return "front"
            elif has_face or has_pose:
                return "partial"
            else:
                return "side"
        except:
            return None
    
    def _aggregate_lighting_quality(self, qualities: List[str]) -> str:
        """Aggregate lighting quality across frames."""
        if not qualities:
            return None
        good_count = sum(1 for q in qualities if q == "good")
        good_ratio = good_count / len(qualities)
        return "good" if good_ratio >= 0.5 else "poor"
    
    def _aggregate_noise_level(self, levels: List[str]) -> str:
        """Aggregate noise level across frames."""
        if not levels:
            return None
        # Use most common level, or "medium" if mixed
        from collections import Counter
        counter = Counter(levels)
        most_common = counter.most_common(1)[0][0]
        # If distribution is mixed, return medium
        if len(counter) > 1 and counter[most_common] / len(levels) < 0.6:
            return "medium"
        return most_common
    
    def _aggregate_camera_angle(self, angles: List[str]) -> str:
        """Aggregate camera angle across frames."""
        if not angles:
            return None
        from collections import Counter
        counter = Counter(angles)
        return counter.most_common(1)[0][0]
    
    def __del__(self):
        """Cleanup MediaPipe resources."""
        try:
            self.face_detection.close()
            self.face_mesh.close()
            self.pose.close()
            self.hands.close()
        except:
            pass


def analyze_video_file(video_path: str) -> Dict:
    """
    Convenience function to analyze a video file.
    
    Args:
        video_path: Path to the video file
    
    Returns:
        Dictionary with video analysis results
    """
    analyzer = VideoAnalyzer()
    return analyzer.analyze_video(video_path)
