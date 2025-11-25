/**
 * Unit tests for User model
 */
import "../../../tests/setup";
import { User } from "../../../src/models/User";
import { createTestUser } from "../../helpers/testHelpers";

describe("User Model", () => {
  describe("User Creation", () => {
    it("should create a new user successfully", async () => {
      const userData = {
        email: "john@example.com",
        password: "password123",
        name: "John Doe",
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe("user"); // default role
      expect(user.createdAt).toBeDefined();
    });

    it("should hash password before saving", async () => {
      const userData = {
        email: "jane@example.com",
        password: "password123",
        name: "Jane Doe",
      };

      const user = await User.create(userData);

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });

    it("should set default role to user", async () => {
      const user = await createTestUser({ email: "default@example.com" });

      expect(user.role).toBe("user");
    });

    it("should allow admin role", async () => {
      const user = await createTestUser({
        email: "admin@example.com",
        role: "admin",
      });

      expect(user.role).toBe("admin");
    });
  });

  describe("User Validation", () => {
    it("should require email", async () => {
      const userData = {
        password: "password123",
        name: "Test User",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should require password", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should require name", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should enforce unique email", async () => {
      const email = "duplicate@example.com";

      await createTestUser({ email });

      await expect(createTestUser({ email })).rejects.toThrow();
    });

    it("should convert email to lowercase", async () => {
      const user = await createTestUser({ email: "UPPER@EXAMPLE.COM" });

      expect(user.email).toBe("upper@example.com");
    });

    it("should trim email whitespace", async () => {
      const user = await createTestUser({ email: "  trimmed@example.com  " });

      expect(user.email).toBe("trimmed@example.com");
    });
  });

  describe("Password Methods", () => {
    it("should compare password correctly", async () => {
      const password = "password123";
      const user = await createTestUser({ password });

      const isMatch = await user.comparePassword(password);
      expect(isMatch).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const user = await createTestUser({ password: "password123" });

      const isMatch = await user.comparePassword("wrongpassword");
      expect(isMatch).toBe(false);
    });

    it("should not rehash password if not modified", async () => {
      const user = await createTestUser({ password: "password123" });
      const originalHash = user.password;

      user.name = "Updated Name";
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });
});
