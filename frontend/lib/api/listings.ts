import { apiClient } from '../api-client';
import { Product, PaginatedResponse } from '../types';

export interface ListingsQuery {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}

export interface CreateListingRequest {
    categoryId: string;
    title: string;
    description: string;
    condition: string;
    brand?: string;
    model?: string;
    price: number;
    originalPrice?: number;
    stock?: number;
    weight?: number;
    dimensions?: any;
    features?: any;
    tags?: string[];
    images?: Array<{ url: string; altText?: string }>;
    isAuction?: boolean;
    auctionData?: {
        startingPrice: number;
        reservePrice?: number;
        duration: number; // in hours
        autoExtend?: boolean;
    };
}

export const listingsApi = {
    async getListings(query: ListingsQuery = {}): Promise<PaginatedResponse<Product>> {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
        return apiClient.get<PaginatedResponse<Product>>(`/listings?${params.toString()}`);
    },

    async getListing(id: string): Promise<Product> {
        return apiClient.get<Product>(`/listings/${id}`);
    },

    async createListing(data: CreateListingRequest): Promise<{ message: string; product: Product }> {
        return apiClient.post('/listings', data);
    },

    async updateListing(id: string, data: Partial<CreateListingRequest>): Promise<{ message: string; product: Product }> {
        return apiClient.put(`/listings/${id}`, data);
    },

    async deleteListing(id: string): Promise<{ message: string }> {
        return apiClient.delete(`/listings/${id}`);
    },

    async getSellerListings(sellerId: string, status: string = 'ACTIVE', page: number = 1, limit: number = 20): Promise<PaginatedResponse<Product>> {
        return apiClient.get<PaginatedResponse<Product>>(`/listings/seller/${sellerId}?status=${status}&page=${page}&limit=${limit}`);
    },

    async addToWatchlist(productId: string): Promise<{ message: string }> {
        return apiClient.post(`/listings/${productId}/watchlist`);
    },

    async removeFromWatchlist(productId: string): Promise<{ message: string }> {
        return apiClient.delete(`/listings/${productId}/watchlist`);
    },
};
