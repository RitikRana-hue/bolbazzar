import { apiClient } from '../api-client';

export interface DashboardStats {
    orders: {
        total: number;
        pending: number;
        completed: number;
        totalSpent: number;
    };
    bids: {
        total: number;
        winning: number;
        won: number;
    };
    wallet: {
        availableBalance: number;
        pendingBalance: number;
        totalBalance: number;
        totalEarned: number;
        totalSpent: number;
    };
    listings: {
        total: number;
        active: number;
        sold: number;
        totalRevenue: number;
    };
    recentActivity: Array<{
        type: string;
        id: string;
        status: string;
        amount: number;
        timestamp: string;
        details: any;
    }>;
}

export interface ActivityQuery {
    page?: number;
    limit?: number;
    type?: 'order' | 'bid' | 'listing';
}

export interface ActivityResponse {
    success: boolean;
    activities: Array<{
        type: string;
        id: string;
        status: string;
        amount: number;
        timestamp: string;
        details: any;
    }>;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const dashboardApi = {
    async getDashboard(): Promise<{ success: boolean; dashboard: DashboardStats }> {
        return apiClient.get<{ success: boolean; dashboard: DashboardStats }>('/user/dashboard');
    },

    async getActivity(query: ActivityQuery = {}): Promise<ActivityResponse> {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
        return apiClient.get<ActivityResponse>(`/user/activity?${params.toString()}`);
    },
};
