import { DailyLogResponse, DailyLogBatchUpdateRequest, DailyLogHistoryResponse } from '../types/dailyLog';

import axiosInstance from '../config/api.client';

export const dailyLogService = {
  getDailyLogsForClass: async (classId: number, date: string): Promise<DailyLogResponse[]> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: DailyLogResponse[] }>(
      `/mobile/daily-logs/classes/${classId}`, 
      { params: { date } }
    );
    return response.data.data;
  },

  batchUpdateDailyLogs: async (date: string, request: DailyLogBatchUpdateRequest): Promise<void> => {
    await axiosInstance.put(
      `/mobile/daily-logs/batch`,
      request,
      { params: { date } }
    );
  },

  getDailyLogForChild: async (childId: number, date: string): Promise<DailyLogResponse | null> => {
    try {
      const response = await axiosInstance.get<{ status: number; message: string; data: DailyLogResponse }>(
        `/mobile/daily-logs/children/${childId}`,
        { params: { date } }
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getChildAttendanceHistory: async (childId: number, year: number, month: number): Promise<DailyLogHistoryResponse[]> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: DailyLogHistoryResponse[] }>(
      `/mobile/daily-logs/history/children/${childId}`,
      { params: { year, month } }
    );
    return response.data.data;
  }
};
