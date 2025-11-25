/**
 * Unit tests for ImageViewer component
 */

// Mock the config module to avoid import.meta issues
jest.mock("@/config/env", () => ({
  API_URL: "http://localhost:5000",
  getEnvVar: jest.fn((_key: string, defaultValue: string) => defaultValue),
}));

// Mock Three.js
jest.mock("three", () => ({
  Scene: jest.fn(() => ({
    add: jest.fn(),
  })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    aspect: 1,
    updateProjectionMatrix: jest.fn(),
    lookAt: jest.fn(),
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    domElement: document.createElement("canvas"),
    render: jest.fn(),
    dispose: jest.fn(),
  })),
  SphereGeometry: jest.fn(() => ({
    scale: jest.fn(),
  })),
  MeshBasicMaterial: jest.fn(),
  Mesh: jest.fn(),
  TextureLoader: jest.fn(() => ({
    load: jest.fn((_url, onLoad) => {
      // Simulate successful texture load
      if (onLoad) {
        setTimeout(() => onLoad({}), 0);
      }
    }),
  })),
  Vector3: jest.fn(),
  MathUtils: {
    degToRad: jest.fn((deg) => deg * (Math.PI / 180)),
  },
}));

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ImageViewer from "@/pages/ImageViewer";
import { apiService } from "@/services/api";
import { AuthProvider } from "@/hooks/useAuth";

jest.mock("@/services/api");
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("antd", () => {
  const actual = jest.requireActual("antd");
  return {
    ...actual,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

const { message } = require("antd");

const mockImage = {
  _id: "img123",
  name: "Test Panorama",
  filename: "test.jpg",
  originalName: "original-test.jpg",
  filepath: "/uploads/test.jpg",
  size: 1024000,
  mimetype: "image/jpeg",
  isBookmarked: false,
  uploadedAt: "2024-01-01T10:00:00Z",
  userId: "user1",
};

describe("ImageViewer Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    (message.success as jest.Mock).mockClear();
    (message.error as jest.Mock).mockClear();
    mockedApiService.getCurrentUser.mockRejectedValue(
      new Error("Not authenticated")
    );
    mockedApiService.getImageUrl.mockReturnValue("/uploads/test.jpg");
    mockedApiService.getDownloadUrl.mockReturnValue(
      "/api/images/img123/download"
    );
  });

  const renderImageViewer = (imageId = "img123") => {
    return render(
      <MemoryRouter initialEntries={[`/images/${imageId}`]}>
        <AuthProvider>
          <Routes>
            <Route path="/images/:id" element={<ImageViewer />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it("should show loading spinner initially", () => {
    mockedApiService.getImageById.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderImageViewer();
    // Ant Design Spin has aria-busy and aria-live attributes
    const spinner = document.querySelector(".ant-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should render image viewer with image details", async () => {
    mockedApiService.getImageById.mockResolvedValue({
      data: mockImage,
    } as any);

    renderImageViewer();

    await waitFor(() => {
      expect(screen.getAllByText("Test Panorama")[0]).toBeInTheDocument();
    });

    expect(screen.getByText("Back to Images")).toBeInTheDocument();
    expect(screen.getByText("Bookmark")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("should display image details section", async () => {
    mockedApiService.getImageById.mockResolvedValue({
      data: mockImage,
    } as any);

    renderImageViewer();

    await waitFor(() => {
      expect(screen.getByText("Image Details")).toBeInTheDocument();
    });

    expect(screen.getByText("original-test.jpg")).toBeInTheDocument();
    expect(screen.getByText("image/jpeg")).toBeInTheDocument();
  });

  it("should navigate back when clicking back button", async () => {
    mockedApiService.getImageById.mockResolvedValue({
      data: mockImage,
    } as any);

    renderImageViewer();

    await waitFor(() => {
      expect(screen.getByText("Back to Images")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Back to Images"));
    expect(mockNavigate).toHaveBeenCalledWith("/images");
  });

  it("should toggle bookmark", async () => {
    mockedApiService.getImageById.mockResolvedValue({
      data: mockImage,
    } as any);
    mockedApiService.toggleBookmark.mockResolvedValue({} as any);

    renderImageViewer();

    await waitFor(() => {
      expect(screen.getByText("Bookmark")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Bookmark"));

    await waitFor(() => {
      expect(mockedApiService.toggleBookmark).toHaveBeenCalledWith("img123");
      expect(message.success).toHaveBeenCalledWith("Bookmark updated");
    });
  });

  it("should show bookmarked state", async () => {
    mockedApiService.getImageById.mockResolvedValue({
      data: { ...mockImage, isBookmarked: true },
    } as any);

    renderImageViewer();

    await waitFor(() => {
      const bookmarkButtons = screen.getAllByText("Bookmarked");
      expect(bookmarkButtons.length).toBeGreaterThan(0);
    });
  });

  it("should format file size correctly", async () => {
    mockedApiService.getImageById.mockResolvedValue({
      data: mockImage,
    } as any);

    renderImageViewer();

    await waitFor(() => {
      expect(screen.getByText("1000 KB")).toBeInTheDocument();
    });
  });

  it("should handle API error and navigate to images", async () => {
    mockedApiService.getImageById.mockRejectedValue(
      new Error("Failed to fetch")
    );

    renderImageViewer();

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Failed to load image");
      expect(mockNavigate).toHaveBeenCalledWith("/images");
    });
  });

  it("should handle bookmark toggle error", async () => {
    mockedApiService.getImageById.mockResolvedValue({
      data: mockImage,
    } as any);
    mockedApiService.toggleBookmark.mockRejectedValue(
      new Error("Failed to toggle")
    );

    renderImageViewer();

    await waitFor(() => {
      expect(screen.getByText("Bookmark")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Bookmark"));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Failed to update bookmark");
    });
  });

  it("should display panorama viewer instructions", async () => {
    mockedApiService.getImageById.mockResolvedValue({
      data: mockImage,
    } as any);

    renderImageViewer();

    await waitFor(() => {
      expect(
        screen.getByText("Click and drag to look around the panorama")
      ).toBeInTheDocument();
    });
  });

  it("should show Yes/No for bookmark status in details", async () => {
    mockedApiService.getImageById.mockResolvedValue({
      data: mockImage,
    } as any);

    renderImageViewer();

    await waitFor(() => {
      const noText = screen.getAllByText("No");
      expect(noText.length).toBeGreaterThan(0);
    });
  });
});
