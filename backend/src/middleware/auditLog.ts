import { Request, Response, NextFunction } from 'express';
import { query } from '../db';

interface AuditRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export interface AuditLogData {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
}

export const auditLog = async (data: AuditLogData): Promise<void> => {
    try {
        await query(`
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
    } catch (error) {
        console.error('Failed to write audit log:', error);
        // Don't throw error to avoid breaking the main request
    }
};

// Middleware to automatically log sensitive actions
export const auditMiddleware = (action: string, resource: string) => {
    return (req: AuditRequest, res: Response, next: NextFunction) => {
        const originalSend = res.send;
        const originalJson = res.json;

        // Override response methods to capture success/failure
        res.send = function (body: any) {
            logAuditEvent(req, res, action, resource, body);
            return originalSend.call(this, body);
        };

        res.json = function (body: any) {
            logAuditEvent(req, res, action, resource, body);
            return originalJson.call(this, body);
        };

        next();
    };
};

const logAuditEvent = async (
    req: AuditRequest,
    res: Response,
    action: string,
    resource: string,
    responseBody: any
) => {
    const success = res.statusCode >= 200 && res.statusCode < 400;
    const errorMessage = !success && responseBody?.error ? responseBody.error : undefined;

    await auditLog({
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
const sanitizeBody = (body: any): any => {
    if (!body || typeof body !== 'object') return body;

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
export const auditAuth = {
    login: (req: AuditRequest, success: boolean, errorMessage?: string) =>
        auditLog({
            userId: req.body.email,
            action: 'LOGIN',
            resource: 'auth',
            details: { email: req.body.email },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            success,
            errorMessage
        }),

    register: (req: AuditRequest, userId: string, success: boolean, errorMessage?: string) =>
        auditLog({
            userId: success ? userId : (req.body.email || 'unknown'),
            action: 'REGISTER',
            resource: 'auth',
            details: { email: req.body.email, role: req.body.role },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            success,
            errorMessage
        }),

    passwordChange: (req: AuditRequest, success: boolean, errorMessage?: string) =>
        auditLog({
            userId: req.user?.id,
            action: 'PASSWORD_CHANGE',
            resource: 'auth',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            success,
            errorMessage
        }),

    passwordReset: (req: AuditRequest, success: boolean, errorMessage?: string) =>
        auditLog({
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

export const auditPayment = {
    paymentAttempt: (req: AuditRequest, orderId: string, amount: number, success: boolean, errorMessage?: string) =>
        auditLog({
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

    refund: (req: AuditRequest, orderId: string, amount: number, success: boolean, errorMessage?: string) =>
        auditLog({
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

export const auditBid = {
    placeBid: (req: AuditRequest, auctionId: string, amount: number, success: boolean, errorMessage?: string) =>
        auditLog({
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