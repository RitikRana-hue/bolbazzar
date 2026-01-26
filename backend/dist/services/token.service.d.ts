interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}
interface RefreshTokenData {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
}
export declare class TokenService {
    static generateAccessToken(payload: TokenPayload): string;
    static generateRefreshToken(): string;
    static storeRefreshToken(userId: string, token: string): Promise<void>;
    static validateRefreshToken(token: string): Promise<RefreshTokenData | null>;
    static revokeRefreshToken(token: string): Promise<void>;
    static revokeAllUserTokens(userId: string): Promise<void>;
    static cleanupExpiredTokens(): Promise<void>;
    static verifyAccessToken(token: string): TokenPayload | null;
    static generateTokenPair(payload: TokenPayload): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    static refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null>;
}
export {};
//# sourceMappingURL=token.service.d.ts.map