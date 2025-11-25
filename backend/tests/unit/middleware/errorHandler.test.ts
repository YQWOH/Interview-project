/**
 * Unit tests for errorHandler middleware
 */
import "../../setup";
import {
  errorHandler,
  notFoundHandler,
  AppError,
} from "../../../src/middleware/errorHandler";
import { mockRequest, mockResponse, mockNext } from "../../helpers/testHelpers";

jest.mock("../../../src/utils/logger");

describe("ErrorHandler Middleware", () => {
  describe("errorHandler", () => {
    it("should handle error with custom status code", () => {
      const error: AppError = new Error("Custom error");
      error.statusCode = 400;

      const req = mockRequest({
        path: "/api/test",
        method: "GET",
      });
      const res = mockResponse();
      const next = mockNext();

      errorHandler(error, req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Custom error",
        },
      });
    });

    it("should default to 500 status code", () => {
      const error: AppError = new Error("Internal error");

      const req = mockRequest({
        path: "/api/test",
        method: "POST",
      });
      const res = mockResponse();
      const next = mockNext();

      errorHandler(error, req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Internal error",
        },
      });
    });

    it("should include stack trace in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const error: AppError = new Error("Dev error");
      error.stack = "Error stack trace";

      const req = mockRequest({
        path: "/api/test",
        method: "GET",
      });
      const res = mockResponse();
      const next = mockNext();

      errorHandler(error, req as any, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Dev error",
          stack: "Error stack trace",
        },
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should not include stack trace in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const error: AppError = new Error("Prod error");
      error.stack = "Error stack trace";

      const req = mockRequest({
        path: "/api/test",
        method: "GET",
      });
      const res = mockResponse();
      const next = mockNext();

      errorHandler(error, req as any, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Prod error",
        },
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle error without message", () => {
      const error: AppError = new Error();

      const req = mockRequest({
        path: "/api/test",
        method: "GET",
      });
      const res = mockResponse();
      const next = mockNext();

      errorHandler(error, req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Internal Server Error",
        },
      });
    });
  });

  describe("notFoundHandler", () => {
    it("should return 404 for unknown routes", () => {
      const req = mockRequest({
        originalUrl: "/api/unknown/route",
      });
      const res = mockResponse();

      notFoundHandler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Route /api/unknown/route not found",
        },
      });
    });

    it("should handle different routes", () => {
      const req = mockRequest({
        originalUrl: "/api/v2/test",
      });
      const res = mockResponse();

      notFoundHandler(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Route /api/v2/test not found",
        },
      });
    });
  });
});
