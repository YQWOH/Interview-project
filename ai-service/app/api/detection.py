from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from PIL import Image
import io
from typing import Optional
from ..models import get_detector
from ..core import settings

router = APIRouter(prefix="/api/detection", tags=["Object Detection"])


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    confidence_threshold: Optional[float] = Form(None),
    max_detections: Optional[int] = Form(None)
):
    """
    Analyze an image and detect objects
    
    - **file**: Image file to analyze (jpg, jpeg, png, webp)
    - **confidence_threshold**: Minimum confidence threshold (0.0-1.0)
    - **max_detections**: Maximum number of detections to return
    """
    # Validate file extension
    file_ext = file.filename.split(".")[-1].lower() if file.filename else ""
    if file_ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(settings.allowed_extensions_list)}"
        )
    
    try:
        # Read image file
        contents = await file.read()
        
        # Check file size
        if len(contents) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Open image
        image = Image.open(io.BytesIO(contents))
        
        # Get detector (singleton)
        detector = get_detector()
        
        # Analyze image with custom parameters if provided
        threshold = confidence_threshold if confidence_threshold is not None else settings.CONFIDENCE_THRESHOLD
        max_det = max_detections if max_detections is not None else settings.MAX_DETECTIONS
        
        results = detector.analyze_image(
            image,
            confidence_threshold=threshold,
            max_detections=max_det
        )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": results,
                "filename": file.filename
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


@router.post("/detect")
async def detect_objects(
    file: UploadFile = File(...),
    confidence_threshold: Optional[float] = Form(0.5)
):
    """
    Quick object detection endpoint
    
    - **file**: Image file to analyze
    - **confidence_threshold**: Minimum confidence threshold
    """
    file_ext = file.filename.split(".")[-1].lower() if file.filename else ""
    if file_ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(settings.allowed_extensions_list)}"
        )
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        detector = get_detector(confidence_threshold=confidence_threshold)
        detections = detector.detect_objects(image)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "detections": detections,
                "count": len(detections)
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error detecting objects: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "model": settings.MODEL_NAME
    }


@router.get("/info")
async def service_info():
    """Get service information"""
    detector = get_detector()
    
    return {
        "service_name": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "model": settings.MODEL_NAME,
        "device": str(detector.device),
        "confidence_threshold": settings.CONFIDENCE_THRESHOLD,
        "max_detections": settings.MAX_DETECTIONS,
        "supported_formats": settings.allowed_extensions_list,
        "max_file_size_mb": settings.MAX_FILE_SIZE / 1024 / 1024
    }
