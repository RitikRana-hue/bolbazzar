import { Request, Response, NextFunction } from 'express';
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
export declare const auditLog: (data: AuditLogData) => Promise<void>;
export declare const auditMiddleware: (action: string, resource: string) => (req: AuditRequest, res: Response, next: NextFunction) => void;
export declare const auditAuth: {
    login: (req: AuditRequest, success: boolean, errorMessage?: string) => Promise<void>;
    register: (req: AuditRequest, userId: string, success: boolean, errorMessage?: string) => Promise<void>;
    passwordChange: (req: AuditRequest, success: boolean, errorMessage?: string) => Promise<void>;
    passwordReset: (req: AuditRequest, success: boolean, errorMessage?: string) => Promise<void>;
};
export declare const auditPayment: {
    paymentAttempt: (req: AuditRequest, orderId: string, amount: number, success: boolean, errorMessage?: string) => Promise<void>;
    refund: (req: AuditRequest, orderId: string, amount: number, success: boolean, errorMessage?: string) => Promise<void>;
};
export declare const auditBid: {
    placeBid: (req: AuditRequest, auctionId: string, amount: number, success: boolean, errorMessage?: string) => Promise<void>;
};
export {};
//# sourceMappingURL=auditLog.d.ts.map