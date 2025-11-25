/**
 * Unit tests for activityLogger middleware
 */
import "../../setup";
import {
  logActivity,
  logActivityAfterResponse,
} from "../../../src/middleware/activityLogger";
import { ActivityLog } from "../../../src/models/ActivityLog";
import { mockRequest, mockResponse, mockNext } from "../../helpers/testHelpers";

jest.mock("../../../src/utils/logger");

describe("ActivityLogger Middleware", () => {
  describe("logActivity", () => {
    it("should log activity before response", async () => {
      const activityData = {
        action: "upload",
        resource: "image",
        resourceId: "123",
        details: { filename: "test.jpg" },
      };

      const req = mockRequest({
        ip: "192.168.1.1",
      });
      req.get = jest.fn().mockReturnValue("Mozilla/5.0");

      const res = mockResponse();
      const next = mockNext();

      const middleware = logActivity(activityData);
      await middleware(req as any, res, next);

      expect(next).toHaveBeenCalled();

      // Verify log was created
      const logs = await ActivityLog.find({ resourceId: "123" });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("upload");
      expect(logs[0].resource).toBe("image");
      expect(logs[0].ipAddress).toBe("192.168.1.1");
      expect(logs[0].userAgent).toBe("Mozilla/5.0");
    });

    it("should call next even if logging fails", async () => {
      const activityData = {
        action: "invalid_action" as any,
        resource: "image",
      };

      const req = mockRequest({
        ip: "192.168.1.1",
      });
      req.get = jest.fn().mockReturnValue("Mozilla/5.0");

      const res = mockResponse();
      const next = mockNext();

      const middleware = logActivity(activityData);
      await middleware(req as any, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should log with optional fields", async () => {
      const activityData = {
        action: "list",
        resource: "analytics",
      };

      const req = mockRequest({
        ip: "10.0.0.1",
      });
      req.get = jest.fn().mockReturnValue("Chrome/91.0");

      const res = mockResponse();
      const next = mockNext();

      const middleware = logActivity(activityData);
      await middleware(req as any, res, next);

      expect(next).toHaveBeenCalled();

      const logs = await ActivityLog.find({
        action: "list",
        resource: "analytics",
      });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].ipAddress).toBe("10.0.0.1");
    });
  });

  describe("logActivityAfterResponse", () => {
    it("should log activity after response is sent", async () => {
      const activityData = {
        action: "download",
        resource: "image",
        resourceId: "456",
      };

      const req = mockRequest({
        ip: "192.168.1.2",
      });
      req.get = jest.fn().mockReturnValue("Safari/14.0");

      const res = mockResponse();
      const next = mockNext();

      const middleware = logActivityAfterResponse(activityData);
      middleware(req as any, res, next);

      expect(next).toHaveBeenCalled();

      // Simulate sending response
      const sendData = { success: true };
      res.send(sendData);

      // Wait for async logging
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify log was created after response
      const logs = await ActivityLog.find({ resourceId: "456" });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("download");
    });

    it("should not interfere with response", () => {
      const activityData = {
        action: "bookmark",
        resource: "image",
      };

      const req = mockRequest({
        ip: "192.168.1.3",
      });
      req.get = jest.fn().mockReturnValue("Firefox/89.0");

      const res = mockResponse();
      const next = mockNext();

      const middleware = logActivityAfterResponse(activityData);
      middleware(req as any, res, next);

      const responseData = { success: true, data: { id: 1 } };
      const result = res.send(responseData);

      expect(result).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it("should handle logging errors gracefully", () => {
      const activityData = {
        action: "delete",
        resource: "image",
      };

      const req = mockRequest({
        ip: undefined,
      });
      req.get = jest.fn().mockReturnValue(undefined);

      const res = mockResponse();
      const next = mockNext();

      const middleware = logActivityAfterResponse(activityData);

      expect(() => {
        middleware(req as any, res, next);
        res.send({ success: true });
      }).not.toThrow();
    });
  });
});
