import { Request, Response, NextFunction } from 'express';
interface CSRFRequest extends Request {
    csrfToken?: () => string;
}
export declare const generateCSRFToken: () => string;
export declare const verifyCSRFToken: (token: string, secret: string) => boolean;
export declare const csrfProtection: (req: CSRFRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const setupCSRF: (req: CSRFRequest, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=csrf.d.ts.map