import Stripe from 'stripe';
import { query, transaction } from '../db';
import { EscrowService } from './escrow.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export class PaymentService {
    /**
     * Create payment intent for order payments
     */
    static async createPaymentIntent(
        orderId: string,
        amount: number,
        userId: string,
        currency: string = 'usd'
    ): Promise<string> {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                metadata: {
                    orderId,
                    userId,
                    type: 'order_payment'
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            // Store payment intent in database
            await query(`
                INSERT INTO payment_intents (
                    id, order_id, amount, currency, status, 
                    payment_method_type, created_at
                )
                VALUES ($1, $2, $3, $4, $5, 'card', NOW())
                ON CONFLICT (id) DO UPDATE SET
                    status = EXCLUDED.status,
                    updated_at = NOW()
            `, [
                paymentIntent.id,
                orderId,
                amount,
                currency,
                paymentIntent.status
            ]);

            return paymentIntent.client_secret!;
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw new Error('Failed to create payment intent');
        }
    }

    /**
     * Confirm payment after successful payment
     */
    static async confirmPayment(orderId: string, paymentIntentId: string): Promise<void> {
        try {
            await transaction(async (client) => {
                // Update payment intent status
                await client.query(`
                    UPDATE payment_intents 
                    SET status = 'succeeded', updated_at = NOW()
                    WHERE id = $1
                `, [paymentIntentId]);

                // Update order status
                await client.query(`
                    UPDATE orders 
                    SET payment_status = 'completed', status = 'confirmed'
                    WHERE id = $1
                `, [orderId]);

                return { success: true };
            });
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw new Error('Failed to confirm payment');
        }
    }

    /**
     * Release escrow funds to seller
     */
    static async releaseEscrow(orderId: string): Promise<void> {
        try {
            await EscrowService.releaseEscrow(orderId, 'manual_release');
        } catch (error) {
            console.error('Error releasing escrow:', error);
            throw new Error('Failed to release escrow');
        }
    }

    /**
     * Process refund for cancelled orders
     */
    static async refundPayment(orderId: string, amount: number): Promise<void> {
        try {
            // Get payment intent for this order
            const paymentResult = await query(`
                SELECT id FROM payment_intents 
                WHERE order_id = $1 AND status = 'succeeded'
                LIMIT 1
            `, [orderId]);

            if (paymentResult.rows.length === 0) {
                throw new Error('No successful payment found for this order');
            }

            const paymentIntentId = paymentResult.rows[0].id;

            // Create refund via Stripe
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: Math.round(amount * 100), // Convert to cents
                reason: 'requested_by_customer',
                metadata: {
                    orderId,
                    reason: 'Order cancelled'
                }
            });

            // Update order status
            await transaction(async (client) => {
                await client.query(`
                    UPDATE orders 
                    SET status = 'refunded', refunded_at = NOW()
                    WHERE id = $1
                `, [orderId]);

                // Create refund record
                await client.query(`
                    INSERT INTO refunds (
                        id, order_id, amount, reason, status, 
                        processed_by, created_at
                    )
                    VALUES ($1, $2, $3, $4, $5, 'system', NOW())
                `, [
                    refund.id,
                    orderId,
                    amount,
                    'Order cancelled',
                    refund.status
                ]);

                return { success: true };
            });
        } catch (error) {
            console.error('Error refunding payment:', error);
            throw new Error('Failed to refund payment');
        }
    }

    /**
     * Create transaction log entry
     */
    static async createTransactionLog(
        userId: string,
        type: string,
        amount: number,
        status: string,
        referenceId: string,
        description: string
    ): Promise<void> {
        try {
            await query(`
                INSERT INTO transactions (
                    user_id, type, amount, status, reference_id, 
                    description, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
            `, [userId, type, amount, status, referenceId, description]);
        } catch (error) {
            console.error('Error creating transaction log:', error);
        }
    }

    /**
     * Get transaction logs for a user
     */
    static async getTransactionLogs(
        userId: string,
        limit: number = 50,
        offset: number = 0,
        type?: string
    ) {
        try {
            let whereClause = 'WHERE user_id = $1';
            const params = [userId];

            if (type) {
                whereClause += ' AND type = $2';
                params.push(type);
            }

            const transactions = await query(`
                SELECT * FROM transactions 
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT $${params.length + 1} OFFSET $${params.length + 2}
            `, [...params, limit, offset]);

            return transactions.rows;
        } catch (error) {
            console.error('Error fetching transaction logs:', error);
            throw new Error('Failed to fetch transaction logs');
        }
    }

    /**
     * Webhook handler for payment status updates
     */
    static async handlePaymentWebhook(event: any): Promise<void> {
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailure(event.data.object);
                    break;
                case 'refund.created':
                    await this.handleRefundCreated(event.data.object);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
        } catch (error) {
            console.error('Error handling payment webhook:', error);
        }
    }

    private static async handlePaymentSuccess(paymentIntent: any): Promise<void> {
        const orderId = paymentIntent.metadata.orderId;

        await transaction(async (client) => {
            // Update payment intent status
            await client.query(`
                UPDATE payment_intents 
                SET status = 'succeeded', updated_at = NOW()
                WHERE id = $1
            `, [paymentIntent.id]);

            // Get order details
            const order = await client.query(`
                SELECT * FROM orders WHERE id = $1
            `, [orderId]);

            if (order.rows.length > 0) {
                const orderData = order.rows[0];

                // Create escrow
                await EscrowService.createEscrow(
                    orderId,
                    orderData.buyer_id,
                    orderData.seller_id,
                    orderData.total_amount,
                    paymentIntent.id
                );

                // Create transaction log
                await this.createTransactionLog(
                    orderData.buyer_id,
                    'payment_success',
                    orderData.total_amount,
                    'completed',
                    orderId,
                    'Payment successful'
                );
            }

            return { success: true };
        });
    }

    private static async handlePaymentFailure(paymentIntent: any): Promise<void> {
        const orderId = paymentIntent.metadata.orderId;

        await transaction(async (client) => {
            // Update payment intent status
            await client.query(`
                UPDATE payment_intents 
                SET status = 'failed', updated_at = NOW()
                WHERE id = $1
            `, [paymentIntent.id]);

            // Update order status
            await client.query(`
                UPDATE orders 
                SET status = 'payment_failed'
                WHERE id = $1
            `, [orderId]);

            return { success: true };
        });
    }

    private static async handleRefundCreated(refund: any): Promise<void> {
        // Update refund status in database
        await query(`
            UPDATE refunds 
            SET status = $1, updated_at = NOW()
            WHERE id = $2
        `, [refund.status, refund.id]);
    }
    /**
     * Process UPI payment (stub implementation)
     */
    static async processUPIPayment(
        orderId: string,
        amount: number,
        upiId: string,
        userId: string
    ) {
        // Stub implementation - would integrate with UPI gateway
        return {
            paymentId: `upi_${Date.now()}`,
            status: 'processing',
            redirectUrl: `upi://pay?pa=${upiId}&am=${amount}`,
            message: 'UPI payment initiated'
        };
    }

    /**
     * Process Net Banking payment (stub implementation)
     */
    static async processNetBankingPayment(
        orderId: string,
        amount: number,
        bankCode: string,
        userId: string
    ) {
        // Stub implementation - would integrate with banking gateway
        return {
            paymentId: `nb_${Date.now()}`,
            status: 'initiated',
            redirectUrl: `https://netbanking.${bankCode}.com/payment`,
            message: 'Net banking payment initiated'
        };
    }

    /**
     * Top up wallet (stub implementation)
     */
    static async topUpWallet(
        userId: string,
        amount: number,
        paymentMethod: string,
        paymentDetails: any
    ) {
        // Stub implementation
        return {
            success: true,
            transactionId: `wallet_${Date.now()}`,
            message: 'Wallet top-up successful'
        };
    }

    /**
     * Top up gas wallet (stub implementation)
     */
    static async topUpGasWallet(
        sellerId: string,
        amount: number,
        paymentMethod: string,
        paymentDetails: any
    ) {
        // Stub implementation
        return {
            success: true,
            transactionId: `gas_${Date.now()}`,
            message: 'Gas wallet top-up successful'
        };
    }

    /**
     * Process refund (alias for refundPayment)
     */
    static async processRefund(
        orderId: string,
        amount: number,
        reason: string,
        adminId?: string
    ) {
        return this.refundPayment(orderId, amount);
    }

    /**
     * Auto-release payment on delivery
     */
    static async autoReleaseOnDelivery(orderId: string) {
        return this.releaseEscrow(orderId);
    }
}