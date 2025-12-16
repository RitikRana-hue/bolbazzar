import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import { PaymentService } from '../services/payment.service';
import { v4 as uuid } from 'uuid';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { buyerId, sellerId, listingId, quantity, totalAmount } = req.body;

        const orderId = uuid();
        const escrowReleaseAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const result = await query(
            `INSERT INTO orders (id, buyer_id, seller_id, listing_id, quantity, total_amount, status, escrow_release_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
            [orderId, buyerId, sellerId, listingId, quantity, totalAmount, 'pending', escrowReleaseAt]
        );

        // Create payment intent
        const clientSecret = await PaymentService.createPaymentIntent(orderId, totalAmount, buyerId);

        res.status(201).json({
            order: result.rows[0],
            clientSecret,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM orders WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

router.post('/:id/confirm-payment', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { paymentIntentId } = req.body;

        await PaymentService.confirmPayment(id, paymentIntentId);

        res.json({ message: 'Payment confirmed' });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});

router.post('/:id/confirm-delivery', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { photos, signatureUrl } = req.body;

        await transaction(async (client) => {
            // Update delivery
            await client.query(
                `UPDATE deliveries SET status = 'delivered', photos = $1, signature_url = $2, updated_at = NOW()
         WHERE order_id = $3`,
                [photos, signatureUrl, id]
            );

            // Get order
            const orderRes = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
            const order = orderRes.rows[0];

            // Release escrow
            await PaymentService.releaseEscrow(id);

            // Update order status
            await client.query(`UPDATE orders SET status = 'delivered' WHERE id = $1`, [id]);
        });

        res.json({ message: 'Delivery confirmed' });
    } catch (error) {
        console.error('Error confirming delivery:', error);
        res.status(500).json({ error: 'Failed to confirm delivery' });
    }
});

router.post('/:id/refund', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, reason } = req.body;

        const orderRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderRes.rows[0];
        await PaymentService.refundPayment(id, amount || order.total_amount);

        res.json({ message: 'Refund processed' });
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({ error: 'Failed to process refund' });
    }
});

export default router;
