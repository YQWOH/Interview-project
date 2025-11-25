from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core import settings
from .api import detection_router

# Create FastAPI app
app = FastAPI(
    title=settings.SERVICE_NAME,
    version=settings.VERSION,
    description="AI-powered object detection and classification service for panorama images",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(detection_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/api/detection/health"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": settings.SERVICE_NAME,
            "version": settings.VERSION
        }
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    from .models import get_detector
    print(f"Starting {settings.SERVICE_NAME} v{settings.VERSION}")
    print("Initializing AI model...")
    detector = get_detector(
        model_name=settings.MODEL_NAME,
        confidence_threshold=settings.CONFIDENCE_THRESHOLD,
        max_detections=settings.MAX_DETECTIONS
    )
    print("Model initialized successfully")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print(f"Shutting down {settings.SERVICE_NAME}")
