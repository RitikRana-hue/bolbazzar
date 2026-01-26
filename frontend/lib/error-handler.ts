// Centralized error handling utility

export class AppError extends Error {
    constructor(
        public message: string,
        public code?: string,
        public statusCode?: number,
        public isOperational = true
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, public fields?: Record<string, string>) {
        super(message, 'VALIDATION_ERROR', 400);
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 'AUTH_ERROR', 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 'AUTHORIZATION_ERROR', 403);
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 'NOT_FOUND', 404);
    }
}

export class NetworkError extends AppError {
    constructor(message = 'Network error occurred') {
        super(message, 'NETWORK_ERROR', 0);
    }
}

// Error logger
export function logError(error: Error | AppError, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            context,
        });
    }

    // In production, send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
        // TODO: Integrate with error tracking service
    }
}

// Error handler for async functions
export function handleAsyncError<T extends (...args: any[]) => Promise<any>>(
    fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
    return async (...args: Parameters<T>) => {
        try {
            return await fn(...args);
        } catch (error) {
            logError(error as Error, { function: fn.name, args });
            return null;
        }
    };
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json);
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to parse JSON:', error);
        }
        return fallback;
    }
}

// Error message extractor
export function getErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }

    return 'An unexpected error occurred';
}

// Retry utility for failed operations
export async function retry<T>(
    fn: () => Promise<T>,
    options: {
        maxAttempts?: number;
        delay?: number;
        backoff?: boolean;
    } = {}
): Promise<T> {
    const { maxAttempts = 3, delay = 1000, backoff = true } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt < maxAttempts) {
                const waitTime = backoff ? delay * attempt : delay;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw lastError!;
}
