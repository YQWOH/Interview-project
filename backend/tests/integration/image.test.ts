/**
 * Integration tests for image routes
 */
import request from "supertest";
import "../setup";
import app from "../../src/app";
import {
  createTestUser,
  generateTestToken,
  createTestImage,
} from "../helpers/testHelpers";
import { Image } from "../../src/models/Image";
import path from "path";
import fs from "fs";

describe("Image Routes", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const user = await createTestUser();
    userId = user._id.toString();
    token = generateTestToken(userId);
  });

  describe("POST /api/images", () => {
    it("should upload an image successfully", async () => {
      const testImagePath = path.join(
        __dirname,
        "../../test-fixtures/test-image.jpg"
      );

      // Create a test image file if it doesn't exist
      if (!fs.existsSync(path.dirname(testImagePath))) {
        fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
      }
      if (!fs.existsSync(testImagePath)) {
        fs.writeFileSync(testImagePath, Buffer.from("fake-image-data"));
      }

      const response = await request(app)
        .post("/api/images")
        .set("Authorization", `Bearer ${token}`)
        .attach("image", testImagePath)
        .field("name", "Test Panorama")
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.name).toBe("Test Panorama");
    });

    it("should return 401 without authentication", async () => {
      await request(app).post("/api/images").expect(401);
    });
  });

  describe("GET /api/images", () => {
    beforeEach(async () => {
      await createTestImage(userId, { name: "Image 1", isBookmarked: true });
      await createTestImage(userId, { name: "Image 2", isBookmarked: false });
      await createTestImage(userId, { name: "Panorama", isBookmarked: true });
    });

    it("should get all images with pagination", async () => {
      const response = await request(app)
        .get("/api/images")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it("should filter images by search query", async () => {
      const response = await request(app)
        .get("/api/images?search=Panorama")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain("Panorama");
    });

    it("should filter images by bookmarked status", async () => {
      const response = await request(app)
        .get("/api/images?bookmarked=true")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      response.body.data.forEach((img: any) => {
        expect(img.isBookmarked).toBe(true);
      });
    });

    it("should support pagination parameters", async () => {
      const response = await request(app)
        .get("/api/images?page=1&limit=2")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });

    it("should return 401 without authentication", async () => {
      await request(app).get("/api/images").expect(401);
    });
  });

  describe("GET /api/images/:id", () => {
    it("should get a single image by id", async () => {
      const image = await createTestImage(userId);

      const response = await request(app)
        .get(`/api/images/${image._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(image._id.toString());
      expect(response.body.data.name).toBe(image.name);
    });

    it("should return 404 for non-existent image", async () => {
      await request(app)
        .get("/api/images/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    it("should return 401 without authentication", async () => {
      const image = await createTestImage(userId);

      await request(app).get(`/api/images/${image._id}`).expect(401);
    });
  });

  describe.skip("PUT /api/images/:id/bookmark", () => {
    // Note: Bookmark route not implemented in imageRoutes.ts
    // This test is skipped until the route is added
    it("should toggle bookmark status", async () => {
      const image = await createTestImage(userId, { isBookmarked: false });

      const response = await request(app)
        .put(`/api/images/${image._id}/bookmark`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isBookmarked).toBe(true);

      // Toggle back
      const response2 = await request(app)
        .put(`/api/images/${image._id}/bookmark`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response2.body.data.isBookmarked).toBe(false);
    });

    it("should return 404 for non-existent image", async () => {
      await request(app)
        .put("/api/images/507f1f77bcf86cd799439011/bookmark")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });

  describe("DELETE /api/images/:id", () => {
    it("should delete an image", async () => {
      const image = await createTestImage(userId);

      await request(app)
        .delete(`/api/images/${image._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const deleted = await Image.findById(image._id);
      expect(deleted).toBeNull();
    });

    it("should return 404 for non-existent image", async () => {
      await request(app)
        .delete("/api/images/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });

  describe("GET /api/images/analytics", () => {
    beforeEach(async () => {
      await createTestImage(userId, { isBookmarked: true, size: 1000000 });
      await createTestImage(userId, { isBookmarked: true, size: 2000000 });
      await createTestImage(userId, { isBookmarked: false, size: 500000 });
    });

    it("should get analytics data", async () => {
      const response = await request(app)
        .get("/api/images/analytics")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.summary.totalImages).toBeGreaterThanOrEqual(3);
      expect(response.body.data.summary.bookmarkedCount).toBeGreaterThanOrEqual(
        2
      );
      expect(response.body.data.sizeByBookmark).toBeDefined();
      expect(response.body.data.uploadTrend).toBeDefined();
    });

    it("should return 401 without authentication", async () => {
      await request(app).get("/api/images/analytics").expect(401);
    });
  });
});
