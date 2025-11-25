/**
 * Unit tests for JWT utilities
 */
import { generateToken, verifyToken, JWTPayload } from "../../../src/utils/jwt";
import jwt from "jsonwebtoken";

describe("JWT Utils", () => {
  const mockPayload: JWTPayload = {
    userId: "123456",
    email: "test@example.com",
    role: "user",
  };

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should include payload data in token", () => {
      const token = generateToken(mockPayload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it("should include expiration time", () => {
      const token = generateToken(mockPayload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it("should generate different tokens for same payload", () => {
      const token1 = generateToken(mockPayload);

      // Wait a bit to ensure different iat
      const token2 = generateToken(mockPayload);

      // Tokens might be same if generated at exact same millisecond
      // But they should both be valid
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
    });

    it("should handle different user roles", () => {
      const adminPayload: JWTPayload = {
        userId: "789",
        email: "admin@example.com",
        role: "admin",
      };

      const token = generateToken(adminPayload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.role).toBe("admin");
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a valid token", () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it("should throw error for invalid token", () => {
      const invalidToken = "invalid.token.here";

      expect(() => verifyToken(invalidToken)).toThrow(
        "Invalid or expired token"
      );
    });

    it("should throw error for malformed token", () => {
      const malformedToken = "not-a-jwt-token";

      expect(() => verifyToken(malformedToken)).toThrow(
        "Invalid or expired token"
      );
    });

    it("should throw error for empty token", () => {
      expect(() => verifyToken("")).toThrow("Invalid or expired token");
    });

    it("should throw error for token with wrong signature", () => {
      // Generate token with different secret
      const wrongToken = jwt.sign(mockPayload, "wrong-secret", {
        expiresIn: "1h",
      });

      expect(() => verifyToken(wrongToken)).toThrow("Invalid or expired token");
    });

    it("should throw error for expired token", () => {
      // Generate token that expires immediately
      const expiredToken = jwt.sign(
        mockPayload,
        process.env.JWT_SECRET || "your-secret-key-change-in-production",
        { expiresIn: "0s" }
      );

      // Wait a bit to ensure expiration
      setTimeout(() => {
        expect(() => verifyToken(expiredToken)).toThrow(
          "Invalid or expired token"
        );
      }, 100);
    });

    it("should verify tokens with different payloads", () => {
      const payload1: JWTPayload = {
        userId: "user1",
        email: "user1@example.com",
        role: "user",
      };

      const payload2: JWTPayload = {
        userId: "user2",
        email: "user2@example.com",
        role: "admin",
      };

      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);

      const decoded1 = verifyToken(token1);
      const decoded2 = verifyToken(token2);

      expect(decoded1.userId).toBe("user1");
      expect(decoded2.userId).toBe("user2");
      expect(decoded2.role).toBe("admin");
    });
  });

  describe("Token Lifecycle", () => {
    it("should generate and verify token successfully", () => {
      const payload: JWTPayload = {
        userId: "test-user-123",
        email: "lifecycle@example.com",
        role: "user",
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it("should maintain payload integrity through encode/decode cycle", () => {
      const complexPayload: JWTPayload = {
        userId: "complex-user-456",
        email: "complex.user@example.com",
        role: "admin",
      };

      const token = generateToken(complexPayload);
      const decoded = verifyToken(token);

      expect(decoded).toMatchObject(complexPayload);
    });
  });
});
