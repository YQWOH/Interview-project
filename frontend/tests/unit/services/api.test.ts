/**
 * Unit tests for API Service
 */

// Mock the config module to avoid import.meta issues
jest.mock("@/config/env", () => ({
  API_URL: "http://localhost:5000",
  getEnvVar: jest.fn((_key: string, defaultValue: string) => defaultValue),
}));

// Create a shared mock axios instance that will be used across tests
const mockAxiosInstance: any = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn((successHandler) => {
        mockAxiosInstance._requestInterceptor = successHandler;
        return 0; // Return interceptor ID
      }),
    },
    response: {
      use: jest.fn((successHandler, errorHandler) => {
        mockAxiosInstance._responseInterceptor = {
          successHandler,
          errorHandler,
        };
        return 0; // Return interceptor ID
      }),
    },
  },
};

// Mock axios before any imports
jest.mock("axios", () => {
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
    },
  };
});

import axios from "axios";
import { apiService } from "../../../src/services/api";
import {
  mockAuthResponse,
  mockImage,
  mockImageListResponse,
  mockAnalyticsResponse,
  mockErrorResponse,
  createMockFile,
} from "../../utils/testHelpers";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ApiService", () => {
  beforeEach(() => {
    // Recreate localStorage mocks for each test
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    // Reset mock axios instance methods (but preserve interceptor handlers)
    const requestInterceptor = (mockAxiosInstance as any)._requestInterceptor;
    const responseInterceptor = (mockAxiosInstance as any)._responseInterceptor;

    mockAxiosInstance.get = jest.fn();
    mockAxiosInstance.post = jest.fn();
    mockAxiosInstance.patch = jest.fn();
    mockAxiosInstance.delete = jest.fn();

    // Restore interceptor handlers if they were captured
    if (requestInterceptor) {
      (mockAxiosInstance as any)._requestInterceptor = requestInterceptor;
    }
    if (responseInterceptor) {
      (mockAxiosInstance as any)._responseInterceptor = responseInterceptor;
    }

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });

  describe("Authentication Endpoints", () => {
    describe("register", () => {
      it("should register a new user successfully", async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

        const result = await apiService.register(
          "Test User",
          "test@example.com",
          "password123"
        );

        expect(mockAxiosInstance.post).toHaveBeenCalledWith("/auth/register", {
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });
        expect(result).toEqual(mockAuthResponse);
      });

      it("should handle registration errors", async () => {
        const error = mockErrorResponse("Email already exists");
        mockAxiosInstance.post.mockRejectedValue(error);

        await expect(
          apiService.register("Test User", "test@example.com", "password123")
        ).rejects.toEqual(error);
      });
    });

    describe("login", () => {
      it("should login successfully", async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

        const result = await apiService.login(
          "test@example.com",
          "password123"
        );

        expect(mockAxiosInstance.post).toHaveBeenCalledWith("/auth/login", {
          email: "test@example.com",
          password: "password123",
        });
        expect(result).toEqual(mockAuthResponse);
      });

      it("should handle invalid credentials", async () => {
        const error = mockErrorResponse("Invalid credentials");
        mockAxiosInstance.post.mockRejectedValue(error);

        await expect(
          apiService.login("test@example.com", "wrongpassword")
        ).rejects.toEqual(error);
      });
    });

    describe("getCurrentUser", () => {
      it("should get current user successfully", async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: mockAuthResponse });

        const result = await apiService.getCurrentUser();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/auth/me");
        expect(result).toEqual(mockAuthResponse);
      });

      it("should handle unauthorized error", async () => {
        const error = mockErrorResponse("Unauthorized");
        error.response.status = 401;
        mockAxiosInstance.get.mockRejectedValue(error);

        await expect(apiService.getCurrentUser()).rejects.toEqual(error);
      });
    });
  });

  describe("Image Endpoints", () => {
    describe("getImages", () => {
      it("should get images without params", async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: mockImageListResponse,
        });

        const result = await apiService.getImages();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/images", {
          params: undefined,
        });
        expect(result).toEqual(mockImageListResponse);
      });

      it("should get images with search query", async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: mockImageListResponse,
        });

        const params = { search: "test", page: 1, limit: 10 };
        const result = await apiService.getImages(params);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/images", {
          params,
        });
        expect(result).toEqual(mockImageListResponse);
      });

      it("should get bookmarked images only", async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: mockImageListResponse,
        });

        const params = { bookmarked: true };
        await apiService.getImages(params);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/images", {
          params,
        });
      });

      it("should get images with sorting", async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: mockImageListResponse,
        });

        const params = {
          sortBy: "uploadedAt" as const,
          order: "desc" as const,
        };
        await apiService.getImages(params);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/images", {
          params,
        });
      });
    });

    describe("getImageById", () => {
      it("should get image by id successfully", async () => {
        const mockResponse = { success: true, data: mockImage };
        mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

        const result = await apiService.getImageById(mockImage._id);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `/images/${mockImage._id}`
        );
        expect(result).toEqual(mockResponse);
      });

      it("should handle image not found error", async () => {
        const error = mockErrorResponse("Image not found");
        error.response.status = 404;
        mockAxiosInstance.get.mockRejectedValue(error);

        await expect(apiService.getImageById("invalid-id")).rejects.toEqual(
          error
        );
      });
    });

    describe("uploadImage", () => {
      it("should upload image with custom name", async () => {
        const mockFile = createMockFile();
        const mockResponse = { success: true, data: mockImage };
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

        const result = await apiService.uploadImage(mockFile, "Custom Name");

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/images",
          expect.any(FormData),
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        expect(result).toEqual(mockResponse);
      });

      it("should upload image without custom name", async () => {
        const mockFile = createMockFile();
        const mockResponse = { success: true, data: mockImage };
        mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

        await apiService.uploadImage(mockFile);

        expect(mockAxiosInstance.post).toHaveBeenCalled();
      });

      it("should handle upload errors", async () => {
        const mockFile = createMockFile();
        const error = mockErrorResponse("File too large");
        mockAxiosInstance.post.mockRejectedValue(error);

        await expect(apiService.uploadImage(mockFile)).rejects.toEqual(error);
      });
    });

    describe("toggleBookmark", () => {
      it("should toggle bookmark successfully", async () => {
        const bookmarkedImage = { ...mockImage, isBookmarked: true };
        const mockResponse = { success: true, data: bookmarkedImage };
        mockAxiosInstance.patch.mockResolvedValue({ data: mockResponse });

        const result = await apiService.toggleBookmark(mockImage._id);

        expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
          `/images/${mockImage._id}/bookmark`
        );
        expect(result).toEqual(mockResponse);
      });

      it("should handle bookmark toggle errors", async () => {
        const error = mockErrorResponse("Image not found");
        mockAxiosInstance.patch.mockRejectedValue(error);

        await expect(apiService.toggleBookmark("invalid-id")).rejects.toEqual(
          error
        );
      });
    });

    describe("deleteImage", () => {
      it("should delete image successfully", async () => {
        const mockResponse = { success: true, message: "Image deleted" };
        mockAxiosInstance.delete.mockResolvedValue({ data: mockResponse });

        const result = await apiService.deleteImage(mockImage._id);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
          `/images/${mockImage._id}`
        );
        expect(result).toEqual(mockResponse);
      });

      it("should handle delete authorization errors", async () => {
        const error = mockErrorResponse("Not authorized");
        error.response.status = 403;
        mockAxiosInstance.delete.mockRejectedValue(error);

        await expect(apiService.deleteImage(mockImage._id)).rejects.toEqual(
          error
        );
      });
    });

    describe("getImageUrl", () => {
      it("should return correct image URL", () => {
        const filepath = "/uploads/test.jpg";
        const url = apiService.getImageUrl(filepath);

        expect(url).toContain(filepath);
        expect(typeof url).toBe("string");
      });
    });

    describe("getDownloadUrl", () => {
      it("should return download URL with token", () => {
        (localStorage.getItem as jest.Mock).mockReturnValue("test-token");

        const url = apiService.getDownloadUrl(mockImage._id);

        expect(url).toContain(`/images/${mockImage._id}/download`);
        expect(url).toContain("token=test-token");
      });

      it("should handle missing token", () => {
        (localStorage.getItem as jest.Mock).mockReturnValue(null);

        const url = apiService.getDownloadUrl(mockImage._id);

        expect(url).toContain("token=null");
      });
    });
  });

  describe("Analytics Endpoints", () => {
    describe("getAnalytics", () => {
      it("should get analytics data successfully", async () => {
        mockAxiosInstance.get.mockResolvedValue({
          data: mockAnalyticsResponse,
        });

        const result = await apiService.getAnalytics();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/images/analytics");
        expect(result).toEqual(mockAnalyticsResponse);
        expect(result.data.summary.totalImages).toBe(10);
      });

      it("should handle analytics errors", async () => {
        const error = mockErrorResponse("Failed to fetch analytics");
        mockAxiosInstance.get.mockRejectedValue(error);

        await expect(apiService.getAnalytics()).rejects.toEqual(error);
      });
    });
  });

  describe("Request Interceptors", () => {
    it("should add authorization token to requests", () => {
      const token = "test-token";
      (localStorage.getItem as jest.Mock).mockReturnValue(token);

      const config = { headers: {} };
      const result = mockAxiosInstance._requestInterceptor(config);

      expect(localStorage.getItem).toHaveBeenCalledWith("token");
      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it("should not add authorization header if no token", () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const config = { headers: {} };
      const result = mockAxiosInstance._requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe("Response Interceptors", () => {
    // Note: These tests verify the interceptor logic but skip location.href checks
    // due to jsdom navigation limitations in the test environment
    it("should handle 401 errors and clear storage", async () => {
      const error = {
        response: {
          status: 401,
          data: { success: false, error: { message: "Unauthorized" } },
        },
      };

      const interceptor = mockAxiosInstance._responseInterceptor.errorHandler;

      await expect(interceptor(error)).rejects.toEqual(error);
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    });

    it("should reject 401 errors", async () => {
      const error = {
        response: {
          status: 401,
          data: { success: false, error: { message: "Unauthorized" } },
        },
      };

      const interceptor = mockAxiosInstance._responseInterceptor.errorHandler;

      await expect(interceptor(error)).rejects.toEqual(error);
    });

    it("should reject non-401 errors without clearing storage", async () => {
      const error = {
        response: {
          status: 500,
          data: { success: false, error: { message: "Server error" } },
        },
      };

      const interceptor = mockAxiosInstance._responseInterceptor.errorHandler;

      await expect(interceptor(error)).rejects.toEqual(error);
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });
});
