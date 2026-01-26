"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const payment_service_1 = require("../services/payment.service");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const { buyerId, sellerId, listingId, quantity, totalAmount } = req.body;
        const orderId = (0, uuid_1.v4)();
        const escrowReleaseAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const result = await (0, db_1.query)(`INSERT INTO orders (id, buyer_id, seller_id, listing_id, quantity, total_amount, status, escrow_release_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`, [orderId, buyerId, sellerId, listingId, quantity, totalAmount, 'pending', escrowReleaseAt]);
        // Create payment intent
        const clientSecret = await payment_service_1.PaymentService.createPaymentIntent(orderId, totalAmount, 'USD', buyerId);
        res.status(201).json({
            order: result.rows[0],
            clientSecret,
        });
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)('SELECT * FROM orders WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});
router.post('/:id/confirm-payment', async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentIntentId } = req.body;
        await payment_service_1.PaymentService.confirmPayment(id, paymentIntentId);
        res.json({ message: 'Payment confirmed' });
    }
    catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});
router.post('/:id/confirm-delivery', async (req, res) => {
    try {
        const { id } = req.params;
        const { photos, signatureUrl } = req.body;
        await (0, db_1.transaction)(async (client) => {
            // Update delivery
            await client.query(`UPDATE deliveries SET status = 'delivered', photos = $1, signature_url = $2, updated_at = NOW()
         WHERE order_id = $3`, [photos, signatureUrl, id]);
            // Get order
            const orderRes = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
            const order = orderRes.rows[0];
            // Release escrow
            await payment_service_1.PaymentService.releaseEscrow(id);
            // Update order status
            await client.query(`UPDATE orders SET status = 'delivered' WHERE id = $1`, [id]);
        });
        res.json({ message: 'Delivery confirmed' });
    }
    catch (error) {
        console.error('Error confirming delivery:', error);
        res.status(500).json({ error: 'Failed to confirm delivery' });
    }
});
router.post('/:id/refund', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, reason } = req.body;
        const orderRes = await (0, db_1.query)('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const order = orderRes.rows[0];
        await payment_service_1.PaymentService.refundPayment(id, amount || order.total_amount);
        res.json({ message: 'Refund processed' });
    }
    catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({ error: 'Failed to process refund' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map