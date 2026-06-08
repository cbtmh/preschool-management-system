import { MeResponse, SchoolClassResponse, EnrollmentResponse, ClassTeacherResponse, ChildDetailResponse } from '../types/teacher';

import axiosInstance from '../config/api.client';

export const teacherService = {
  getMe: async (): Promise<MeResponse> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: MeResponse }>('/auth/me');
    return response.data.data;
  },
  
  getClassesByTeacherId: async (teacherId: number): Promise<SchoolClassResponse[]> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: SchoolClassResponse[] }>(`/core/class-teachers/teacher/${teacherId}`);
    return response.data.data;
  },
  
  getStudentsInClass: async (classId: number): Promise<EnrollmentResponse[]> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: EnrollmentResponse[] }>(`/core/enrollments/class/${classId}`);
    return response.data.data;
  },

  getTeachersInClass: async (classId: number): Promise<ClassTeacherResponse> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: ClassTeacherResponse }>(`/core/class-teachers/${classId}`);
    return response.data.data;
  },

  getChildDetails: async (childId: number): Promise<ChildDetailResponse> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: ChildDetailResponse }>(`/core/children/${childId}`);
    return response.data.data;
  }
};
