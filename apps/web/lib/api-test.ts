import { API_CONFIG, getApiUrl } from './config';

// Simple API test function
export const testApiConnection = async () => {
    try {
        console.log('Testing API connection...');
        console.log('API Base URL:', API_CONFIG.BASE_URL);
        console.log('Health check URL:', getApiUrl('/health'));
        
        const response = await fetch(getApiUrl('/health'));
        const data = await response.json();
        
        console.log('API Response:', data);
        return { success: true, data };
    } catch (error) {
        console.error('API Test Failed:', error);
        return { success: false, error };
    }
};

// Test function to be called from browser console
if (typeof window !== 'undefined') {
    (window as any).testApi = testApiConnection;
}