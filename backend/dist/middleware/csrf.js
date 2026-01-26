"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCSRF = exports.csrfProtection = exports.verifyCSRFToken = exports.generateCSRFToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret-key';
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';
const generateCSRFToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateCSRFToken = generateCSRFToken;
const verifyCSRFToken = (token, secret) => {
    try {
        const hmac = crypto_1.default.createHmac('sha256', CSRF_SECRET);
        hmac.update(secret);
        const expectedToken = hmac.digest('hex');
        return crypto_1.default.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expectedToken, 'hex'));
    }
    catch {
        return false;
    }
};
exports.verifyCSRFToken = verifyCSRFToken;
const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    // Skip CSRF for health checks and auth endpoints during login
    if (req.path.startsWith('/health') || req.path === '/api/auth/login' || req.path === '/api/auth/register') {
        return next();
    }
    const token = req.headers[CSRF_HEADER] || req.body._csrf;
    const secret = req.cookies[CSRF_COOKIE];
    if (!token || !secret) {
        return res.status(403).json({
            error: 'CSRF token missing',
            code: 'CSRF_MISSING'
        });
    }
    if (!(0, exports.verifyCSRFToken)(token, secret)) {
        return res.status(403).json({
            error: 'Invalid CSRF token',
            code: 'CSRF_INVALID'
        });
    }
    next();
};
exports.csrfProtection = csrfProtection;
const setupCSRF = (req, res, next) => {
    const secret = (0, exports.generateCSRFToken)();
    const token = crypto_1.default.createHmac('sha256', CSRF_SECRET).update(secret).digest('hex');
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
exports.setupCSRF = setupCSRF;
//# sourceMappingURL=csrf.js.map