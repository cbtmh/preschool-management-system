
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
  },

  getClassRequests: async (classId: number): Promise<LeaveRequestResponse[]> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: LeaveRequestResponse[] }>(
      `/mobile/leave-requests/classes/${classId}`
    );
    return response.data.data;
  },

  updateStatus: async (id: number, status: 'APPROVED' | 'REJECTED'): Promise<void> => {
    await axiosInstance.put(
      `/mobile/leave-requests/${id}/status`,
      null,
      { params: { status } }
    );
  }
};
