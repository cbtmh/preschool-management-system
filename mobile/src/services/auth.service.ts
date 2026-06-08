import { LoginRequest, ApiResponse, AuthData, ForgotPasswordRequest, MeResponse } from '../types/auth';
import axiosInstance from '../config/api.client';

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthData>> => {
    const response = await axiosInstance.post<ApiResponse<AuthData>>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<MeResponse>> => {
    const response = await axiosInstance.get<ApiResponse<MeResponse>>('/auth/me');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>('/auth/forgot-password', data);
    return response.data;
  },

  updateParentProfile: async (data: { fullName: string, phone: string, address: string }): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.put<ApiResponse<string>>('/mobile/parent/profile', data);
    return response.data;
  },

  updateTeacherProfile: async (data: { fullName: string, phone: string, address: string }): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.put<ApiResponse<string>>('/mobile/teacher/profile', data);
    return response.data;
  },

  logoutApi: async (): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string, refreshToken: string }>> => {
    const response = await axiosInstance.post<ApiResponse<{ accessToken: string, refreshToken: string }>>('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  updatePushToken: async (token: string): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.put<ApiResponse<any>>('/auth/push-token', { token });
    return response.data;
  }
};
