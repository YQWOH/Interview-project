import { Request, Response, NextFunction } from "express";
import { ActivityLog } from "../models/ActivityLog";
import { logger } from "../utils/logger";

export interface ActivityLogData {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export const logActivity = (data: ActivityLogData) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await ActivityLog.create({
        ...data,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("Failed to log activity:", error);
    }
    next();
  };
};

export const logActivityAfterResponse = (data: ActivityLogData) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body: any): Response {
      res.send = originalSend;

      ActivityLog.create({
        ...data,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        timestamp: new Date(),
      }).catch((error) => {
        logger.error("Failed to log activity:", error);
      });

      return originalSend.call(this, body);
    };

    next();
  };
};
