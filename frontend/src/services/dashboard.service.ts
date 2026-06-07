import axiosInstance from '../config/axios.instance';
import { ApiResponse } from '../types/api';

export interface DashboardStatisticsResponse {
  totalStudents: number;
  totalClasses: number;
  totalTeachers: number;
}

export const dashboardService = {
  getStatistics: async (): Promise<ApiResponse<DashboardStatisticsResponse>> => {
    const response = await axiosInstance.get('/api/core/dashboard/statistics');
    return response.data;
  },
};
