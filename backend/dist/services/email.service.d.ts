interface EmailVerificationData {
    name: string;
    verificationUrl: string;
}
interface PasswordResetData {
    name: string;
    resetUrl: string;
}
declare class EmailService {
    private transporter;
    constructor();
    sendVerificationEmail(email: string, data: EmailVerificationData): Promise<void>;
    sendPasswordResetEmail(email: string, data: PasswordResetData): Promise<void>;
}
declare const emailService: EmailService;
export default emailService;
//# sourceMappingURL=email.service.d.ts.map