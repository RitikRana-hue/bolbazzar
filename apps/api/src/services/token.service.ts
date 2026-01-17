import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db';
import config from '../config';

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

export class TokenService {
    static generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
            issuer: config.jwt.issuer,
            audience: config.jwt.audience
        } as jwt.SignOptions);
    }

    static generateRefreshToken(): string {
        return crypto.randomBytes(64).toString('hex');
    }

    static async storeRefreshToken(userId: string, token: string): Promise<void> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        await query(`
            INSERT INTO refresh_tokens (userId, token, expiresAt)
            VALUES ($1, $2, $3)
        `, [userId, token, expiresAt]);
    }

    static async validateRefreshToken(token: string): Promise<RefreshTokenData | null> {
        const result = await query(`
            SELECT * FROM refresh_tokens 
            WHERE token = $1 AND expiresAt > NOW() AND isRevoked = false
        `, [token]);

        return result.rows[0] || null;
    }

    static async revokeRefreshToken(token: string): Promise<void> {
        await query(`
            UPDATE refresh_tokens 
            SET isRevoked = true, revokedAt = NOW()
            WHERE token = $1
        `, [token]);
    }

    static async revokeAllUserTokens(userId: string): Promise<void> {
        await query(`
            UPDATE refresh_tokens 
            SET isRevoked = true, revokedAt = NOW()
            WHERE userId = $1 AND isRevoked = false
        `, [userId]);
    }

    static async cleanupExpiredTokens(): Promise<void> {
        await query(`
            DELETE FROM refresh_tokens 
            WHERE expiresAt < NOW() OR (isRevoked = true AND revokedAt < NOW() - INTERVAL '7 days')
        `);
    }

    static verifyAccessToken(token: string): TokenPayload | null {
        try {
            return jwt.verify(token, config.jwt.secret, {
                issuer: config.jwt.issuer,
                audience: config.jwt.audience
            } as jwt.VerifyOptions) as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    static async generateTokenPair(payload: TokenPayload): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken();

        await this.storeRefreshToken(payload.userId, refreshToken);

        return { accessToken, refreshToken };
    }

    static async refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null> {
        const tokenData = await this.validateRefreshToken(refreshToken);
        if (!tokenData) {
            return null;
        }

        // Get user data
        const userResult = await query(`
            SELECT id, email, role FROM users WHERE id = $1 AND isActive = true
        `, [tokenData.userId]);

        if (userResult.rows.length === 0) {
            return null;
        }

        const user = userResult.rows[0];

        // Revoke old refresh token
        await this.revokeRefreshToken(refreshToken);

        // Generate new token pair
        return this.generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role
        });
    }
}