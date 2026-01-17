import { apiClient } from '../api-client';
import { User } from '../types';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username?: string;
    password: string;
    role?: 'BUYER' | 'SELLER';
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface RegisterResponse {
    message: string;
    user: User;
}

export const authApi = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);
        if (response.token) {
            apiClient.setAuthToken(response.token);
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
        }
        return response;
    },

    async register(data: RegisterRequest): Promise<RegisterResponse> {
        return apiClient.post<RegisterResponse>('/auth/register', data);
    },

    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    },

    async getCurrentUser(): Promise<{ user: User }> {
        return apiClient.get<{ user: User }>('/auth/me');
    },

    async verifyEmail(token: string): Promise<{ message: string; user: User }> {
        return apiClient.post('/auth/verify-email', { token });
    },

    async forgotPassword(email: string): Promise<{ message: string }> {
        return apiClient.post('/auth/forgot-password', { email });
    },

    async resetPassword(token: string, password: string): Promise<{ message: string }> {
        return apiClient.post('/auth/reset-password', { token, password });
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
        return apiClient.post('/auth/change-password', { currentPassword, newPassword });
    },

    async updateProfile(data: Partial<User>): Promise<{ message: string; profile: any }> {
        return apiClient.put('/auth/profile', data);
    },
};
