
import axiosInstance from '../config/api.client';

export interface LeaveRequestCreateRequest {
  childId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveRequestResponse {
  id: number;
  childId: number;
  childFullName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const leaveRequestService = {
  createRequest: async (data: LeaveRequestCreateRequest): Promise<LeaveRequestResponse> => {
    const response = await axiosInstance.post<{ status: number; message: string; data: LeaveRequestResponse }>(
      '/mobile/leave-requests',
      data
    );
    return response.data.data;
  },

  getParentRequests: async (childId: number): Promise<LeaveRequestResponse[]> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: LeaveRequestResponse[] }>(
      `/mobile/leave-requests/children/${childId}`
    );
    return response.data.data;
  }
};
