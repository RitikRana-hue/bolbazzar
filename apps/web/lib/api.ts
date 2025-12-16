const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(response.status, errorData.error || 'Request failed');
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Network error');
    }
}

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        apiRequest<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (userData: any) =>
        apiRequest<{ user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    verifyEmail: (token: string) =>
        apiRequest<{ message: string }>('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ token }),
        }),

    forgotPassword: (email: string) =>
        apiRequest<{ message: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),

    resetPassword: (token: string, password: string) =>
        apiRequest<{ message: string }>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
        }),
};

// User API
export const userApi = {
    getProfile: () => apiRequest<any>('/users/profile'),

    updateProfile: (data: any) =>
        apiRequest<any>('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    getNotifications: () => apiRequest<any[]>('/notifications'),

    markNotificationRead: (id: string) =>
        apiRequest<{ message: string }>(`/notifications/${id}/read`, {
            method: 'POST',
        }),

    markAllNotificationsRead: () =>
        apiRequest<{ message: string }>('/notifications/mark-all-read', {
            method: 'POST',
        }),

    deleteNotification: (id: string) =>
        apiRequest<{ message: string }>(`/notifications/${id}`, {
            method: 'DELETE',
        }),
};

// Wallet API
export const walletApi = {
    getWallet: () => apiRequest<any>('/wallet'),

    topup: (amount: number, paymentMethod: string) =>
        apiRequest<{ message: string }>('/wallet/topup', {
            method: 'POST',
            body: JSON.stringify({ amount, paymentMethod }),
        }),

    withdraw: (amount: number) =>
        apiRequest<{ message: string }>('/wallet/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        }),

    getTransactions: (filters?: any) => {
        const params = new URLSearchParams(filters || {});
        return apiRequest<any[]>(`/wallet/transactions?${params}`);
    },
};

// Listings API
export const listingsApi = {
    getListings: (filters?: any) => {
        const params = new URLSearchParams(filters);
        return apiRequest<any[]>(`/listings?${params}`);
    },

    getListing: (id: string) => apiRequest<any>(`/listings/${id}`),

    createListing: (data: any) =>
        apiRequest<any>('/listings', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateListing: (id: string, data: any) =>
        apiRequest<any>(`/listings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteListing: (id: string) =>
        apiRequest<{ message: string }>(`/listings/${id}`, {
            method: 'DELETE',
        }),

    searchListings: (query: string, searchFilters?: any) => {
        const params = new URLSearchParams({ q: query, ...(searchFilters || {}) });
        return apiRequest<any[]>(`/listings/search?${params}`);
    },
};

// Auctions API
export const auctionsApi = {
    getAuctions: (filters?: any) => {
        const params = new URLSearchParams(filters);
        return apiRequest<any[]>(`/auctions?${params}`);
    },

    getAuction: (id: string) => apiRequest<any>(`/auctions/${id}`),

    placeBid: (auctionId: string, amount: number) =>
        apiRequest<any>(`/auctions/${auctionId}/bid`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        }),

    getUserBids: () => apiRequest<any[]>('/auctions/my-bids'),
};

// Orders API
export const ordersApi = {
    getOrders: () => apiRequest<any[]>('/orders'),

    getOrder: (id: string) => apiRequest<any>(`/orders/${id}`),

    createOrder: (data: any) =>
        apiRequest<any>('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    confirmPayment: (orderId: string, paymentIntentId: string) =>
        apiRequest<{ message: string }>(`/orders/${orderId}/confirm-payment`, {
            method: 'POST',
            body: JSON.stringify({ paymentIntentId }),
        }),

    requestRefund: (orderId: string, reason: string) =>
        apiRequest<{ message: string }>(`/orders/${orderId}/refund`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        }),
};

// Messages API
export const messagesApi = {
    getConversations: () => apiRequest<any[]>('/messages/conversations'),

    getMessages: (conversationId: string) =>
        apiRequest<any[]>(`/messages/conversations/${conversationId}`),

    sendMessage: (conversationId: string, content: string) =>
        apiRequest<any>(`/messages/conversations/${conversationId}`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }),
};

// Admin API
export const adminApi = {
    getDashboard: () => apiRequest<any>('/admin/dashboard'),

    getUsers: (filters?: any) => {
        const params = new URLSearchParams(filters);
        return apiRequest<any[]>(`/admin/users?${params}`);
    },

    suspendUser: (userId: string) =>
        apiRequest<{ message: string }>(`/admin/users/${userId}/suspend`, {
            method: 'POST',
        }),

    activateUser: (userId: string) =>
        apiRequest<{ message: string }>(`/admin/users/${userId}/activate`, {
            method: 'POST',
        }),

    getDisputes: () => apiRequest<any[]>('/admin/disputes'),

    resolveDispute: (disputeId: string, resolution: string) =>
        apiRequest<{ message: string }>(`/admin/disputes/${disputeId}/resolve`, {
            method: 'POST',
            body: JSON.stringify({ resolution }),
        }),
};

// Payment Methods API
export const paymentMethodsApi = {
    getPaymentMethods: () => apiRequest<any[]>('/payment-methods'),

    addPaymentMethod: (data: any) =>
        apiRequest<any>('/payment-methods', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    setDefaultPaymentMethod: (id: string) =>
        apiRequest<{ message: string }>(`/payment-methods/${id}/default`, {
            method: 'POST',
        }),

    deletePaymentMethod: (id: string) =>
        apiRequest<{ message: string }>(`/payment-methods/${id}`, {
            method: 'DELETE',
        }),
};

// Channels API
export const channelsApi = {
    getChannels: () => apiRequest<any[]>('/channels'),

    subscribeToChannel: (data: any) =>
        apiRequest<any>('/channels/subscribe', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    unsubscribeFromChannel: (channelId: string) =>
        apiRequest<{ message: string }>(`/channels/${channelId}/unsubscribe`, {
            method: 'POST',
        }),

    toggleChannel: (channelId: string, isActive: boolean) =>
        apiRequest<{ message: string }>(`/channels/${channelId}/toggle`, {
            method: 'POST',
            body: JSON.stringify({ isActive }),
        }),
};

// Subscription API
export const subscriptionApi = {
    getPlans: () => apiRequest<any[]>('/subscriptions/plans'),

    getCurrentSubscription: () => apiRequest<any>('/subscriptions/current'),

    upgradePlan: (planId: string) =>
        apiRequest<any>('/subscriptions/upgrade', {
            method: 'POST',
            body: JSON.stringify({ planId }),
        }),

    cancelSubscription: () =>
        apiRequest<{ message: string }>('/subscriptions/cancel', {
            method: 'POST',
        }),
};

export { ApiError };