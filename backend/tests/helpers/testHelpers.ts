/**
 * Test helper functions and utilities
 */
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { User, IUser } from "../../src/models/User";
import { Image, IImage } from "../../src/models/Image";

const JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

/**
 * Create a test user
 */
export const createTestUser = async (overrides = {}): Promise<IUser> => {
  const defaultUser = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
    ...overrides,
  };

  const user = await User.create(defaultUser);
  return user;
};

/**
 * Generate JWT token for testing
 */
export const generateTestToken = (userId: string | Types.ObjectId): string => {
  return jwt.sign({ userId: userId.toString() }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

/**
 * Create a test image
 */
export const createTestImage = async (
  userId: string | Types.ObjectId,
  overrides = {}
): Promise<IImage> => {
  // Generate unique filename to avoid duplicate key errors
  const uniqueId = Date.now() + Math.random().toString(36).substring(7);
  const defaultImage = {
    name: "Test Image",
    originalName: "test.jpg",
    filename: `test-${uniqueId}.jpg`,
    filepath: `/uploads/test-${uniqueId}.jpg`,
    size: 1024000,
    mimetype: "image/jpeg",
    userId,
    ...overrides,
  };

  const image = await Image.create(defaultImage);
  return image;
};

/**
 * Create multiple test images
 */
export const createMultipleTestImages = async (
  userId: string | Types.ObjectId,
  count: number
): Promise<IImage[]> => {
  const images = [];
  for (let i = 0; i < count; i++) {
    const image = await createTestImage(userId, {
      name: `Test Image ${i + 1}`,
      filename: `test-${i + 1}.jpg`,
    });
    images.push(image);
  }
  return images;
};

/**
 * Mock file upload
 */
export const mockFileUpload = () => ({
  fieldname: "image",
  originalname: "test.jpg",
  encoding: "7bit",
  mimetype: "image/jpeg",
  destination: "./uploads",
  filename: "test-123.jpg",
  path: "./uploads/test-123.jpg",
  size: 1024000,
});

/**
 * Mock Express request
 */
export const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  file: undefined,
  user: undefined,
  ...overrides,
});

/**
 * Mock Express response
 */
export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Mock Express next function
 */
export const mockNext = () => jest.fn();

/**
 * Wait for async operations
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
