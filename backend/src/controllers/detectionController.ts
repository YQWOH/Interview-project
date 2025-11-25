import { Request, Response, NextFunction } from "express";
import axios from "axios";
import FormData from "form-data";
import { Image } from "../models/Image";
import { logger } from "../utils/logger";
import fs from "fs";
import path from "path";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://panorama-ai-service:8000";

// Detect objects in an existing image
export const detectObjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { confidence_threshold, max_detections } = req.body;

    // Find the image in database
    const image = await Image.findById(id);
    if (!image) {
      res.status(404).json({
        success: false,
        error: { message: "Image not found" },
      });
      return;
    }

    // Check if user owns the image
    if (image.userId.toString() !== req.user?.userId) {
      res.status(403).json({
        success: false,
        error: { message: "Not authorized to access this image" },
      });
      return;
    }

    // Read the image file
    const imagePath = path.join(process.cwd(), image.filepath);
    if (!fs.existsSync(imagePath)) {
      res.status(404).json({
        success: false,
        error: { message: "Image file not found on server" },
      });
      return;
    }

    // Prepare form data for AI service
    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath), {
      filename: image.filename,
      contentType: image.mimetype,
    });
    if (confidence_threshold) {
      formData.append("confidence_threshold", confidence_threshold.toString());
    }
    if (max_detections) {
      formData.append("max_detections", max_detections.toString());
    }

    // Call AI service
    logger.info(`Calling AI service for image ${id}`);
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/detection/analyze`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (!aiResponse.data.success) {
      throw new Error("AI service returned unsuccessful response");
    }

    const detectionResult = aiResponse.data.data;

    // Save detection results to image document
    image.detections = {
      detectedAt: new Date(),
      results: detectionResult.detections,
      metadata: detectionResult.metadata,
      summary: detectionResult.summary,
    };
    await image.save();

    logger.info(`Object detection completed for image ${id}`);

    res.status(200).json({
      success: true,
      data: {
        imageId: image._id,
        imageName: image.name,
        detections: detectionResult.detections,
        metadata: detectionResult.metadata,
        summary: detectionResult.summary,
      },
    });
  } catch (error: any) {
    // Log error without circular references
    logger.error("Detection error:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      res.status(503).json({
        success: false,
        error: {
          message: "AI service is unavailable. Please try again later.",
        },
      });
      return;
    }

    if (error.response) {
      res.status(error.response.status || 500).json({
        success: false,
        error: {
          message: error.response.data?.message || "AI service error",
        },
      });
      return;
    }

    next(error);
  }
};

// Get detection history for an image
export const getDetectionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);
    if (!image) {
      res.status(404).json({
        success: false,
        error: { message: "Image not found" },
      });
      return;
    }

    // Check if user owns the image
    if (image.userId.toString() !== req.user?.userId) {
      res.status(403).json({
        success: false,
        error: { message: "Not authorized to access this image" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        imageId: image._id,
        imageName: image.name,
        detections: image.detections || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all images with detections
export const getImagesWithDetections = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const images = await Image.find({
      userId,
      "detections.results": { $exists: true, $ne: [] },
    })
      .select("name filename detections.detectedAt detections.summary")
      .sort({ "detections.detectedAt": -1 });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

// Check AI service health
export const checkAIServiceHealth = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const healthResponse = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000,
    });

    res.status(200).json({
      success: true,
      data: {
        aiService: healthResponse.data,
        connected: true,
      },
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      error: {
        message: "AI service is unavailable",
        connected: false,
      },
    });
  }
};
