import { create } from 'zustand';
import { User } from '../types';

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
            // Hardcoded credentials for demo
            const validCredentials = [
                { email: 'admin@instasell.com', password: 'admin123', role: 'ADMIN', username: 'Admin' },
                { email: 'user@instasell.com', password: 'user123', role: 'BUYER', username: 'Demo User' },
                { email: 'seller@instasell.com', password: 'seller123', role: 'SELLER', username: 'Demo Seller' }
            ];

            const user = validCredentials.find(cred => cred.email === email && cred.password === password);

            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Create mock user object
            const mockUser: User = {
                id: Math.random().toString(36).substring(7),
                email: user.email,
                username: user.username,
                role: user.role as 'BUYER' | 'SELLER' | 'ADMIN' | 'DELIVERY_AGENT',
                isEmailVerified: true,
                isActive: true,
                createdAt: new Date().toISOString()
            };

            // Store mock token and user
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', 'mock-jwt-token-' + Date.now());
                localStorage.setItem('user', JSON.stringify(mockUser));
            }

            set({ user: mockUser, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            const errorMessage = error.message || 'Login failed';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    register: async (_email, _password, _username, _role) => {
        set({ isLoading: true, error: null });
        try {
            // Mock registration - just simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false });
        } catch (error: any) {
            const errorMessage = 'Registration failed';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            // Mock logout - just clear data
            await new Promise(resolve => setTimeout(resolve, 500));
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
            // Mock fetch current user - get from localStorage
            if (typeof window !== 'undefined') {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    set({ user, isAuthenticated: true, isLoading: false });
                    return;
                }
            }
            set({ user: null, isAuthenticated: false, isLoading: false });
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
