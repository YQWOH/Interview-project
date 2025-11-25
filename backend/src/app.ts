import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import imageRoutes from "./routes/imageRoutes";
import authRoutes from "./routes/authRoutes";
import detectionRoutes from "./routes/detectionRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import { swaggerSpec } from "./config/swagger";

dotenv.config();

const app: Application = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for Swagger UI
  })
);
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Check if the server is running and healthy
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-11-21T00:00:00.000Z
 */
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Swagger API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Panorama API Documentation",
  })
);

// Swagger JSON endpoint
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/detection", detectionRoutes);

// Static files for uploaded images
app.use("/uploads", express.static(process.env.UPLOAD_DIR || "uploads"));

// Export app without error handlers (they will be added in server.ts after GraphQL)
export default app;
export { notFoundHandler, errorHandler };
