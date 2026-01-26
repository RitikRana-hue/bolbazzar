"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../db");
const config_1 = __importDefault(require("../config"));
class TokenService {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.secret, {
            expiresIn: config_1.default.jwt.expiresIn,
            issuer: config_1.default.jwt.issuer,
            audience: config_1.default.jwt.audience
        });
    }
    static generateRefreshToken() {
        return crypto_1.default.randomBytes(64).toString('hex');
    }
    static async storeRefreshToken(userId, token) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
        await (0, db_1.query)(`
            INSERT INTO refresh_tokens (userId, token, expiresAt)
            VALUES ($1, $2, $3)
        `, [userId, token, expiresAt]);
    }
    static async validateRefreshToken(token) {
        const result = await (0, db_1.query)(`
            SELECT * FROM refresh_tokens 
            WHERE token = $1 AND expiresAt > NOW() AND isRevoked = false
        `, [token]);
        return result.rows[0] || null;
    }
    static async revokeRefreshToken(token) {
        await (0, db_1.query)(`
            UPDATE refresh_tokens 
            SET isRevoked = true, revokedAt = NOW()
            WHERE token = $1
        `, [token]);
    }
    static async revokeAllUserTokens(userId) {
        await (0, db_1.query)(`
            UPDATE refresh_tokens 
            SET isRevoked = true, revokedAt = NOW()
            WHERE userId = $1 AND isRevoked = false
        `, [userId]);
    }
    static async cleanupExpiredTokens() {
        await (0, db_1.query)(`
            DELETE FROM refresh_tokens 
            WHERE expiresAt < NOW() OR (isRevoked = true AND revokedAt < NOW() - INTERVAL '7 days')
        `);
    }
    static verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret, {
                issuer: config_1.default.jwt.issuer,
                audience: config_1.default.jwt.audience
            });
        }
        catch (error) {
            return null;
        }
    }
    static async generateTokenPair(payload) {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken();
        await this.storeRefreshToken(payload.userId, refreshToken);
        return { accessToken, refreshToken };
    }
    static async refreshTokens(refreshToken) {
        const tokenData = await this.validateRefreshToken(refreshToken);
        if (!tokenData) {
            return null;
        }
        // Get user data
        const userResult = await (0, db_1.query)(`
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
exports.TokenService = TokenService;
//# sourceMappingURL=token.service.js.map