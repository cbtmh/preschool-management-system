export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  SNACK = 'SNACK'
}

export interface MealMenuRequest {
  date: string; // Format: YYYY-MM-DD
  mealType: MealType;
  description: string;
  imageUrl?: string | null;
}

export interface MealMenuResponse {
  id: number;
  date: string;
  mealType: MealType;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MealStatisticsResponse {
  totalBreakfast: number;
  totalLunch: number;
  totalSnack: number;
  totalMeals: number; // Tổng cộng tất cả các bữa
}
