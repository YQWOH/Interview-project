/**
 * Unit tests for imageController
 */
import "../../setup";
import {
  uploadImage,
  getImages,
  getImageById,
  toggleBookmark,
  deleteImage,
  getAnalytics,
} from "../../../src/controllers/imageController";
import { Image } from "../../../src/models/Image";
import {
  mockRequest,
  mockResponse,
  mockNext,
  createTestUser,
  createTestImage,
} from "../../helpers/testHelpers";
import fs from "fs";

jest.mock("fs");
jest.mock("../../../src/utils/logger");

describe("ImageController", () => {
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user._id.toString();
  });

  describe("uploadImage", () => {
    it("should upload image successfully", async () => {
      const req = mockRequest({
        file: {
          originalname: "test.jpg",
          filename: "test-123.jpg",
          path: "/uploads/test-123.jpg",
          size: 1024000,
          mimetype: "image/jpeg",
        },
        body: { name: "Test Image" },
        user: { userId },
      });
      const res = mockResponse();
      const next = mockNext();

      await uploadImage(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          name: "Test Image",
          filename: "test-123.jpg",
        }),
      });
    });

    it("should use original filename if name not provided", async () => {
      const req = mockRequest({
        file: {
          originalname: "original.jpg",
          filename: "test-123.jpg",
          path: "/uploads/test-123.jpg",
          size: 1024000,
          mimetype: "image/jpeg",
        },
        body: {},
        user: { userId },
      });
      const res = mockResponse();
      const next = mockNext();

      await uploadImage(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          name: "original.jpg",
        }),
      });
    });

    it("should return 400 if no file uploaded", async () => {
      const req = mockRequest({
        file: undefined,
        body: {},
        user: { userId },
      });
      const res = mockResponse();
      const next = mockNext();

      await uploadImage(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "No file uploaded" },
      });
    });
  });

  describe("getImages", () => {
    beforeEach(async () => {
      await createTestImage(userId, { name: "Image 1", isBookmarked: true });
      await createTestImage(userId, { name: "Image 2", isBookmarked: false });
      await createTestImage(userId, { name: "Panorama", isBookmarked: true });
    });

    it("should get all images with pagination", async () => {
      const req = mockRequest({
        query: { page: "1", limit: "10" },
      });
      const res = mockResponse();
      const next = mockNext();

      await getImages(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
        pagination: expect.objectContaining({
          total: 3,
          page: 1,
          limit: 10,
        }),
      });
    });

    it("should filter by search query", async () => {
      const req = mockRequest({
        query: { search: "Panorama" },
      });
      const res = mockResponse();
      const next = mockNext();

      await getImages(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data).toHaveLength(1);
      expect(response.data[0].name).toBe("Panorama");
    });

    it("should filter by bookmarked status", async () => {
      const req = mockRequest({
        query: { bookmarked: "true" },
      });
      const res = mockResponse();
      const next = mockNext();

      await getImages(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data).toHaveLength(2);
      response.data.forEach((img: any) => {
        expect(img.isBookmarked).toBe(true);
      });
    });

    it("should sort by uploadedAt descending by default", async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();
      const next = mockNext();

      await getImages(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      const images = response.data;

      for (let i = 0; i < images.length - 1; i++) {
        expect(new Date(images[i].uploadedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(images[i + 1].uploadedAt).getTime()
        );
      }
    });
  });

  describe("getImageById", () => {
    it("should get image by id", async () => {
      const image = await createTestImage(userId);
      const req = mockRequest({
        params: { id: image._id.toString() },
      });
      const res = mockResponse();
      const next = mockNext();

      await getImageById(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          _id: image._id,
        }),
      });
    });

    it("should return 404 if image not found", async () => {
      const req = mockRequest({
        params: { id: "507f1f77bcf86cd799439011" },
      });
      const res = mockResponse();
      const next = mockNext();

      await getImageById(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "Image not found" },
      });
    });
  });

  describe("toggleBookmark", () => {
    it("should toggle bookmark from false to true", async () => {
      const image = await createTestImage(userId, { isBookmarked: false });
      const req = mockRequest({
        params: { id: image._id.toString() },
      });
      const res = mockResponse();
      const next = mockNext();

      await toggleBookmark(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.isBookmarked).toBe(true);
    });

    it("should toggle bookmark from true to false", async () => {
      const image = await createTestImage(userId, { isBookmarked: true });
      const req = mockRequest({
        params: { id: image._id.toString() },
      });
      const res = mockResponse();
      const next = mockNext();

      await toggleBookmark(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.isBookmarked).toBe(false);
    });

    it("should return 404 if image not found", async () => {
      const req = mockRequest({
        params: { id: "507f1f77bcf86cd799439011" },
      });
      const res = mockResponse();
      const next = mockNext();

      await toggleBookmark(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "Image not found" },
      });
    });
  });

  describe("deleteImage", () => {
    beforeEach(() => {
      // Clear mocks before each test
      jest.clearAllMocks();
    });

    it("should delete image successfully", async () => {
      const image = await createTestImage(userId);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const req = mockRequest({
        params: { id: image._id.toString() },
      });
      const res = mockResponse();
      const next = mockNext();

      await deleteImage(req as any, res, next);

      expect(fs.unlinkSync).toHaveBeenCalledWith(image.filepath);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Image deleted successfully",
      });

      const deleted = await Image.findById(image._id);
      expect(deleted).toBeNull();
    });

    it("should delete image even if file does not exist", async () => {
      const image = await createTestImage(userId);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const req = mockRequest({
        params: { id: image._id.toString() },
      });
      const res = mockResponse();
      const next = mockNext();

      await deleteImage(req as any, res, next);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);

      const deleted = await Image.findById(image._id);
      expect(deleted).toBeNull();
    });

    it("should return 404 if image not found", async () => {
      const req = mockRequest({
        params: { id: "507f1f77bcf86cd799439011" },
      });
      const res = mockResponse();
      const next = mockNext();

      await deleteImage(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "Image not found" },
      });
    });
  });

  describe("getAnalytics", () => {
    beforeEach(async () => {
      await createTestImage(userId, { isBookmarked: true, size: 1000000 });
      await createTestImage(userId, { isBookmarked: true, size: 2000000 });
      await createTestImage(userId, { isBookmarked: false, size: 500000 });
    });

    it("should return analytics summary", async () => {
      const req = mockRequest({});
      const res = mockResponse();
      const next = mockNext();

      await getAnalytics(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];

      expect(response.success).toBe(true);
      expect(response.data.summary).toEqual({
        totalImages: 3,
        bookmarkedCount: 2,
        unbookmarkedCount: 1,
        totalSize: 3500000,
        bookmarkPercentage: "66.67",
      });
    });

    it("should return size by bookmark breakdown", async () => {
      const req = mockRequest({});
      const res = mockResponse();
      const next = mockNext();

      await getAnalytics(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];

      expect(response.data.sizeByBookmark).toHaveLength(2);
    });

    it("should return upload trend data", async () => {
      const req = mockRequest({});
      const res = mockResponse();
      const next = mockNext();

      await getAnalytics(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];

      expect(response.data.uploadTrend).toBeDefined();
      expect(Array.isArray(response.data.uploadTrend)).toBe(true);
    });
  });
});
