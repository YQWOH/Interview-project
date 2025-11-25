"""
Tests for configuration settings
"""
import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import Settings


class TestSettings:
    """Test Settings configuration"""
    
    def test_settings_initialization(self):
        """Test that settings can be initialized"""
        settings = Settings()
        
        assert settings is not None
        assert hasattr(settings, "SERVICE_NAME")
        assert hasattr(settings, "VERSION")
        assert hasattr(settings, "MODEL_NAME")
    
    def test_default_values(self):
        """Test default configuration values"""
        settings = Settings()
        
        # Service info
        assert isinstance(settings.SERVICE_NAME, str)
        assert isinstance(settings.VERSION, str)
        
        # Server config
        assert settings.HOST == "0.0.0.0"
        assert settings.PORT == 8000
        
        # Model config
        assert settings.MODEL_NAME in ["yolov5s", "yolov5n", "yolov5m", "yolov5l", "yolov5x"]
        assert 0.0 <= settings.CONFIDENCE_THRESHOLD <= 1.0
        assert settings.MAX_DETECTIONS > 0
    
    def test_cors_origins_list(self):
        """Test CORS origins list parsing"""
        settings = Settings()
        
        assert isinstance(settings.cors_origins_list, list)
        assert len(settings.cors_origins_list) > 0
    
    def test_file_upload_config(self):
        """Test file upload configuration"""
        settings = Settings()
        
        assert settings.MAX_FILE_SIZE > 0
        assert isinstance(settings.ALLOWED_EXTENSIONS, str)
        assert len(settings.allowed_extensions_list) > 0
    
    def test_allowed_extensions_list(self):
        """Test allowed extensions parsing"""
        settings = Settings()
        
        extensions = settings.allowed_extensions_list
        assert isinstance(extensions, list)
        
        # Should contain common image formats
        common_formats = ["jpg", "jpeg", "png"]
        for fmt in common_formats:
            assert fmt in extensions or fmt.upper() in extensions


class TestSettingsValidation:
    """Test settings validation"""
    
    def test_confidence_threshold_range(self):
        """Test confidence threshold is in valid range"""
        settings = Settings()
        
        assert 0.0 <= settings.CONFIDENCE_THRESHOLD <= 1.0
    
    def test_max_detections_positive(self):
        """Test max detections is positive"""
        settings = Settings()
        
        assert settings.MAX_DETECTIONS > 0
    
    def test_port_valid(self):
        """Test port is in valid range"""
        settings = Settings()
        
        assert 1 <= settings.PORT <= 65535
    
    def test_max_file_size_reasonable(self):
        """Test max file size is reasonable"""
        settings = Settings()
        
        # Should be at least 1MB and less than 100MB
        assert 1_000_000 <= settings.MAX_FILE_SIZE <= 100_000_000


class TestEnvironmentVariables:
    """Test environment variable handling"""
    
    def test_debug_mode(self):
        """Test DEBUG mode setting"""
        settings = Settings()
        
        assert isinstance(settings.DEBUG, bool)
    
    def test_service_name_not_empty(self):
        """Test service name is not empty"""
        settings = Settings()
        
        assert len(settings.SERVICE_NAME) > 0
    
    def test_version_format(self):
        """Test version string format"""
        settings = Settings()
        
        assert len(settings.VERSION) > 0
        # Version should contain numbers
        assert any(char.isdigit() for char in settings.VERSION)
