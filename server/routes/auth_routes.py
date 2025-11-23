from flask import Blueprint, request, jsonify
from utils.auth import (
    hash_password, check_password, generate_token, verify_token,
    generate_verification_token, verify_verification_token,
    generate_reset_token, verify_reset_token
)
from utils.email_service import send_verification_email, send_password_reset_email
import pymongo
from dotenv import load_dotenv
import os

load_dotenv()
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# MongoDB Connection
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client["PresentationCoach"]
collection_users = db["user"]

#  CREATE USER (Signup) - Email-First Verification
@auth_bp.route('/create', methods=['POST'])
def create_user():
    try:
        data = request.get_json()

        username = (data.get('username') or "").strip()
        email = (data.get('email') or "").strip()
        password = (data.get('password') or "").strip()
        role = data.get('role', 'student')
        studentId = data.get('studentId')
        program = data.get('program')
        semester = data.get('semester')
        phone = data.get('phone')

        # 1️⃣ Check empty required fields
        if not username or not email or not password:
            return jsonify({"error": "Name, email, and password are required"}), 400

        # 2️⃣ Check email format
        import re
        email_pattern = r"[^@]+@[^@]+\.[^@]+"
        if not re.match(email_pattern, email):
            return jsonify({"error": "Invalid email address"}), 400

        # 3️⃣ Check password minimum length
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        # 4️⃣ Check if user already exists
        if collection_users.find_one({'email': email}):
            return jsonify({"error": "An account with this email already exists. Please use a different email or try logging in."}), 409

        # 5️⃣ Generate verification token BEFORE creating user
        verification_token = generate_verification_token(email)
        
        # 6️⃣ EMAIL-FIRST: Attempt to send verification email BEFORE creating account
        email_sent, email_error = send_verification_email(email, verification_token, username)
        
        if not email_sent:
            # Email failed - DO NOT create account
            error_message = email_error or "Failed to send verification email"
            
            # Provide helpful error message
            if "SMTP" in error_message or "authentication" in error_message.lower():
                return jsonify({
                    "error": "Email service is not properly configured. Please contact support or try again later.",
                    "details": "Unable to send verification email. Account was not created."
                }), 503
            elif "connect" in error_message.lower():
                return jsonify({
                    "error": "Unable to connect to email server. Please try again later.",
                    "details": "Email service temporarily unavailable. Account was not created."
                }), 503
            else:
                return jsonify({
                    "error": "Failed to send verification email. Please check your email address and try again.",
                    "details": error_message
                }), 500

        # 7️⃣ Only create user if email was sent successfully
        hashed_password = hash_password(password)
        
        try:
            collection_users.insert_one({
                'username': username,
                'email': email,
                'password': hashed_password,
                'role': role,
                'studentId': studentId,
                'program': program,
                'semester': semester,
                'phone': phone,
                'emailVerified': False,
                'verificationToken': verification_token,
            })
        except Exception as db_error:
            # If database insert fails after email was sent, log the error
            # The user will need to request a new verification email
            return jsonify({
                "error": "Account creation failed after email was sent. Please try signing up again.",
                "details": str(db_error)
            }), 500

        # 8️⃣ Success - email sent and account created
        return jsonify({
            "success": True,
            "message": "Account created successfully! Please check your email to verify your account before logging in."
        }), 201

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred during signup", "details": str(e)}), 500



#  VERIFY EMAIL
@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({"error": "Verification token is required"}), 400
        
        email = verify_verification_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired verification token"}), 400
        
        user = collection_users.find_one({'email': email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Update user as verified
        collection_users.update_one(
            {'email': email},
            {'$set': {'emailVerified': True}, '$unset': {'verificationToken': ''}}
        )
        
        return jsonify({
            "success": True,
            "message": "Email verified successfully"
        }), 200
        
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

        # Check if email is verified
        if not user.get('emailVerified', False):
            return jsonify({
                "error": "Please verify your email before logging in. Check your inbox for the verification link."
            }), 403

        token = generate_token(email)
        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#  FORGOT PASSWORD
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        user = collection_users.find_one({'email': email})
        if not user:
            # Don't reveal if user exists for security
            return jsonify({
                "success": True,
                "message": "If an account exists with this email, a password reset link has been sent."
            }), 200
        
        # Generate reset token
        reset_token = generate_reset_token(email)
        
        # Save reset token to user
        collection_users.update_one(
            {'email': email},
            {'$set': {'resetToken': reset_token}}
        )
        
        # Send reset email
        email_sent, email_error = send_password_reset_email(email, reset_token, user.get('username', 'User'))
        
        if not email_sent:
            # Log the error but don't reveal to user for security
            import logging
            logging.error(f"Failed to send password reset email to {email}: {email_error}")
            # Still return success message to prevent email enumeration
        
        return jsonify({
            "success": True,
            "message": "If an account exists with this email, a password reset link has been sent."
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#  RESET PASSWORD
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({"error": "Token and new password are required"}), 400
        
        # Verify reset token
        email = verify_reset_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired reset token"}), 400
        
        # Check password length
        if len(new_password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400
        
        # Find user and verify token matches
        user = collection_users.find_one({'email': email})
        if not user or user.get('resetToken') != token:
            return jsonify({"error": "Invalid reset token"}), 400
        
        # Update password and remove reset token
        hashed_password = hash_password(new_password)
        collection_users.update_one(
            {'email': email},
            {'$set': {'password': hashed_password}, '$unset': {'resetToken': ''}}
        )
        
        return jsonify({
            "success": True,
            "message": "Password reset successfully. You can now login with your new password."
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#  TEST EMAIL CONFIGURATION (for debugging)
@auth_bp.route('/test-email-config', methods=['GET'])
def test_email_config():
    """
    Test endpoint to check if email configuration is properly set up.
    Only use this for debugging in development.
    """
    try:
        from utils.email_service import check_smtp_config
        
        is_configured, error_message = check_smtp_config()
        
        if is_configured:
            smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
            smtp_port = os.getenv("SMTP_PORT", "587")
            smtp_username = os.getenv("SMTP_USERNAME")
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
            
            return jsonify({
                "success": True,
                "message": "Email configuration is set up",
                "config": {
                    "smtp_server": smtp_server,
                    "smtp_port": smtp_port,
                    "smtp_username": smtp_username,
                    "frontend_url": frontend_url,
                    "password_configured": "Yes" if os.getenv("SMTP_PASSWORD") else "No"
                }
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Email configuration is missing",
                "details": error_message
            }), 503
            
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

        user = collection_users.find_one({"email": email}, {"_id": 0, "password": 0, "verificationToken": 0, "resetToken": 0})
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"success": True, "user": user}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
