from flask import Blueprint, request, jsonify
from utils.auth import hash_password, check_password, generate_token, verify_token
import pymongo
from dotenv import load_dotenv
import os

load_dotenv()
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# MongoDB Connection
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client["PresentationCoach"]
collection_users = db["user"]

#  CREATE USER (Signup)
@auth_bp.route('/create', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not all([username, email, password]):
            return jsonify({"error": "All fields are required"}), 400

        if collection_users.find_one({'email': email}):
            return jsonify({"error": "User already exists"}), 400

        hashed_password = hash_password(password)
        collection_users.insert_one({
            'username': username,
            'email': email,
            'password': hashed_password
        })

        return jsonify({
            "success": True,
            "message": "User created successfully. Please log in now."
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#  LOGIN USER
@auth_bp.route('/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = collection_users.find_one({'email': email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not check_password(password, user['password']):
            return jsonify({"error": "Invalid password"}), 401

        token = generate_token(email)
        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#  GET USER DETAILS
@auth_bp.route('/me', methods=['GET'])
def get_user_details():
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "")

        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = collection_users.find_one({"email": email}, {"_id": 0, "password": 0})
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"success": True, "user": user}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
