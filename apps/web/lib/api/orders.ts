import { apiClient } from '../api-client';

export interface Order {
    id: string;
    buyerId: string;
    sellerId: string;
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    shippingAddress: any;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    product?: any;
    quantity: number;
    price: number;
    total: number;
}

export const ordersApi = {
    async getOrders(page: number = 1, limit: number = 20): Promise<{ orders: Order[]; total: number }> {
        return apiClient.get(`/orders?page=${page}&limit=${limit}`);
    },

    async getOrder(id: string): Promise<Order> {
        return apiClient.get(`/orders/${id}`);
    },

    async createOrder(data: {
        items: Array<{ productId: string; quantity: number; price: number }>;
        shippingAddressId: string;
        paymentMethodId?: string;
    }): Promise<{ message: string; order: Order }> {
        return apiClient.post('/orders', data);
    },

    async cancelOrder(id: string, reason?: string): Promise<{ message: string }> {
        return apiClient.post(`/orders/${id}/cancel`, { reason });
    },

    async updateOrderStatus(id: string, status: string): Promise<{ message: string; order: Order }> {
        return apiClient.patch(`/orders/${id}/status`, { status });
    },
};