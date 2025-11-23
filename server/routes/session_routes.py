from flask import Blueprint, request, jsonify
import pymongo
from bson import ObjectId
from datetime import datetime
from utils.auth import verify_token
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

        # Placeholder for actual analysis logic
        # For now, just add some dummy feedback
        dummy_feedback = {
            "voice": "Strong, confident delivery. Work on varying tone slightly.",
            "expressions": "Good hand gestures. Try to keep consistent eye contact.",
            "vocabulary": "Excellent vocabulary. Consider reducing filler words."
        }
        collection_sessions.update_one(
            {"_id": session_obj_id},
            {"$set": {"feedback": dummy_feedback, "analyzed_at": datetime.now().isoformat()}}
        )

        return jsonify({"success": True, "message": "Analysis triggered successfully", "feedback": dummy_feedback}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500