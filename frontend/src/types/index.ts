// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

// Image types
export interface PanoramaImage {
  _id: string;
  name: string;
  originalName: string;
  filename: string;
  filepath: string;
  size: number;
  mimetype: string;
  isBookmarked: boolean;
  uploadedAt: string;
  updatedAt: string;
}

export interface ImageListResponse {
  success: boolean;
  data: PanoramaImage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ImageResponse {
  success: boolean;
  data: PanoramaImage;
}

// Analytics types
export interface AnalyticsData {
  summary: {
    totalImages: number;
    bookmarkedCount: number;
    unbookmarkedCount: number;
    totalSize: number;
    bookmarkPercentage: string;
  };
  sizeByBookmark: Array<{
    isBookmarked: boolean;
    totalSize: number;
    count: number;
  }>;
  uploadTrend: Array<{
    date: string;
    count: number;
  }>;
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

// API Error types
export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

// Query params
export interface ImageQueryParams {
  search?: string;
  bookmarked?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "uploadedAt" | "name" | "size";
  order?: "asc" | "desc";
}
