import { apiClient } from '../api-client';

export interface Address {
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressRequest {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> { }

export const addressesApi = {
    async getAddresses(): Promise<{ success: boolean; addresses: Address[] }> {
        return apiClient.get<{ success: boolean; addresses: Address[] }>('/addresses');
    },

    async getAddress(id: string): Promise<{ success: boolean; address: Address }> {
        return apiClient.get<{ success: boolean; address: Address }>(`/addresses/${id}`);
    },

    async createAddress(data: CreateAddressRequest): Promise<{ success: boolean; message: string; address: Address }> {
        return apiClient.post('/addresses', data);
    },

    async updateAddress(id: string, data: UpdateAddressRequest): Promise<{ success: boolean; message: string; address: Address }> {
        return apiClient.put(`/addresses/${id}`, data);
    },

    async deleteAddress(id: string): Promise<{ success: boolean; message: string }> {
        return apiClient.delete(`/addresses/${id}`);
    },

    async setDefaultAddress(id: string): Promise<{ success: boolean; message: string }> {
        return apiClient.patch(`/addresses/${id}/default`, {});
    },
};
