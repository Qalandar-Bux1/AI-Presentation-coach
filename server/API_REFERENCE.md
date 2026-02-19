# API Reference - Analysis Endpoints

## Base URL
```
http://localhost:5000
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <your_token>
```

---

## Endpoints

### 1. Analyze Session Video

Analyze a video associated with a session ID.

**Endpoint:** `POST /session/<session_id>/analyze`

**Request:**
```http
POST /session/507f1f77bcf86cd799439011/analyze
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Analysis completed successfully",
  "report": {
    "transcription": {
      "text": "Hello, today I will be presenting...",
      "language": "en",
      "segments_count": 15
    },
    "audio_analysis": {
      "speaking_speed": {
        "wpm": 145.5,
        "assessment": "optimal"
      },
      "filler_words": {
        "total": 5,
        "percentage": 3.2,
        "breakdown": {
          "um": 2,
          "uh": 1,
          "like": 2
        }
      },
      "pitch": {
        "mean": 180.5,
        "std": 12.3,
        "stability_score": 85.2
      },
      "volume": {
        "mean_db": -15.2,
        "std_db": 4.5,
        "stability_score": 78.5,
        "level_score": 90.0
      },
      "duration_seconds": 120.5
    },
    "text_analysis": {
      "grammar": {
        "score": 82.5,
        "issues": [],
        "sentence_count": 12
      },
      "repetition": {
        "repetition_score": 88.0,
        "repeated_phrases": [],
        "repeated_words": {}
      },
      "structure": {
        "has_intro": true,
        "has_body": true,
        "has_conclusion": true,
        "structure_score": 100.0,
        "word_count": 156
      }
    },
    "video_analysis": {
      "face_presence": {
        "percentage": 95.2,
        "frames_analyzed": 1440
      },
      "eye_contact": {
        "score": 75.5,
        "assessment": "good"
      },
      "posture": {
        "score": 82.0,
        "assessment": "good"
      },
      "gestures": {
        "frequency_percentage": 35.0,
        "assessment": "appropriate"
      },
      "confidence_estimate": 78.5,
      "duration_seconds": 120.5,
      "frames_analyzed": 1440
    },
    "scores": {
      "final_score": 82.5,
      "grade": "Very Good",
      "rating": "A",
      "breakdown": {
        "voice_delivery": {
          "score": 85.0,
          "weight": 0.30,
          "contribution": 25.5
        },
        "content_quality": {
          "score": 80.0,
          "weight": 0.30,
          "contribution": 24.0
        },
        "confidence_body_language": {
          "score": 78.5,
          "weight": 0.25,
          "contribution": 19.6
        },
        "engagement": {
          "score": 88.0,
          "weight": 0.15,
          "contribution": 13.2
        }
      }
    },
    "feedback": {
      "strengths": [
        "Your voice delivery is strong with good pacing and clarity.",
        "You maintained good eye contact throughout the presentation.",
        "Your content is well-structured and grammatically sound."
      ],
      "improvements": [
        "Reduce filler words (currently 3.2%). Practice pausing instead of using 'um' or 'uh'.",
        "Work on maintaining an upright, confident posture throughout your presentation."
      ],
      "overall_assessment": "Good presentation! You scored 82.5/100. With some targeted improvements, you can reach the next level.",
      "generated_by": "openai_gpt"
    },
    "metadata": {
      "video_path": "uploads/user123_1234567890.mp4",
      "duration_seconds": 120.5,
      "analysis_timestamp": "2024-01-15T10:30:00.123456"
    }
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "error": "Session not found or access denied"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Analysis failed: <error_message>"
}
```

---

### 2. Analyze Video Directly

Analyze a video by providing video path or video ID.

**Endpoint:** `POST /session/analyze-video`

**Request:**
```http
POST /session/analyze-video
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "video_id": "507f1f77bcf86cd799439011"
}
```

**OR**

```json
{
  "video_path": "uploads/video.mp4"
}
```

**Response:** Same as endpoint 1 (without saving to database)

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Either video_path or video_id must be provided"
}
```

**404 Not Found:**
```json
{
  "error": "Video file not found: <path>"
}
```

---

## Example Usage

### Python (requests)

```python
import requests

url = "http://localhost:5000/session/507f1f77bcf86cd799439011/analyze"
headers = {
    "Authorization": "Bearer your_token_here"
}

response = requests.post(url, headers=headers)
data = response.json()

if response.status_code == 200:
    report = data["report"]
    print(f"Score: {report['scores']['final_score']}/100")
    print(f"Grade: {report['scores']['grade']}")
    print(f"WPM: {report['audio_analysis']['speaking_speed']['wpm']}")
else:
    print(f"Error: {data['error']}")
```

### JavaScript (fetch)

```javascript
const analyzeVideo = async (sessionId, token) => {
  const response = await fetch(
    `http://localhost:5000/session/${sessionId}/analyze`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json();

  if (response.ok) {
    const report = data.report;
    console.log(`Score: ${report.scores.final_score}/100`);
    console.log(`Grade: ${report.scores.grade}`);
    console.log(`WPM: ${report.audio_analysis.speaking_speed.wpm}`);
    return report;
  } else {
    console.error('Error:', data.error);
    throw new Error(data.error);
  }
};
```

### cURL

```bash
curl -X POST http://localhost:5000/session/507f1f77bcf86cd799439011/analyze \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json"
```

---

## Response Fields Explained

### Transcription
- `text`: Full transcribed text from audio
- `language`: Detected language (usually "en")
- `segments_count`: Number of speech segments

### Audio Analysis
- `speaking_speed.wpm`: Words per minute
- `filler_words.total`: Total filler words detected
- `filler_words.percentage`: Percentage of filler words
- `pitch.stability_score`: Pitch consistency (0-100)
- `volume.stability_score`: Volume consistency (0-100)
- `volume.level_score`: Appropriate volume level (0-100)

### Text Analysis
- `grammar.score`: Grammar quality (0-100)
- `repetition.repetition_score`: Repetition score (0-100, higher = less repetition)
- `structure.structure_score`: Structure completeness (0-100)
- `structure.has_intro`: Boolean - has introduction
- `structure.has_conclusion`: Boolean - has conclusion

### Video Analysis
- `face_presence.percentage`: Percentage of frames with face detected
- `eye_contact.score`: Eye contact quality (0-100)
- `posture.score`: Posture quality (0-100)
- `gestures.frequency_percentage`: Percentage of frames with gestures
- `confidence_estimate`: Overall confidence estimate (0-100)

### Scores
- `final_score`: Overall score out of 100
- `grade`: Text grade (Excellent, Very Good, Good, Fair, Needs Improvement)
- `rating`: Letter grade (A+, A, B, C, D)
- `breakdown`: Detailed score breakdown by category

### Feedback
- `strengths`: Array of positive feedback points
- `improvements`: Array of actionable improvement suggestions
- `overall_assessment`: Overall assessment text
- `generated_by`: "openai_gpt" or "template"

---

## Processing Time

Typical processing times:
- **Short video (1-2 min):** 2-5 minutes
- **Medium video (3-5 min):** 5-10 minutes
- **Long video (10+ min):** 10-20 minutes

*Times vary based on hardware, video resolution, and model size.*

---

## Notes

1. **Analysis is synchronous:** The endpoint waits for analysis to complete before returning
2. **Temporary files:** Audio files are automatically cleaned up after analysis
3. **Database update:** Endpoint 1 saves the report to the database automatically
4. **Error handling:** All errors are returned with appropriate HTTP status codes
5. **Authentication:** All endpoints require valid Bearer token

---

## Status Codes

- `200 OK`: Analysis completed successfully
- `400 Bad Request`: Invalid request (missing parameters, invalid ID)
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: Video file or session not found
- `500 Internal Server Error`: Analysis failed (check error message)
