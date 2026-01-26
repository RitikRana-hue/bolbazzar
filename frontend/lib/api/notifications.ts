import { apiClient } from '../api-client';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    readAt?: string;
    actionUrl?: string;
    createdAt: string;
}

export const notificationsApi = {
    async getNotifications(page: number = 1, limit: number = 20): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
        return apiClient.get(`/notifications?page=${page}&limit=${limit}`);
    },

    async markAsRead(id: string): Promise<{ message: string }> {
        return apiClient.patch(`/notifications/${id}/read`);
    },

    async markAllAsRead(): Promise<{ message: string }> {
        return apiClient.post('/notifications/read-all');
    },

    async deleteNotification(id: string): Promise<{ message: string }> {
        return apiClient.delete(`/notifications/${id}`);
    },

    async getUnreadCount(): Promise<{ count: number }> {
        return apiClient.get('/notifications/unread-count');
    },
};