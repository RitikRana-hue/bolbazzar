import { query, transaction } from '../db';
import { AppError } from '../utils/error';

export class PaymentService {
    static async createPayment(paymentData: {
        orderId: string;
        amount: number;
        currency: string;
        method: string;
        status: string;
    }) {
        try {
            const result = await query(
                `INSERT INTO payments (order_id, amount, currency, method, status, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 RETURNING *`,
                [paymentData.orderId, paymentData.amount, paymentData.currency, paymentData.method, paymentData.status]
            );
            return result.rows[0];
        } catch (error) {
            throw new AppError('Failed to create payment', 500);
        }
    }

    static async updatePaymentStatus(paymentId: string, status: string) {
        try {
            const result = await query(
                `UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
                [status, paymentId]
            );
            return result.rows[0];
        } catch (error) {
            throw new AppError('Failed to update payment status', 500);
        }
    }

    static async getPaymentById(paymentId: string) {
        try {
            const result = await query('SELECT * FROM payments WHERE id = $1', [paymentId]);
            return result.rows[0];
        } catch (error) {
            throw new AppError('Failed to get payment', 500);
        }
    }

    static async getPaymentsByOrderId(orderId: string) {
        try {
            const result = await query('SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC', [orderId]);
            return result.rows;
        } catch (error) {
            throw new AppError('Failed to get payments', 500);
        }
    }

    static async createPaymentIntent(orderId: string, amount: number, currency: string, userId: string, idempotencyKey?: string) {
        try {
            // This would integrate with Stripe in production
            const result = await query(
                `INSERT INTO payment_intents (order_id, amount, buyer_id, status, created_at)
                 VALUES ($1, $2, $3, 'pending', NOW())
                 RETURNING *`,
                [orderId, amount, userId]
            );
            return { clientSecret: `pi_test_${result.rows[0].id}` };
        } catch (error) {
            throw new AppError('Failed to create payment intent', 500);
        }
    }

    static async confirmPayment(orderId: string, paymentIntentId: string) {
        try {
            const result = await query(
                `UPDATE payment_intents SET status = 'succeeded', payment_intent_id = $1 
                 WHERE order_id = $2 RETURNING *`,
                [paymentIntentId, orderId]
            );
            return result.rows[0];
        } catch (error) {
            throw new AppError('Failed to confirm payment', 500);
        }
    }

    static async releaseEscrow(orderId: string, reason?: string) {
        try {
            const result = await query(
                `UPDATE payment_intents SET status = 'released', released_at = NOW(), release_reason = $1 
                 WHERE order_id = $2 RETURNING *`,
                [reason || 'Order completed', orderId]
            );
            return result.rows[0];
        } catch (error) {
            throw new AppError('Failed to release escrow', 500);
        }
    }

    static async refundPayment(orderId: string, amount: number) {
        try {
            const result = await query(
                `INSERT INTO refunds (order_id, amount, status, created_at)
                 VALUES ($1, $2, 'processing', NOW())
                 RETURNING *`,
                [orderId, amount]
            );
            return result.rows[0];
        } catch (error) {
            throw new AppError('Failed to process refund', 500);
        }
    }

    static async getPaymentStatus(orderId: string) {
        try {
            const result = await query('SELECT status FROM payment_intents WHERE order_id = $1', [orderId]);
            return result.rows[0]?.status || 'pending';
        } catch (error) {
            throw new AppError('Failed to get payment status', 500);
        }
    }

    static async processRefund(orderId: string, amount: number, reason?: string) {
        try {
            const result = await query(
                `INSERT INTO refunds (order_id, amount, reason, status, created_at)
                 VALUES ($1, $2, $3, 'processing', NOW())
                 RETURNING *`,
                [orderId, amount, reason || 'Customer request']
            );
            return result.rows[0];
        } catch (error) {
            throw new AppError('Failed to process refund', 500);
        }
    }

    static async getTransactionHistory(userId: string) {
        try {
            const result = await query(
                `SELECT p.*, o.buyer_id, o.seller_id 
                 FROM payments p 
                 JOIN orders o ON p.order_id = o.id 
                 WHERE o.buyer_id = $1 OR o.seller_id = $1 
                 ORDER BY p.created_at DESC`,
                [userId]
            );
            return result.rows;
        } catch (error) {
            throw new AppError('Failed to get transaction history', 500);
        }
    }

    static async handleWebhookEvent(event: any) {
        try {
            // Handle Stripe webhook events
            console.log('Processing webhook event:', event.type);
            return { received: true };
        } catch (error) {
            throw new AppError('Failed to handle webhook event', 500);
        }
    }
}