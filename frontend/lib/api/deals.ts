import { apiClient } from '../api-client';

export interface Deal {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    savings: number;
    condition: string;
    stock: number;
    views: number;
    isFeatured: boolean;
    category: {
        name: string;
        slug: string;
    };
    seller: {
        username: string;
    };
    imageUrl: string;
    reviewCount: number;
    averageRating: number;
    createdAt: string;
}

export interface DealsQuery {
    page?: number;
    limit?: number;
    category?: string;
    minDiscount?: number;
    featured?: boolean;
}

export interface DealsResponse {
    success: boolean;
    deals: Deal[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const dealsApi = {
    async getDeals(query: DealsQuery = {}): Promise<DealsResponse> {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
        return apiClient.get<DealsResponse>(`/deals?${params.toString()}`);
    },

    async getDeal(id: string): Promise<{ success: boolean; deal: Deal }> {
        return apiClient.get<{ success: boolean; deal: Deal }>(`/deals/${id}`);
    },
};
