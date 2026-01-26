import { apiClient } from '../api-client';

export interface WatchlistItem {
    id: string;
    productId: string;
    title: string;
    price: number;
    status: string;
    condition: string;
    stock: number;
    seller: {
        id: string;
        username: string;
    };
    imageUrl: string;
    category: string;
    bidCount?: number;
    addedAt: string;
}

export interface WatchlistResponse {
    success: boolean;
    watchlist: WatchlistItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AddToWatchlistRequest {
    productId: string;
}

export const watchlistApi = {
    async getWatchlist(page: number = 1, limit: number = 20): Promise<WatchlistResponse> {
        return apiClient.get<WatchlistResponse>(`/watchlist?page=${page}&limit=${limit}`);
    },

    async addToWatchlist(data: AddToWatchlistRequest): Promise<{ success: boolean; message: string }> {
        return apiClient.post('/watchlist', data);
    },

    async removeFromWatchlist(productId: string): Promise<{ success: boolean; message: string }> {
        return apiClient.delete(`/watchlist/${productId}`);
    },

    async checkWatchlist(productId: string): Promise<{ success: boolean; isWatched: boolean }> {
        return apiClient.get<{ success: boolean; isWatched: boolean }>(`/watchlist/check/${productId}`);
    },
};
