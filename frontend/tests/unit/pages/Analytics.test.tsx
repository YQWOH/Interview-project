/**
 * Unit tests for Analytics component
 */

// Mock the config module to avoid import.meta issues
jest.mock("@/config/env", () => ({
  API_URL: "http://localhost:5000",
  getEnvVar: jest.fn((_key: string, defaultValue: string) => defaultValue),
}));

import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Analytics from "@/pages/Analytics";
import { apiService } from "@/services/api";
import { Provider } from "react-redux";
import { createMockStore } from "../../utils/testHelpers";

jest.mock("@/services/api");
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

const mockAnalyticsData = {
  summary: {
    totalImages: 150,
    bookmarkedCount: 45,
    bookmarkPercentage: 30,
    totalSize: 524288000, // 500 MB
  },
  sizeByBookmark: [
    { isBookmarked: true, count: 45, totalSize: 157286400 },
    { isBookmarked: false, count: 105, totalSize: 367001600 },
  ],
  uploadTrend: [
    { date: "2024-01-01", count: 10 },
    { date: "2024-01-02", count: 15 },
    { date: "2024-01-03", count: 20 },
  ],
};

describe("Analytics Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApiService.getCurrentUser.mockRejectedValue(
      new Error("Not authenticated")
    );
  });

  const renderAnalytics = () => {
    return render(
      <BrowserRouter>
        <Provider store={createMockStore()}>
          <Analytics />
        </Provider>
      </BrowserRouter>
    );
  };

  it.skip("should show loading spinner initially", () => {
    mockedApiService.getAnalytics.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderAnalytics();
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument(); // Spin component
  });

  it.skip("should render analytics dashboard with data", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: mockAnalyticsData,
    } as any);

    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    });

    // Check statistics cards
    expect(screen.getByText("Total Images")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("Bookmarked")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("Bookmark Rate")).toBeInTheDocument();
    expect(screen.getByText("30.0")).toBeInTheDocument();
  });

  it.skip("should format bytes correctly", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: mockAnalyticsData,
    } as any);

    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText("Total Storage")).toBeInTheDocument();
    });

    // 524288000 bytes = 500 MB
    expect(screen.getByText("500 MB")).toBeInTheDocument();
  });

  it.skip("should render charts with correct titles", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: mockAnalyticsData,
    } as any);

    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText("Upload Trend")).toBeInTheDocument();
      expect(screen.getByText("Bookmark Distribution")).toBeInTheDocument();
      expect(
        screen.getByText("Storage by Bookmark Status")
      ).toBeInTheDocument();
    });
  });

  it.skip("should handle API error gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedApiService.getAnalytics.mockRejectedValue(
      new Error("Failed to fetch")
    );

    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch analytics:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it.skip("should display zero values when no data", async () => {
    mockedApiService.getAnalytics.mockResolvedValue({
      data: {
        summary: {
          totalImages: 0,
          bookmarkedCount: 0,
          bookmarkPercentage: 0,
          totalSize: 0,
        },
        sizeByBookmark: [],
        uploadTrend: [],
      },
    } as any);

    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("0 Bytes")).toBeInTheDocument();
    });
  });
});
