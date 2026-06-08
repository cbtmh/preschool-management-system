import axiosInstance from '../config/api.client';

export interface MealMenuResponse {
  id: number;
  date: string;
  mealType: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MealMenuRequest {
  date: string;
  mealType: string;
  description: string;
  imageUrl?: string | null;
}

export const mealMenuService = {
  getMealMenusBetweenDates: async (startDate: string, endDate: string): Promise<MealMenuResponse[]> => {
    const response = await axiosInstance.get(`/core/meal-menus/range`, {
      params: { startDate, endDate }
    });
    return response.data.data;
  },
  
  getMealMenuById: async (id: number): Promise<MealMenuResponse> => {
    const response = await axiosInstance.get(`/core/meal-menus/${id}`);
    return response.data.data;
  },

  createMealMenu: async (data: MealMenuRequest): Promise<MealMenuResponse> => {
    const response = await axiosInstance.post(`/core/meal-menus`, data);
    return response.data.data;
  },

  updateMealMenu: async (id: number, data: MealMenuRequest): Promise<MealMenuResponse> => {
    const response = await axiosInstance.put(`/core/meal-menus/${id}`, data);
    return response.data.data;
  },

  deleteMealMenu: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/core/meal-menus/${id}`);
  }
};
