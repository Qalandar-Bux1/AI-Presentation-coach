from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.session_routes import session_bp
from flask import send_from_directory
import os
from config.database import test_database_connection
from dotenv import load_dotenv
from utils.path_utils import get_env_path, resolve_uploads_dir, debug_print_paths

app = Flask(__name__)
# Configure CORS for local dev frontend origins.
# Using explicit origins avoids wildcard+credentials ambiguity in browsers.
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
CORS(
    app,
    resources={
        r"/*": {
            "origins": [origin.strip() for origin in allowed_origins.split(",") if origin.strip()],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "supports_credentials": False,
        }
    },
)

# Add CORS headers to all responses
# CORS headers are handled by flask-cors (configured above)
# Redundant after_request handler removed to prevent double headers


# Register Routes
app.register_blueprint(auth_bp)
app.register_blueprint(session_bp)

@app.route('/')
def home():
    return "Flask backend connected successfully!"


@app.route('/health/db')
def health_db():
    ok, message = test_database_connection()
    if ok:
        return {"success": True, "message": message}, 200
    return {"success": False, "error": message}, 503

# Load .env before reading environment variables in both dev and packaged mode.
load_dotenv(get_env_path())

# Serve uploaded files (videos) securely from UPLOAD_FOLDER
app.config['UPLOAD_FOLDER'] = resolve_uploads_dir(os.getenv("UPLOAD_FOLDER"))
debug_print_paths("BACKEND_STARTUP")

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    # Background analysis threads log via print; line-buffer so Windows consoles show progress live.
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(line_buffering=True)
            sys.stderr.reconfigure(line_buffering=True)
        except Exception:
            pass

    print("Starting Flask authentication + session server...")
    db_ok, db_message = test_database_connection()
    if db_ok:
        print(f"OK: {db_message}")
    else:
        print(f"WARNING: {db_message}")
        print("   Server will still start, but DB-backed endpoints may return 503 until connection is fixed.")
    # Disable reloader completely to prevent thread killing on Windows
    # This is critical for background analysis threads to survive
    # Pre-load Whisper model on startup to avoid first-time download delay
    print("Pre-loading Whisper model (tiny) for faster analysis...")
    try:
        from utils.transcription import load_whisper_model
        load_whisper_model()
        print("Whisper model pre-loaded successfully!")
    except Exception as e:
        print(f"WARNING: Could not pre-load Whisper model: {e}")
        print("   Model will be downloaded on first analysis (may take a few minutes)")
    
    # On Windows, completely disable reloader to prevent thread killing
    # On other platforms, you can enable it if needed
    try:
        _server_port = int(os.getenv("FLASK_PORT", os.getenv("PORT", "5000")))
    except ValueError:
        _server_port = 5000
    print(f"Listening on port {_server_port} (set FLASK_PORT or PORT to override)")

    if sys.platform == 'win32':
        print("WARNING: Windows detected: Disabling auto-reloader to protect background threads")
        app.run(host="0.0.0.0", port=_server_port, debug=True, use_reloader=False, threaded=True)
    else:
        app.run(host="0.0.0.0", port=_server_port, debug=True, use_reloader=True, threaded=True)
