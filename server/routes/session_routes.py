from flask import Blueprint, request, jsonify
import pymongo
from datetime import datetime
from utils.auth import verify_token
from dotenv import load_dotenv
import os

load_dotenv()
session_bp = Blueprint('session', __name__, url_prefix='/session')

client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client["PresentationCoach"]
collection_users = db["user"]
collection_sessions = db["session"]

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

        sessions = list(collection_sessions.find({"user_id": str(user["_id"])}, {"_id": 0}))
        return jsonify({"success": True, "sessions": sessions}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
