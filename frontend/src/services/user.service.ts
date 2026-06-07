import axiosInstance from '../config/axios.instance';
import { ApiResponse, EnrollmentResponse } from '../types/core';
import {
  TeacherCreateRequest,
  TeacherUpdateRequest,
  TeacherResponse,
  ParentCreateRequest,
  ParentUpdateRequest,
  ParentResponse,
  ChildRequest,
  ChildResponse,
  TransferClassRequest,
  DropOutRequest,
  AutoEnrollmentRequest,
  AutoEnrollmentResponse
} from '../types/user';

export const userService = {
  // --- TEACHERS ---
  getAllTeachers: async (): Promise<ApiResponse<TeacherResponse[]>> => {
    const response = await axiosInstance.get('/api/core/teachers');
    return response.data;
  },

  getTeacherById: async (id: number): Promise<ApiResponse<TeacherResponse>> => {
    const response = await axiosInstance.get(`/api/core/teachers/${id}`);
    return response.data;
  },

  createTeacher: async (data: TeacherCreateRequest): Promise<ApiResponse<TeacherResponse>> => {
    const response = await axiosInstance.post('/api/core/teachers', data);
    return response.data;
  },

  updateTeacher: async (id: number, data: TeacherUpdateRequest): Promise<ApiResponse<TeacherResponse>> => {
    const response = await axiosInstance.put(`/api/core/teachers/${id}`, data);
    return response.data;
  },

  deleteTeacher: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/api/core/teachers/${id}`);
    return response.data;
  },

  // --- PARENTS ---
  getAllParents: async (): Promise<ApiResponse<ParentResponse[]>> => {
    const response = await axiosInstance.get('/api/core/parents');
    return response.data;
  },

  getParentById: async (id: number): Promise<ApiResponse<ParentResponse>> => {
    const response = await axiosInstance.get(`/api/core/parents/${id}`);
    return response.data;
  },

  createParent: async (data: ParentCreateRequest): Promise<ApiResponse<ParentResponse>> => {
    const response = await axiosInstance.post('/api/core/parents', data);
    return response.data;
  },

  updateParent: async (id: number, data: ParentUpdateRequest): Promise<ApiResponse<ParentResponse>> => {
    const response = await axiosInstance.put(`/api/core/parents/${id}`, data);
    return response.data;
  },

  deleteParent: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/api/core/parents/${id}`);
    return response.data;
  },

  // --- CHILDREN ---
  getAllChildren: async (): Promise<ApiResponse<ChildResponse[]>> => {
    const response = await axiosInstance.get('/api/core/children');
    return response.data;
  },

  getChildById: async (id: number): Promise<ApiResponse<ChildResponse>> => {
    const response = await axiosInstance.get(`/api/core/children/${id}`);
    return response.data;
  },

  createChild: async (data: ChildRequest): Promise<ApiResponse<ChildResponse>> => {
    const response = await axiosInstance.post('/api/core/children', data);
    return response.data;
  },

  updateChild: async (id: number, data: ChildRequest): Promise<ApiResponse<ChildResponse>> => {
    const response = await axiosInstance.put(`/api/core/children/${id}`, data);
    return response.data;
  },

  deleteChild: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/api/core/children/${id}`);
    return response.data;
  },

  // --- ENROLLMENTS & PLACEMENT ---
  autoEnroll: async (data: AutoEnrollmentRequest): Promise<ApiResponse<AutoEnrollmentResponse>> => {
    const response = await axiosInstance.post('/api/core/enrollments/auto-enroll', data);
    return response.data;
  },

  getStudentsInClass: async (classId: number): Promise<ApiResponse<EnrollmentResponse[]>> => {
    const response = await axiosInstance.get(`/api/core/enrollments/class/${classId}`);
    return response.data;
  },

  transferClass: async (childId: number, data: TransferClassRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.put(`/api/core/enrollments/children/${childId}/transfer`, data);
    return response.data;
  },

  dropOut: async (childId: number, data: DropOutRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.put(`/api/core/enrollments/children/${childId}/drop-out`, data);
    return response.data;
  },

  graduateClass: async (classId: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.put(`/api/core/enrollments/classes/${classId}/graduate`);
    return response.data;
  },

  // --- BULK IMPORT ---
  importChildrenAndParents: async (file: File): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/api/core/children/import-bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadBulkTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/api/core/children/import-bulk/template', {
      responseType: 'blob',
    });
    return response.data;
  }
};
