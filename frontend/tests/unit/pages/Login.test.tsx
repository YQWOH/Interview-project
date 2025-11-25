// Mock the config module to avoid import.meta issues
jest.mock("@/config/env", () => ({
  API_URL: "http://localhost:5000",
  getEnvVar: jest.fn((_key: string, defaultValue: string) => defaultValue),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Login from "@/pages/Login";
import { AuthProvider } from "@/hooks/useAuth";
import { apiService } from "@/services/api";
import { mockAuthResponse } from "../../utils/testHelpers";

// Mock the API service
jest.mock("@/services/api");
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock antd message
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

describe("Login Component", () => {
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    (message.success as jest.Mock).mockClear();
    (message.error as jest.Mock).mockClear();

    // Mock getCurrentUser to avoid initial auth check
    mockedApiService.getCurrentUser.mockRejectedValue(
      new Error("Not authenticated")
    );
  });

  it("should render login form", () => {
    renderLogin();

    expect(screen.getByText("Panorama Viewer")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
  });

  it("should show validation errors for empty fields", async () => {
    renderLogin();

    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please input your email!")).toBeInTheDocument();
      expect(
        screen.getByText("Please input your password!")
      ).toBeInTheDocument();
    });
  });

  it("should show validation error for invalid email format", async () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText("Email");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    await userEvent.type(emailInput, "invalid-email");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email!")
      ).toBeInTheDocument();
    });
  });

  it("should login successfully with valid credentials", async () => {
    mockedApiService.login.mockResolvedValue(mockAuthResponse);

    renderLogin();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedApiService.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(message.success).toHaveBeenCalledWith("Login successful!");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should handle login error with API error message", async () => {
    const errorMessage = "Invalid credentials";
    mockedApiService.login.mockRejectedValue({
      response: {
        data: {
          error: { message: errorMessage },
        },
      },
    });

    renderLogin();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "wrongpassword");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedApiService.login).toHaveBeenCalled();
      expect(message.error).toHaveBeenCalledWith(errorMessage, 5);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("should handle login error with generic error message", async () => {
    mockedApiService.login.mockRejectedValue(new Error("Network error"));

    renderLogin();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Network error", 5);
    });
  });

  it("should disable form inputs while loading", async () => {
    // Make login take some time
    mockedApiService.login.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockAuthResponse), 100)
        )
    );

    renderLogin();

    const emailInput = screen.getByPlaceholderText("Email") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      "Password"
    ) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /log in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    fireEvent.click(submitButton);

    // Check that inputs are disabled during loading
    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    // Wait for login to complete
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should have a link to register page", () => {
    renderLogin();

    const registerLink = screen.getByRole("link", { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("should handle form validation failure", async () => {
    renderLogin();

    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);

    // API should not be called if validation fails
    await waitFor(() => {
      expect(mockedApiService.login).not.toHaveBeenCalled();
    });
  });

  it("should preserve form state on validation error", async () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText("Email") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      "Password"
    ) as HTMLInputElement;

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "short");

    // Trigger validation
    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);

    // Form values should be preserved
    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("short");
  });
});
