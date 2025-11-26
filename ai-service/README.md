# Panorama AI Detection Service

AI-powered object detection service using FastAPI and YOLOv5 with bounding boxes.

## Features

- 🤖 **Object Detection**: Detect and locate objects in images using YOLOv5
- 🎯 **High Accuracy**: Pre-trained on COCO dataset with 80 object categories
- 🚀 **Fast API**: Built with FastAPI for high performance
- 🐳 **Docker Ready**: Containerized for easy deployment
- 📊 **Detailed Analysis**: Confidence scores, metadata, and summaries
- 🔧 **Configurable**: Adjustable confidence thresholds and detection limits
- 🧪 **Well Tested**: Comprehensive test suite with >80% coverage

## Tech Stack

- **Framework**: FastAPI
- **ML Model**: YOLOv5 (COCO pre-trained)
- **Image Processing**: Pillow, OpenCV
- **Server**: Uvicorn

## API Endpoints

### POST /api/detection/analyze

Comprehensive image analysis with object detection

**Request:**

- `file`: Image file (multipart/form-data)
- `confidence_threshold`: Optional, minimum confidence (0.0-1.0)
- `max_detections`: Optional, maximum detections to return

**Response:**

```json
{
  "success": true,
  "data": {
    "detections": [
      {
        "class_id": 281,
        "class_name": "tabby cat",
        "confidence": 85.32,
        "description": "This image very likely contains tabby cat (85.3% confidence)"
      }
    ],
    "metadata": {
      "image_width": 1920,
      "image_height": 1080,
      "total_detections": 5,
      "average_confidence": 72.45,
      "model_name": "YOLOv5"
    },
    "summary": "Primary object: tabby cat (85.32% confidence). Also detected 4 other objects."
  }
}
```

### POST /api/detection/detect

Quick object detection

**Request:**

- `file`: Image file
- `confidence_threshold`: Optional, minimum confidence

**Response:**

```json
{
  "success": true,
  "detections": [...],
  "count": 5
}
```

### GET /api/detection/health

Health check endpoint

### GET /api/detection/info

Service information and configuration

## Quick Start

### Local Development

1. **Install dependencies:**

```bash
pip install -r requirements.txt
```

2. **Run the service:**

```bash
uvicorn app.main:app --reload --port 8000
```

3. **Access API docs:**

```
http://localhost:8000/docs
```

### Docker Deployment

1. **Build and run:**

```bash
docker-compose up -d
```

2. **Check logs:**

```bash
docker logs panorama-ai-service -f
```

3. **Test the service:**

```bash
curl http://localhost:8000/health
```

## Usage Examples

### Using cURL

```bash
# Analyze an image
curl -X POST http://localhost:8000/api/detection/analyze \
  -F "file=@image.jpg" \
  -F "confidence_threshold=0.5" \
  -F "max_detections=10"

# Quick detection
curl -X POST http://localhost:8000/api/detection/detect \
  -F "file=@image.jpg"
```

### Using Python

```python
import requests

# Analyze image
with open('image.jpg', 'rb') as f:
    files = {'file': f}
    data = {
        'confidence_threshold': 0.5,
        'max_detections': 10
    }
    response = requests.post(
        'http://localhost:8000/api/detection/analyze',
        files=files,
        data=data
    )
    result = response.json()
    print(result)
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("confidence_threshold", "0.5");

const response = await fetch("http://localhost:8000/api/detection/analyze", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log(result);
```

## Configuration

Edit `.env` file:

```env
# Model Configuration
MODEL_NAME=yolov5s
CONFIDENCE_THRESHOLD=0.5
MAX_DETECTIONS=10

# Server Configuration
HOST=0.0.0.0
PORT=8000

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

## Model Information

**YOLOv5s (COCO)**

- Pre-trained on COCO dataset
- 80 object categories with bounding boxes
- High accuracy for common objects
- Optimized for inference

**Supported Categories Include:**

- People (person)
- Animals (cat, dog, bird, horse, etc.)
- Vehicles (car, truck, bicycle, motorcycle, etc.)
- Furniture (chair, couch, bed, dining table, etc.)
- Electronics (tv, laptop, cell phone, etc.)
- Kitchen items (bottle, cup, fork, knife, bowl, etc.)
- And 60+ more common object categories

## Performance

- **CPU Mode**: ~500ms per image
- **GPU Mode**: ~50ms per image (with CUDA)
- **Memory**: ~2GB for model loading
- **Supported Formats**: JPG, JPEG, PNG, WEBP

## Development

### Project Structure

```
ai-service/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   └── detection.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── detector.py
│   ├── __init__.py
│   └── main.py
├── tests/
├── .env
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

### Running Tests

```bash
# Install test dependencies
pip install -r requirements-test.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Use test runner script
./run_tests.sh all
./run_tests.sh coverage
```

**See [TESTING.md](TESTING.md) for comprehensive testing guide.**

**Test Coverage:**

- 60+ comprehensive tests
- Unit, integration, and API tests
- > 80% code coverage
- Tests for all endpoints and models

## Integration with Panorama App

The AI service integrates seamlessly with the Panorama application:

1. **Backend Integration**: Connect via `BACKEND_API_URL`
2. **Frontend Integration**: Call from Detection page
3. **Network**: Shares `backend_panorama-network`

## Troubleshooting

### Model Download Issues

The model will download automatically on first run (~100MB). Ensure internet connection.

### Memory Issues

If running on limited memory, reduce `MAX_DETECTIONS` or use CPU mode.

### CORS Errors

Add your frontend URL to `CORS_ORIGINS` in `.env`

## License

MIT License
