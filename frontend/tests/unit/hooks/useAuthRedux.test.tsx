/**
 * Unit tests for useAuthRedux hook
 */

// Mock the config module to avoid import.meta issues
jest.mock("@/config/env", () => ({
  API_URL: "http://localhost:5000",
  getEnvVar: jest.fn((_key: string, defaultValue: string) => defaultValue),
}));

import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import { apiService } from "@/services/api";
import {
  ReduxWrapper,
  mockAuthResponse,
  mockUser,
} from "../../utils/testHelpers";

jest.mock("@/services/api");
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe("useAuthRedux Hook", () => {
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
  });

  it("should initialize with no user and not authenticated", () => {
    const { result } = renderHook(() => useAuthRedux(), {
      wrapper: ReduxWrapper,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it("should initialize with preloaded authenticated state", () => {
    const preloadedState = {
      auth: {
        user: mockUser,
        token: "test-token",
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    const { result } = renderHook(() => useAuthRedux(), {
      wrapper: ({ children }) => (
        <ReduxWrapper preloadedState={preloadedState}>{children}</ReduxWrapper>
      ),
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe("test-token");
    expect(result.current.isAuthenticated).toBe(true);
  });

  describe("login", () => {
    it("should login successfully and store credentials", async () => {
      mockedApiService.login.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuthRedux(), {
        wrapper: ReduxWrapper,
      });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
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

    it("should handle login failure", async () => {
      const errorMessage = "Invalid credentials";
      mockedApiService.login.mockRejectedValue({
        response: {
          data: {
            error: {
              message: errorMessage,
            },
          },
        },
      });

      const { result } = renderHook(() => useAuthRedux(), {
        wrapper: ReduxWrapper,
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login("test@example.com", "wrongpassword");
        });
      }).rejects.toThrow(errorMessage);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("register", () => {
    it("should register successfully and store credentials", async () => {
      mockedApiService.register.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuthRedux(), {
        wrapper: ReduxWrapper,
      });

      await act(async () => {
        await result.current.register(
          "Test User",
          "test@example.com",
          "password123"
        );
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
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

    it("should handle registration failure", async () => {
      const errorMessage = "Email already exists";
      mockedApiService.register.mockRejectedValue({
        response: {
          data: {
            error: {
              message: errorMessage,
            },
          },
        },
      });

      const { result } = renderHook(() => useAuthRedux(), {
        wrapper: ReduxWrapper,
      });

      await expect(async () => {
        await act(async () => {
          await result.current.register(
            "Test User",
            "test@example.com",
            "password123"
          );
        });
      }).rejects.toThrow(errorMessage);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("logout", () => {
    it("should logout and clear credentials", async () => {
      const preloadedState = {
        auth: {
          user: mockUser,
          token: "test-token",
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      };

      const { result } = renderHook(() => useAuthRedux(), {
        wrapper: ({ children }) => (
          <ReduxWrapper preloadedState={preloadedState}>
            {children}
          </ReduxWrapper>
        ),
      });

      expect(result.current.isAuthenticated).toBe(true);

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

  describe("getCurrentUser", () => {
    it("should fetch current user successfully", async () => {
      mockedApiService.getCurrentUser.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuthRedux(), {
        wrapper: ReduxWrapper,
      });

      await act(async () => {
        await result.current.getCurrentUser();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should handle getCurrentUser failure", async () => {
      mockedApiService.getCurrentUser.mockRejectedValue({
        response: {
          data: {
            error: {
              message: "Session expired",
            },
          },
        },
      });

      const { result } = renderHook(() => useAuthRedux(), {
        wrapper: ReduxWrapper,
      });

      await expect(async () => {
        await act(async () => {
          await result.current.getCurrentUser();
        });
      }).rejects.toThrow("Session expired");

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    });
  });
});
