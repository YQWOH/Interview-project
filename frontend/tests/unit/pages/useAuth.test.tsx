/**
 * Unit tests for useAuth hook
 */

// Mock the config module to avoid import.meta issues
jest.mock("@/config/env", () => ({
  API_URL: "http://localhost:5000",
  getEnvVar: jest.fn((_key: string, defaultValue: string) => defaultValue),
}));

import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { apiService } from "@/services/api";
import {
  AuthWrapper,
  mockAuthResponse,
  mockUser,
} from "../../utils/testHelpers";

jest.mock("@/services/api");
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe("useAuth Hook", () => {
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

    // Mock getCurrentUser to fail by default (not authenticated)
    mockedApiService.getCurrentUser.mockRejectedValue(
      new Error("Not authenticated")
    );
  });

  it("should throw error when used outside AuthProvider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within AuthProvider");

    consoleSpy.mockRestore();
  });

  it("should initialize with no user and not authenticated", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should restore user from localStorage on mount", async () => {
    const storedToken = "stored-token";
    const storedUser = JSON.stringify(mockUser);

    (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === "token") return storedToken;
      if (key === "user") return storedUser;
      return null;
    });

    mockedApiService.getCurrentUser.mockResolvedValue(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(storedToken);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should clear invalid token from localStorage", async () => {
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === "token") return "invalid-token";
      if (key === "user") return JSON.stringify(mockUser);
      return null;
    });

    mockedApiService.getCurrentUser.mockRejectedValue(
      new Error("Invalid token")
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  describe("login", () => {
    it("should login successfully and store credentials", async () => {
      mockedApiService.login.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(mockedApiService.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "token",
        mockAuthResponse.data.token
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUser)
      );
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockAuthResponse.data.token);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should throw error on login failure", async () => {
      const error = new Error("Invalid credentials");
      mockedApiService.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login("test@example.com", "wrongpassword");
        });
      }).rejects.toThrow("Invalid credentials");

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("register", () => {
    it("should register successfully and store credentials", async () => {
      mockedApiService.register.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.register(
          "Test User",
          "test@example.com",
          "password123"
        );
      });

      expect(mockedApiService.register).toHaveBeenCalledWith(
        "Test User",
        "test@example.com",
        "password123"
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "token",
        mockAuthResponse.data.token
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUser)
      );
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockAuthResponse.data.token);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should throw error on registration failure", async () => {
      const error = new Error("Email already exists");
      mockedApiService.register.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.register(
            "Test User",
            "test@example.com",
            "password123"
          );
        });
      }).rejects.toThrow("Email already exists");

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("logout", () => {
    it("should logout and clear credentials", async () => {
      // Setup authenticated state
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === "token") return "test-token";
        if (key === "user") return JSON.stringify(mockUser);
        return null;
      });

      mockedApiService.getCurrentUser.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.logout();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("loading state", () => {
    it.skip("should set loading to true initially", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthWrapper,
      });

      expect(result.current.loading).toBe(true);
    });

    it("should set loading to false after initialization", async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthWrapper,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
