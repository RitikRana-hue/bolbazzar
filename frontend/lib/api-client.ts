import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Get API URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Validate API URL
if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

class ApiClient {
    private client: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value?: any) => void;
        reject: (error?: any) => void;
    }> = [];

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
            withCredentials: true, // Include cookies for CORS
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor - add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add request ID for debugging
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                    config.headers['X-Request-ID'] = this.generateRequestId();
                }

                return config;
            },
            (error) => {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Request interceptor error:', error);
                }
                return Promise.reject(error);
            }
        );

        // Response interceptor - handle errors and token refresh
        this.client.interceptors.response.use(
            (response) => {
                // Log successful requests in debug mode
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                        status: response.status,
                        data: response.data,
                    });
                }
                return response;
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                // Log errors in debug mode
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
                        status: error.response?.status,
                        message: error.message,
                        data: error.response?.data,
                    });
                }

                // Handle 401 Unauthorized
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        // If already refreshing, queue the request
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return this.client(originalRequest);
                        }).catch(err => {
                            return Promise.reject(err);
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const refreshToken = this.getRefreshToken();
                        if (refreshToken) {
                            const response = await this.refreshAuthToken(refreshToken);
                            const newToken = response.token;

                            this.setToken(newToken);
                            this.processQueue(null, newToken);

                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return this.client(originalRequest);
                        } else {
                            throw new Error('No refresh token available');
                        }
                    } catch (refreshError) {
                        this.processQueue(refreshError, null);
                        this.clearTokens();

                        // Redirect to login if we're in the browser
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }

                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                // Handle network errors
                if (!error.response) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Network error:', error.message);
                    }
                    return Promise.reject(new Error('Network error. Please check your connection.'));
                }

                // Handle other HTTP errors
                const errorMessage = this.extractErrorMessage(error);
                return Promise.reject(new Error(errorMessage));
            }
        );
    }

    private processQueue(error: any, token: string | null): void {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });

        this.failedQueue = [];
    }

    private extractErrorMessage(error: AxiosError): string {
        const response = error.response;

        if (response?.data) {
            const data = response.data as any;
            return data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
        }

        return error.message || 'An unexpected error occurred';
    }

    private generateRequestId(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
    }

    private getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('refresh_token');
    }

    private setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('auth_token', token);
    }

    private clearTokens(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }

    private async refreshAuthToken(refreshToken: string): Promise<{ token: string }> {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
        });
        return response.data;
    }

    // Public methods
    public setAuthToken(token: string, refreshToken?: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('auth_token', token);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    }

    public clearAuth(): void {
        this.clearTokens();
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    // Upload method for file uploads
    public async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
        const response = await this.client.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });
        return response.data;
    }

    // Health check method
    public async healthCheck(): Promise<any> {
        const healthUrl = API_BASE_URL.replace('/api', '/health');
        const response = await axios.get(healthUrl, { timeout: 5000 });
        return response.data;
    }

    // Get API base URL
    public getBaseURL(): string {
        return API_BASE_URL;
    }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for testing
export { ApiClient };
