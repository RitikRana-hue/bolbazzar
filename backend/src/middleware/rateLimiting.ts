import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// General API rate limiting
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60 // seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count both successful and failed attempts
});

// Very strict rate limiting for password reset
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
        error: 'Too many password reset attempts, please try again later.',
        retryAfter: 60 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for bidding (prevent bid spam)
export const biddingLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 bids per minute
    message: {
        error: 'Too many bidding attempts, please slow down.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Rate limit per user for bidding
        return req.user?.id || req.ip || 'anonymous';
    }
});

// Rate limiting for payment processing
export const paymentLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 payment attempts per 5 minutes
    message: {
        error: 'Too many payment attempts, please try again later.',
        retryAfter: 5 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Rate limit per user for payments
        return req.user?.id || req.ip || 'anonymous';
    }
});

// Rate limiting for file uploads
export const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20, // 20 uploads per 10 minutes
    message: {
        error: 'Too many file uploads, please try again later.',
        retryAfter: 10 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for listing creation
export const listingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 listings per hour
    message: {
        error: 'Too many listings created, please try again later.',
        retryAfter: 60 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        return req.user?.id || req.ip || 'anonymous';
    }
});

// Custom rate limiter for sensitive operations
export const createCustomLimiter = (windowMs: number, max: number, message: string) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            error: message,
            retryAfter: Math.ceil(windowMs / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};