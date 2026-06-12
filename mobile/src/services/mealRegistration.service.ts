import axiosInstance from '../config/api.client';

export interface MonthlyMealRegistrationRequest {
  childId: number;
  month: number;
  year: number;
  isRegistered: boolean;
  mealTypes: string[];
}

export interface DailyMealRegistrationRequest {
  childId: number;
  date: string;
  isRegistered: boolean;
  mealTypes: string[];
}

export interface MealRegistrationResponse {
  id: number;
  childId: number;
  childFullName: string;
  className: string;
  date: string;
  mealType: string;
  status: string;
}

export const mealRegistrationService = {
  processMonthlyRegistration: async (request: MonthlyMealRegistrationRequest): Promise<void> => {
    await axiosInstance.post(`/core/meal-registrations/monthly`, request);
  },

  processDailyRegistration: async (request: DailyMealRegistrationRequest): Promise<void> => {
    await axiosInstance.post(`/core/meal-registrations/daily`, request);
  },

  getRegistrationsByChildAndDateRange: async (childId: number, startDate: string, endDate: string): Promise<MealRegistrationResponse[]> => {
    const response = await axiosInstance.get(`/core/meal-registrations/child/${childId}`, {
      params: { startDate, endDate }
    });
    return response.data.data;
  }
};
