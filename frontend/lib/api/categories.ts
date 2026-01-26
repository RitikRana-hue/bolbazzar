import { apiClient } from '../api-client';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    parentId?: string;
    children?: Category[];
    productCount?: number;
}

export const categoriesApi = {
    async getCategories(): Promise<{ categories: Category[] }> {
        return apiClient.get('/categories');
    },

    async getCategory(slug: string): Promise<Category> {
        return apiClient.get(`/categories/${slug}`);
    },

    async getCategoryProducts(slug: string, page: number = 1, limit: number = 20): Promise<any> {
        return apiClient.get(`/categories/${slug}/products?page=${page}&limit=${limit}`);
    },
};