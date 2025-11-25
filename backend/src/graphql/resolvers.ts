import { Image } from "../models/Image";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";
import { GraphQLError } from "graphql";

// @ts-ignore - Mongoose _id type issues
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Context {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const resolvers = {
  Query: {
    // Get current user
    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const user = await User.findById(context.user.userId).select("-password");
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      };
    },

    // Get images with filters
    images: async (_parent: any, args: any) => {
      const {
        search,
        bookmarked,
        page = 1,
        limit = 10,
        sortBy = "uploadedAt",
        order = "desc",
      } = args;

      const query: any = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { originalName: { $regex: search, $options: "i" } },
        ];
      }

      if (bookmarked !== undefined) {
        query.isBookmarked = bookmarked;
      }

      const skip = (page - 1) * limit;
      const sortOrder = order === "asc" ? 1 : -1;

      const [images, total] = await Promise.all([
        Image.find(query)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit),
        Image.countDocuments(query),
      ]);

      return {
        images: images.map((img) => ({
          id: (img._id as any).toString(),
          name: img.name,
          originalName: img.originalName,
          filename: img.filename,
          filepath: img.filepath,
          size: img.size,
          mimetype: img.mimetype,
          isBookmarked: img.isBookmarked,
          uploadedAt: img.uploadedAt.toISOString(),
          updatedAt: img.updatedAt.toISOString(),
        })),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    },

    // Get single image
    image: async (_parent: any, args: { id: string }) => {
      const image = await Image.findById(args.id);

      if (!image) {
        throw new GraphQLError("Image not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return {
        id: (image._id as any).toString(),
        name: image.name,
        originalName: image.originalName,
        filename: image.filename,
        filepath: image.filepath,
        size: image.size,
        mimetype: image.mimetype,
        isBookmarked: image.isBookmarked,
        uploadedAt: image.uploadedAt.toISOString(),
        updatedAt: image.updatedAt.toISOString(),
      };
    },

    // Get analytics
    analytics: async () => {
      const [totalImages, bookmarkedCount, unbookmarkedCount, totalSize] =
        await Promise.all([
          Image.countDocuments(),
          Image.countDocuments({ isBookmarked: true }),
          Image.countDocuments({ isBookmarked: false }),
          Image.aggregate([
            { $group: { _id: null, total: { $sum: "$size" } } },
          ]),
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

      return {
        summary: {
          totalImages,
          bookmarkedCount,
          unbookmarkedCount,
          totalSize: totalSize[0]?.total || 0,
          bookmarkPercentage:
            totalImages > 0
              ? ((bookmarkedCount / totalImages) * 100).toFixed(2)
              : "0.00",
        },
        sizeByBookmark: sizeByBookmark.map((item: any) => ({
          isBookmarked: item._id,
          totalSize: item.totalSize,
          count: item.count,
        })),
        uploadTrend: uploadTrend.map((item: any) => ({
          date: `${item._id.year}-${String(item._id.month).padStart(
            2,
            "0"
          )}-${String(item._id.day).padStart(2, "0")}`,
          count: item.count,
        })),
      };
    },
  },

  Mutation: {
    // Register
    register: async (
      _parent: any,
      args: { email: string; password: string; name: string }
    ) => {
      const existingUser = await User.findOne({ email: args.email });
      if (existingUser) {
        throw new GraphQLError("User already exists", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const user = await User.create({
        email: args.email,
        password: args.password,
        name: args.name,
        role: "user",
      });

      const token = generateToken({
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: (user._id as any).toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
        token,
      };
    },

    // Login
    login: async (_parent: any, args: { email: string; password: string }) => {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const isPasswordValid = await user.comparePassword(args.password);
      if (!isPasswordValid) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const token = generateToken({
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: (user._id as any).toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        },
        token,
      };
    },

    // Toggle bookmark
    toggleBookmark: async (
      _parent: any,
      args: { id: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const image = await Image.findById(args.id);
      if (!image) {
        throw new GraphQLError("Image not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      image.isBookmarked = !image.isBookmarked;
      await image.save();

      return {
        id: (image._id as any).toString(),
        name: image.name,
        originalName: image.originalName,
        filename: image.filename,
        filepath: image.filepath,
        size: image.size,
        mimetype: image.mimetype,
        isBookmarked: image.isBookmarked,
        uploadedAt: image.uploadedAt.toISOString(),
        updatedAt: image.updatedAt.toISOString(),
      };
    },

    // Delete image
    deleteImage: async (
      _parent: any,
      args: { id: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const image = await Image.findByIdAndDelete(args.id);
      if (!image) {
        throw new GraphQLError("Image not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return true;
    },
  },
};
