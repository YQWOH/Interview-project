import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  AuthResponse,
  ImageListResponse,
  ImageResponse,
  AnalyticsResponse,
  ImageQueryParams,
  ApiError,
} from "@/types";
import { API_URL } from "@/config/env";

class ApiService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Only redirect if we're not already on login/register page
          const currentPath = globalThis.location.pathname;
          if (currentPath !== "/login" && currentPath !== "/register") {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            globalThis.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  }

  async getCurrentUser(): Promise<AuthResponse> {
    const { data } = await this.api.get<AuthResponse>("/auth/me");
    return data;
  }

  // Image endpoints
  async getImages(params?: ImageQueryParams): Promise<ImageListResponse> {
    const { data } = await this.api.get<ImageListResponse>("/images", {
      params,
    });
    return data;
  }

  async getImageById(id: string): Promise<ImageResponse> {
    const { data } = await this.api.get<ImageResponse>(`/images/${id}`);
    return data;
  }

  async uploadImage(file: File, name?: string): Promise<ImageResponse> {
    const formData = new FormData();
    formData.append("image", file);
    if (name) {
      formData.append("name", name);
    }

    const { data } = await this.api.post<ImageResponse>("/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  }

  async toggleBookmark(id: string): Promise<ImageResponse> {
    const { data } = await this.api.patch<ImageResponse>(
      `/images/${id}/bookmark`
    );
    return data;
  }

  async deleteImage(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const { data } = await this.api.delete(`/images/${id}`);
    return data;
  }

  getImageUrl(filepath: string): string {
    return `${API_URL}/${filepath}`;
  }

  getDownloadUrl(id: string): string {
    const token = localStorage.getItem("token");
    return `${API_URL}/api/images/${id}/download?token=${token}`;
  }

  // Analytics endpoints
  async getAnalytics(): Promise<AnalyticsResponse> {
    const { data } = await this.api.get<AnalyticsResponse>("/images/analytics");
    return data;
  }
}

export const apiService = new ApiService();
