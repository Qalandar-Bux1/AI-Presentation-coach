from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.session_routes import session_bp

app = Flask(__name__)
CORS(app)

# Register Routes
app.register_blueprint(auth_bp)
app.register_blueprint(session_bp)

@app.route('/')
def home():
    return "✅ Flask backend connected successfully!"

if __name__ == '__main__':
    print("🚀 Starting Flask authentication + session server...")
    app.run(host="0.0.0.0", port=5000, debug=True)
