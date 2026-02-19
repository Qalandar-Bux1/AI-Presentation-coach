# Analysis Pipeline Documentation

## Overview

This document describes the complete video analysis pipeline for the AI Presentation Coach application. The pipeline analyzes presentation videos across multiple dimensions: audio, text, and video, then generates comprehensive scores and feedback.

## Architecture

The analysis pipeline follows a **modular, clean architecture** with the following components:

```
server/
├── utils/
│   ├── audioextraction.py      # Audio extraction from video (FFmpeg)
│   ├── transcription.py         # Speech-to-text (Whisper)
│   ├── audio_analyzer.py         # Audio analysis (WPM, fillers, pitch, volume)
│   ├── text_analyzer.py          # Text analysis (grammar, repetition, structure)
│   ├── video_analyzer.py         # Video analysis (face, posture, gestures, eye contact)
│   ├── scoring.py                # Score calculation with weighted categories
│   ├── feedback_generator.py     # LLM-based feedback generation
│   └── analysis_pipeline.py      # Main orchestrator
└── routes/
    └── session_routes.py         # API endpoints
```

## Pipeline Flow

```
Video File
    ↓
1. Audio Extraction (FFmpeg)
    ↓
2. Speech Transcription (Whisper)
    ↓
3. Audio Analysis ──┐
4. Text Analysis ──┤
5. Video Analysis ──┤
    ↓               ↓
6. Score Calculation (Weighted)
    ↓
7. Feedback Generation (LLM/Template)
    ↓
Complete Analysis Report
```

## API Endpoints

### 1. POST `/session/<session_id>/analyze`

Analyzes a video associated with a session.

**Authentication:** Required (Bearer token)

**Request:**
```json
POST /session/{session_id}/analyze
Headers: {
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Analysis completed successfully",
  "report": {
    "transcription": {...},
    "audio_analysis": {...},
    "text_analysis": {...},
    "video_analysis": {...},
    "scores": {...},
    "feedback": {...},
    "metadata": {...}
  }
}
```

### 2. POST `/session/analyze-video`

Analyzes a video directly by providing video path or video ID.

**Authentication:** Required (Bearer token)

**Request:**
```json
POST /session/analyze-video
Headers: {
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
Body: {
  "video_path": "/path/to/video.mp4",  // Optional
  "video_id": "session_id"              // Optional (one required)
}
```

**Response:** Same as above

## Analysis Components

### 1. Audio Extraction (`audioextraction.py`)

**Purpose:** Extract audio from video files using FFmpeg.

**Key Functions:**
- `extract_audio(video_path, output_format="wav")` - Extracts audio to WAV format
- `get_audio_duration(audio_path)` - Gets audio duration in seconds

**Requirements:**
- FFmpeg must be installed on the system
- Audio is extracted at 16kHz mono for Whisper compatibility

### 2. Transcription (`transcription.py`)

**Purpose:** Convert speech to text using OpenAI Whisper.

**Key Functions:**
- `transcribe_audio(audio_path, model_size="base")` - Transcribes audio to text
- `load_whisper_model(model_size)` - Loads Whisper model (lazy loading)

**Model Sizes:**
- `tiny` - Fastest, least accurate
- `base` - Balanced (recommended)
- `small`, `medium`, `large` - More accurate, slower

### 3. Audio Analysis (`audio_analyzer.py`)

**Purpose:** Analyze audio characteristics.

**Metrics:**
- **Speaking Speed (WPM):** Words per minute
  - Optimal: 120-160 WPM
- **Filler Words:** Count of "um", "uh", "like", etc.
  - Target: < 5% of words
- **Pitch Stability:** Consistency of pitch
  - Score: 0-100 (higher = more stable)
- **Volume Stability:** Consistency of volume
  - Score: 0-100 (higher = more stable)
- **Volume Level:** Appropriate loudness
  - Optimal: -20 to -12 dB

**Key Functions:**
- `analyze_audio_complete(audio_path, text, duration)` - Complete audio analysis

### 4. Text Analysis (`text_analyzer.py`)

**Purpose:** Analyze text quality and structure.

**Metrics:**
- **Grammar Quality:** Basic grammar heuristics
  - Score: 0-100
  - Checks: sentence length, repeated words, fragments
- **Repetition:** Detects repetitive phrases and words
  - Score: 0-100 (higher = less repetition)
- **Structure:** Checks for intro, body, conclusion
  - Score: 0-100
  - Indicators: keywords, text length, sentence count

**Key Functions:**
- `analyze_text_complete(text)` - Complete text analysis

### 5. Video Analysis (`video_analyzer.py`)

**Purpose:** Analyze video for presentation metrics using OpenCV and MediaPipe.

**Metrics:**
- **Face Presence:** Percentage of frames with detected face
  - Target: > 80%
- **Eye Contact:** Quality of eye contact with camera
  - Score: 0-100
  - Based on face orientation and position
- **Posture:** Quality of body posture
  - Score: 0-100
  - Checks: shoulder alignment, head position
- **Gestures:** Frequency of hand gestures
  - Optimal: 20-50% of frames
- **Confidence Estimate:** Overall confidence score
  - Combination of all video metrics

**Key Functions:**
- `analyze_video_file(video_path)` - Complete video analysis
- Uses MediaPipe for face detection, pose estimation, hand tracking

### 6. Scoring (`scoring.py`)

**Purpose:** Calculate weighted scores for different categories.

**Score Categories (Weights):**
1. **Voice & Delivery (30%)**
   - WPM score
   - Filler words score
   - Pitch stability
   - Volume stability
   - Volume level

2. **Content Quality (30%)**
   - Grammar score (40%)
   - Repetition score (30%)
   - Structure score (30%)

3. **Confidence & Body Language (25%)**
   - Face presence (25%)
   - Eye contact (35%)
   - Posture (25%)
   - Gesture score (15%)

4. **Engagement (15%)**
   - Volume variation (40%)
   - Gesture engagement (40%)
   - Eye contact (20%)

**Final Score:** Weighted sum out of 100

**Grade Scale:**
- 90-100: Excellent (A+)
- 80-89: Very Good (A)
- 70-79: Good (B)
- 60-69: Fair (C)
- < 60: Needs Improvement (D)

### 7. Feedback Generation (`feedback_generator.py`)

**Purpose:** Generate human-like feedback using LLM or templates.

**Methods:**
1. **LLM (OpenAI GPT-3.5-turbo):** If `OPENAI_API_KEY` is set
   - Generates contextual, personalized feedback
   - Returns JSON with strengths, improvements, overall assessment

2. **Template-based:** Fallback method
   - Rule-based feedback based on metrics
   - Still provides actionable insights

**Output Structure:**
```json
{
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "overall_assessment": "...",
  "generated_by": "openai_gpt" | "template"
}
```

## Main Pipeline (`analysis_pipeline.py`)

**Purpose:** Orchestrates the complete analysis workflow.

**Class:** `AnalysisPipeline`

**Key Method:**
- `analyze_video(video_path)` - Runs complete pipeline

**Steps:**
1. Extract audio
2. Transcribe audio
3. Analyze audio
4. Analyze text
5. Analyze video
6. Calculate scores
7. Generate feedback
8. Compile report
9. Cleanup temporary files

## Report Structure

The complete analysis report contains:

```json
{
  "transcription": {
    "text": "Full transcribed text",
    "language": "en",
    "segments_count": 10
  },
  "audio_analysis": {
    "speaking_speed": {...},
    "filler_words": {...},
    "pitch": {...},
    "volume": {...},
    "duration_seconds": 120.5
  },
  "text_analysis": {
    "grammar": {...},
    "repetition": {...},
    "structure": {...},
    "text_length": 500,
    "word_count": 80
  },
  "video_analysis": {
    "face_presence": {...},
    "eye_contact": {...},
    "posture": {...},
    "gestures": {...},
    "confidence_estimate": 75.5,
    "duration_seconds": 120.5,
    "frames_analyzed": 1440
  },
  "scores": {
    "final_score": 82.5,
    "grade": "Very Good",
    "rating": "A",
    "breakdown": {...}
  },
  "feedback": {
    "strengths": [...],
    "improvements": [...],
    "overall_assessment": "...",
    "generated_by": "openai_gpt"
  },
  "metadata": {
    "video_path": "...",
    "duration_seconds": 120.5,
    "analysis_timestamp": "2024-01-15T10:30:00"
  }
}
```

## Installation & Setup

### 1. Install Python Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. Install System Dependencies

**FFmpeg:**
- Windows: Download from https://ffmpeg.org/download.html
- Linux: `sudo apt-get install ffmpeg`
- Mac: `brew install ffmpeg`

**NLTK Data:**
- Automatically downloaded on first run
- Or manually: `python -m nltk.downloader punkt averaged_perceptron_tagger stopwords`

### 3. Environment Variables

Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key  # Optional (for LLM feedback)
UPLOAD_FOLDER=./uploads
```

### 4. Whisper Model

- Models are automatically downloaded on first use
- Default: `base` model (~150MB)
- Larger models provide better accuracy but are slower

## Usage Example

```python
from utils.analysis_pipeline import analyze_presentation_video

# Analyze a video
report = analyze_presentation_video("path/to/video.mp4")

# Access results
print(f"Final Score: {report['scores']['final_score']}")
print(f"Grade: {report['scores']['grade']}")
print(f"WPM: {report['audio_analysis']['speaking_speed']['wpm']}")
print(f"Feedback: {report['feedback']['overall_assessment']}")
```

## Performance Considerations

- **Video Analysis:** Samples every 5th frame by default (configurable)
- **Whisper Model:** `base` model provides good balance of speed/accuracy
- **Temporary Files:** Automatically cleaned up after analysis
- **Processing Time:** ~2-5 minutes for a 2-minute video (depends on hardware)

## Error Handling

All modules include comprehensive error handling:
- File not found errors
- FFmpeg/MediaPipe initialization errors
- Transcription failures
- Graceful fallbacks (e.g., template feedback if LLM unavailable)

## Best Practices for FYP Defense

1. **Modularity:** Each component is independent and testable
2. **Clean Architecture:** Separation of concerns (extraction → analysis → scoring → feedback)
3. **Production-Ready:** Error handling, cleanup, logging
4. **Explainable:** Clear metrics and scoring rationale
5. **Extensible:** Easy to add new analysis metrics

## Future Enhancements

- Real-time analysis during recording
- Advanced NLP for content quality
- Emotion detection from facial expressions
- Comparison with previous presentations
- Progress tracking over time
