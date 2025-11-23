import bcrypt
import jwt
import datetime
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET")

#  Hash password
def hash_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

#  Check password
def check_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

#  Generate JWT token
def generate_token(email):
    payload = {
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=6)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

#  Verify JWT token
def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['email']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

#  Generate email verification token
def generate_verification_token(email):
    payload = {
        'email': email,
        'type': 'email_verification',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)  # 24 hours
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

#  Verify email verification token
def verify_verification_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        if payload.get('type') != 'email_verification':
            return None
        return payload['email']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

#  Generate password reset token
def generate_reset_token(email):
    payload = {
        'email': email,
        'type': 'password_reset',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # 1 hour
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

#  Verify password reset token
def verify_reset_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        if payload.get('type') != 'password_reset':
            return None
        return payload['email']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None