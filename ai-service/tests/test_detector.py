"""
Tests for the detector model
"""
import pytest
from PIL import Image
import io
from pathlib import Path
import sys

# Add app to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models.detector import ObjectDetector, get_detector


class TestObjectDetector:
    """Test ObjectDetector class"""
    
    @pytest.fixture(scope="class")
    def detector(self):
        """Create a detector instance for testing"""
        return ObjectDetector(
            model_name="yolov5s",
            confidence_threshold=0.25,
            max_detections=50
        )
    
    @pytest.fixture
    def test_image(self):
        """Create a test PIL Image"""
        return Image.new('RGB', (640, 480), color=(100, 150, 200))
    
    def test_detector_initialization(self, detector):
        """Test detector initializes correctly"""
        assert detector is not None
        assert detector.model is not None
        assert detector.confidence_threshold == 0.25
        assert detector.max_detections == 50
        assert detector.model_name == "yolov5s"
    
    def test_detect_objects(self, detector, test_image):
        """Test object detection on image"""
        detections = detector.detect_objects(test_image)
        
        assert isinstance(detections, list)
        # Each detection should have required fields
        for detection in detections:
            assert "class_id" in detection
            assert "class_name" in detection
            assert "confidence" in detection
            assert "bbox" in detection
            
            # Check bbox structure
            bbox = detection["bbox"]
            assert "x" in bbox
            assert "y" in bbox
            assert "width" in bbox
            assert "height" in bbox
    
    def test_detect_with_custom_confidence(self, detector, test_image):
        """Test detection with custom confidence threshold"""
        # High confidence - should return fewer detections
        high_conf_detections = detector.detect_objects(
            test_image,
            confidence_threshold=0.8
        )
        
        # Low confidence - should return more detections
        low_conf_detections = detector.detect_objects(
            test_image,
            confidence_threshold=0.1
        )
        
        # All detections should meet confidence threshold
        for detection in high_conf_detections:
            assert detection["confidence"] >= 80.0  # Stored as percentage
    
    def test_detect_with_max_detections(self, detector, test_image):
        """Test detection with max detections limit"""
        max_det = 5
        detections = detector.detect_objects(
            test_image,
            max_detections=max_det
        )
        
        assert len(detections) <= max_det
    
    def test_analyze_image(self, detector, test_image):
        """Test full image analysis"""
        result = detector.analyze_image(test_image)
        
        assert "detections" in result
        assert "metadata" in result
        assert "summary" in result
        
        # Check metadata
        metadata = result["metadata"]
        assert "image_width" in metadata
        assert "image_height" in metadata
        assert "total_detections" in metadata
        assert "average_confidence" in metadata
        assert "model_name" in metadata
        assert "model_variant" in metadata
        assert "device" in metadata
        
        # Check image dimensions match
        assert metadata["image_width"] == 640
        assert metadata["image_height"] == 480
    
    def test_analyze_with_parameters(self, detector, test_image):
        """Test analysis with custom parameters"""
        result = detector.analyze_image(
            test_image,
            confidence_threshold=0.5,
            max_detections=10
        )
        
        assert len(result["detections"]) <= 10
    
    def test_get_description(self, detector):
        """Test description generation"""
        description = detector._get_description("person", 85.5)
        
        assert isinstance(description, str)
        assert "person" in description.lower()
        assert "85" in description or "85.5" in description
    
    def test_summary_in_analysis(self, detector, test_image):
        """Test that analysis includes summary"""
        result = detector.analyze_image(test_image)
        
        assert "summary" in result
        assert isinstance(result["summary"], str)
        assert len(result["summary"]) > 0


class TestGetDetector:
    """Test get_detector singleton function"""
    
    def test_get_detector_singleton(self):
        """Test that get_detector returns same instance"""
        detector1 = get_detector()
        detector2 = get_detector()
        
        assert detector1 is detector2
    
    def test_get_detector_with_params(self):
        """Test get_detector with custom parameters"""
        detector = get_detector(
            model_name="yolov5s",
            confidence_threshold=0.3,
            max_detections=20
        )
        
        assert detector is not None
        assert detector.model_name == "yolov5s"
    
    def test_detector_caching(self):
        """Test that detector is cached properly"""
        # First call creates detector
        detector1 = get_detector(model_name="yolov5s")
        
        # Second call should return cached instance
        detector2 = get_detector(model_name="yolov5s")
        
        assert detector1 is detector2


class TestDetectorEdgeCases:
    """Test edge cases and error handling"""
    
    @pytest.fixture(scope="class")
    def detector(self):
        """Create a detector instance"""
        return ObjectDetector(
            model_name="yolov5s",
            confidence_threshold=0.25,
            max_detections=50
        )
    
    def test_empty_image(self, detector):
        """Test with minimal image"""
        tiny_image = Image.new('RGB', (10, 10), color='white')
        
        # Should not crash
        detections = detector.detect_objects(tiny_image)
        assert isinstance(detections, list)
    
    def test_large_image(self, detector):
        """Test with large image"""
        large_image = Image.new('RGB', (4000, 3000), color='blue')
        
        # Should handle large images
        detections = detector.detect_objects(large_image)
        assert isinstance(detections, list)
    
    def test_grayscale_image(self, detector):
        """Test with grayscale image"""
        gray_image = Image.new('L', (640, 480), color=128)
        
        # Should convert to RGB and process
        detections = detector.detect_objects(gray_image)
        assert isinstance(detections, list)
    
    def test_zero_confidence_threshold(self, detector):
        """Test with zero confidence threshold"""
        test_image = Image.new('RGB', (640, 480), color='red')
        
        detections = detector.detect_objects(
            test_image,
            confidence_threshold=0.0
        )
        
        # Should return all detections
        assert isinstance(detections, list)
    
    def test_very_high_confidence_threshold(self, detector):
        """Test with very high confidence threshold"""
        test_image = Image.new('RGB', (640, 480), color='green')
        
        detections = detector.detect_objects(
            test_image,
            confidence_threshold=0.99
        )
        
        # Might return empty list
        assert isinstance(detections, list)
    
    def test_zero_max_detections(self, detector):
        """Test with zero max detections"""
        test_image = Image.new('RGB', (640, 480), color='yellow')
        
        detections = detector.detect_objects(
            test_image,
            max_detections=0
        )
        
        # Should return empty list
        assert len(detections) == 0
