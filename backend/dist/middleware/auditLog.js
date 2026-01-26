"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditBid = exports.auditPayment = exports.auditAuth = exports.auditMiddleware = exports.auditLog = void 0;
const db_1 = require("../db");
const auditLog = async (data) => {
    try {
        await (0, db_1.query)(`
            INSERT INTO audit_logs (
                userId, action, resource, resourceId, details,
                ipAddress, userAgent, success, errorMessage, createdAt
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `, [
            data.userId,
            data.action,
            data.resource,
            data.resourceId,
            data.details ? JSON.stringify(data.details) : null,
            data.ipAddress,
            data.userAgent,
            data.success,
            data.errorMessage
        ]);
    }
    catch (error) {
        console.error('Failed to write audit log:', error);
        // Don't throw error to avoid breaking the main request
    }
};
exports.auditLog = auditLog;
// Middleware to automatically log sensitive actions
const auditMiddleware = (action, resource) => {
    return (req, res, next) => {
        const originalSend = res.send;
        const originalJson = res.json;
        // Override response methods to capture success/failure
        res.send = function (body) {
            logAuditEvent(req, res, action, resource, body);
            return originalSend.call(this, body);
        };
        res.json = function (body) {
            logAuditEvent(req, res, action, resource, body);
            return originalJson.call(this, body);
        };
        next();
    };
};
exports.auditMiddleware = auditMiddleware;
const logAuditEvent = async (req, res, action, resource, responseBody) => {
    const success = res.statusCode >= 200 && res.statusCode < 400;
    const errorMessage = !success && responseBody?.error ? responseBody.error : undefined;
    await (0, exports.auditLog)({
        userId: req.user?.id,
        action,
        resource,
        resourceId: req.params.id || req.body.id,
        details: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: sanitizeBody(req.body),
            statusCode: res.statusCode
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage
    });
};
// Remove sensitive data from audit logs
const sanitizeBody = (body) => {
    if (!body || typeof body !== 'object')
        return body;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'token', 'refreshToken'];
    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
};
// Specific audit functions for common actions
exports.auditAuth = {
    login: (req, success, errorMessage) => (0, exports.auditLog)({
        userId: req.body.email,
        action: 'LOGIN',
        resource: 'auth',
        details: { email: req.body.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage
    }),
    register: (req, userId, success, errorMessage) => (0, exports.auditLog)({
        userId: success ? userId : (req.body.email || 'unknown'),
        action: 'REGISTER',
        resource: 'auth',
        details: { email: req.body.email, role: req.body.role },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage
    }),
    passwordChange: (req, success, errorMessage) => (0, exports.auditLog)({
        userId: req.user?.id,
        action: 'PASSWORD_CHANGE',
        resource: 'auth',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage
    }),
    passwordReset: (req, success, errorMessage) => (0, exports.auditLog)({
        userId: req.body.email,
        action: 'PASSWORD_RESET',
        resource: 'auth',
        details: { email: req.body.email },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage
    })
};
exports.auditPayment = {
    paymentAttempt: (req, orderId, amount, success, errorMessage) => (0, exports.auditLog)({
        userId: req.user?.id,
        action: 'PAYMENT_ATTEMPT',
        resource: 'payment',
        resourceId: orderId,
        details: { amount, method: req.body.paymentMethod },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage
    }),
    refund: (req, orderId, amount, success, errorMessage) => (0, exports.auditLog)({
        userId: req.user?.id,
        action: 'REFUND',
        resource: 'payment',
        resourceId: orderId,
        details: { amount, reason: req.body.reason },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage
    })
};
exports.auditBid = {
    placeBid: (req, auctionId, amount, success, errorMessage) => (0, exports.auditLog)({
        userId: req.user?.id,
        action: 'PLACE_BID',
        resource: 'auction',
        resourceId: auctionId,
        details: { amount, maxBid: req.body.maxBid },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage
    })
};
//# sourceMappingURL=auditLog.js.map