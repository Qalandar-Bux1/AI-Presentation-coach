from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp  # Import your auth routes

app = Flask(__name__)
CORS(app)  # Allow frontend connection (Next.js)

# Register your authentication routes
app.register_blueprint(auth_bp)

@app.route('/')
def home():
    return "Flask backend connected successfully!"

if __name__ == '__main__':
    print("🚀 Starting Flask authentication server...")
    app.run(host="0.0.0.0", port=50001, debug=True)
