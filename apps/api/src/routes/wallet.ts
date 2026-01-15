import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import { authenticateToken, requireSeller } from '../middleware/auth';
import { createNotification } from './notifications';

interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

const router = Router();

// Apply authentication middleware
router.use(authenticateToken);

// Get wallet (main route)
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const wallet = await query(`
            SELECT 
                w.balance,
                w."availableBalance",
                w."pendingWithdrawal",
                w."totalEarned",
                w."totalWithdrawn",
                gw.balance as "gasBalance",
                gw."totalToppedUp" as "gasTotalToppedUp",
                gw."totalUsed" as "gasTotalUsed"
            FROM wallets w
            LEFT JOIN gas_wallets gw ON gw."userId" = w."userId"
            WHERE w."userId" = $1
        `, [userId]);

        if (wallet.rows.length === 0) {
            // Create wallet if doesn't exist
            const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await query(`
                INSERT INTO wallets (id, "userId", balance, "availableBalance", "createdAt", "updatedAt")
                VALUES ($1, $2, 0, 0, NOW(), NOW())
            `, [walletId, userId]);

            return res.json({
                balance: 0,
                availableBalance: 0,
                pendingWithdrawal: 0,
                totalEarned: 0,
                totalWithdrawn: 0,
                gasBalance: 0,
                gasTotalToppedUp: 0,
                gasTotalUsed: 0
            });
        }

        res.json(wallet.rows[0]);
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ error: 'Failed to fetch wallet' });
    }
});

// Get wallet balance
router.get('/balance', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const wallet = await query(`
            SELECT 
                w.balance,
                w."availableBalance",
                w."pendingWithdrawal",
                w."totalEarned",
                w."totalWithdrawn",
                gw.balance as "gasBalance",
                gw."totalToppedUp" as "gasTotalToppedUp",
                gw."totalUsed" as "gasTotalUsed"
            FROM wallets w
            LEFT JOIN gas_wallets gw ON gw."userId" = w."userId"
            WHERE w."userId" = $1
        `, [userId]);

        if (wallet.rows.length === 0) {
            // Create wallet if doesn't exist
            const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await query(`
                INSERT INTO wallets (id, "userId", balance, "availableBalance", "createdAt", "updatedAt")
                VALUES ($1, $2, 0, 0, NOW(), NOW())
            `, [walletId, userId]);

            return res.json({
                balance: 0,
                availableBalance: 0,
                pendingWithdrawal: 0,
                totalEarned: 0,
                totalWithdrawn: 0,
                gasBalance: 0,
                gasTotalToppedUp: 0,
                gasTotalUsed: 0
            });
        }

        res.json(wallet.rows[0]);
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
});

// Get transaction history
router.get('/transactions', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { limit = 50, offset = 0, type } = req.query;

        let whereClause = 'WHERE "userId" = $1';
        const params = [userId];

        if (type) {
            whereClause += ' AND type = $2';
            params.push(type as string);
        }

        const transactions = await query(`
            SELECT 
                id,
                type,
                amount,
                status,
                "referenceId",
                description,
                metadata,
                "createdAt"
            FROM transactions 
            ${whereClause}
            ORDER BY "createdAt" DESC
            LIMIT ${params.length + 1} OFFSET ${params.length + 2}
        `, [...params, limit, offset]);

        // Get total count
        const countResult = await query(`
            SELECT COUNT(*) as total
            FROM transactions 
            ${whereClause}
        `, params);

        const total = parseInt(countResult.rows[0].total);

        res.json({
            transactions: transactions.rows,
            pagination: {
                total,
                limit: parseInt(limit as string),
                offset: parseInt(offset as string),
                hasMore: total > parseInt(offset as string) + parseInt(limit as string)
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Top up wallet (for testing - in production this would be done via payment gateway)
router.post('/topup', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { amount, method = 'test' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (amount < 10) {
            return res.status(400).json({ error: 'Minimum top-up amount is $10' });
        }

        const result = await transaction(async (client) => {
            // Ensure wallet exists
            await client.query(`
                INSERT INTO wallets (id, "userId", balance, "availableBalance", "createdAt", "updatedAt")
                VALUES ($1, $2, 0, 0, NOW(), NOW())
                ON CONFLICT ("userId") DO NOTHING
            `, [`wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, userId]);

            // Update wallet balance
            await client.query(`
                UPDATE wallets 
                SET balance = balance + $1,
                    "availableBalance" = "availableBalance" + $1,
                    "updatedAt" = NOW()
                WHERE "userId" = $2
            `, [amount, userId]);

            // Create transaction record
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await client.query(`
                INSERT INTO transactions (
                    id, "userId", type, amount, status, "referenceId", 
                    description, "createdAt"
                )
                VALUES ($1, $2, 'WALLET_TOPUP', $3, 'COMPLETED', $4, $5, NOW())
            `, [
                transactionId, 
                userId, 
                amount, 
                `topup_${Date.now()}`,
                `Wallet top-up via ${method}`
            ]);

            return { transactionId, amount };
        });

        // Send notification
        await createNotification(
            userId!,
            'payment',
            'Wallet Top-up Successful',
            `Your wallet has been topped up with $${amount.toFixed(2)}`,
            '/account/wallet',
            { amount, method }
        );

        res.json({
            success: true,
            message: 'Wallet topped up successfully',
            transactionId: result.transactionId,
            amount: result.amount
        });
    } catch (error) {
        console.error('Error topping up wallet:', error);
        res.status(500).json({ error: 'Failed to top up wallet' });
    }
});

// Top up gas wallet (sellers only)
router.post('/gas/topup', requireSeller, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { amount, method = 'test' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (amount < 5) {
            return res.status(400).json({ error: 'Minimum gas wallet top-up is $5' });
        }

        const result = await transaction(async (client) => {
            // Ensure gas wallet exists
            await client.query(`
                INSERT INTO gas_wallets (id, "userId", balance, "createdAt", "updatedAt")
                VALUES ($1, $2, 0, NOW(), NOW())
                ON CONFLICT ("userId") DO NOTHING
            `, [`gas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, userId]);

            // Update gas wallet balance
            await client.query(`
                UPDATE gas_wallets 
                SET balance = balance + $1,
                    "totalToppedUp" = "totalToppedUp" + $1,
                    "updatedAt" = NOW()
                WHERE "userId" = $2
            `, [amount, userId]);

            // Create transaction record
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await client.query(`
                INSERT INTO transactions (
                    id, "userId", type, amount, status, "referenceId", 
                    description, "createdAt"
                )
                VALUES ($1, $2, 'GAS_WALLET_TOPUP', $3, 'COMPLETED', $4, $5, NOW())
            `, [
                transactionId, 
                userId, 
                amount, 
                `gas_topup_${Date.now()}`,
                `Gas wallet top-up via ${method}`
            ]);

            return { transactionId, amount };
        });

        // Send notification
        await createNotification(
            userId!,
            'payment',
            'Gas Wallet Top-up Successful',
            `Your gas wallet has been topped up with $${amount.toFixed(2)}`,
            '/account/wallet',
            { amount, method, type: 'gas' }
        );

        res.json({
            success: true,
            message: 'Gas wallet topped up successfully',
            transactionId: result.transactionId,
            amount: result.amount
        });
    } catch (error) {
        console.error('Error topping up gas wallet:', error);
        res.status(500).json({ error: 'Failed to top up gas wallet' });
    }
});

// Use gas (for auction fees, listing fees, etc.)
router.post('/gas/use', requireSeller, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { amount, purpose, referenceId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (!purpose) {
            return res.status(400).json({ error: 'Purpose is required' });
        }

        // Check gas wallet balance
        const gasWallet = await query(
            'SELECT balance FROM gas_wallets WHERE "userId" = $1',
            [userId]
        );

        if (gasWallet.rows.length === 0 || gasWallet.rows[0].balance < amount) {
            return res.status(400).json({ error: 'Insufficient gas balance' });
        }

        const result = await transaction(async (client) => {
            // Deduct from gas wallet
            await client.query(`
                UPDATE gas_wallets 
                SET balance = balance - $1,
                    "totalUsed" = "totalUsed" + $1,
                    "updatedAt" = NOW()
                WHERE "userId" = $2
            `, [amount, userId]);

            // Create transaction record
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await client.query(`
                INSERT INTO transactions (
                    id, "userId", type, amount, status, "referenceId", 
                    description, "createdAt"
                )
                VALUES ($1, $2, 'AUCTION_FEE', $3, 'COMPLETED', $4, $5, NOW())
            `, [
                transactionId, 
                userId, 
                amount, 
                referenceId || `gas_use_${Date.now()}`,
                `Gas used for ${purpose}`
            ]);

            return { transactionId, amount };
        });

        res.json({
            success: true,
            message: 'Gas used successfully',
            transactionId: result.transactionId,
            amount: result.amount,
            purpose
        });
    } catch (error) {
        console.error('Error using gas:', error);
        res.status(500).json({ error: 'Failed to use gas' });
    }
});

// Request withdrawal
router.post('/withdraw', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { amount, method, accountDetails } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (amount < 10) {
            return res.status(400).json({ error: 'Minimum withdrawal amount is $10' });
        }

        if (!method || !accountDetails) {
            return res.status(400).json({ error: 'Withdrawal method and account details are required' });
        }

        // Check available balance
        const wallet = await query(
            'SELECT "availableBalance" FROM wallets WHERE "userId" = $1',
            [userId]
        );

        if (wallet.rows.length === 0 || wallet.rows[0].availableBalance < amount) {
            return res.status(400).json({ error: 'Insufficient available balance' });
        }

        const result = await transaction(async (client) => {
            // Create withdrawal request
            const withdrawalId = `wd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await client.query(`
                INSERT INTO withdrawals (
                    id, "userId", amount, method, "accountDetails", 
                    status, "requestedAt", "createdAt", "updatedAt"
                )
                VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW(), NOW(), NOW())
            `, [withdrawalId, userId, amount, method, JSON.stringify(accountDetails)]);

            // Move from available to pending
            await client.query(`
                UPDATE wallets 
                SET "availableBalance" = "availableBalance" - $1,
                    "pendingWithdrawal" = "pendingWithdrawal" + $1,
                    "updatedAt" = NOW()
                WHERE "userId" = $2
            `, [amount, userId]);

            // Create transaction record
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await client.query(`
                INSERT INTO transactions (
                    id, "userId", type, amount, status, "referenceId", 
                    description, "createdAt"
                )
                VALUES ($1, $2, 'WITHDRAWAL', $3, 'PENDING', $4, $5, NOW())
            `, [
                transactionId, 
                userId, 
                amount, 
                withdrawalId,
                `Withdrawal request via ${method}`
            ]);

            return { withdrawalId, transactionId, amount };
        });

        // Send notification
        await createNotification(
            userId!,
            'payment',
            'Withdrawal Request Submitted',
            `Your withdrawal request for $${amount.toFixed(2)} has been submitted for review`,
            '/account/wallet',
            { amount, method, withdrawalId: result.withdrawalId }
        );

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            withdrawalId: result.withdrawalId,
            amount: result.amount
        });
    } catch (error) {
        console.error('Error requesting withdrawal:', error);
        res.status(500).json({ error: 'Failed to request withdrawal' });
    }
});

// Get withdrawal history
router.get('/withdrawals', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { limit = 20, offset = 0, status } = req.query;

        let whereClause = 'WHERE "userId" = $1';
        const params = [userId];

        if (status) {
            whereClause += ' AND status = $2';
            params.push(status as string);
        }

        const withdrawals = await query(`
            SELECT 
                id,
                amount,
                method,
                "accountDetails",
                status,
                "requestedAt",
                "processedAt",
                "completedAt",
                "adminNotes"
            FROM withdrawals 
            ${whereClause}
            ORDER BY "requestedAt" DESC
            LIMIT ${params.length + 1} OFFSET ${params.length + 2}
        `, [...params, limit, offset]);

        res.json(withdrawals.rows);
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
});

export default router;