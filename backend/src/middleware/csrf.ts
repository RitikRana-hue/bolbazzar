import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CSRFRequest extends Request {
    csrfToken?: () => string;
}

const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret-key';
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';

export const generateCSRFToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const verifyCSRFToken = (token: string, secret: string): boolean => {
    try {
        const hmac = crypto.createHmac('sha256', CSRF_SECRET);
        hmac.update(secret);
        const expectedToken = hmac.digest('hex');
        return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expectedToken, 'hex'));
    } catch {
        return false;
    }
};

export const csrfProtection = (req: CSRFRequest, res: Response, next: NextFunction) => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Skip CSRF for health checks and auth endpoints during login
    if (req.path.startsWith('/health') || req.path === '/api/auth/login' || req.path === '/api/auth/register') {
        return next();
    }

    const token = req.headers[CSRF_HEADER] as string || req.body._csrf;
    const secret = req.cookies[CSRF_COOKIE];

    if (!token || !secret) {
        return res.status(403).json({
            error: 'CSRF token missing',
            code: 'CSRF_MISSING'
        });
    }

    if (!verifyCSRFToken(token, secret)) {
        return res.status(403).json({
            error: 'Invalid CSRF token',
            code: 'CSRF_INVALID'
        });
    }

    next();
};

export const setupCSRF = (req: CSRFRequest, res: Response, next: NextFunction) => {
    const secret = generateCSRFToken();
    const token = crypto.createHmac('sha256', CSRF_SECRET).update(secret).digest('hex');

    // Set CSRF secret in cookie
    res.cookie(CSRF_COOKIE, secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Add method to generate token for forms
    req.csrfToken = () => token;

    next();
};