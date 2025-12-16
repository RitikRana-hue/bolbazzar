import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { query } from '../db';

const router = Router();

// Create payment intent for card payments
router.post('/card/create-intent', async (req: Request, res: Response) => {
    try {
        const { orderId, amount, currency = 'usd' } = req.body;
        const userId = req.user?.id;

        // Verify order belongs to user
        const order = await query(
            'SELECT * FROM orders WHERE id = $1 AND buyer_id = $2',
            [orderId, userId]
        );

        if (order.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const result = await PaymentService.createPaymentIntent(
            orderId,
            amount,
            currency,
            userId
        );

        res.json(result);
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Process UPI payment
router.post('/upi/pay', async (req: Request, res: Response) => {
    try {
        const { orderId, amount, upiId } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify order belongs to user
        const order = await query(
            'SELECT * FROM orders WHERE id = $1 AND buyer_id = $2',
            [orderId, userId]
        );

        if (order.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const result = await PaymentService.processUPIPayment(
            orderId,
            amount,
            upiId,
            userId
        );

        res.json(result);
    } catch (error) {
        console.error('Error processing UPI payment:', error);
        res.status(500).json({ error: 'Failed to process UPI payment' });
    }
});

// Process Net Banking payment
router.post('/netbanking/pay', async (req: Request, res: Response) => {
    try {
        const { orderId, amount, bankCode } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify order belongs to user
        const order = await query(
            'SELECT * FROM orders WHERE id = $1 AND buyer_id = $2',
            [orderId, userId]
        );

        if (order.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const result = await PaymentService.processNetBankingPayment(
            orderId,
            amount,
            bankCode,
            userId
        );

        res.json(result);
    } catch (error) {
        console.error('Error processing net banking payment:', error);
        res.status(500).json({ error: 'Failed to process net banking payment' });
    }
});

// Wallet top-up
router.post('/wallet/topup', async (req: Request, res: Response) => {
    try {
        const { amount, paymentMethod, paymentDetails } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (amount < 10) {
            return res.status(400).json({ error: 'Minimum top-up amount is $10' });
        }

        const result = await PaymentService.topUpWallet(
            userId,
            amount,
            paymentMethod,
            paymentDetails
        );

        res.json(result);
    } catch (error) {
        console.error('Error topping up wallet:', error);
        res.status(500).json({ error: 'Failed to top up wallet' });
    }
});

// Gas wallet top-up (sellers only)
router.post('/gas-wallet/topup', async (req: Request, res: Response) => {
    try {
        const { amount, paymentMethod, paymentDetails } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify user is a seller
        const user = await query(
            'SELECT role FROM users WHERE id = $1',
            [userId]
        );

        if (user.rows.length === 0 || user.rows[0].role !== 'seller') {
            return res.status(403).json({ error: 'Only sellers can top up gas wallet' });
        }

        if (amount < 5) {
            return res.status(400).json({ error: 'Minimum gas wallet top-up is $5' });
        }

        const result = await PaymentService.topUpGasWallet(
            userId,
            amount,
            paymentMethod,
            paymentDetails
        );

        res.json(result);
    } catch (error) {
        console.error('Error topping up gas wallet:', error);
        res.status(500).json({ error: 'Failed to top up gas wallet' });
    }
});

// Get wallet balance
router.get('/wallet/balance', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const wallet = await query(`
            SELECT 
                w.balance,
                w.available_balance,
                w.pending_withdrawal,
                w.total_earned,
                w.total_withdrawn,
                gw.balance as gas_balance,
                gw.total_topped_up as gas_total_topped_up,
                gw.total_used as gas_total_used
            FROM wallets w
            LEFT JOIN gas_wallets gw ON gw.user_id = w.user_id
            WHERE w.user_id = $1
        `, [userId]);

        if (wallet.rows.length === 0) {
            // Create wallet if doesn't exist
            await query(`
                INSERT INTO wallets (user_id, balance, available_balance, created_at)
                VALUES ($1, 0, 0, NOW())
            `, [userId]);

            return res.json({
                balance: 0,
                available_balance: 0,
                pending_withdrawal: 0,
                total_earned: 0,
                total_withdrawn: 0,
                gas_balance: 0,
                gas_total_topped_up: 0,
                gas_total_used: 0
            });
        }

        res.json(wallet.rows[0]);
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
});

// Get transaction logs
router.get('/transactions', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { limit = 50, offset = 0, type } = req.query;

        const transactions = await PaymentService.getTransactionLogs(
            userId,
            parseInt(limit as string),
            parseInt(offset as string),
            type as string
        );

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transaction logs:', error);
        res.status(500).json({ error: 'Failed to fetch transaction logs' });
    }
});

// Process refund (admin only)
router.post('/refund', async (req: Request, res: Response) => {
    try {
        const { orderId, amount, reason } = req.body;
        const adminId = req.user?.id;

        // Verify user is admin
        const user = await query(
            'SELECT role FROM users WHERE id = $1',
            [adminId]
        );

        if (user.rows.length === 0 || user.rows[0].role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const result = await PaymentService.processRefund(
            orderId,
            amount,
            reason,
            adminId
        );

        res.json(result);
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({ error: 'Failed to process refund' });
    }
});

// Auto-release payment on delivery
router.post('/auto-release/:orderId', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const userId = req.user?.id;

        // Verify user is buyer for this order
        const order = await query(
            'SELECT buyer_id FROM orders WHERE id = $1',
            [orderId]
        );

        if (order.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.rows[0].buyer_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const result = await PaymentService.autoReleaseOnDelivery(orderId);
        res.json(result);
    } catch (error) {
        console.error('Error auto-releasing payment:', error);
        res.status(500).json({ error: 'Failed to auto-release payment' });
    }
});

// Get payment methods for user
router.get('/methods', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const methods = await query(`
            SELECT 
                id, type, nickname, last4, brand, upi_id, 
                bank_name, account_last4, is_default, is_verified,
                created_at
            FROM payment_methods 
            WHERE user_id = $1 AND is_active = true
            ORDER BY is_default DESC, created_at DESC
        `, [userId]);

        res.json(methods.rows);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
});

// Add payment method
router.post('/methods', async (req: Request, res: Response) => {
    try {
        const { type, nickname, cardDetails, upiId, bankDetails } = req.body;
        const userId = req.user?.id;

        let methodData: any = { type, nickname };

        switch (type) {
            case 'card':
                if (!cardDetails) {
                    return res.status(400).json({ error: 'Card details required' });
                }
                methodData = {
                    ...methodData,
                    last4: cardDetails.last4,
                    brand: cardDetails.brand,
                    exp_month: cardDetails.exp_month,
                    exp_year: cardDetails.exp_year
                };
                break;

            case 'upi':
                if (!upiId) {
                    return res.status(400).json({ error: 'UPI ID required' });
                }
                methodData.upi_id = upiId;
                break;

            case 'bank_account':
                if (!bankDetails) {
                    return res.status(400).json({ error: 'Bank details required' });
                }
                methodData = {
                    ...methodData,
                    bank_name: bankDetails.bank_name,
                    account_last4: bankDetails.account_last4,
                    account_type: bankDetails.account_type
                };
                break;

            default:
                return res.status(400).json({ error: 'Invalid payment method type' });
        }

        const method = await query(`
            INSERT INTO payment_methods (
                user_id, type, nickname, last4, brand, exp_month, exp_year,
                upi_id, bank_name, account_last4, account_type, 
                is_default, is_verified, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, false, NOW())
            RETURNING *
        `, [
            userId, methodData.type, methodData.nickname, methodData.last4,
            methodData.brand, methodData.exp_month, methodData.exp_year,
            methodData.upi_id, methodData.bank_name, methodData.account_last4,
            methodData.account_type
        ]);

        res.status(201).json(method.rows[0]);
    } catch (error) {
        console.error('Error adding payment method:', error);
        res.status(500).json({ error: 'Failed to add payment method' });
    }
});

// Set default payment method
router.put('/methods/:id/default', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Remove default from all methods
        await query(`
            UPDATE payment_methods 
            SET is_default = false 
            WHERE user_id = $1
        `, [userId]);

        // Set new default
        await query(`
            UPDATE payment_methods 
            SET is_default = true 
            WHERE id = $1 AND user_id = $2
        `, [id, userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error setting default payment method:', error);
        res.status(500).json({ error: 'Failed to set default payment method' });
    }
});

// Delete payment method
router.delete('/methods/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        await query(`
            UPDATE payment_methods 
            SET is_active = false 
            WHERE id = $1 AND user_id = $2
        `, [id, userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting payment method:', error);
        res.status(500).json({ error: 'Failed to delete payment method' });
    }
});

// Get supported banks for net banking
router.get('/banks', async (req: Request, res: Response) => {
    try {
        const banks = [
            { code: 'sbi', name: 'State Bank of India', logo: '/banks/sbi.png' },
            { code: 'hdfc', name: 'HDFC Bank', logo: '/banks/hdfc.png' },
            { code: 'icici', name: 'ICICI Bank', logo: '/banks/icici.png' },
            { code: 'axis', name: 'Axis Bank', logo: '/banks/axis.png' },
            { code: 'kotak', name: 'Kotak Mahindra Bank', logo: '/banks/kotak.png' },
            { code: 'pnb', name: 'Punjab National Bank', logo: '/banks/pnb.png' },
            { code: 'bob', name: 'Bank of Baroda', logo: '/banks/bob.png' },
            { code: 'canara', name: 'Canara Bank', logo: '/banks/canara.png' }
        ];

        res.json(banks);
    } catch (error) {
        console.error('Error fetching banks:', error);
        res.status(500).json({ error: 'Failed to fetch banks' });
    }
});

// Webhook endpoint for payment status updates
router.post('/webhook', async (req: Request, res: Response) => {
    try {
        const event = req.body;

        // Verify webhook signature (implement based on payment provider)
        // For Stripe: stripe.webhooks.constructEvent(req.body, sig, endpointSecret)

        await PaymentService.handlePaymentWebhook(event);

        res.json({ received: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(400).json({ error: 'Webhook error' });
    }
});

export default router;