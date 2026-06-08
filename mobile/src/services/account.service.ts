import { ChangePasswordRequest, ApiResponse } from '../types/auth';

import axiosInstance from '../config/api.client';

export const accountService = {
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosInstance.put<ApiResponse<any>>('/auth/change-password', data);
  },
};
