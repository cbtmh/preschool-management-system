import axiosInstance from '../config/axios.instance';
import { ApiResponse } from '../types/api';
import { ClassAttendanceReportResponse } from '../types/report.type';

export const getClassAttendanceReport = async (classId: number, month: number, year: number): Promise<ApiResponse<ClassAttendanceReportResponse>> => {
  const response = await axiosInstance.get(`/api/core/reports/attendance`, {
    params: { classId, month, year }
  });
  return response.data;
};
