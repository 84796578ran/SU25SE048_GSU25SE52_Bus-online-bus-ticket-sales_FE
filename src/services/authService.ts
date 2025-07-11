import { apiClient } from './api';
import type { ApiResponse } from '../types/api';

// User authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Authentication API calls
export const authService = {
  // User login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data;
  },

  // User registration
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/logout', {});
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', userData);
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      newPassword,
    });
  },
};

export default authService;
