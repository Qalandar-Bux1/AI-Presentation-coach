from datetime import datetime
import pymongo
from bson import ObjectId
from utils.auth import verify_token
from flask import Blueprint, request, jsonify, send_from_directory
from dotenv import load_dotenv
import os
from werkzeug.utils import secure_filename

load_dotenv()
session_bp = Blueprint('session', __name__, url_prefix='/session')

client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client["PresentationCoach"]
collection_users = db["user"]
collection_sessions = db["session"]

ALLOWED_EXTENSIONS = {"mp4", "webm"}
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(os.getcwd(), "uploads"))
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

#  CREATE SESSION
@session_bp.route('/create', methods=['POST'])
def create_session():
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = collection_users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        session_data = {
            "user_id": str(user["_id"]),
            "video_path": data.get('video_path'),
            "title": data.get('title') or None,
            "start_time": data.get('start_time', datetime.now().isoformat()),
            "end_time": data.get('end_time', None),
            "created_at": datetime.now().isoformat()
        }

        collection_sessions.insert_one(session_data)
        return jsonify({"success": True, "message": "Session saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#  UPLOAD VIDEO + CREATE SESSION
@session_bp.route('/upload', methods=['POST'])
def upload_video():
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = collection_users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        print("Request.files keys:", request.files.keys())  # ✅ debug

        if 'file' not in request.files:
            return jsonify({"error": "No file part in request"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not _allowed_file(file.filename):
            return jsonify({"error": "Unsupported file type. Only MP4 and WEBM allowed"}), 400

        # Save file
        base_name = secure_filename(file.filename)
        ext = base_name.rsplit(".", 1)[1].lower()
        unique_name = f"{str(user['_id'])}_{int(datetime.now().timestamp())}.{ext}"
        save_path = os.path.join(UPLOAD_FOLDER, unique_name)
        file.save(save_path)

        session_data = {
            "user_id": str(user["_id"]),
            "video_path": unique_name,
            "title": request.form.get('title') or None,
            "start_time": request.form.get('start_time') or datetime.now().isoformat(),
            "end_time": request.form.get('end_time') or None,
            "created_at": datetime.now().isoformat(),
        }
        result = collection_sessions.insert_one(session_data)
        inserted_session = collection_sessions.find_one({"_id": result.inserted_id})
        inserted_session["_id"] = str(inserted_session["_id"])

        return jsonify({"success": True, "filename": unique_name, "session": inserted_session}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500



#  GET USER SESSIONS
@session_bp.route('/all', methods=['GET'])
def get_sessions():
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = collection_users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        sessions = list(collection_sessions.find({"user_id": str(user["_id"])}))
        # Convert _id to string for JSON serialization
        for session in sessions:
            if "_id" in session:
                session["_id"] = str(session["_id"])
        return jsonify({"success": True, "sessions": sessions}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Alias: GET USER VIDEOS (same as /all)
@session_bp.route('/videos', methods=['GET'])
def get_user_videos():
    return get_sessions()

# Videos with feedback only
@session_bp.route('/videos/with-feedback', methods=['GET'])
def get_user_videos_with_feedback():
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = collection_users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        sessions = list(
            collection_sessions.find(
                {"user_id": str(user["_id"]), "feedback": {"$exists": True, "$ne": None}},
                {"_id": 0}
            )
        )
        return jsonify({"success": True, "sessions": sessions}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# DELETE SESSION (and video file)
@session_bp.route('/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = collection_users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Convert session_id to ObjectId
        try:
            session_obj_id = ObjectId(session_id)
        except:
            return jsonify({"error": "Invalid session ID"}), 400

        # Find session and verify ownership
        session = collection_sessions.find_one({"_id": session_obj_id, "user_id": str(user["_id"])})
        if not session:
            return jsonify({"error": "Session not found or access denied"}), 404

        # Delete video file if it exists
        video_path = session.get("video_path")
        if video_path:
            file_path = os.path.join(UPLOAD_FOLDER, video_path)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Warning: Could not delete file {file_path}: {e}")

        # Delete session from MongoDB
        collection_sessions.delete_one({"_id": session_obj_id})

        return jsonify({"success": True, "message": "Session deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET SESSION BY ID (for download)
@session_bp.route('/<session_id>', methods=['GET'])
def get_session(session_id):
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = collection_users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Convert session_id to ObjectId
        try:
            session_obj_id = ObjectId(session_id)
        except:
            return jsonify({"error": "Invalid session ID"}), 400

        session = collection_sessions.find_one({"_id": session_obj_id, "user_id": str(user["_id"])})
        if not session:
            return jsonify({"error": "Session not found or access denied"}), 404

        # Convert _id to string for JSON
        session["_id"] = str(session["_id"])
        return jsonify({"success": True, "session": session}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Trigger analysis for a session
@session_bp.route('/<session_id>/analyze', methods=['POST', 'OPTIONS'])
def analyze_session(session_id):
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = collection_users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        try:
            session_obj_id = ObjectId(session_id)
        except:
            return jsonify({"error": "Invalid session ID"}), 400

        session = collection_sessions.find_one({"_id": session_obj_id, "user_id": str(user["_id"])})
        if not session:
            return jsonify({"error": "Session not found or access denied"}), 404

        # Check analysis status
        analysis_status = session.get("analysis_status", "not_started")
        if analysis_status == "completed":
            return jsonify({
                "success": True,
                "message": "Analysis already completed",
                "already_completed": True
            }), 200
        
        if analysis_status == "processing":
            return jsonify({
                "success": True,
                "message": "Analysis already in progress",
                "in_progress": True
            }), 200
        
        # Check if analysis previously failed due to short video
        if analysis_status == "failed":
            error_msg = session.get("analysis_error", "Unknown error")
            if "too short" in error_msg.lower() or "minimum" in error_msg.lower():
                return jsonify({
                    "success": False,
                    "error": "Video is too short. Minimum presentation length is 10 seconds.",
                    "video_too_short": True
                }), 400
            else:
                # Allow re-analysis for other types of failures
                pass
        
        # Set status to "processing" immediately
        session_obj_id = ObjectId(session_id)
        collection_sessions.update_one(
            {"_id": session_obj_id},
            {"$set": {"analysis_status": "processing"}}
        )
        print(f"[API] Set analysis_status to 'processing' for session {session_id}")

        # Get video path
        video_filename = session.get("video_path")
        if not video_filename:
            return jsonify({"error": "No video found for this session"}), 400

        video_path = os.path.join(UPLOAD_FOLDER, video_filename)
        
        # Verify video file exists and is readable
        if not os.path.exists(video_path):
            print(f"[API] ERROR: Video file not found: {video_path}")
            print(f"[API] UPLOAD_FOLDER: {UPLOAD_FOLDER}")
            print(f"[API] video_filename: {video_filename}")
            return jsonify({"error": f"Video file not found on server: {video_filename}"}), 404
        
        # Check file size (should be > 0)
        file_size = os.path.getsize(video_path)
        if file_size == 0:
            return jsonify({"error": "Video file is empty"}), 400
        
        print(f"[API] ✅ Video file verified: {video_path} ({file_size} bytes)")
        
        # Quick duration check before starting analysis (if not already failed)
        if analysis_status != "failed":
            try:
                from utils.audioextraction import extract_audio, get_audio_duration
                
                # Extract audio quickly to check duration
                print(f"[API] Checking video duration before analysis...")
                audio_path = extract_audio(video_path)
                duration = get_audio_duration(audio_path)
                
                # Clean up temp audio file
                try:
                    if os.path.exists(audio_path):
                        os.remove(audio_path)
                except:
                    pass
                
                # Check if video is too short
                MIN_DURATION = 10.0
                if duration < MIN_DURATION:
                    error_msg = f"Video is too short. Minimum presentation length is {int(MIN_DURATION)} seconds."
                    # Mark as failed immediately
                    collection_sessions.update_one(
                        {"_id": session_obj_id},
                        {"$set": {
                            "analysis_status": "failed",
                            "analysis_error": error_msg
                        }}
                    )
                    return jsonify({
                        "success": False,
                        "error": error_msg,
                        "video_too_short": True
                    }), 400
                
                print(f"[API] ✅ Video duration check passed: {duration:.1f}s")
            except Exception as duration_error:
                # If duration check fails, continue with analysis (let it fail during validation)
                print(f"[API] ⚠️  Duration check failed, continuing with analysis: {str(duration_error)}")

        # Start analysis in background thread
        from utils.analysis_manager import get_analysis_manager
        manager = get_analysis_manager()
        
        # Check if already running
        if manager.is_running(session_id):
            return jsonify({
                "success": True,
                "message": "Analysis already in progress",
                "in_progress": True
            }), 200
        
        # Start background analysis
        print(f"[API] Starting analysis for session {session_id}, video: {video_path}")
        started = manager.start_analysis(
            session_id=session_id,
            video_path=video_path,
            user_id=str(user["_id"]),
            db_collection=collection_sessions
        )
        
        if not started:
            print(f"[API] Failed to start analysis for session {session_id}")
            return jsonify({"error": "Failed to start analysis (may already be running)"}), 500

        print(f"[API] ✅ Analysis started successfully for session {session_id}")
        return jsonify({
            "success": True,
            "message": "Analysis started successfully",
            "session_id": session_id
        }), 200

    except Exception as e:
        import traceback
        print(f"[API] ❌ Analysis start error: {str(e)}")
        print(f"[API] Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Failed to start analysis: {str(e)}"}), 500


# Get analysis progress
@session_bp.route('/<session_id>/progress', methods=['GET', 'OPTIONS'])
def get_analysis_progress(session_id):
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = collection_users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        try:
            session_obj_id = ObjectId(session_id)
        except:
            return jsonify({"error": "Invalid session ID"}), 400

        session = collection_sessions.find_one({"_id": session_obj_id, "user_id": str(user["_id"])})
        if not session:
            return jsonify({"error": "Session not found or access denied"}), 404

        # Check analysis_status from DB first (this is the source of truth)
        analysis_status = session.get("analysis_status", "not_started")
        
        # Also check manager's in-memory progress for real-time updates
        from utils.analysis_manager import get_analysis_manager
        manager = get_analysis_manager()
        manager_progress = manager.get_progress(session_id)
        
        # Prioritize DB status, but also check manager progress for failed status
        # (in case DB update is slightly delayed)
        if analysis_status == "failed" or (manager_progress and manager_progress.get("status") == "failed"):
            # Try to get error from analysis_error field first, then from analysis_report
            error_msg = session.get("analysis_error")
            if not error_msg and manager_progress and manager_progress.get("error"):
                error_msg = manager_progress.get("error")
            if not error_msg and session.get("analysis_report"):
                rejection_reason = session.get("analysis_report", {}).get("rejection_reason")
                if rejection_reason:
                    # Extract user-friendly message for short videos
                    if "too short" in rejection_reason.lower() or "minimum" in rejection_reason.lower():
                        error_msg = "Video is too short. Minimum presentation length is 10 seconds."
                    else:
                        error_msg = rejection_reason
            if not error_msg:
                error_msg = "Unknown error"
            
            return jsonify({
                "status": "failed",
                "progress": 0,
                "message": f"Analysis failed: {error_msg}",
                "error": error_msg
            }), 200
        
        if analysis_status == "completed":
            return jsonify({
                "status": "completed",
                "progress": 100,
                "message": "Analysis completed",
                "completed": True
            }), 200
        
        if analysis_status == "processing":
            # Get progress from manager (real-time progress)
            if manager_progress:
                # Check if manager shows failed status (in case DB hasn't updated yet)
                if manager_progress.get("status") == "failed":
                    error_msg = manager_progress.get("error", "Analysis failed")
                    return jsonify({
                        "status": "failed",
                        "progress": 0,
                        "message": f"Analysis failed: {error_msg}",
                        "error": error_msg
                    }), 200
                
                return jsonify({
                    "status": "processing",
                    "progress": manager_progress.get("progress", 0),
                    "message": manager_progress.get("message", "Processing...")
                }), 200
            else:
                # Status is processing but no manager progress (might have restarted server)
                return jsonify({
                    "status": "processing",
                    "progress": 50,
                    "message": "Analysis in progress..."
                }), 200
        
        # Not started
        return jsonify({
            "status": "not_started",
            "progress": 0,
            "message": "Analysis not started"
        }), 200

    except Exception as e:
        print(f"Progress error: {str(e)}")
        return jsonify({"error": f"Failed to get progress: {str(e)}"}), 500


# New endpoint: POST /analyze-video (direct video analysis)
@session_bp.route('/analyze-video', methods=['POST', 'OPTIONS'])
def analyze_video():
    """
    Analyze a video directly by providing video path or video ID.
    
    Request body (JSON):
    - video_path: Path to video file (optional if video_id provided)
    - video_id: Session ID (optional if video_path provided)
    """
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = collection_users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json() or {}
        video_path = data.get("video_path")
        video_id = data.get("video_id")

        # Determine video path
        if video_id:
            # Get video path from session
            try:
                session_obj_id = ObjectId(video_id)
            except:
                return jsonify({"error": "Invalid video ID"}), 400

            session = collection_sessions.find_one({"_id": session_obj_id, "user_id": str(user["_id"])})
            if not session:
                return jsonify({"error": "Session not found or access denied"}), 404

            video_filename = session.get("video_path")
            if not video_filename:
                return jsonify({"error": "No video found for this session"}), 400

            video_path = os.path.join(UPLOAD_FOLDER, video_filename)
        
        elif video_path:
            # Use provided path (must be in uploads folder for security)
            if not video_path.startswith(UPLOAD_FOLDER):
                # If just filename, assume it's in uploads folder
                video_path = os.path.join(UPLOAD_FOLDER, os.path.basename(video_path))
        else:
            return jsonify({"error": "Either video_path or video_id must be provided"}), 400

        # Verify file exists
        if not os.path.exists(video_path):
            return jsonify({"error": f"Video file not found: {video_path}"}), 404

        # Run analysis pipeline
        from utils.analysis_pipeline import analyze_presentation_video
        
        print(f"Starting analysis for video: {video_path}...")
        analysis_report = analyze_presentation_video(video_path)
        
        # Add timestamp
        analysis_report["metadata"]["analysis_timestamp"] = datetime.now().isoformat()

        return jsonify({
            "success": True,
            "message": "Analysis completed successfully",
            "report": analysis_report
        }), 200

    except FileNotFoundError as e:
        return jsonify({"error": f"File not found: {str(e)}"}), 404
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

# Download video (auto-converts WEBM to MP4)

@session_bp.route('/download/<path:filename>', methods=['GET'])
def download_video(filename):
    """
    Download a video file. 
    If the requested file is .mp4 but only .webm exists, convert it.
    If the requested file is .webm, return it directly.
    """
    try:
        # Security check: prevent directory traversal
        if ".." in filename or filename.startswith("/"):
            return jsonify({"error": "Invalid filename"}), 400
            
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        # Check if file exists directly
        if os.path.exists(file_path):
            return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)
            
        # If requested mp4 but it doesn't exist, check for webm source
        if filename.lower().endswith('.mp4'):
            webm_filename = filename[:-4] + '.webm'
            webm_path = os.path.join(UPLOAD_FOLDER, webm_filename)
            
            if os.path.exists(webm_path):
                # We have the source webm, convert it to mp4
                from utils.video_converter import convert_webm_to_mp4
                
                print(f" Converting {webm_filename} to {filename} for download...")
                success = convert_webm_to_mp4(webm_path, file_path)
                
                if success and os.path.exists(file_path):
                    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)
                else:
                    return jsonify({"error": "Video conversion failed"}), 500
        
        return jsonify({"error": "File not found"}), 404

    except Exception as e:
        print(f"Download error: {str(e)}")
        return jsonify({"error": str(e)}), 500