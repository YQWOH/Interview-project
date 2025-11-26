import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loginUser,
  registerUser,
  logout,
  getCurrentUser,
  clearError,
} from "@/store/slices/authSlice";

/**
 * Redux-based authentication hook
 * Use this instead of the Context API version
 */
export const useAuthRedux = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );

  // Verify token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      return result.payload;
    } else {
      const errorMessage = (result.payload as string) || "Login failed";
      const error = new Error(errorMessage);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error((result.payload as string) || "Registration failed");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const fetchCurrentUser = async () => {
    const result = await dispatch(getCurrentUser());
    if (getCurrentUser.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error((result.payload as string) || "Failed to fetch user");
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: handleLogout,
    clearError: clearAuthError,
    getCurrentUser: fetchCurrentUser,
  };
};
