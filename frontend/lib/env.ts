// Environment variable validation utility
const requiredEnvVars = {
    client: [
        'NEXT_PUBLIC_API_URL',
    ],
    server: []
};

export function validateEnv() {
    const missing: string[] = [];
    const isServer = typeof window === 'undefined';

    // Check client-side variables
    if (!isServer) {
        requiredEnvVars.client.forEach(varName => {
            if (!process.env[varName]) {
                missing.push(varName);
            }
        });
    }

    // Check server-side variables
    if (isServer) {
        requiredEnvVars.server.forEach(varName => {
            if (!process.env[varName]) {
                missing.push(varName);
            }
        });
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${missing.join('\n')}\n\nPlease check your .env file.`
        );
    }
}

// Safe environment variable getter
export function getEnv(key: string, defaultValue?: string): string {
    const value = process.env[key];

    if (!value && !defaultValue) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`Environment variable ${key} is not set`);
        }
        return '';
    }

    return value || defaultValue || '';
}

// Type-safe environment variables
export const env = {
    apiUrl: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001/api'),
    socketUrl: getEnv('NEXT_PUBLIC_SOCKET_URL', 'http://localhost:3001'),
    stripePublishableKey: getEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
} as const;
