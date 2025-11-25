import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";
import { logger } from "../utils/logger";

// Register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: { message: "User already exists" },
      });
      return;
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role: "user",
    });

    // Generate token
    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
      return;
    }

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
