// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    TIMEOUT: 10000, // 10 seconds
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
};

// Environment check
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Debug API URL (for development)
if (isDevelopment && typeof window !== 'undefined') {
    console.log('API Configuration:', {
        BASE_URL: API_CONFIG.BASE_URL,
        WS_URL: API_CONFIG.WS_URL,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    });
}