import { query, transaction } from '../db';
import { createNotification } from '../routes/notifications';

const ESCROW_HOLD_DAYS = parseInt(process.env.ESCROW_HOLD_DAYS || '7');

export class EscrowService {
    /**
     * Create escrow entry when buyer makes payment
     */
    static async createEscrow(
        orderId: string,
        buyerId: string,
        sellerId: string,
        amount: number,
        paymentIntentId: string
    ) {
        return await transaction(async (client) => {
            // Create escrow record
            const escrow = await client.query(`
                INSERT INTO escrows (
                    order_id, buyer_id, seller_id, amount, 
                    payment_intent_id, status, created_at, 
                    release_date, can_compound
                )
                VALUES ($1, $2, $3, $4, $5, 'holding', NOW(), 
                        NOW() + INTERVAL '${ESCROW_HOLD_DAYS} days', true)
                RETURNING *
            `, [orderId, buyerId, sellerId, amount, paymentIntentId]);

            // Update order status
            await client.query(`
                UPDATE orders 
                SET status = 'paid', escrow_id = $1, paid_at = NOW()
                WHERE id = $2
            `, [escrow.rows[0].id, orderId]);

            // Create transaction record
            await client.query(`
                INSERT INTO transactions (
                    user_id, type, amount, status, reference_id, 
                    description, created_at
                )
                VALUES ($1, 'escrow_hold', $2, 'completed', $3, 
                        'Payment held in escrow', NOW())
            `, [buyerId, amount, orderId]);

            // Notify seller about payment
            await createNotification(
                sellerId,
                'payment',
                'Payment Received',
                `Payment of $${amount.toFixed(2)} is being held in escrow for order #${orderId}`,
                `/account/orders/${orderId}`,
                { orderId, amount }
            );

            return escrow.rows[0];
        });
    }

    /**
     * Release escrow funds to seller
     */
    static async releaseEscrow(escrowId: string, reason: 'delivery_confirmed' | 'auto_release' | 'manual_release') {
        return await transaction(async (client) => {
            // Get escrow details
            const escrowResult = await client.query(`
                SELECT e.*, o.id as order_id 
                FROM escrows e
                JOIN orders o ON o.id = e.order_id
                WHERE e.id = $1 AND e.status = 'holding'
                FOR UPDATE
            `, [escrowId]);

            if (escrowResult.rows.length === 0) {
                throw new Error('Escrow not found or already released');
            }

            const escrow = escrowResult.rows[0];

            // Release escrow
            await client.query(`
                UPDATE escrows 
                SET status = 'released', released_at = NOW(), release_reason = $1
                WHERE id = $2
            `, [reason, escrowId]);

            // Add to seller's available balance
            await client.query(`
                INSERT INTO wallets (user_id, balance, available_balance, created_at)
                VALUES ($1, 0, 0, NOW())
                ON CONFLICT (user_id) DO NOTHING
            `, [escrow.seller_id]);

            await client.query(`
                UPDATE wallets 
                SET available_balance = available_balance + $1,
                    updated_at = NOW()
                WHERE user_id = $2
            `, [escrow.amount, escrow.seller_id]);

            // Create transaction record for seller
            await client.query(`
                INSERT INTO transactions (
                    user_id, type, amount, status, reference_id, 
                    description, created_at
                )
                VALUES ($1, 'escrow_release', $2, 'completed', $3, 
                        'Escrow funds released', NOW())
            `, [escrow.seller_id, escrow.amount, escrow.order_id]);

            // Update order status
            await client.query(`
                UPDATE orders 
                SET status = 'completed', escrow_released_at = NOW()
                WHERE id = $1
            `, [escrow.order_id]);

            // Notify seller
            await createNotification(
                escrow.seller_id,
                'payment',
                'Funds Released',
                `$${escrow.amount.toFixed(2)} has been released to your account`,
                `/account/wallet`,
                { orderId: escrow.order_id, amount: escrow.amount }
            );

            return escrow;
        });
    }

    /**
     * Auto-release escrows that have passed the holding period
     */
    static async autoReleaseExpiredEscrows() {
        const expiredEscrows = await query(`
            SELECT id FROM escrows 
            WHERE status = 'holding' 
            AND release_date <= NOW()
            AND can_compound = true
        `);

        const results = [];
        for (const escrow of expiredEscrows.rows) {
            try {
                const released = await this.releaseEscrow(escrow.id, 'auto_release');
                results.push(released);
            } catch (error) {
                console.error(`Failed to auto-release escrow ${escrow.id}:`, error);
            }
        }

        return results;
    }

    /**
     * Get platform's total holding funds (for compounding)
     */
    static async getPlatformHoldingFunds() {
        const result = await query(`
            SELECT 
                COUNT(*) as total_escrows,
                SUM(amount) as total_holding,
                AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400) as avg_hold_days
            FROM escrows 
            WHERE status = 'holding' AND can_compound = true
        `);

        return result.rows[0];
    }

    /**
     * Seller manual withdrawal request
     */
    static async requestWithdrawal(sellerId: string, amount: number, method: 'bank' | 'upi' | 'card') {
        return await transaction(async (client) => {
            // Check available balance
            const wallet = await client.query(`
                SELECT available_balance FROM wallets WHERE user_id = $1
            `, [sellerId]);

            if (!wallet.rows[0] || wallet.rows[0].available_balance < amount) {
                throw new Error('Insufficient available balance');
            }

            // Create withdrawal request
            const withdrawal = await client.query(`
                INSERT INTO withdrawals (
                    user_id, amount, method, status, requested_at
                )
                VALUES ($1, $2, $3, 'pending', NOW())
                RETURNING *
            `, [sellerId, amount, method]);

            // Deduct from available balance (hold for processing)
            await client.query(`
                UPDATE wallets 
                SET available_balance = available_balance - $1,
                    pending_withdrawal = pending_withdrawal + $1,
                    updated_at = NOW()
                WHERE user_id = $2
            `, [amount, sellerId]);

            // Create transaction record
            await client.query(`
                INSERT INTO transactions (
                    user_id, type, amount, status, reference_id, 
                    description, created_at
                )
                VALUES ($1, 'withdrawal_request', $2, 'pending', $3, 
                        'Withdrawal request submitted', NOW())
            `, [sellerId, amount, withdrawal.rows[0].id]);

            return withdrawal.rows[0];
        });
    }

    /**
     * Process withdrawal (admin action)
     */
    static async processWithdrawal(withdrawalId: string, status: 'approved' | 'rejected', adminNotes?: string) {
        return await transaction(async (client) => {
            const withdrawal = await client.query(`
                SELECT * FROM withdrawals WHERE id = $1 AND status = 'pending'
                FOR UPDATE
            `, [withdrawalId]);

            if (withdrawal.rows.length === 0) {
                throw new Error('Withdrawal not found or already processed');
            }

            const w = withdrawal.rows[0];

            if (status === 'approved') {
                // Update withdrawal status
                await client.query(`
                    UPDATE withdrawals 
                    SET status = 'approved', processed_at = NOW(), admin_notes = $1
                    WHERE id = $2
                `, [adminNotes, withdrawalId]);

                // Remove from pending
                await client.query(`
                    UPDATE wallets 
                    SET pending_withdrawal = pending_withdrawal - $1,
                        updated_at = NOW()
                    WHERE user_id = $2
                `, [w.amount, w.user_id]);

                // Update transaction
                await client.query(`
                    UPDATE transactions 
                    SET status = 'completed', updated_at = NOW()
                    WHERE reference_id = $1 AND type = 'withdrawal_request'
                `, [withdrawalId]);

            } else {
                // Rejected - return to available balance
                await client.query(`
                    UPDATE withdrawals 
                    SET status = 'rejected', processed_at = NOW(), admin_notes = $1
                    WHERE id = $2
                `, [adminNotes, withdrawalId]);

                await client.query(`
                    UPDATE wallets 
                    SET available_balance = available_balance + $1,
                        pending_withdrawal = pending_withdrawal - $1,
                        updated_at = NOW()
                    WHERE user_id = $2
                `, [w.amount, w.user_id]);

                // Update transaction
                await client.query(`
                    UPDATE transactions 
                    SET status = 'failed', updated_at = NOW()
                    WHERE reference_id = $1 AND type = 'withdrawal_request'
                `, [withdrawalId]);
            }

            // Notify seller
            await createNotification(
                w.user_id,
                'payment',
                `Withdrawal ${status}`,
                status === 'approved'
                    ? `Your withdrawal of $${w.amount.toFixed(2)} has been processed`
                    : `Your withdrawal request was rejected: ${adminNotes}`,
                `/account/wallet`
            );

            return withdrawal.rows[0];
        });
    }

    /**
     * Lock funds when dispute is raised
     */
    static async lockFundsForDispute(orderId: string, disputeId: string) {
        return await transaction(async (client) => {
            // Update escrow status
            await client.query(`
                UPDATE escrows 
                SET status = 'disputed', dispute_id = $1, updated_at = NOW()
                WHERE order_id = $2 AND status = 'holding'
            `, [disputeId, orderId]);

            // Get order details for notification
            const order = await client.query(`
                SELECT o.*, e.seller_id, e.amount 
                FROM orders o
                JOIN escrows e ON e.order_id = o.id
                WHERE o.id = $1
            `, [orderId]);

            if (order.rows.length > 0) {
                const o = order.rows[0];

                // Notify seller about locked funds
                await createNotification(
                    o.seller_id,
                    'dispute',
                    'Funds Locked',
                    `Funds for order #${orderId} have been locked due to a dispute`,
                    `/account/disputes`,
                    { orderId, amount: o.amount }
                );
            }
        });
    }
}