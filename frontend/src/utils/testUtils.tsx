import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

/**
 * Mock user data for testing
 */
export const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Test User",
  email: "test@example.com",
  role: "user",
  createdAt: "2024-01-01T00:00:00.000Z",
};

/**
 * Mock auth response
 */
export const mockAuthResponse = {
  success: true,
  data: {
    user: mockUser,
    token: "mock-jwt-token",
  },
};

/**
 * Mock image data
 */
export const mockImage = {
  _id: "507f1f77bcf86cd799439012",
  name: "Test Image",
  originalName: "test.jpg",
  filename: "test-123.jpg",
  filepath: "/uploads/test-123.jpg",
  size: 1024000,
  mimetype: "image/jpeg",
  isBookmarked: false,
  uploadedAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

/**
 * Mock image list response
 */
export const mockImageListResponse = {
  success: true,
  data: [mockImage],
  pagination: {
    total: 1,
    page: 1,
    limit: 10,
    pages: 1,
  },
};

/**
 * Mock analytics data
 */
export const mockAnalyticsData = {
  summary: {
    totalImages: 10,
    bookmarkedCount: 3,
    unbookmarkedCount: 7,
    totalSize: 10240000,
    bookmarkPercentage: "30.00",
  },
  sizeByBookmark: [
    { isBookmarked: true, totalSize: 3072000, count: 3 },
    { isBookmarked: false, totalSize: 7168000, count: 7 },
  ],
  uploadTrend: [
    { date: "2024-01-01", count: 5 },
    { date: "2024-01-02", count: 5 },
  ],
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
