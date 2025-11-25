"""
Tests for detection API endpoints
"""
import pytest
from fastapi.testclient import TestClient
import io


class TestDetectionAnalyze:
    """Test /api/detection/analyze endpoint"""
    
    def test_analyze_success(self, test_client: TestClient, sample_image: bytes):
        """Test successful image analysis"""
        files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}
        
        response = test_client.post("/api/detection/analyze", files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "data" in data
        assert "detections" in data["data"]
        assert "metadata" in data["data"]
        assert "summary" in data["data"]
    
    def test_analyze_with_custom_confidence(self, test_client: TestClient, sample_image: bytes):
        """Test analysis with custom confidence threshold"""
        files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}
        data = {"confidence_threshold": 0.7}
        
        response = test_client.post(
            "/api/detection/analyze",
            files=files,
            data=data
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
    
    def test_analyze_with_max_detections(self, test_client: TestClient, sample_image: bytes):
        """Test analysis with max detections limit"""
        files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}
        data = {"max_detections": 5}
        
        response = test_client.post(
            "/api/detection/analyze",
            files=files,
            data=data
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        
        # Check that detections don't exceed max
        detections = result["data"]["detections"]
        assert len(detections) <= 5
    
    def test_analyze_no_file(self, test_client: TestClient):
        """Test analysis without file upload"""
        response = test_client.post("/api/detection/analyze")
        
        assert response.status_code == 422  # Validation error
    
    def test_analyze_invalid_image(self, test_client: TestClient, invalid_image: bytes):
        """Test analysis with invalid image data"""
        files = {"file": ("test.txt", io.BytesIO(invalid_image), "text/plain")}
        
        response = test_client.post("/api/detection/analyze", files=files)
        
        # Should return error
        assert response.status_code in [400, 500]
    
    def test_analyze_large_image(self, test_client: TestClient, large_image: bytes):
        """Test analysis with large image"""
        files = {"file": ("large.jpg", io.BytesIO(large_image), "image/jpeg")}
        
        response = test_client.post("/api/detection/analyze", files=files)
        
        # Should succeed or return specific error
        assert response.status_code in [200, 413]  # 413 = Payload Too Large
    
    def test_analyze_response_structure(self, test_client: TestClient, sample_image: bytes):
        """Test that response has correct structure"""
        files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}
        
        response = test_client.post("/api/detection/analyze", files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check top-level structure
        assert "success" in data
        assert "data" in data
        
        # Check data structure
        result_data = data["data"]
        assert "detections" in result_data
        assert "metadata" in result_data
        assert "summary" in result_data
        
        # Check metadata structure
        metadata = result_data["metadata"]
        assert "image_width" in metadata
        assert "image_height" in metadata
        assert "total_detections" in metadata
        assert "model_name" in metadata
        assert "device" in metadata
        
        # Check detections structure (if any)
        if result_data["detections"]:
            detection = result_data["detections"][0]
            assert "class_id" in detection
            assert "class_name" in detection
            assert "confidence" in detection
            assert "description" in detection


class TestDetectionDetect:
    """Test /api/detection/detect endpoint"""
    
    def test_detect_success(self, test_client: TestClient, sample_image: bytes):
        """Test successful object detection"""
        files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}
        
        response = test_client.post("/api/detection/detect", files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "detections" in data
        assert isinstance(data["detections"], list)
    
    def test_detect_with_parameters(self, test_client: TestClient, sample_image: bytes):
        """Test detection with custom parameters"""
        files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}
        data = {
            "confidence_threshold": 0.6,
            "max_detections": 3
        }
        
        response = test_client.post(
            "/api/detection/detect",
            files=files,
            data=data
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        assert len(result["detections"]) <= 3


class TestDetectionHealth:
    """Test /api/detection/health endpoint"""
    
    def test_health_check(self, test_client: TestClient):
        """Test detection service health check"""
        response = test_client.get("/api/detection/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "healthy"
        assert "model" in data
        assert "version" in data


class TestDetectionValidation:
    """Test input validation"""
    
    def test_invalid_confidence_threshold(self, test_client: TestClient, sample_image: bytes):
        """Test with invalid confidence threshold"""
        files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}
        data = {"confidence_threshold": 1.5}  # Invalid: > 1.0
        
        response = test_client.post(
            "/api/detection/analyze",
            files=files,
            data=data
        )
        
        # Should either validate, process with clamped value, or return error
        # 500 is acceptable if the model rejects invalid values
        assert response.status_code in [200, 400, 422, 500]
    
    def test_negative_max_detections(self, test_client: TestClient, sample_image: bytes):
        """Test with negative max detections"""
        files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}
        data = {"max_detections": -1}  # Invalid: negative
        
        response = test_client.post(
            "/api/detection/analyze",
            files=files,
            data=data
        )
        
        # Should either validate or process with default value
        assert response.status_code in [200, 400, 422]
    
    def test_wrong_file_type(self, test_client: TestClient):
        """Test with wrong file type"""
        files = {"file": ("test.txt", io.BytesIO(b"not an image"), "text/plain")}
        
        response = test_client.post("/api/detection/analyze", files=files)
        
        # Should return error
        assert response.status_code in [400, 415, 500]
