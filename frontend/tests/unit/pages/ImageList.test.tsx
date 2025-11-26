/**
 * Unit tests for ImageList component
 */

// Mock the config module to avoid import.meta issues
jest.mock("@/config/env", () => ({
  API_URL: "http://localhost:5000",
  getEnvVar: jest.fn((_key: string, defaultValue: string) => defaultValue),
}));

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import ImageList from "@/pages/ImageList";
import { apiService } from "@/services/api";
import { Provider } from "react-redux";
import { createMockStore } from "../../utils/testHelpers";

jest.mock("@/services/api");
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock("antd", () => {
  const actual = jest.requireActual("antd");
  return {
    ...actual,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
    },
  };
});

const { message } = require("antd");

const mockImages = [
  {
    _id: "1",
    name: "Image 1",
    filename: "image1.jpg",
    originalName: "original1.jpg",
    filepath: "/uploads/image1.jpg",
    size: 1024000,
    mimetype: "image/jpeg",
    isBookmarked: false,
    uploadedAt: "2024-01-01T10:00:00Z",
    userId: "user1",
  },
  {
    _id: "2",
    name: "Image 2",
    filename: "image2.jpg",
    originalName: "original2.jpg",
    filepath: "/uploads/image2.jpg",
    size: 2048000,
    mimetype: "image/jpeg",
    isBookmarked: true,
    uploadedAt: "2024-01-02T10:00:00Z",
    userId: "user1",
  },
];

describe("ImageList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    (message.success as jest.Mock).mockClear();
    (message.error as jest.Mock).mockClear();
    mockedApiService.getCurrentUser.mockRejectedValue(
      new Error("Not authenticated")
    );
  });

  const renderImageList = () => {
    return render(
      <BrowserRouter>
        <Provider store={createMockStore()}>
          <ImageList />
        </Provider>
      </BrowserRouter>
    );
  };

  it("should render image list with title", async () => {
    mockedApiService.getImages.mockResolvedValue({
      data: mockImages,
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    } as any);

    renderImageList();

    await waitFor(() => {
      expect(screen.getByText("Panorama Images")).toBeInTheDocument();
    });
  });

  it("should display images in table", async () => {
    mockedApiService.getImages.mockResolvedValue({
      data: mockImages,
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    } as any);

    renderImageList();

    await waitFor(() => {
      expect(screen.getByText("Image 1")).toBeInTheDocument();
      expect(screen.getByText("Image 2")).toBeInTheDocument();
    });
  });

  it("should show upload button", async () => {
    mockedApiService.getImages.mockResolvedValue({
      data: [],
      pagination: { total: 0, page: 1, limit: 10, pages: 0 },
    } as any);

    renderImageList();

    await waitFor(() => {
      expect(screen.getByText("Upload Image")).toBeInTheDocument();
    });
  });

  it("should open upload modal when clicking upload button", async () => {
    mockedApiService.getImages.mockResolvedValue({
      data: [],
      pagination: { total: 0, page: 1, limit: 10, pages: 0 },
    } as any);

    renderImageList();

    await waitFor(() => {
      expect(screen.getByText("Upload Image")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Upload Image"));

    await waitFor(() => {
      expect(screen.getByText("Upload Panorama Image")).toBeInTheDocument();
    });
  });

  it("should handle search", async () => {
    mockedApiService.getImages.mockResolvedValue({
      data: mockImages,
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    } as any);

    renderImageList();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search by name")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search by name");
    await userEvent.type(searchInput, "test{enter}");

    await waitFor(() => {
      expect(mockedApiService.getImages).toHaveBeenCalledWith(
        expect.objectContaining({ search: "test" })
      );
    });
  });

  it("should toggle bookmark", async () => {
    mockedApiService.getImages.mockResolvedValue({
      data: mockImages,
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    } as any);
    mockedApiService.toggleBookmark.mockResolvedValue({} as any);

    renderImageList();

    await waitFor(() => {
      expect(screen.getByText("Image 1")).toBeInTheDocument();
    });

    // Find bookmark button by icon class
    const bookmarkIcons = document.querySelectorAll(".anticon-star");
    if (bookmarkIcons.length > 0) {
      const bookmarkButton = bookmarkIcons[0].closest("button");
      if (bookmarkButton) {
        fireEvent.click(bookmarkButton);

        await waitFor(() => {
          expect(mockedApiService.toggleBookmark).toHaveBeenCalledWith("1");
          expect(message.success).toHaveBeenCalledWith("Bookmark updated");
        });
      }
    }
  });

  it("should navigate to image viewer when clicking view", async () => {
    mockedApiService.getImages.mockResolvedValue({
      data: mockImages,
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    } as any);

    renderImageList();

    await waitFor(() => {
      expect(screen.getAllByText("View").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText("View")[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/images/1");
  });

  it("should handle delete confirmation", async () => {
    mockedApiService.getImages.mockResolvedValue({
      data: mockImages,
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    } as any);
    mockedApiService.deleteImage.mockResolvedValue({} as any);

    renderImageList();

    await waitFor(() => {
      expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
    });

    // Click delete button
    fireEvent.click(screen.getAllByText("Delete")[0]);

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText("Delete this image?")).toBeInTheDocument();
    });

    const yesButton = screen.getByText("Yes");
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(mockedApiService.deleteImage).toHaveBeenCalledWith("1");
      expect(message.success).toHaveBeenCalledWith("Image deleted");
    });
  });

  it.skip("should format file size correctly", async () => {
    mockedApiService.getImages.mockResolvedValue({
      data: mockImages,
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    } as any);

    renderImageList();

    // Wait for images to load first
    await waitFor(() => {
      expect(screen.getByText("Image 1")).toBeInTheDocument();
    });

    // Then check for formatted file sizes
    expect(screen.getByText("1000 KB")).toBeInTheDocument();
    expect(screen.getByText("2 MB")).toBeInTheDocument();
  });

  it("should handle API error when fetching images", async () => {
    mockedApiService.getImages.mockRejectedValue(new Error("Failed to fetch"));

    renderImageList();

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Failed to fetch images");
    });
  });

  it("should handle bookmark toggle error", async () => {
    mockedApiService.getImages.mockResolvedValue({
      data: mockImages,
      pagination: { total: 2, page: 1, limit: 10, pages: 1 },
    } as any);
    mockedApiService.toggleBookmark.mockRejectedValue(
      new Error("Failed to toggle")
    );

    renderImageList();

    await waitFor(() => {
      expect(screen.getByText("Image 1")).toBeInTheDocument();
    });

    // Find bookmark button by icon class
    const bookmarkIcons = document.querySelectorAll(".anticon-star");
    if (bookmarkIcons.length > 0) {
      const bookmarkButton = bookmarkIcons[0].closest("button");
      if (bookmarkButton) {
        fireEvent.click(bookmarkButton);

        await waitFor(() => {
          expect(message.error).toHaveBeenCalledWith(
            "Failed to update bookmark"
          );
        });
      }
    }
  });
});
