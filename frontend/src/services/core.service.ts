import api from '../config/axios.instance';
import {
    ApiResponse,
    AcademicYearRequest,
    AcademicYearResponse,
    SchoolClassRequest,
    SchoolClassResponse,
    ClassTeacherRequest,
    ClassTeacherResponse
} from '../types/core';

export const coreService = {
    // Academic Years
    getAllAcademicYears: async () => {
        const response = await api.get<ApiResponse<AcademicYearResponse[]>>('/api/core/academic-years');
        return response.data;
    },
    getAcademicYearById: async (id: number) => {
        const response = await api.get<ApiResponse<AcademicYearResponse>>(`/api/core/academic-years/${id}`);
        return response.data;
    },
    createAcademicYear: async (data: AcademicYearRequest) => {
        const response = await api.post<ApiResponse<AcademicYearResponse>>('/api/core/academic-years', data);
        return response.data;
    },
    updateAcademicYear: async (id: number, data: AcademicYearRequest) => {
        const response = await api.put<ApiResponse<AcademicYearResponse>>(`/api/core/academic-years/${id}`, data);
        return response.data;
    },
    deleteAcademicYear: async (id: number) => {
        const response = await api.delete<ApiResponse<null>>(`/api/core/academic-years/${id}`);
        return response.data;
    },

    // School Classes
    getAllClasses: async () => {
        const response = await api.get<ApiResponse<SchoolClassResponse[]>>('/api/core/classes');
        return response.data;
    },
    getClassesByAcademicYear: async (academicYearId: number) => {
        const response = await api.get<ApiResponse<SchoolClassResponse[]>>(`/api/core/classes/academic-year/${academicYearId}`);
        return response.data;
    },
    getClassById: async (id: number) => {
        const response = await api.get<ApiResponse<SchoolClassResponse>>(`/api/core/classes/${id}`);
        return response.data;
    },
    createClass: async (data: SchoolClassRequest) => {
        const response = await api.post<ApiResponse<SchoolClassResponse>>('/api/core/classes', data);
        return response.data;
    },
    updateClass: async (id: number, data: SchoolClassRequest) => {
        const response = await api.put<ApiResponse<SchoolClassResponse>>(`/api/core/classes/${id}`, data);
        return response.data;
    },
    deleteClass: async (id: number) => {
        const response = await api.delete<ApiResponse<null>>(`/api/core/classes/${id}`);
        return response.data;
    },

    // Class Teachers
    assignTeachersToClass: async (data: ClassTeacherRequest) => {
        const response = await api.post<ApiResponse<ClassTeacherResponse>>('/api/core/class-teachers', data);
        return response.data;
    },
    getTeachersByClassId: async (classId: number) => {
        const response = await api.get<ApiResponse<ClassTeacherResponse>>(`/api/core/class-teachers/${classId}`);
        return response.data;
    }
};
