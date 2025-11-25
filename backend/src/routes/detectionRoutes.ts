import { Router } from "express";
import {
  detectObjects,
  getDetectionHistory,
  getImagesWithDetections,
  checkAIServiceHealth,
} from "../controllers/detectionController";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/detection/{id}:
 *   post:
 *     summary: Detect objects in an uploaded image
 *     tags: [Detection]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confidence_threshold:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.5
 *               max_detections:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 example: 10
 *     responses:
 *       200:
 *         description: Detection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Image not found
 *       503:
 *         description: AI service unavailable
 */
router.post("/:id", authenticate, detectObjects);

/**
 * @swagger
 * /api/detection/{id}/history:
 *   get:
 *     summary: Get detection history for an image
 *     tags: [Detection]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Detection history retrieved
 *       404:
 *         description: Image not found
 */
router.get("/:id/history", authenticate, getDetectionHistory);

/**
 * @swagger
 * /api/detection/images:
 *   get:
 *     summary: Get all images with detections
 *     tags: [Detection]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of images with detections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 */
router.get("/images", authenticate, getImagesWithDetections);

/**
 * @swagger
 * /api/detection/health:
 *   get:
 *     summary: Check AI service health
 *     tags: [Detection]
 *     responses:
 *       200:
 *         description: AI service is healthy
 *       503:
 *         description: AI service is unavailable
 */
router.get("/health", checkAIServiceHealth);

export default router;
