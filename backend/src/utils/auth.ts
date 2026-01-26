import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'instasell-api',
        audience: 'instasell-web'
    } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'instasell-api',
        audience: 'instasell-web'
    } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'instasell-api',
            audience: 'instasell-web'
        }) as any;

        return {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

export const generateRandomToken = (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
};

export const hashPassword = async (password: string): Promise<string> => {
    const bcrypt = await import('bcryptjs');
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
};

export const generateEmailVerificationToken = (): string => {
    return generateRandomToken(32);
};

export const generatePasswordResetToken = (): string => {
    return generateRandomToken(32);
};