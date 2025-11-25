/**
 * Unit tests for Image model
 */
import "../../setup";
import { Image } from "../../../src/models/Image";
import { createTestUser, createTestImage } from "../../helpers/testHelpers";

describe("Image Model", () => {
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user._id.toString();
  });

  describe("Image Creation", () => {
    it("should create a new image successfully", async () => {
      const imageData = {
        name: "Panorama 1",
        originalName: "panorama.jpg",
        filename: "panorama-123.jpg",
        filepath: "/uploads/panorama-123.jpg",
        size: 2048000,
        mimetype: "image/jpeg",
        userId,
      };

      const image = await Image.create(imageData);

      expect(image._id).toBeDefined();
      expect(image.name).toBe(imageData.name);
      expect(image.originalName).toBe(imageData.originalName);
      expect(image.filename).toBe(imageData.filename);
      expect(image.filepath).toBe(imageData.filepath);
      expect(image.size).toBe(imageData.size);
      expect(image.mimetype).toBe(imageData.mimetype);
      expect(image.userId.toString()).toBe(userId);
      expect(image.uploadedAt).toBeDefined();
    });

    it("should set default values", async () => {
      const image = await createTestImage(userId);

      expect(image.isBookmarked).toBe(false);
      expect(image.uploadedAt).toBeDefined();
      expect(image.updatedAt).toBeDefined();
    });

    it("should allow bookmarking", async () => {
      const image = await createTestImage(userId, { isBookmarked: true });

      expect(image.isBookmarked).toBe(true);
    });
  });

  describe("Image Validation", () => {
    it("should require name", async () => {
      const imageData = {
        originalName: "test.jpg",
        filename: "test-123.jpg",
        filepath: "/uploads/test-123.jpg",
        size: 1024000,
        mimetype: "image/jpeg",
        userId,
      };

      await expect(Image.create(imageData)).rejects.toThrow();
    });

    it("should require filename", async () => {
      const imageData = {
        name: "Test Image",
        originalName: "test.jpg",
        filepath: "/uploads/test-123.jpg",
        size: 1024000,
        mimetype: "image/jpeg",
        userId,
      };

      await expect(Image.create(imageData)).rejects.toThrow();
    });

    it("should require userId", async () => {
      const imageData = {
        name: "Test Image",
        originalName: "test.jpg",
        filename: "test-123.jpg",
        filepath: "/uploads/test-123.jpg",
        size: 1024000,
        mimetype: "image/jpeg",
      };

      await expect(Image.create(imageData)).rejects.toThrow();
    });
  });

  describe("Image Detections", () => {
    it("should store detection results", async () => {
      const image = await createTestImage(userId);

      image.detections = {
        detectedAt: new Date(),
        results: [
          {
            class_id: 0,
            class_name: "person",
            confidence: 95.5,
            description: "A person",
          },
          {
            class_id: 1,
            class_name: "car",
            confidence: 87.3,
            description: "A car",
          },
        ],
        metadata: {
          image_width: 1920,
          image_height: 1080,
          image_mode: "RGB",
          total_detections: 2,
          average_confidence: 91.4,
          model_name: "yolov5",
          device: "cpu",
        },
        summary: "Detected 2 objects",
      };
      await image.save();

      const updated = await Image.findById(image._id);
      expect(updated?.detections).toBeDefined();
      expect(updated?.detections?.results).toHaveLength(2);
      expect(updated?.detections?.summary).toBe("Detected 2 objects");
    });

    it("should allow images without detections", async () => {
      const image = await createTestImage(userId);

      // Mongoose may return empty object or undefined for optional nested fields
      expect(image.detections?.results || []).toHaveLength(0);
    });
  });

  describe("Image Updates", () => {
    it("should update image name", async () => {
      const image = await createTestImage(userId);
      const newName = "Updated Image Name";

      image.name = newName;
      await image.save();

      const updated = await Image.findById(image._id);
      expect(updated?.name).toBe(newName);
    });

    it("should toggle bookmark status", async () => {
      const image = await createTestImage(userId);

      image.isBookmarked = true;
      await image.save();

      let updated = await Image.findById(image._id);
      expect(updated?.isBookmarked).toBe(true);

      image.isBookmarked = false;
      await image.save();

      updated = await Image.findById(image._id);
      expect(updated?.isBookmarked).toBe(false);
    });

    it("should update updatedAt timestamp on save", async () => {
      const image = await createTestImage(userId);
      const originalUpdatedAt = image.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      image.name = "Updated Name";
      await image.save();

      const updated = await Image.findById(image._id);
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });
});
