"""
YOLOv5 Object Detection Module
Provides object detection with bounding boxes using YOLOv5
"""

from typing import Dict, List
from PIL import Image
import numpy as np
import torch
import logging

logger = logging.getLogger(__name__)


class ObjectDetector:
    """YOLOv5-based object detector"""
    
    def __init__(
        self,
        model_name: str = "yolov5s",  # small model for speed
        confidence_threshold: float = 0.25,
        max_detections: int = 50
    ):
        """
        Initialize YOLOv5 detector
        
        Args:
            model_name: YOLOv5 model variant (yolov5n, yolov5s, yolov5m, yolov5l, yolov5x)
            confidence_threshold: Minimum confidence for detections
            max_detections: Maximum number of objects to detect
        """
        self.model_name = model_name
        self.confidence_threshold = confidence_threshold
        self.max_detections = max_detections
        
        logger.info(f"Loading YOLOv5 model: {model_name}")
        logger.info(f"Confidence threshold: {confidence_threshold}")
        logger.info(f"Max detections: {max_detections}")
        
        # Load YOLOv5 model from torch hub
        self.model = torch.hub.load('ultralytics/yolov5', model_name, pretrained=True)
        self.model.conf = confidence_threshold  # Set confidence threshold
        self.model.max_det = max_detections  # Set max detections
        
        # Store device info (AutoShape doesn't expose .device)
        self.device = 'cpu'
        
        logger.info(f"YOLOv5 model loaded successfully")
        logger.info(f"Model can detect {len(self.model.names)} classes")
    
    def detect_objects(self, image: Image.Image, confidence_threshold: float = None, max_detections: int = None) -> List[Dict]:
        """
        Detect objects in image using YOLOv5
        
        Args:
            image: PIL Image object
            confidence_threshold: Override confidence threshold for this detection
            max_detections: Override max detections for this detection
            
        Returns:
            List of detected objects with bounding boxes
        """
        # Use provided thresholds or fall back to instance defaults
        conf = confidence_threshold if confidence_threshold is not None else self.confidence_threshold
        max_det = max_detections if max_detections is not None else self.max_detections
        
        # Update model settings for this inference
        self.model.conf = conf
        self.model.max_det = max_det
        
        # Convert PIL Image to numpy array
        img_array = np.array(image)
        
        # Run inference
        results = self.model(img_array)
        
        # Get predictions
        predictions = results.pandas().xyxy[0]  # Pandas DataFrame
        
        # Format detections
        detections = []
        
        for _, row in predictions.iterrows():
            # Get bounding box coordinates
            x1, y1, x2, y2 = row['xmin'], row['ymin'], row['xmax'], row['ymax']
            
            # Get confidence and class
            confidence = float(row['confidence'])
            class_id = int(row['class'])
            class_name = row['name']
            
            # Calculate box dimensions
            width = x2 - x1
            height = y2 - y1
            
            detections.append({
                "class_id": class_id,
                "class_name": class_name,
                "confidence": round(confidence * 100, 2),
                "bbox": {
                    "x": round(x1, 2),
                    "y": round(y1, 2),
                    "width": round(width, 2),
                    "height": round(height, 2),
                    "x_center": round((x1 + x2) / 2, 2),
                    "y_center": round((y1 + y2) / 2, 2)
                },
                "description": self._get_description(class_name, confidence)
            })
        
        return detections
    
    def _get_description(self, class_name: str, confidence: float) -> str:
        """Generate human-readable description"""
        confidence_pct = round(confidence * 100, 1)
        
        if confidence >= 0.9:
            certainty = "very confident"
        elif confidence >= 0.7:
            certainty = "confident"
        elif confidence >= 0.5:
            certainty = "fairly confident"
        else:
            certainty = "detected"
        
        return f"{class_name} {certainty} ({confidence_pct}%)"
    
    def analyze_image(self, image: Image.Image, confidence_threshold: float = None, max_detections: int = None) -> Dict:
        """
        Comprehensive image analysis with YOLOv5
        
        Args:
            image: PIL Image object
            confidence_threshold: Override confidence threshold for this analysis
            max_detections: Override max detections for this analysis
            
        Returns:
            Dictionary with detections and metadata
        """
        # Get image metadata
        width, height = image.size
        mode = image.mode
        
        # Detect objects with custom parameters
        detections = self.detect_objects(image, confidence_threshold, max_detections)
        
        # Calculate statistics
        total_detections = len(detections)
        avg_confidence = (
            sum(d["confidence"] for d in detections) / total_detections
            if total_detections > 0
            else 0
        )
        
        # Group by class
        class_counts = {}
        for detection in detections:
            class_name = detection["class_name"]
            class_counts[class_name] = class_counts.get(class_name, 0) + 1
        
        # Generate summary
        if total_detections == 0:
            summary = "No objects detected with sufficient confidence."
        elif total_detections == 1:
            det = detections[0]
            summary = f"Detected 1 object: {det['class_name']} ({det['confidence']:.1f}% confidence)"
        else:
            top_classes = sorted(class_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            class_summary = ", ".join([f"{count} {name}{'s' if count > 1 else ''}" for name, count in top_classes])
            summary = f"Detected {total_detections} objects: {class_summary}"
        
        return {
            "detections": detections,
            "metadata": {
                "image_width": width,
                "image_height": height,
                "image_mode": mode,
                "total_detections": total_detections,
                "average_confidence": round(avg_confidence, 2),
                "model_name": "YOLOv5",
                "model_variant": self.model_name,
                "device": self.device,
                "unique_classes": len(class_counts),
                "class_distribution": class_counts
            },
            "summary": summary
        }


# Global detector instance
_detector = None


def get_detector(
    model_name: str = "yolov5s",
    confidence_threshold: float = 0.25,
    max_detections: int = 50
) -> ObjectDetector:
    """
    Get or create global detector instance
    
    Args:
        model_name: YOLOv5 model variant
        confidence_threshold: Minimum confidence threshold
        max_detections: Maximum detections to return
        
    Returns:
        ObjectDetector instance
    """
    global _detector
    
    if _detector is None:
        _detector = ObjectDetector(
            model_name=model_name,
            confidence_threshold=confidence_threshold,
            max_detections=max_detections
        )
    
    return _detector
