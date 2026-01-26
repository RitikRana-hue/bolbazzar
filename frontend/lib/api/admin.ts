import { apiClient } from '../api-client';

export interface AdminStats {
    totalUsers: number;
    activeListings: number;
    totalOrders: number;
    revenue: number;
    pendingDisputes: number;
    activeAuctions: number;
}

export interface AnalyticsData {
    overview: {
        totalRevenue: number;
        totalOrders: number;
        totalUsers: number;
        conversionRate: number;
    };
    revenueChart: Array<{ date: string; revenue: number }>;
    categoryBreakdown: Array<{ category: string; count: number; revenue: number }>;
    topProducts: Array<{ id: string; title: string; sales: number; revenue: number }>;
    userGrowth: Array<{ date: string; users: number }>;
}

export interface Dispute {
    id: string;
    orderId: string;
    buyerId: string;
    sellerId: string;
    reason: string;
    description: string;
    status: string;
    resolution?: string;
    createdAt: string;
    updatedAt: string;
}

export const adminApi = {
    async getDashboardStats(): Promise<AdminStats> {
        return apiClient.get('/admin/stats');
    },

    async getAnalytics(timeRange: string = '7d'): Promise<AnalyticsData> {
        return apiClient.get(`/admin/analytics?timeRange=${timeRange}`);
    },

    async getUsers(page: number = 1, limit: number = 20, search?: string): Promise<{ users: any[]; total: number }> {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.append('search', search);
        return apiClient.get(`/admin/users?${params.toString()}`);
    },

    async updateUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
        return apiClient.patch(`/admin/users/${userId}/status`, { isActive });
    },

    async getDisputes(status?: string, page: number = 1, limit: number = 20): Promise<{ disputes: Dispute[]; total: number }> {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) params.append('status', status);
        return apiClient.get(`/admin/disputes?${params.toString()}`);
    },

    async resolveDispute(disputeId: string, resolution: string): Promise<{ message: string }> {
        return apiClient.post(`/admin/disputes/${disputeId}/resolve`, { resolution });
    },

    async getReports(type: string, startDate: string, endDate: string): Promise<any> {
        return apiClient.get(`/admin/reports/${type}?startDate=${startDate}&endDate=${endDate}`);
    },
};