import { NotificationResponse } from '../types/notification';

import axiosInstance from '../config/api.client';

export const notificationService = {
  getMyNotifications: async (page: number = 0, size: number = 20): Promise<NotificationResponse> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: NotificationResponse }>(
      `/notifications/my-notifications?page=${page}&size=${size}`
    );
    return response.data.data;
  },
  
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get<{ status: number; message: string; data: number }>(`/notifications/unread-count`);
    return response.data.data;
  },
  
  markAsRead: async (id: number): Promise<void> => {
    await axiosInstance.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.put(`/notifications/mark-all-read`);
  },

  deleteNotification: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/notifications/${id}`);
  },

  deleteAllNotifications: async (): Promise<void> => {
    await axiosInstance.delete(`/notifications/all`);
  }
};
