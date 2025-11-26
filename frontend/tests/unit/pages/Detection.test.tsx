/**
 * Unit tests for Detection component
 */

// Mock the config module to avoid import.meta issues
jest.mock("@/config/env", () => ({
  API_URL: "http://localhost:5000",
  getEnvVar: jest.fn((_key: string, defaultValue: string) => defaultValue),
}));

// Mock axios before importing anything that uses it
jest.mock("axios", () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    },
  };
});

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Detection from "@/pages/Detection";
import { Provider } from "react-redux";
import { createMockStore } from "../../utils/testHelpers";
import axios from "axios";

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock apiService to prevent initialization errors
jest.mock("@/services/api");

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
    _id: "img1",
    name: "Test Image 1",
    filename: "test1.jpg",
    filepath: "/uploads/test1.jpg",
  },
  {
    _id: "img2",
    name: "Test Image 2",
    filename: "test2.jpg",
    filepath: "/uploads/test2.jpg",
    detections: {
      detectedAt: "2024-01-01",
      summary: "Detected objects",
    },
  },
];

// Mock detection result for future test cases
// const mockDetectionResult = {
//   success: true,
//   data: {
//     imageId: "img1",
//     imageName: "Test Image 1",
//     detections: [
//       {
//         class_id: 0,
//         class_name: "person",
//         confidence: 85.5,
//         description: "A person detected in the image",
//         bbox: { x: 100, y: 100, width: 200, height: 300, x_center: 200, y_center: 250 },
//       },
//     ],
//     metadata: {
//       image_width: 1920,
//       image_height: 1080,
//       image_mode: "RGB",
//       total_detections: 1,
//       average_confidence: 85.5,
//       model_name: "YOLOv5s",
//       device: "CPU",
//     },
//     summary: "Detected 1 object with 85.5% average confidence",
//   },
// };

describe("Detection Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (message.success as jest.Mock).mockClear();
    (message.error as jest.Mock).mockClear();
    (message.warning as jest.Mock).mockClear();
  });

  const renderDetection = () => {
    return render(
      <BrowserRouter>
        <Provider store={createMockStore()}>
          <Detection />
        </Provider>
      </BrowserRouter>
    );
  };

  it.skip("should render detection page with header", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    renderDetection();

    await waitFor(() => {
      expect(screen.getByText("AI Object Detection")).toBeInTheDocument();
    });
  });

  it.skip("should fetch and display user images", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, data: mockImages },
    });

    renderDetection();

    await waitFor(() => {
      expect(screen.getByText("Select Image")).toBeInTheDocument();
    });
  });

  it.skip("should show warning when no image is selected", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, data: mockImages },
    });

    renderDetection();

    await waitFor(() => {
      expect(screen.getByText("Detect Objects")).toBeInTheDocument();
    });

    const detectButton = screen.getByText("Detect Objects");
    fireEvent.click(detectButton);

    expect(message.warning).toHaveBeenCalledWith(
      "Please select an image first"
    );
  });

  it("should display detection settings", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    renderDetection();

    await waitFor(() => {
      expect(screen.getByText("Detection Settings")).toBeInTheDocument();
    });

    expect(screen.getByText(/Confidence Threshold:/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum Detections:/)).toBeInTheDocument();
  });

  it("should show info card when no results", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    renderDetection();

    await waitFor(() => {
      expect(screen.getByText("How it works")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Our AI detection service uses YOLOv5/)
    ).toBeInTheDocument();
  });

  it("should handle image fetch error", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error("Failed to fetch"));

    renderDetection();

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Failed to load images");
    });

    consoleErrorSpy.mockRestore();
  });

  it("should display refresh button", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    renderDetection();

    await waitFor(() => {
      expect(screen.getByText("Refresh Images")).toBeInTheDocument();
    });
  });

  it("should show alert about uploading images first", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    renderDetection();

    await waitFor(() => {
      expect(
        screen.getByText(
          "Note: You must first upload images in the Images tab before using detection"
        )
      ).toBeInTheDocument();
    });
  });

  it("should show no images warning when list is empty", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: true, data: [] },
    });

    renderDetection();

    await waitFor(() => {
      expect(screen.getByText("No images found")).toBeInTheDocument();
      expect(
        screen.getByText("Please upload images in the Images tab first")
      ).toBeInTheDocument();
    });
  });
});
