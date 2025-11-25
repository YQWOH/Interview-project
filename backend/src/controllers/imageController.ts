import { Request, Response, NextFunction } from "express";
import { Image } from "../models/Image";
import { logger } from "../utils/logger";
import fs from "fs";
import path from "path";

// Upload image
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res
        .status(400)
        .json({ success: false, error: { message: "No file uploaded" } });
      return;
    }

    const { name } = req.body;
    const displayName = name || req.file.originalname;

    const image = await Image.create({
      name: displayName,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filepath: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      userId: req.user?.userId,
    });

    logger.info(`Image uploaded: ${image.filename}`);

    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

// Get all images with optional filters
export const getImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      bookmarked,
      page = 1,
      limit = 10,
      sortBy = "uploadedAt",
      order = "desc",
    } = req.query;

    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { originalName: { $regex: search, $options: "i" } },
      ];
    }

    // Bookmark filter
    if (bookmarked !== undefined) {
      query.isBookmarked = bookmarked === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const [images, total] = await Promise.all([
      Image.find(query)
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Image.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: images,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single image by ID
export const getImageById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      res
        .status(404)
        .json({ success: false, error: { message: "Image not found" } });
      return;
    }

    res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

// Download image
export const downloadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      res
        .status(404)
        .json({ success: false, error: { message: "Image not found" } });
      return;
    }

    const filePath = path.resolve(image.filepath);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        error: { message: "File not found on server" },
      });
      return;
    }

    res.download(filePath, image.originalName);
  } catch (error) {
    next(error);
  }
};

// Toggle bookmark
export const toggleBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      res
        .status(404)
        .json({ success: false, error: { message: "Image not found" } });
      return;
    }

    image.isBookmarked = !image.isBookmarked;
    await image.save();

    logger.info(
      `Image ${image.filename} bookmark toggled to ${image.isBookmarked}`
    );

    res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

// Delete image
export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      res
        .status(404)
        .json({ success: false, error: { message: "Image not found" } });
      return;
    }

    // Delete file from filesystem
    if (fs.existsSync(image.filepath)) {
      fs.unlinkSync(image.filepath);
    }

    await Image.findByIdAndDelete(req.params.id);

    logger.info(`Image deleted: ${image.filename}`);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get analytics
export const getAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalImages, bookmarkedCount, unbookmarkedCount, totalSize] =
      await Promise.all([
        Image.countDocuments(),
        Image.countDocuments({ isBookmarked: true }),
        Image.countDocuments({ isBookmarked: false }),
        Image.aggregate([{ $group: { _id: null, total: { $sum: "$size" } } }]),
      ]);

    const sizeByBookmark = await Image.aggregate([
      {
        $group: {
          _id: "$isBookmarked",
          totalSize: { $sum: "$size" },
          count: { $sum: 1 },
        },
      },
    ]);

    const uploadTrend = await Image.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$uploadedAt" },
            month: { $month: "$uploadedAt" },
            day: { $dayOfMonth: "$uploadedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      { $limit: 30 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalImages,
          bookmarkedCount,
          unbookmarkedCount,
          totalSize: totalSize[0]?.total || 0,
          bookmarkPercentage:
            totalImages > 0
              ? ((bookmarkedCount / totalImages) * 100).toFixed(2)
              : 0,
        },
        sizeByBookmark: sizeByBookmark.map((item) => ({
          isBookmarked: item._id,
          totalSize: item.totalSize,
          count: item.count,
        })),
        uploadTrend: uploadTrend.map((item) => ({
          date: `${item._id.year}-${String(item._id.month).padStart(
            2,
            "0"
          )}-${String(item._id.day).padStart(2, "0")}`,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
