/**
 * Unit tests for ActivityLog model
 */
import "../../setup";
import { ActivityLog } from "../../../src/models/ActivityLog";

describe("ActivityLog Model", () => {
  describe("ActivityLog Creation", () => {
    it("should create a new activity log successfully", async () => {
      const logData = {
        action: "upload",
        resource: "image",
        resourceId: "123456",
        details: { filename: "test.jpg", size: 1024000 },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      const log = await ActivityLog.create(logData);

      expect(log._id).toBeDefined();
      expect(log.action).toBe(logData.action);
      expect(log.resource).toBe(logData.resource);
      expect(log.resourceId).toBe(logData.resourceId);
      expect(log.details).toEqual(logData.details);
      expect(log.ipAddress).toBe(logData.ipAddress);
      expect(log.userAgent).toBe(logData.userAgent);
      expect(log.timestamp).toBeDefined();
    });

    it("should set default timestamp", async () => {
      const log = await ActivityLog.create({
        action: "search",
        resource: "image",
      });

      expect(log.timestamp).toBeDefined();
      expect(log.timestamp).toBeInstanceOf(Date);
    });

    it("should allow optional fields to be undefined", async () => {
      const log = await ActivityLog.create({
        action: "list",
        resource: "analytics",
      });

      expect(log.resourceId).toBeUndefined();
      expect(log.details).toBeUndefined();
      expect(log.ipAddress).toBeUndefined();
      expect(log.userAgent).toBeUndefined();
    });
  });

  describe("ActivityLog Validation", () => {
    it("should require action", async () => {
      const logData = {
        resource: "image",
      };

      await expect(ActivityLog.create(logData)).rejects.toThrow();
    });

    it("should require resource", async () => {
      const logData = {
        action: "upload",
      };

      await expect(ActivityLog.create(logData)).rejects.toThrow();
    });

    it("should only allow valid action values", async () => {
      const logData = {
        action: "invalid_action",
        resource: "image",
      };

      await expect(ActivityLog.create(logData)).rejects.toThrow();
    });

    it("should only allow valid resource values", async () => {
      const logData = {
        action: "upload",
        resource: "invalid_resource",
      };

      await expect(ActivityLog.create(logData)).rejects.toThrow();
    });

    it("should accept all valid action values", async () => {
      const validActions = [
        "upload",
        "download",
        "delete",
        "bookmark",
        "unbookmark",
        "search",
        "list",
      ];

      for (const action of validActions) {
        const log = await ActivityLog.create({
          action,
          resource: "image",
        });
        expect(log.action).toBe(action);
      }
    });

    it("should accept all valid resource values", async () => {
      const validResources = ["image", "analytics"];

      for (const resource of validResources) {
        const log = await ActivityLog.create({
          action: "list",
          resource,
        });
        expect(log.resource).toBe(resource);
      }
    });
  });

  describe("ActivityLog Details", () => {
    it("should store complex details object", async () => {
      const details = {
        filename: "panorama.jpg",
        size: 2048000,
        mimetype: "image/jpeg",
        metadata: {
          width: 1920,
          height: 1080,
        },
      };

      const log = await ActivityLog.create({
        action: "upload",
        resource: "image",
        details,
      });

      expect(log.details).toEqual(details);
    });

    it("should store nested objects in details", async () => {
      const details = {
        query: { search: "panorama", bookmarked: true },
        results: { total: 10, page: 1 },
      };

      const log = await ActivityLog.create({
        action: "search",
        resource: "image",
        details,
      });

      expect(log.details).toEqual(details);
    });
  });

  describe("ActivityLog Queries", () => {
    beforeEach(async () => {
      // Create sample logs
      await ActivityLog.create({
        action: "upload",
        resource: "image",
        resourceId: "img1",
      });
      await ActivityLog.create({
        action: "download",
        resource: "image",
        resourceId: "img1",
      });
      await ActivityLog.create({
        action: "bookmark",
        resource: "image",
        resourceId: "img2",
      });
      await ActivityLog.create({
        action: "list",
        resource: "analytics",
      });
    });

    it("should query by action", async () => {
      const logs = await ActivityLog.find({ action: "upload" });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("upload");
    });

    it("should query by resource", async () => {
      const logs = await ActivityLog.find({ resource: "image" });
      expect(logs.length).toBeGreaterThanOrEqual(3);
    });

    it("should query by resourceId", async () => {
      const logs = await ActivityLog.find({ resourceId: "img1" });
      expect(logs).toHaveLength(2);
    });

    it("should sort by timestamp descending", async () => {
      const logs = await ActivityLog.find().sort({ timestamp: -1 });

      expect(logs.length).toBeGreaterThanOrEqual(4);
      for (let i = 0; i < logs.length - 1; i++) {
        expect(logs[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          logs[i + 1].timestamp.getTime()
        );
      }
    });

    it("should filter by action and resource", async () => {
      const logs = await ActivityLog.find({
        action: "upload",
        resource: "image",
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("upload");
      expect(logs[0].resource).toBe("image");
    });
  });
});
