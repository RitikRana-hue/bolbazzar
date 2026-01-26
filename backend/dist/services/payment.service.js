"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const db_1 = require("../db");
const error_1 = require("../utils/error");
class PaymentService {
    static async createPayment(paymentData) {
        try {
            const result = await (0, db_1.query)(`INSERT INTO payments (order_id, amount, currency, method, status, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 RETURNING *`, [paymentData.orderId, paymentData.amount, paymentData.currency, paymentData.method, paymentData.status]);
            return result.rows[0];
        }
        catch (error) {
            throw new error_1.AppError('Failed to create payment', 500);
        }
    }
    static async updatePaymentStatus(paymentId, status) {
        try {
            const result = await (0, db_1.query)(`UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [status, paymentId]);
            return result.rows[0];
        }
        catch (error) {
            throw new error_1.AppError('Failed to update payment status', 500);
        }
    }
    static async getPaymentById(paymentId) {
        try {
            const result = await (0, db_1.query)('SELECT * FROM payments WHERE id = $1', [paymentId]);
            return result.rows[0];
        }
        catch (error) {
            throw new error_1.AppError('Failed to get payment', 500);
        }
    }
    static async getPaymentsByOrderId(orderId) {
        try {
            const result = await (0, db_1.query)('SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC', [orderId]);
            return result.rows;
        }
        catch (error) {
            throw new error_1.AppError('Failed to get payments', 500);
        }
    }
    static async createPaymentIntent(orderId, amount, currency, userId, idempotencyKey) {
        try {
            // This would integrate with Stripe in production
            const result = await (0, db_1.query)(`INSERT INTO payment_intents (order_id, amount, buyer_id, status, created_at)
                 VALUES ($1, $2, $3, 'pending', NOW())
                 RETURNING *`, [orderId, amount, userId]);
            return { clientSecret: `pi_test_${result.rows[0].id}` };
        }
        catch (error) {
            throw new error_1.AppError('Failed to create payment intent', 500);
        }
    }
    static async confirmPayment(orderId, paymentIntentId) {
        try {
            const result = await (0, db_1.query)(`UPDATE payment_intents SET status = 'succeeded', payment_intent_id = $1 
                 WHERE order_id = $2 RETURNING *`, [paymentIntentId, orderId]);
            return result.rows[0];
        }
        catch (error) {
            throw new error_1.AppError('Failed to confirm payment', 500);
        }
    }
    static async releaseEscrow(orderId, reason) {
        try {
            const result = await (0, db_1.query)(`UPDATE payment_intents SET status = 'released', released_at = NOW(), release_reason = $1 
                 WHERE order_id = $2 RETURNING *`, [reason || 'Order completed', orderId]);
            return result.rows[0];
        }
        catch (error) {
            throw new error_1.AppError('Failed to release escrow', 500);
        }
    }
    static async refundPayment(orderId, amount) {
        try {
            const result = await (0, db_1.query)(`INSERT INTO refunds (order_id, amount, status, created_at)
                 VALUES ($1, $2, 'processing', NOW())
                 RETURNING *`, [orderId, amount]);
            return result.rows[0];
        }
        catch (error) {
            throw new error_1.AppError('Failed to process refund', 500);
        }
    }
    static async getPaymentStatus(orderId) {
        try {
            const result = await (0, db_1.query)('SELECT status FROM payment_intents WHERE order_id = $1', [orderId]);
            return result.rows[0]?.status || 'pending';
        }
        catch (error) {
            throw new error_1.AppError('Failed to get payment status', 500);
        }
    }
    static async processRefund(orderId, amount, reason) {
        try {
            const result = await (0, db_1.query)(`INSERT INTO refunds (order_id, amount, reason, status, created_at)
                 VALUES ($1, $2, $3, 'processing', NOW())
                 RETURNING *`, [orderId, amount, reason || 'Customer request']);
            return result.rows[0];
        }
        catch (error) {
            throw new error_1.AppError('Failed to process refund', 500);
        }
    }
    static async getTransactionHistory(userId) {
        try {
            const result = await (0, db_1.query)(`SELECT p.*, o.buyer_id, o.seller_id 
                 FROM payments p 
                 JOIN orders o ON p.order_id = o.id 
                 WHERE o.buyer_id = $1 OR o.seller_id = $1 
                 ORDER BY p.created_at DESC`, [userId]);
            return result.rows;
        }
        catch (error) {
            throw new error_1.AppError('Failed to get transaction history', 500);
        }
    }
    static async handleWebhookEvent(event) {
        try {
            // Handle Stripe webhook events
            console.log('Processing webhook event:', event.type);
            return { received: true };
        }
        catch (error) {
            throw new error_1.AppError('Failed to handle webhook event', 500);
        }
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map