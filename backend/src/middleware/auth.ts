import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "../utils/jwt";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: { message: "No token provided" },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: "Invalid or expired token" },
    });
  }
};

export const authenticateDownload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // For download endpoints, accept token from query parameter or header
    let token: string | undefined;

    // Try to get token from query parameter first (for direct browser downloads)
    if (req.query.token && typeof req.query.token === "string") {
      token = req.query.token;
    } else {
      // Fall back to Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: "No token provided" },
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: "Invalid or expired token" },
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: "Authentication required" },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { message: "Insufficient permissions" },
      });
      return;
    }

    next();
  };
};
