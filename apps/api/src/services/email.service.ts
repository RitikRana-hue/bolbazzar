import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

interface EmailVerificationData {
    name: string;
    verificationUrl: string;
}

interface PasswordResetData {
    name: string;
    resetUrl: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendVerificationEmail(email: string, data: EmailVerificationData): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
                    <h1>Welcome to InstaSell!</h1>
                </div>
                <div style="padding: 30px 20px; background: #f9fafb;">
                    <h2>Hi ${data.name},</h2>
                    <p>Thank you for signing up! Please verify your email address:</p>
                    <p style="text-align: center;">
                        <a href="${data.verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a>
                    </p>
                    <p>Link: ${data.verificationUrl}</p>
                </div>
            </div>
        `;

        await this.transporter.sendMail({
            from: `"InstaSell" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Verify Your Email - InstaSell',
            html,
        });
    }

    async sendPasswordResetEmail(email: string, data: PasswordResetData): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
                    <h1>Password Reset</h1>
                </div>
                <div style="padding: 30px 20px; background: #f9fafb;">
                    <h2>Hi ${data.name},</h2>
                    <p>Click the button below to reset your password:</p>
                    <p style="text-align: center;">
                        <a href="${data.resetUrl}" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
                    </p>
                    <p>Link: ${data.resetUrl}</p>
                </div>
            </div>
        `;

        await this.transporter.sendMail({
            from: `"InstaSell" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Reset Your Password - InstaSell',
            html,
        });
    }
}

const emailService = new EmailService();
export default emailService;