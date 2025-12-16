import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, transaction } from '../db';
// Email service stub functions
const sendVerificationEmail = async (email: string, data: { name: string; verificationUrl: string }) => {
    console.log(`Verification email would be sent to ${email} with URL: ${data.verificationUrl}`);
};

const sendPasswordResetEmail = async (email: string, data: { name: string; resetUrl: string }) => {
    console.log(`Password reset email would be sent to ${email} with URL: ${data.resetUrl}`);
};
import { generateToken, verifyToken, generateRandomToken, generatePasswordResetToken } from '../utils/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, username, password, role = 'buyer' } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate email verification token
        const emailVerifyToken = generateRandomToken(32);

        // Create user
        const result = await transaction(async (client) => {
            const user = await client.query(`
                INSERT INTO users (email, username, password, role, emailVerifyToken)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, email, username, role, isEmailVerified, createdAt
            `, [email, username, hashedPassword, role, emailVerifyToken]);

            // Create user profile
            await client.query(`
                INSERT INTO user_profiles (userId)
                VALUES ($1)
            `, [user.rows[0].id]);

            // Create wallet for all users
            await client.query(`
                INSERT INTO wallets (userId)
                VALUES ($1)
            `, [user.rows[0].id]);

            // Create gas wallet for sellers
            if (role === 'seller') {
                await client.query(`
                    INSERT INTO gas_wallets (userId)
                    VALUES ($1)
                `, [user.rows[0].id]);
            }

            return user.rows[0];
        });

        // Send verification email
        await sendVerificationEmail(email, {
            name: username || email,
            verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`
        });

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            user: result
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user
        const result = await query(`
            SELECT u.*, up.firstName, up.lastName, up.avatar
            FROM users u
            LEFT JOIN user_profiles up ON up.userId = u.id
            WHERE u.email = $1 AND u.isActive = true
        `, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await query(
            'UPDATE users SET lastLoginAt = NOW() WHERE id = $1',
            [user.id]
        );

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Remove password from response
        delete user.password;

        res.json({
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify email
router.post('/verify-email', async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }

        // Verify token
        const decoded = verifyToken(token) as any;
        if (!decoded || !decoded.email) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Update user
        const result = await query(`
            UPDATE users 
            SET isEmailVerified = true, emailVerifyToken = NULL
            WHERE email = $1 AND emailVerifyToken = $2
            RETURNING id, email, isEmailVerified
        `, [decoded.email, token]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        res.json({
            message: 'Email verified successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Email verification failed' });
    }
});

// Forgot password
router.post('/forgot-password', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user exists
        const user = await query(
            'SELECT id, email, username FROM users WHERE email = $1 AND isActive = true',
            [email]
        );

        if (user.rows.length === 0) {
            // Don't reveal if email exists or not
            return res.json({ message: 'If the email exists, a reset link has been sent' });
        }

        // Generate reset token
        const resetToken = generatePasswordResetToken();

        // Save reset token
        await query(
            'UPDATE users SET resetPasswordToken = $1 WHERE id = $2',
            [resetToken, user.rows[0].id]
        );

        // Send reset email
        await sendPasswordResetEmail(email, {
            name: user.rows[0].username || email,
            resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        });

        res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Reset password
router.post('/reset-password', async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Verify token
        const decoded = verifyToken(token) as any;
        if (!decoded || !decoded.userId) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Get user with reset token
        const user = await query(
            'SELECT id FROM users WHERE id = $1 AND resetPasswordToken = $2',
            [decoded.userId, token]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password and clear reset token
        await query(`
            UPDATE users 
            SET password = $1, resetPasswordToken = NULL
            WHERE id = $2
        `, [hashedPassword, decoded.userId]);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    }
});

// Change password (authenticated)
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Get current password
        const user = await query(
            'SELECT password FROM users WHERE id = $1',
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, userId]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Password change failed' });
    }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const result = await query(`
            SELECT 
                u.id, u.email, u.username, u.role, u.isEmailVerified, u.isActive, u.createdAt,
                up.firstName, up.lastName, up.phone, up.avatar, up.bio, up.location,
                w.balance, w.availableBalance,
                gw.balance as gasBalance
            FROM users u
            LEFT JOIN user_profiles up ON up.userId = u.id
            LEFT JOIN wallets w ON w.userId = u.id
            LEFT JOIN gas_wallets gw ON gw.userId = u.id
            WHERE u.id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const {
            firstName,
            lastName,
            phone,
            bio,
            location,
            website,
            dateOfBirth,
            gender
        } = req.body;

        const result = await query(`
            UPDATE user_profiles 
            SET 
                firstName = COALESCE($1, firstName),
                lastName = COALESCE($2, lastName),
                phone = COALESCE($3, phone),
                bio = COALESCE($4, bio),
                location = COALESCE($5, location),
                website = COALESCE($6, website),
                dateOfBirth = COALESCE($7, dateOfBirth),
                gender = COALESCE($8, gender),
                updatedAt = NOW()
            WHERE userId = $9
            RETURNING *
        `, [firstName, lastName, phone, bio, location, website, dateOfBirth, gender, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            profile: result.rows[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Profile update failed' });
    }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', async (req: Request, res: Response) => {
    try {
        // In a more sophisticated setup, you might want to blacklist the token
        // For now, we just acknowledge the logout
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

export default router;