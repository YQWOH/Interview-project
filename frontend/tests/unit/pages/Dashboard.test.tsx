/**
 * Unit tests for Dashboard component
 */

// Mock the config module to avoid import.meta issues
jest.mock("@/config/env", () => ({
  API_URL: "http://localhost:5000",
  getEnvVar: jest.fn((_key: string, defaultValue: string) => defaultValue),
}));

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import { apiService } from "@/services/api";
import { AuthProvider } from "@/hooks/useAuth";

jest.mock("@/services/api");
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockAnalyticsData = {
  summary: {
    totalImages: 100,
    bookmarkedCount: 25,
    bookmarkPercentage: 25,
    totalSize: 104857600, // 100 MB
  },
  sizeByBookmark: [],
  uploadTrend: [],
};

describe("Dashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockedApiService.getCurrentUser.mockRejectedValue(
      new Error("Not authenticated")
    );
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it.skip("should show loading spinner initially", () => {
    mockedApiService.getAnalytics.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderDashboard();
    // Ant Design Spin has aria-busy and aria-live attributes
    const spinner = document.querySelector(".ant-spin");
    expect(spinner).toBeInTheDocument();
  });

  it.skip("should render dashboard with statistics", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: mockAnalyticsData,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText("Total Images")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Bookmarked")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Bookmark Rate")).toBeInTheDocument();
  });

  it("should have upload button that navigates to images", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: mockAnalyticsData,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Upload Image")).toBeInTheDocument();
    });

    const uploadButton = screen.getByText("Upload Image");
    fireEvent.click(uploadButton);

    expect(mockNavigate).toHaveBeenCalledWith("/images");
  });

  it("should render quick actions section", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: mockAnalyticsData,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    });

    expect(screen.getByText("View All Images")).toBeInTheDocument();
    expect(screen.getByText("View Bookmarked Images")).toBeInTheDocument();
    expect(screen.getByText("View Analytics")).toBeInTheDocument();
  });

  it("should navigate to images when clicking View All Images", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: mockAnalyticsData,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("View All Images")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("View All Images"));
    expect(mockNavigate).toHaveBeenCalledWith("/images");
  });

  it("should navigate to bookmarked images with query param", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: mockAnalyticsData,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("View Bookmarked Images")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("View Bookmarked Images"));
    expect(mockNavigate).toHaveBeenCalledWith("/images?bookmarked=true");
  });

  it("should navigate to analytics page", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: mockAnalyticsData,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText("View Analytics").length).toBeGreaterThan(0);
    });

    const viewAnalyticsButtons = screen.getAllByText("View Analytics");
    fireEvent.click(viewAnalyticsButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/analytics");
  });

  it("should format storage size correctly", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: mockAnalyticsData,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Total Storage")).toBeInTheDocument();
    });

    expect(screen.getByText("100 MB")).toBeInTheDocument();
  });

  it("should handle API error gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedApiService.getAnalytics.mockRejectedValue(
      new Error("Failed to fetch")
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
