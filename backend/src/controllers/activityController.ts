import { Request, Response } from "express";
import { ActivityLog } from "../models/ActivityLog";

/**
 * Get activity logs with filtering and pagination
 */
export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const {
      action,
      resource,
      resourceId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter query
    const filter: any = {};

    if (action) {
      filter.action = action;
    }

    if (resource) {
      filter.resource = resource;
    }

    if (resourceId) {
      filter.resourceId = resourceId;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate as string);
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await ActivityLog.countDocuments(filter);

    // Get logs
    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch activity logs",
      },
    });
  }
};

/**
 * Get activity statistics
 */
export const getActivityStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Build filter query
    const filter: any = {};

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate as string);
      }
    }

    // Get total activities
    const totalActivities = await ActivityLog.countDocuments(filter);

    // Get action breakdown
    const actionBreakdown = await ActivityLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get resource breakdown
    const resourceBreakdown = await ActivityLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$resource",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get activities by day
    const activitiesByDay = await ActivityLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    // Format action breakdown
    const actionStats: any = {
      upload: 0,
      download: 0,
      delete: 0,
      bookmark: 0,
      unbookmark: 0,
      search: 0,
      list: 0,
    };
    actionBreakdown.forEach((item) => {
      actionStats[item._id] = item.count;
    });

    // Format resource breakdown
    const resourceStats: any = {
      image: 0,
      analytics: 0,
    };
    resourceBreakdown.forEach((item) => {
      resourceStats[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        totalActivities,
        actionBreakdown: actionStats,
        resourceBreakdown: resourceStats,
        activitiesByDay,
      },
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch activity statistics",
      },
    });
  }
};
