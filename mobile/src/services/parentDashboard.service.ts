import axiosInstance from '../config/api.client';

export interface ChildSummaryDTO {
  id: number;
  fullName: string;
  dob: string;
  gender: string;
  allergyDeclared?: boolean;
  allergies?: {
    id?: number;
    allergen: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
    description?: string;
  }[];
  className?: string;
  teacher?: {
    fullName: string;
    phoneNumber: string;
  };
}

export interface NewsDto {
  id: number;
  title: string;
  imageUrl: string;
  publishedDate: string;
}

export interface ParentDashboardResponse {
  children: ChildSummaryDTO[];
  recentNews: NewsDto[];
}

export const parentDashboardService = {
  getDashboardData: async (): Promise<ParentDashboardResponse> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: ParentDashboardResponse }>(
      `/mobile/parent/dashboard`
    );
    return response.data.data;
  }
};
