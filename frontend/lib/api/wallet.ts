import { apiClient } from '../api-client';

export interface WalletBalance {
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    totalSpent: number;
}

export interface WalletTransaction {
    id: string;
    userId: string;
    orderId?: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    createdAt: string;
}

export interface PaymentMethod {
    id: string;
    userId: string;
    type: string;
    provider?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    createdAt: string;
}

export const walletApi = {
    async getBalance(): Promise<WalletBalance> {
        return apiClient.get('/wallet/balance');
    },

    async getTransactions(page: number = 1, limit: number = 20): Promise<{ transactions: WalletTransaction[]; total: number }> {
        return apiClient.get(`/wallet/transactions?page=${page}&limit=${limit}`);
    },

    async addFunds(amount: number, paymentMethodId: string): Promise<{ message: string; transaction: WalletTransaction }> {
        return apiClient.post('/wallet/add-funds', { amount, paymentMethodId });
    },

    async withdraw(amount: number, bankAccountId: string): Promise<{ message: string; transaction: WalletTransaction }> {
        return apiClient.post('/wallet/withdraw', { amount, bankAccountId });
    },

    async getPaymentMethods(): Promise<{ paymentMethods: PaymentMethod[] }> {
        return apiClient.get('/wallet/payment-methods');
    },

    async addPaymentMethod(data: {
        type: string;
        provider?: string;
        token?: string;
    }): Promise<{ message: string; paymentMethod: PaymentMethod }> {
        return apiClient.post('/wallet/payment-methods', data);
    },

    async removePaymentMethod(id: string): Promise<{ message: string }> {
        return apiClient.delete(`/wallet/payment-methods/${id}`);
    },

    async setDefaultPaymentMethod(id: string): Promise<{ message: string }> {
        return apiClient.patch(`/wallet/payment-methods/${id}/default`);
    },
};