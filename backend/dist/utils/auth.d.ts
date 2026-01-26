export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}
export declare const generateToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export declare const generateRandomToken: (length?: number) => string;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const generateEmailVerificationToken: () => string;
export declare const generatePasswordResetToken: () => string;
//# sourceMappingURL=auth.d.ts.map