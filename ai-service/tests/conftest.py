"""
Pytest configuration and fixtures for AI service tests
"""
import os
import sys
from pathlib import Path
from typing import Generator
import pytest
from fastapi.testclient import TestClient
from PIL import Image
import io

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
from app.core import settings


@pytest.fixture(scope="session")
def test_client() -> Generator:
    """Create a test client for the FastAPI app"""
    with TestClient(app) as client:
        yield client


@pytest.fixture(scope="session")
def sample_image() -> bytes:
    """Create a sample test image"""
    # Create a simple RGB image
    img = Image.new('RGB', (640, 480), color=(73, 109, 137))
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    return img_bytes.getvalue()


@pytest.fixture(scope="session")
def sample_image_file(sample_image: bytes) -> Generator:
    """Create a temporary image file"""
    test_file = Path(__file__).parent / "test_image.jpg"
    
    with open(test_file, 'wb') as f:
        f.write(sample_image)
    
    yield test_file
    
    # Cleanup
    if test_file.exists():
        test_file.unlink()


@pytest.fixture(scope="session")
def large_image() -> bytes:
    """Create a large test image"""
    # Create a larger image
    img = Image.new('RGB', (1920, 1080), color=(100, 150, 200))
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    return img_bytes.getvalue()


@pytest.fixture(scope="session")
def invalid_image() -> bytes:
    """Create invalid image data"""
    return b"This is not a valid image file"


@pytest.fixture
def mock_settings(monkeypatch):
    """Mock settings for testing"""
    monkeypatch.setattr(settings, "CONFIDENCE_THRESHOLD", 0.5)
    monkeypatch.setattr(settings, "MAX_DETECTIONS", 10)
    monkeypatch.setattr(settings, "MODEL_NAME", "yolov5s")
    return settings


@pytest.fixture(scope="session")
def test_image_with_objects() -> bytes:
    """Create a more complex test image that might contain detectable objects"""
    # Create an image with some patterns
    img = Image.new('RGB', (800, 600), color='white')
    
    # Add some colored rectangles (simulating objects)
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    
    # Draw some shapes
    draw.rectangle([100, 100, 300, 300], fill='blue', outline='black')
    draw.rectangle([400, 200, 600, 400], fill='red', outline='black')
    draw.ellipse([150, 400, 350, 550], fill='green', outline='black')
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    return img_bytes.getvalue()
