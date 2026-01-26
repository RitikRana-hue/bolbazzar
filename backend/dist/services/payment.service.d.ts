export declare class PaymentService {
    static createPayment(paymentData: {
        orderId: string;
        amount: number;
        currency: string;
        method: string;
        status: string;
    }): Promise<any>;
    static updatePaymentStatus(paymentId: string, status: string): Promise<any>;
    static getPaymentById(paymentId: string): Promise<any>;
    static getPaymentsByOrderId(orderId: string): Promise<any>;
    static createPaymentIntent(orderId: string, amount: number, currency: string, userId: string, idempotencyKey?: string): Promise<{
        clientSecret: string;
    }>;
    static confirmPayment(orderId: string, paymentIntentId: string): Promise<any>;
    static releaseEscrow(orderId: string, reason?: string): Promise<any>;
    static refundPayment(orderId: string, amount: number): Promise<any>;
    static getPaymentStatus(orderId: string): Promise<any>;
    static processRefund(orderId: string, amount: number, reason?: string): Promise<any>;
    static getTransactionHistory(userId: string): Promise<any>;
    static handleWebhookEvent(event: any): Promise<{
        received: boolean;
    }>;
}
//# sourceMappingURL=payment.service.d.ts.map