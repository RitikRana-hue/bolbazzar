import { apiClient } from '../api-client';
import { Auction, AuctionBid, PaginatedResponse } from '../types';

export interface AuctionsQuery {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    endingSoon?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}

export interface PlaceBidRequest {
    amount: number;
    maxBid?: number;
}

export const auctionsApi = {
    async getAuctions(query: AuctionsQuery = {}): Promise<PaginatedResponse<Auction>> {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
        return apiClient.get<PaginatedResponse<Auction>>(`/auctions?${params.toString()}`);
    },

    async getAuction(id: string): Promise<Auction & { images: any[]; bids: AuctionBid[] }> {
        return apiClient.get(`/auctions/${id}`);
    },

    async placeBid(auctionId: string, data: PlaceBidRequest): Promise<{ message: string; bid: AuctionBid }> {
        return apiClient.post(`/auctions/${auctionId}/bid`, data);
    },

    async getUserBids(status: string = 'all', page: number = 1, limit: number = 20): Promise<{ bids: AuctionBid[] }> {
        return apiClient.get(`/auctions/user/bids?status=${status}&page=${page}&limit=${limit}`);
    },

    async endAuction(auctionId: string): Promise<{ message: string; auction: any }> {
        return apiClient.post(`/auctions/${auctionId}/end`);
    },

    async getAuctionStats(auctionId: string): Promise<{ stats: any }> {
        return apiClient.get(`/auctions/${auctionId}/stats`);
    },

    async watchAuction(auctionId: string): Promise<{ message: string }> {
        return apiClient.post(`/auctions/${auctionId}/watch`);
    },
};
