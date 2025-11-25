/**
 * Unit tests for Register component
 */

// Mock the config module to avoid import.meta issues
jest.mock("@/config/env", () => ({
  API_URL: "http://localhost:5000",
  getEnvVar: jest.fn((_key: string, defaultValue: string) => defaultValue),
}));

import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "@/pages/Register";
import {
  renderWithAuth,
  mockAuthResponse,
  mockErrorResponse,
} from "../../utils/testHelpers";
import { apiService } from "@/services/api";

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

describe("Register Component", () => {
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

    jest.clearAllMocks();
    mockNavigate.mockClear();
    (message.success as jest.Mock).mockClear();
    (message.error as jest.Mock).mockClear();
    mockedApiService.getCurrentUser.mockRejectedValue(
      new Error("Not authenticated")
    );
  });

  it("should render registration form with all elements", () => {
    renderWithAuth(<Register />);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("should show validation errors for empty fields", async () => {
    renderWithAuth(<Register />);

    const submitButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please input your name!")).toBeInTheDocument();
      expect(screen.getByText("Please input your email!")).toBeInTheDocument();
      expect(
        screen.getByText("Please input your password!")
      ).toBeInTheDocument();
    });
  });

  it("should show validation error for invalid email", async () => {
    renderWithAuth(<Register />);

    const emailInput = screen.getByPlaceholderText("Email");
    const submitButton = screen.getByRole("button", { name: /register/i });

    await userEvent.type(emailInput, "invalid-email");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email!")
      ).toBeInTheDocument();
    });
  });

  it("should show validation error for short password", async () => {
    renderWithAuth(<Register />);

    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /register/i });

    await userEvent.type(passwordInput, "12345");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters!")
      ).toBeInTheDocument();
    });
  });

  it.skip("should register successfully with valid data", async () => {
    mockedApiService.register.mockResolvedValue(mockAuthResponse);

    renderWithAuth(<Register />);

    const nameInput = screen.getByPlaceholderText("Full Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /register/i });

    await userEvent.type(nameInput, "Test User");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedApiService.register).toHaveBeenCalledWith(
        "Test User",
        "test@example.com",
        "password123"
      );
      expect(message.success).toHaveBeenCalledWith("Registration successful!");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it.skip("should handle registration error with API error message", async () => {
    const error = mockErrorResponse("Email already exists");
    mockedApiService.register.mockRejectedValue(error);

    renderWithAuth(<Register />);

    const nameInput = screen.getByPlaceholderText("Full Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /register/i });

    await userEvent.type(nameInput, "Test User");
    await userEvent.type(emailInput, "existing@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedApiService.register).toHaveBeenCalled();
      expect(message.error).toHaveBeenCalledWith("Email already exists", 5);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it.skip("should disable form inputs while loading", async () => {
    mockedApiService.register.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockAuthResponse), 100)
        )
    );

    renderWithAuth(<Register />);

    const nameInput = screen.getByPlaceholderText(
      "Full Name"
    ) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText("Email") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      "Password"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /register/i });

    await userEvent.type(nameInput, "Test User");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should have correct link to login page", () => {
    renderWithAuth(<Register />);

    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("should not call API if validation fails", async () => {
    renderWithAuth(<Register />);

    const submitButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please input your name!")).toBeInTheDocument();
    });

    expect(mockedApiService.register).not.toHaveBeenCalled();
  });
});
