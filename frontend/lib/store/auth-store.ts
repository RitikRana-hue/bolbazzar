import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../api/auth';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: User | null) => void;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username?: string, role?: 'BUYER' | 'SELLER') => Promise<void>;
    logout: () => Promise<void>;
    fetchCurrentUser: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.login({ email, password });

            // Store tokens with correct keys
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Login failed';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    register: async (email, password, username, role) => {
        set({ isLoading: true, error: null });
        try {
            await authApi.register({ email, password, username, role });
            set({ isLoading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Registration failed';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await authApi.logout();
        } catch (error) {
            // Continue with logout even if API call fails
        } finally {
            // Clear all auth data
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
            }
            set({ user: null, isAuthenticated: false, isLoading: false });

            // Redirect to home
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }
    },

    fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
            const response = await authApi.getCurrentUser();
            set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));

// Initialize auth state from localStorage on client side
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            useAuthStore.setState({ user, isAuthenticated: true });
            // Fetch fresh user data
            useAuthStore.getState().fetchCurrentUser();
        } catch (error) {
            console.error('Failed to parse stored user:', error);
        }
    }
}
