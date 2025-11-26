import { Router } from "express";
import {
  getActivityLogs,
  getActivityStats,
} from "../controllers/activityController";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get activity logs
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [upload, download, delete, bookmark, unbookmark, search, list]
 *         description: Filter by action type
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *           enum: [image, analytics]
 *         description: Filter by resource type
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *         description: Filter by specific resource ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ActivityLog'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         pages:
 *                           type: number
 *                         limit:
 *                           type: number
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", authenticate, getActivityLogs);

/**
 * @swagger
 * /api/activities/stats:
 *   get:
 *     summary: Get activity statistics
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Statistics from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Statistics until this date
 *     responses:
 *       200:
 *         description: Activity statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalActivities:
 *                       type: number
 *                       description: Total number of activities
 *                     actionBreakdown:
 *                       type: object
 *                       description: Count of each action type
 *                       properties:
 *                         upload:
 *                           type: number
 *                         download:
 *                           type: number
 *                         delete:
 *                           type: number
 *                         bookmark:
 *                           type: number
 *                         unbookmark:
 *                           type: number
 *                         search:
 *                           type: number
 *                         list:
 *                           type: number
 *                     resourceBreakdown:
 *                       type: object
 *                       description: Count by resource type
 *                       properties:
 *                         image:
 *                           type: number
 *                         analytics:
 *                           type: number
 *                     activitiesByDay:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: number
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/stats", authenticate, getActivityStats);

export default router;
