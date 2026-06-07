import api from '../config/axios.instance';
import { ApiResponse } from '../types/core';

export interface SendNotificationRequest {
    title: string;
    content: string;
    type: 'SCHOOL' | 'SYSTEM' | 'CLASS' | 'INDIVIDUAL' | 'INTERACTION';
    targetRoles?: string[];
    targetClassIds?: number[];
}

export interface Notification {
    id: number;
    title: string;
    content: string;
    type: string;
    createdAt: string;
    senderName?: string;
    referenceType?: string;
    referenceId?: number;
}

export const notificationService = {
    // Send a new notification (Admin)
    sendNotification: async (data: SendNotificationRequest) => {
        const response = await api.post<ApiResponse<null>>('/api/admin/notifications/send', data);
        return response.data;
    },

    // Get list of sent notifications (Admin)
    getSentNotifications: async (page = 0, size = 10) => {
        const response = await api.get<ApiResponse<{ content: Notification[], totalElements: number }>>('/api/admin/notifications', {
            params: { page, size }
        });
        return response.data;
    }
};
