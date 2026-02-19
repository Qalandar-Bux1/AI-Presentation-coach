from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.session_routes import session_bp
from flask import send_from_directory
import os

app = Flask(__name__)
# Configure CORS to allow all origins, methods, and headers for development
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": True
    }
})

# Add CORS headers to all responses
# CORS headers are handled by flask-cors (configured above)
# Redundant after_request handler removed to prevent double headers


# Register Routes
app.register_blueprint(auth_bp)
app.register_blueprint(session_bp)

@app.route('/')
def home():
    return "✅ Flask backend connected successfully!"

# Serve uploaded files (videos) securely from UPLOAD_FOLDER
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', os.path.join(os.getcwd(), 'uploads'))

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    print("🚀 Starting Flask authentication + session server...")
    # Disable reloader completely to prevent thread killing on Windows
    # This is critical for background analysis threads to survive
    import sys
    
    # Pre-load Whisper model on startup to avoid first-time download delay
    print("📥 Pre-loading Whisper model (tiny) for faster analysis...")
    try:
        from utils.transcription import load_whisper_model
        load_whisper_model("tiny")
        print("✅ Whisper model pre-loaded successfully!")
    except Exception as e:
        print(f"⚠️  Warning: Could not pre-load Whisper model: {e}")
        print("   Model will be downloaded on first analysis (may take a few minutes)")
    
    # On Windows, completely disable reloader to prevent thread killing
    # On other platforms, you can enable it if needed
    if sys.platform == 'win32':
        print("⚠️  Windows detected: Disabling auto-reloader to protect background threads")
        app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False, threaded=True)
    else:
        app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=True, threaded=True)
