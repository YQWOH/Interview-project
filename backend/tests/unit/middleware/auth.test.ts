/**
 * Unit tests for auth middleware
 */
import "../../setup";
import {
  authenticate,
  authenticateDownload,
  authorize,
} from "../../../src/middleware/auth";
import { verifyToken } from "../../../src/utils/jwt";
import { mockRequest, mockResponse, mockNext } from "../../helpers/testHelpers";

jest.mock("../../../src/utils/jwt");

describe("Auth Middleware", () => {
  describe("authenticate", () => {
    it("should authenticate with valid token", () => {
      const mockPayload = {
        userId: "123",
        email: "test@example.com",
        role: "user",
      };

      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const req = mockRequest({
        headers: {
          authorization: "Bearer valid-token",
        },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticate(req as any, res, next);

      expect(verifyToken).toHaveBeenCalledWith("valid-token");
      expect(req.user).toEqual(mockPayload);
      expect(next).toHaveBeenCalled();
    });

    it("should return 401 if no authorization header", () => {
      const req = mockRequest({
        headers: {},
      });
      const res = mockResponse();
      const next = mockNext();

      authenticate(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "No token provided" },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if authorization header does not start with Bearer", () => {
      const req = mockRequest({
        headers: {
          authorization: "InvalidFormat token",
        },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticate(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "No token provided" },
      });
    });

    it("should return 401 if token is invalid", () => {
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const req = mockRequest({
        headers: {
          authorization: "Bearer invalid-token",
        },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticate(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "Invalid or expired token" },
      });
    });
  });

  describe("authenticateDownload", () => {
    it("should authenticate with token from query parameter", () => {
      const mockPayload = {
        userId: "123",
        email: "test@example.com",
        role: "user",
      };

      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const req = mockRequest({
        query: {
          token: "valid-token",
        },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticateDownload(req as any, res, next);

      expect(verifyToken).toHaveBeenCalledWith("valid-token");
      expect(req.user).toEqual(mockPayload);
      expect(next).toHaveBeenCalled();
    });

    it("should authenticate with token from authorization header", () => {
      const mockPayload = {
        userId: "123",
        email: "test@example.com",
        role: "user",
      };

      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const req = mockRequest({
        headers: {
          authorization: "Bearer valid-token",
        },
        query: {},
      });
      const res = mockResponse();
      const next = mockNext();

      authenticateDownload(req as any, res, next);

      expect(verifyToken).toHaveBeenCalledWith("valid-token");
      expect(req.user).toEqual(mockPayload);
      expect(next).toHaveBeenCalled();
    });

    it("should prioritize query parameter over header", () => {
      const mockPayload = {
        userId: "123",
        email: "test@example.com",
        role: "user",
      };

      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const req = mockRequest({
        query: {
          token: "query-token",
        },
        headers: {
          authorization: "Bearer header-token",
        },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticateDownload(req as any, res, next);

      expect(verifyToken).toHaveBeenCalledWith("query-token");
    });

    it("should return 401 if no token provided", () => {
      const req = mockRequest({
        query: {},
        headers: {},
      });
      const res = mockResponse();
      const next = mockNext();

      authenticateDownload(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "No token provided" },
      });
    });

    it("should return 401 if token is invalid", () => {
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const req = mockRequest({
        query: {
          token: "invalid-token",
        },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticateDownload(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "Invalid or expired token" },
      });
    });
  });

  describe("authorize", () => {
    it("should authorize user with correct role", () => {
      const req = mockRequest({
        user: {
          userId: "123",
          email: "admin@example.com",
          role: "admin",
        },
      });
      const res = mockResponse();
      const next = mockNext();

      const middleware = authorize("admin");
      middleware(req as any, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should authorize user with one of multiple allowed roles", () => {
      const req = mockRequest({
        user: {
          userId: "123",
          email: "user@example.com",
          role: "user",
        },
      });
      const res = mockResponse();
      const next = mockNext();

      const middleware = authorize("admin", "user");
      middleware(req as any, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should return 401 if user not authenticated", () => {
      const req = mockRequest({
        user: undefined,
      });
      const res = mockResponse();
      const next = mockNext();

      const middleware = authorize("admin");
      middleware(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "Authentication required" },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 if user does not have required role", () => {
      const req = mockRequest({
        user: {
          userId: "123",
          email: "user@example.com",
          role: "user",
        },
      });
      const res = mockResponse();
      const next = mockNext();

      const middleware = authorize("admin");
      middleware(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { message: "Insufficient permissions" },
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
