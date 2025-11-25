import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

/**
 * Custom render function that wraps components with Router
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
 * Custom render function that wraps components with Auth and Router
 */
export function renderWithAuth(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    ),
    ...options,
  });
}

/**
 * Custom wrapper for testing hooks with Auth context
 */
export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
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
    token: "mock-jwt-token-12345",
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
 * Mock bookmarked image
 */
export const mockBookmarkedImage = {
  ...mockImage,
  _id: "507f1f77bcf86cd799439013",
  name: "Bookmarked Image",
  isBookmarked: true,
};

/**
 * Mock image list response
 */
export const mockImageListResponse = {
  success: true,
  data: [mockImage, mockBookmarkedImage],
  pagination: {
    total: 2,
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
    { date: "2024-01-02", count: 3 },
    { date: "2024-01-03", count: 2 },
  ],
};

/**
 * Mock analytics response
 */
export const mockAnalyticsResponse = {
  success: true,
  data: mockAnalyticsData,
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a mock file for upload testing
 */
export const createMockFile = (
  name = "test.jpg",
  size = 1024000,
  type = "image/jpeg"
): File => {
  const blob = new Blob(["test file content"], { type });
  const file = new File([blob], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

/**
 * Mock error response
 */
export const mockErrorResponse = (message: string, code?: string) => ({
  response: {
    status: 400,
    data: {
      success: false,
      error: {
        message,
        code,
      },
    },
  },
});

/**
 * Setup localStorage mock with initial values
 */
export const setupLocalStorage = (token?: string, user?: any) => {
  const localStorageMock = {
    getItem: jest.fn((key: string) => {
      if (key === "token") return token || null;
      if (key === "user") return user ? JSON.stringify(user) : null;
      return null;
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
  return localStorageMock;
};
