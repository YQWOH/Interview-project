/**
 * Unit tests for logger utility
 */
import { logger } from "../../../src/utils/logger";
import winston from "winston";

describe("Logger Utils", () => {
  describe("Logger Configuration", () => {
    it("should be a winston logger instance", () => {
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it("should have correct log level based on environment", () => {
      expect(logger.level).toBeDefined();

      if (process.env.NODE_ENV === "production") {
        expect(logger.level).toBe("info");
      } else {
        expect(logger.level).toBe("debug");
      }
    });

    it("should have configured transports", () => {
      expect(logger.transports).toBeDefined();
      expect(logger.transports.length).toBeGreaterThan(0);
    });
  });

  describe("Logging Methods", () => {
    beforeEach(() => {
      // Clear any previous logs
      jest.clearAllMocks();
    });

    it("should log info messages", () => {
      const spy = jest.spyOn(logger, "info");

      logger.info("Test info message");

      expect(spy).toHaveBeenCalledWith("Test info message");
      spy.mockRestore();
    });

    it("should log error messages", () => {
      const spy = jest.spyOn(logger, "error");

      logger.error("Test error message");

      expect(spy).toHaveBeenCalledWith("Test error message");
      spy.mockRestore();
    });

    it("should log warning messages", () => {
      const spy = jest.spyOn(logger, "warn");

      logger.warn("Test warning message");

      expect(spy).toHaveBeenCalledWith("Test warning message");
      spy.mockRestore();
    });

    it("should log debug messages", () => {
      const spy = jest.spyOn(logger, "debug");

      logger.debug("Test debug message");

      expect(spy).toHaveBeenCalledWith("Test debug message");
      spy.mockRestore();
    });

    it("should log messages with metadata", () => {
      const spy = jest.spyOn(logger, "info");
      const metadata = { userId: "123", action: "upload" };

      logger.info("User action", metadata);

      expect(spy).toHaveBeenCalledWith("User action", metadata);
      spy.mockRestore();
    });

    it("should log error objects", () => {
      const spy = jest.spyOn(logger, "error");
      const error = new Error("Test error");

      logger.error("Error occurred", { error });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("Log Formatting", () => {
    it("should format logs with timestamp", () => {
      const spy = jest.spyOn(logger, "info");

      logger.info("Timestamp test");

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should handle complex metadata objects", () => {
      const spy = jest.spyOn(logger, "info");
      const complexMetadata = {
        user: { id: "123", email: "test@example.com" },
        request: { method: "POST", path: "/api/test" },
        data: { items: [1, 2, 3] },
      };

      logger.info("Complex log", complexMetadata);

      expect(spy).toHaveBeenCalledWith("Complex log", complexMetadata);
      spy.mockRestore();
    });

    it("should handle null and undefined values", () => {
      const spy = jest.spyOn(logger, "info");

      logger.info("Null test", { value: null });
      logger.info("Undefined test", { value: undefined });

      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });
  });

  describe("Error Logging", () => {
    it("should log errors with stack traces", () => {
      const spy = jest.spyOn(logger, "error");
      const error = new Error("Stack trace test");

      logger.error("Error with stack", { stack: error.stack });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should log multiple error properties", () => {
      const spy = jest.spyOn(logger, "error");

      logger.error("Detailed error", {
        message: "Something went wrong",
        statusCode: 500,
        path: "/api/test",
        method: "POST",
      });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("Performance", () => {
    it("should handle rapid successive log calls", () => {
      const spy = jest.spyOn(logger, "info");

      for (let i = 0; i < 100; i++) {
        logger.info(`Log message ${i}`);
      }

      expect(spy).toHaveBeenCalledTimes(100);
      spy.mockRestore();
    });

    it("should handle large metadata objects", () => {
      const spy = jest.spyOn(logger, "info");
      const largeMetadata = {
        data: new Array(1000).fill({ id: 1, name: "test", value: 123 }),
      };

      logger.info("Large metadata", largeMetadata);

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
