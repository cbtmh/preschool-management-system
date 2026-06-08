
import axiosInstance from '../config/api.client';

export interface AllergyRequest {
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  description?: string;
}

export interface AllergyResponse {
  id: number;
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  description?: string;
}

export interface HealthRecordCreateRequest {
  childId: number;
  height: number;
  weight: number;
  status: string;
  note: string;
}

export interface HealthRecordDto {
  id: number;
  childId: number;
  month: string;
  height: number;
  weight: number;
  status: string;
  note: string;
  recordedDate: string;
}

export interface ChildHealthSummaryDto {
  id: number;
  name: string;
  status: string;
  hasRecord: boolean;
  lastRecord: string;
  allergyDeclared?: boolean;
  allergies?: AllergyResponse[];
}

export const healthService = {
  getHealthRecordsByChildId: async (childId: number): Promise<HealthRecordDto[]> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: HealthRecordDto[] }>(
      `/mobile/health-records/children/${childId}`
    );
    return response.data.data;
  },

  getClassHealthSummary: async (classId: number, year?: number, month?: number): Promise<ChildHealthSummaryDto[]> => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await axiosInstance.get<{ status: number; message: string; data: ChildHealthSummaryDto[] }>(
      `/mobile/health-records/classes/${classId}`,
      { params }
    );
    return response.data.data;
  },

  createHealthRecord: async (data: HealthRecordCreateRequest): Promise<HealthRecordDto> => {
    const response = await axiosInstance.post<{ status: number; message: string; data: HealthRecordDto }>(
      '/mobile/health-records',
      data
    );
    return response.data.data;
  },

  updateChildAllergies: async (childId: number, allergies: AllergyRequest[]): Promise<any> => {
    const response = await axiosInstance.put<{ status: number; message: string; data: any }>(
      `/core/children/${childId}/allergies`,
      allergies
    );
    return response.data.data;
  },

  teacherUpdateChildAllergies: async (childId: number, allergies: AllergyRequest[]): Promise<any> => {
    const response = await axiosInstance.put<{ status: number; message: string; data: any }>(
      `/mobile/health-records/children/${childId}/allergies/teacher`,
      allergies
    );
    return response.data.data;
  }
};
