// Security utilities for input sanitization and XSS prevention

// Sanitize HTML to prevent XSS attacks
export function sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Escape HTML special characters
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    return text.replace(/[&<>"'/]/g, char => map[char]);
}

// Sanitize user input
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '')
        .slice(0, 1000); // Limit length
}

// Validate and sanitize URL
export function sanitizeUrl(url: string): string {
    try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

// Check if string contains potential XSS
export function containsXss(input: string): boolean {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .slice(0, 255);
}

// Generate CSRF token
export function generateCsrfToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate CSRF token
export function validateCsrfToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) return false;
    return token === storedToken;
}

// Rate limiting helper (client-side)
export class RateLimiter {
    private attempts: Map<string, number[]> = new Map();

    constructor(
        private maxAttempts: number = 5,
        private windowMs: number = 60000
    ) { }

    isAllowed(key: string): boolean {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];

        // Remove old attempts outside the window
        const recentAttempts = attempts.filter(time => now - time < this.windowMs);

        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }

        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);
        return true;
    }

    reset(key: string): void {
        this.attempts.delete(key);
    }
}

// Content Security Policy helper
export function generateCspNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}

// Secure storage wrapper
export const secureStorage = {
    set: (key: string, value: any, encrypt = false): void => {
        if (typeof window === 'undefined') return;

        try {
            const data = encrypt ? btoa(JSON.stringify(value)) : JSON.stringify(value);
            localStorage.setItem(key, data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to save to secure storage:', error);
            }
        }
    },

    get: <T>(key: string, decrypt = false): T | null => {
        if (typeof window === 'undefined') return null;

        try {
            const data = localStorage.getItem(key);
            if (!data) return null;

            const parsed = decrypt ? JSON.parse(atob(data)) : JSON.parse(data);
            return parsed;
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to read from secure storage:', error);
            }
            return null;
        }
    },

    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    },

    clear: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    },
};

// Password strength checker
export function checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
} {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Password should be at least 8 characters');

    if (password.length >= 12) score++;

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Add special characters');

    return { score, feedback };
}

// Input validation
export const validators = {
    email: (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    phone: (phone: string): boolean => {
        const regex = /^\+?[\d\s-()]+$/;
        return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    url: (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    creditCard: (card: string): boolean => {
        const cleaned = card.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleaned)) return false;

        // Luhn algorithm
        let sum = 0;
        let isEven = false;

        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    },
};
