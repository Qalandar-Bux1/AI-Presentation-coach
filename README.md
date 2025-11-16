AI Presentation Coach

Project Description

The AI Presentation Coach is a web-based application designed to help users improve their presentation skills. The system will eventually provide AI-powered feedback analyzing eye contact, posture, gestures, filler words, and speech clarity.

Currently, the project implements the basic framework and core functionalities, with AI feedback planned for future development.

Current Progress (30%)

Implemented features include:

User Authentication: Sign up, login, and session management

Video Management:

Upload recorded presentation videos

Record videos directly through the app

View all uploaded videos by the user

User Profile: View and manage user details

Frontend & Backend Integration: Next.js frontend communicates with Flask backend

Note: AI-powered feedback (analysis of speech and non-verbal cues) will be implemented in the next phases.

Tech Stack

Frontend:

Next.js

React.js

Tailwind CSS / Custom CSS

Backend:

Flask



GUI / Future AI Modules:

Mediapipe / OpenCV / NLP libraries (for AI feedback, future implementation)

Version Control:

GitHub

Installation
Backend (Flask)
git clone 
cd backend
python -m venv venv
source venv/bin/activate       # Linux / Mac
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python app.py

Frontend (Next.js)
cd ../frontend
npm install
npm run dev


Open http://localhost:3000 in your browser.



Future Work

Implement AI Feedback Module: eye contact, gestures, posture, filler words detection

Real-time analysis during live presentations

Feedback visualization with charts and graphs

User progress tracking and improvement suggestions

Deployment for public access
