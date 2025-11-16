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
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

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
    app.run(host="0.0.0.0", port=5000, debug=True)
