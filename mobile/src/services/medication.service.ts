
import axiosInstance from '../config/api.client';

export interface MedicationCreateRequest {
  childId: number;
  medicationName: string;
  dosage: string;
  startDate: string;
  endDate: string;
  notes: string;
}

export interface MedicationResponse {
  id: number;
  childId: number;
  childFullName: string;
  medicationName: string;
  dosage: string;
  startDate: string;
  endDate: string;
  notes: string;
  status: 'PENDING' | 'COMPLETED';
  allergies?: string[];
}

export const medicationService = {
  createRequest: async (data: MedicationCreateRequest): Promise<MedicationResponse> => {
    const response = await axiosInstance.post<{ status: number; message: string; data: MedicationResponse }>(
      '/mobile/medications',
      data
    );
    return response.data.data;
  },

  getParentRequests: async (childId: number): Promise<MedicationResponse[]> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: MedicationResponse[] }>(
      `/mobile/medications/children/${childId}`
    );
    return response.data.data;
  },

  getClassRequests: async (classId: number, date: string): Promise<MedicationResponse[]> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: MedicationResponse[] }>(
      `/mobile/medications/classes/${classId}`,
      { params: { date } }
    );
    return response.data.data;
  },

  markAsCompleted: async (id: number): Promise<void> => {
    await axiosInstance.put(`/mobile/medications/${id}/complete`);
  }
};
