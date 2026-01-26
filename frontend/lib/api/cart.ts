import { apiClient } from '../api-client';

export interface CartItem {
    id: string;
    productId: string;
    title: string;
    quantity: number;
    price: number;
    currentPrice: number;
    total: number;
    imageUrl: string;
    status: string;
    stock: number;
    isAvailable: boolean;
}

export interface Cart {
    id: string;
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    updatedAt: string;
}

export interface AddToCartRequest {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export const cartApi = {
    async getCart(): Promise<{ success: boolean; cart: Cart }> {
        return apiClient.get<{ success: boolean; cart: Cart }>('/cart');
    },

    async addItem(data: AddToCartRequest): Promise<{ success: boolean; message: string }> {
        return apiClient.post('/cart/items', data);
    },

    async updateItem(itemId: string, data: UpdateCartItemRequest): Promise<{ success: boolean; message: string }> {
        return apiClient.patch(`/cart/items/${itemId}`, data);
    },

    async removeItem(itemId: string): Promise<{ success: boolean; message: string }> {
        return apiClient.delete(`/cart/items/${itemId}`);
    },

    async clearCart(): Promise<{ success: boolean; message: string }> {
        return apiClient.delete('/cart');
    },
};
