# Setup Guide - Analysis Pipeline

## Quick Start

### 1. Install Python Dependencies

```bash
cd server
pip install -r requirements.txt
```

**Note:** This will install:
- Flask and related packages
- OpenCV, MediaPipe for video analysis
- OpenAI Whisper for transcription
- Librosa for audio analysis
- NLTK for text analysis
- OpenAI library for feedback generation

### 2. Install FFmpeg

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract and add to PATH
3. Verify: `ffmpeg -version`

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

### 3. Download NLTK Data (Automatic)

NLTK data is automatically downloaded on first run. If you need to download manually:

```python
import nltk
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('stopwords')
```

### 4. Set Up Environment Variables

Create/update `.env` file in `server/` directory:

```env
MONGO_URI=mongodb+srv://buxq4935_db_user:gZoKgwr3vMiBYv3e@cluster0.hsaifuk.mongodb.net/?retryWrites=true&w=majority
DB_NAME=ai_presentation_coach
OPENAI_API_KEY=sk-your-api-key-here  # Optional: for LLM feedback
UPLOAD_FOLDER=./uploads
```

**Note:** If `OPENAI_API_KEY` is not set, the system will use template-based feedback (still functional).

### 5. Test the Pipeline

```python
# Test script (test_analysis.py)
from utils.analysis_pipeline import analyze_presentation_video

try:
    report = analyze_presentation_video("path/to/test_video.mp4")
    print(f"✅ Analysis successful!")
    print(f"Score: {report['scores']['final_score']}/100")
    print(f"Grade: {report['scores']['grade']}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
```

## API Testing

### Using cURL

**Analyze by Session ID:**
```bash
curl -X POST http://localhost:5000/session/{session_id}/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Analyze by Video Path:**
```bash
curl -X POST http://localhost:5000/session/analyze-video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"video_id": "session_id"}'
```

### Using Python Requests

```python
import requests

url = "http://localhost:5000/session/analyze-video"
headers = {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}
data = {
    "video_id": "your_session_id"
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(result)
```

## Troubleshooting

### FFmpeg Not Found

**Error:** `FFmpeg not found`

**Solution:**
1. Install FFmpeg (see step 2)
2. Add to system PATH
3. Restart terminal/IDE

### Whisper Model Download Issues

**Error:** `Failed to download Whisper model`

**Solution:**
1. Check internet connection
2. Models are downloaded to `~/.cache/whisper/`
3. For offline use, download manually and place in cache directory

### MediaPipe/OpenCV Errors

**Error:** `Could not open video file`

**Solution:**
1. Verify video file exists and is readable
2. Check video format (MP4, WEBM supported)
3. Ensure OpenCV can read the file: `cv2.VideoCapture(video_path)`

### Memory Issues

**Error:** Out of memory during analysis

**Solution:**
1. Use smaller Whisper model (`tiny` instead of `base`)
2. Reduce video resolution before analysis
3. Increase system RAM or use cloud instance

### OpenAI API Errors

**Error:** `OpenAI API key invalid`

**Solution:**
1. Check `.env` file has correct `OPENAI_API_KEY`
2. Verify API key is valid and has credits
3. System will fallback to template feedback if API fails

## Performance Optimization

### For Faster Analysis

1. **Use smaller Whisper model:**
   ```python
   # In transcription.py, change default:
   model_size = "tiny"  # Instead of "base"
   ```

2. **Reduce video analysis sampling:**
   ```python
   # In video_analyzer.py:
   sample_rate = 10  # Analyze every 10th frame (instead of 5)
   ```

3. **Process videos in background:**
   - Use Celery or similar task queue
   - Return job ID immediately
   - Poll for results

### For Better Accuracy

1. **Use larger Whisper model:**
   ```python
   model_size = "medium"  # or "large"
   ```

2. **Increase video analysis sampling:**
   ```python
   sample_rate = 2  # Analyze every 2nd frame
   ```

## Production Deployment

### Recommended Setup

1. **Use production WSGI server:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Set up background task processing:**
   - Use Celery + Redis for async analysis
   - Prevents request timeouts

3. **Optimize resource usage:**
   - Cache Whisper models in memory
   - Use GPU for video processing (if available)
   - Implement request queuing

4. **Monitor and log:**
   - Log all analysis requests
   - Track processing times
   - Monitor error rates

## Folder Structure

```
server/
├── utils/
│   ├── audioextraction.py      ✅ Audio extraction
│   ├── transcription.py         ✅ Speech-to-text
│   ├── audio_analyzer.py         ✅ Audio metrics
│   ├── text_analyzer.py          ✅ Text quality
│   ├── video_analyzer.py         ✅ Video metrics
│   ├── scoring.py                ✅ Score calculation
│   ├── feedback_generator.py     ✅ Feedback generation
│   └── analysis_pipeline.py      ✅ Main orchestrator
├── routes/
│   └── session_routes.py         ✅ API endpoints
├── uploads/                      📁 Video storage
├── requirements.txt              ✅ Dependencies
├── app.py                        ✅ Flask app
└── .env                          ⚙️ Configuration
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up environment variables
3. ✅ Test with a sample video
4. ✅ Integrate with frontend
5. ✅ Deploy to production

## Support

For issues or questions:
1. Check `ANALYSIS_PIPELINE_DOCUMENTATION.md` for detailed docs
2. Review error messages in console
3. Check video file format and size
4. Verify all dependencies are installed
