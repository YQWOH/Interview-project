from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Service Info
    SERVICE_NAME: str = "Panorama AI Detection Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Model Configuration (YOLOv5)
    MODEL_NAME: str = "yolov5s"  # small model (fast), options: yolov5n, yolov5s, yolov5m, yolov5l, yolov5x
    CONFIDENCE_THRESHOLD: float = 0.25  # 25% confidence threshold for YOLO
    MAX_DETECTIONS: int = 50  # Maximum objects to detect per image
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5000"
    
    # File Upload
    MAX_FILE_SIZE: int = 52428800  # 50MB (increased for panorama images)
    ALLOWED_EXTENSIONS: str = "jpg,jpeg,png,webp"
    
    # Backend API
    BACKEND_API_URL: str = "http://panorama-backend:5000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def allowed_extensions_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_EXTENSIONS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
