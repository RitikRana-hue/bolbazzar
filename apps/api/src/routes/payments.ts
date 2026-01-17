import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { ReconciliationService } from '../services/reconciliation.service';
import { StripeService } from '../services/stripe.service';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { createPaymentIntentSchema, processPaymentSchema, idSchema } from '../validation/schemas';
import { paymentLimiter } from '../middleware/rateLimiting';
import { auditPayment } from '../middleware/auditLog';
import crypto from 'crypto';
import config from '../config';

const router = Router();

// Apply authentication to all payment routes
router.use(authenticateToken);

// Create payment intent for order
router.post('/create-intent', paymentLimiter, validateBody(createPaymentIntentSchema), async (req: Request, res: Response) => {
    try {
        const { orderId, amount, currency = 'USD' } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Generate idempotency key from request
        const idempotencyKey = req.headers['idempotency-key'] as string ||
            crypto.createHash('sha256').update(`${userId}-${orderId}-${amount}`).digest('hex');

        const result = await PaymentService.createPaymentIntent(
            orderId,
            amount,
            currency,
            userId,
            idempotencyKey
        );

        // Audit payment attempt
        await auditPayment.paymentAttempt(req, orderId, amount, true);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);

        // Audit failed payment attempt
        await auditPayment.paymentAttempt(req, req.body.orderId, req.body.amount, false, error instanceof Error ? error.message : 'Failed to create payment intent');

        res.status(500).json({
            error: 'Failed to create payment intent',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
// Confirm payment after successful client-side payment
router.post('/confirm', paymentLimiter, async (req: Request, res: Response) => {
    try {
        const { paymentIntentId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Payment intent ID is required' });
        }

        // Generate idempotency key for confirmation
        const idempotencyKey = req.headers['idempotency-key'] as string ||
            crypto.createHash('sha256').update(`confirm-${userId}-${paymentIntentId}`).digest('hex');

        const result = await PaymentService.confirmPayment(
            paymentIntentId,
            idempotencyKey,
            userId
        );

        res.json(result);

    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({
            error: 'Failed to confirm payment',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get payment status for order
router.get('/status/:orderId', validateParams(idSchema), async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const userId = req.user?.id;

        // Verify user has access to this order
        const orderResult = await query(`
            SELECT id FROM orders 
            WHERE id = $1 AND (buyerId = $2 OR sellerId = $2)
        `, [orderId, userId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found or access denied' });
        }

        const status = await PaymentService.getPaymentStatus(orderId);
        res.json(status);

    } catch (error) {
        console.error('Error getting payment status:', error);
        res.status(500).json({ error: 'Failed to get payment status' });
    }
});

// Process refund (admin only)
router.post('/refund', paymentLimiter, async (req: Request, res: Response) => {
    try {
        const { orderId, amount, reason } = req.body;
        const userId = req.user?.id;

        // Verify user is admin or seller of the order
        const orderResult = await query(`
            SELECT sellerId FROM orders WHERE id = $1
        `, [orderId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];
        const userResult = await query(`
            SELECT role FROM users WHERE id = $1
        `, [userId]);

        const isAdmin = userResult.rows[0]?.role === 'admin';
        const isSeller = order.sellerid === userId;

        if (!isAdmin && !isSeller) {
            return res.status(403).json({ error: 'Not authorized to process refunds for this order' });
        }

        const result = await PaymentService.processRefund(
            orderId,
            amount,
            reason,
            userId
        );

        // Audit refund
        await auditPayment.refund(req, orderId, amount, true);

        res.json(result);

    } catch (error) {
        console.error('Error processing refund:', error);

        // Audit failed refund
        await auditPayment.refund(req, req.body.orderId, req.body.amount, false, error instanceof Error ? error.message : 'Failed to process refund');

        res.status(500).json({
            error: 'Failed to process refund',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Release escrow (seller or admin)
router.post('/escrow/release/:orderId', validateParams(idSchema), async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { reason = 'manual_release' } = req.body;
        const userId = req.user?.id;

        // Verify user is admin or seller of the order
        const orderResult = await query(`
            SELECT sellerId FROM orders WHERE id = $1
        `, [orderId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];
        const userResult = await query(`
            SELECT role FROM users WHERE id = $1
        `, [userId]);

        const isAdmin = userResult.rows[0]?.role === 'admin';
        const isSeller = order.sellerid === userId;

        if (!isAdmin && !isSeller) {
            return res.status(403).json({ error: 'Not authorized to release escrow for this order' });
        }

        const result = await PaymentService.releaseEscrow(orderId, reason);
        res.json(result);

    } catch (error) {
        console.error('Error releasing escrow:', error);
        res.status(500).json({
            error: 'Failed to release escrow',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get seller wallet balance
router.get('/wallet/balance', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const wallet = await query(`
            SELECT 
                availableBalance,
                pendingBalance,
                totalEarned,
                totalWithdrawn,
                lastPayoutAt
            FROM seller_wallets 
            WHERE userId = $1
        `, [userId]);

        if (wallet.rows.length === 0) {
            // Create wallet if doesn't exist
            await query(`
                INSERT INTO seller_wallets (userId, availableBalance, pendingBalance, totalEarned, totalWithdrawn)
                VALUES ($1, 0, 0, 0, 0)
            `, [userId]);

            return res.json({
                availableBalance: 0,
                pendingBalance: 0,
                totalEarned: 0,
                totalWithdrawn: 0,
                lastPayoutAt: null
            });
        }

        const walletData = wallet.rows[0];
        res.json({
            availableBalance: parseFloat(walletData.availablebalance),
            pendingBalance: parseFloat(walletData.pendingbalance),
            totalEarned: parseFloat(walletData.totalearned),
            totalWithdrawn: parseFloat(walletData.totalwithdrawn),
            lastPayoutAt: walletData.lastpayoutat
        });

    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
});
// Request withdrawal (sellers only)
router.post('/wallet/withdraw', async (req: Request, res: Response) => {
    try {
        const { amount, method = 'stripe_transfer' } = req.body;
        const userId = req.user?.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid withdrawal amount is required' });
        }

        // Verify user is a seller
        const userResult = await query(`
            SELECT role FROM users WHERE id = $1
        `, [userId]);

        if (userResult.rows.length === 0 || userResult.rows[0].role !== 'seller') {
            return res.status(403).json({ error: 'Only sellers can request withdrawals' });
        }

        // Check available balance
        const walletResult = await query(`
            SELECT availableBalance FROM seller_wallets WHERE userId = $1
        `, [userId]);

        if (walletResult.rows.length === 0 || parseFloat(walletResult.rows[0].availablebalance) < amount) {
            return res.status(400).json({ error: 'Insufficient available balance' });
        }

        // Create withdrawal request
        const withdrawalResult = await query(`
            INSERT INTO withdrawal_requests (userId, amount, method, status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING *
        `, [userId, amount, method]);

        // Update wallet balance
        await query(`
            UPDATE seller_wallets 
            SET availableBalance = availableBalance - $1,
                pendingBalance = pendingBalance + $1,
                updatedAt = NOW()
            WHERE userId = $2
        `, [amount, userId]);

        res.json({
            success: true,
            withdrawalId: withdrawalResult.rows[0].id,
            message: 'Withdrawal request submitted successfully'
        });

    } catch (error) {
        console.error('Error requesting withdrawal:', error);
        res.status(500).json({ error: 'Failed to request withdrawal' });
    }
});

// Get transaction history
router.get('/transactions', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { limit = 50, offset = 0, type } = req.query;

        const transactions = await PaymentService.getTransactionHistory(
            userId!,
            parseInt(limit as string),
            parseInt(offset as string),
            type as string
        );

        res.json({ transactions });

    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
});
// Webhook endpoint for Stripe events
router.post('/webhook', async (req: Request, res: Response) => {
    try {
        const signature = req.headers['stripe-signature'] as string;

        if (!signature) {
            return res.status(400).json({ error: 'Missing stripe-signature header' });
        }

        // Construct webhook event
        const event = StripeService.constructWebhookEvent(
            req.body,
            signature,
            config.payment.stripe.webhookSecret!
        );

        // Handle the event
        await PaymentService.handleWebhookEvent(event);

        res.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({
            error: 'Webhook error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Admin routes for reconciliation
router.get('/admin/reconciliation/:date', async (req: Request, res: Response) => {
    try {
        const { date } = req.params;
        const userId = req.user?.id;

        // Verify user is admin
        const userResult = await query(`
            SELECT role FROM users WHERE id = $1
        `, [userId]);

        if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const report = await ReconciliationService.getReconciliationReport(date);

        if (!report) {
            return res.status(404).json({ error: 'Reconciliation report not found' });
        }

        res.json(report);

    } catch (error) {
        console.error('Error getting reconciliation report:', error);
        res.status(500).json({ error: 'Failed to get reconciliation report' });
    }
});

// Run reconciliation for a specific date (admin only)
router.post('/admin/reconciliation/:date', async (req: Request, res: Response) => {
    try {
        const { date } = req.params;
        const userId = req.user?.id;

        // Verify user is admin
        const userResult = await query(`
            SELECT role FROM users WHERE id = $1
        `, [userId]);

        if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const report = await ReconciliationService.runDailyReconciliation(date);
        res.json(report);

    } catch (error) {
        console.error('Error running reconciliation:', error);
        res.status(500).json({ error: 'Failed to run reconciliation' });
    }
});