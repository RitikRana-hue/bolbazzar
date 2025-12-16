import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import { v4 as uuid } from 'uuid';

const router = Router();

router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ error: 'Failed to fetch wallet' });
    }
});

router.post('/:userId/topup', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        await transaction(async (client) => {
            // Update wallet
            await client.query(
                `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2`,
                [amount, userId]
            );

            // Create transaction record
            const txnId = uuid();
            await client.query(
                `INSERT INTO transactions (id, user_id, amount, type, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
                [txnId, userId, amount, 'topup']
            );
        });

        res.json({ message: 'Wallet topped up' });
    } catch (error) {
        console.error('Error topping up wallet:', error);
        res.status(500).json({ error: 'Failed to topup wallet' });
    }
});

router.post('/:userId/use-gas', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        const walletRes = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
        if (walletRes.rows.length === 0) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const wallet = walletRes.rows[0];
        if (wallet.gas_balance < amount) {
            return res.status(400).json({ error: 'Insufficient gas balance' });
        }

        await transaction(async (client) => {
            // Update wallet
            await client.query(
                `UPDATE wallets SET gas_balance = gas_balance - $1, updated_at = NOW() WHERE user_id = $2`,
                [amount, userId]
            );

            // Create transaction record
            const txnId = uuid();
            await client.query(
                `INSERT INTO transactions (id, user_id, amount, type, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
                [txnId, userId, amount, 'charge']
            );
        });

        res.json({ message: 'Gas used' });
    } catch (error) {
        console.error('Error using gas:', error);
        res.status(500).json({ error: 'Failed to use gas' });
    }
});

router.post('/:userId/withdraw', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        const walletRes = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
        if (walletRes.rows.length === 0) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const wallet = walletRes.rows[0];
        if (wallet.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        await transaction(async (client) => {
            // Update wallet
            await client.query(
                `UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2`,
                [amount, userId]
            );

            // Create transaction record
            const txnId = uuid();
            await client.query(
                `INSERT INTO transactions (id, user_id, amount, type, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
                [txnId, userId, amount, 'withdraw']
            );
        });

        res.json({ message: 'Withdrawal processed' });
    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).json({ error: 'Failed to process withdrawal' });
    }
});

export default router;
