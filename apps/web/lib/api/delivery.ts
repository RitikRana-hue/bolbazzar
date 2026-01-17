import { apiClient } from '../api-client';

export interface DeliveryStatus {
    id: string;
    orderId: string;
    status: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    currentLocation?: string;
    timeline: Array<{
        status: string;
        location?: string;
        timestamp: string;
        description: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export const deliveryApi = {
    async getDeliveryStatus(orderId: string): Promise<DeliveryStatus> {
        return apiClient.get(`/delivery/${orderId}`);
    },

    async updateDeliveryStatus(orderId: string, data: {
        status: string;
        location?: string;
        notes?: string;
    }): Promise<{ message: string; delivery: DeliveryStatus }> {
        return apiClient.patch(`/delivery/${orderId}`, data);
    },

    async confirmDelivery(orderId: string): Promise<{ message: string }> {
        return apiClient.post(`/delivery/${orderId}/confirm`);
    },

    async reportIssue(orderId: string, issue: string, description: string): Promise<{ message: string }> {
        return apiClient.post(`/delivery/${orderId}/issue`, { issue, description });
    },
};