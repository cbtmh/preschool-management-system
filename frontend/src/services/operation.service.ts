import axiosInstance from '../config/axios.instance';
import { ApiResponse } from '../types/api';
import { MealMenuRequest, MealMenuResponse, MealStatisticsResponse } from '../types/operation.type';

export const getMealMenus = async (startDate: string, endDate: string): Promise<ApiResponse<MealMenuResponse[]>> => {
  const response = await axiosInstance.get(`/api/core/meal-menus/range`, {
    params: { startDate, endDate }
  });
  return response.data;
};

export const createMealMenu = async (data: MealMenuRequest): Promise<ApiResponse<MealMenuResponse>> => {
  const response = await axiosInstance.post(`/api/core/meal-menus`, data);
  return response.data;
};

export const getMealStatistics = async (startDate: string, endDate: string): Promise<ApiResponse<MealStatisticsResponse>> => {
  const response = await axiosInstance.get(`/api/core/meal-registrations/statistics`, {
    params: { startDate, endDate }
  });
  return response.data;
};
