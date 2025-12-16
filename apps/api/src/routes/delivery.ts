import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import { createNotification } from './notifications';
import { EscrowService } from '../services/escrow.service';

const router = Router();

// Get delivery status for an order
router.get('/:orderId', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const userId = req.user?.id;

        // Verify user has access to this order
        const order = await query(`
            SELECT o.*, l.title as product_title
            FROM orders o
            JOIN listings l ON l.id = o.listing_id
            WHERE o.id = $1 AND (o.buyer_id = $2 OR l.seller_id = $2)
        `, [orderId, userId]);

        if (order.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get delivery information
        const delivery = await query(`
            SELECT 
                d.*,
                o.shipping_address
            FROM deliveries d
            JOIN orders o ON o.id = d.order_id
            WHERE d.order_id = $1
        `, [orderId]);

        if (delivery.rows.length === 0) {
            return res.status(404).json({ error: 'Delivery information not found' });
        }

        // Get delivery timeline
        const timeline = await query(`
            SELECT status, description, timestamp, location
            FROM delivery_timeline
            WHERE delivery_id = $1
            ORDER BY timestamp ASC
        `, [delivery.rows[0].id]);

        const deliveryData = {
            ...delivery.rows[0],
            timeline: timeline.rows,
            deliveryAddress: JSON.parse(delivery.rows[0].shipping_address || '{}')
        };

        res.json(deliveryData);
    } catch (error) {
        console.error('Error fetching delivery status:', error);
        res.status(500).json({ error: 'Failed to fetch delivery status' });
    }
});

// Update delivery status (for delivery agents)
router.put('/:orderId/status', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status, location, description, photos, signature } = req.body;

        // Update delivery status
        await query(`
            UPDATE deliveries 
            SET status = $1, updated_at = NOW()
            WHERE order_id = $2
        `, [status, orderId]);

        // Add timeline entry
        const delivery = await query('SELECT id FROM deliveries WHERE order_id = $1', [orderId]);

        if (delivery.rows.length > 0) {
            await query(`
                INSERT INTO delivery_timeline (delivery_id, status, description, timestamp, location)
                VALUES ($1, $2, $3, NOW(), $4)
            `, [delivery.rows[0].id, status, description, location]);
        }

        // If delivered, update with photos and signature
        if (status === 'delivered' && (photos || signature)) {
            await query(`
                UPDATE deliveries 
                SET delivery_photos = $1, signature = $2, actual_delivery = NOW()
                WHERE order_id = $3
            `, [JSON.stringify(photos), signature, orderId]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ error: 'Failed to update delivery status' });
    }
});

// Confirm delivery (by buyer)
router.post('/:orderId/confirm', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const userId = req.user?.id;

        // Verify buyer owns this order
        const order = await query(`
            SELECT * FROM orders 
            WHERE id = $1 AND buyer_id = $2
        `, [orderId, userId]);

        if (order.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status to delivered
        await query(`
            UPDATE orders 
            SET status = 'delivered', delivered_at = NOW()
            WHERE id = $1
        `, [orderId]);

        // Update delivery status
        await query(`
            UPDATE deliveries 
            SET status = 'delivered', actual_delivery = NOW()
            WHERE order_id = $1
        `, [orderId]);

        // Release escrow funds (this would trigger payout to seller)
        await query(`
            UPDATE orders 
            SET escrow_released_at = NOW()
            WHERE id = $1
        `, [orderId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error confirming delivery:', error);
        res.status(500).json({ error: 'Failed to confirm delivery' });
    }
});

// Report delivery issue
router.post('/:orderId/issue', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { issue, description, photos } = req.body;
        const userId = req.user?.id;

        // Create dispute record
        await query(`
            INSERT INTO disputes (order_id, reporter_id, reason, description, evidence, status, created_at)
            VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
        `, [orderId, userId, issue, description, JSON.stringify(photos)]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error reporting delivery issue:', error);
        res.status(500).json({ error: 'Failed to report delivery issue' });
    }
});

export default router;

// Delivery agent app endpoints
router.post('/agent/login', async (req: Request, res: Response) => {
    try {
        const { agentId, password } = req.body;

        // Authenticate delivery agent
        const agent = await query(`
            SELECT * FROM delivery_agents 
            WHERE agent_id = $1 AND password_hash = crypt($2, password_hash)
        `, [agentId, password]);

        if (agent.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate agent token (simplified)
        const token = Buffer.from(`${agentId}:${Date.now()}`).toString('base64');

        res.json({
            token,
            agent: {
                id: agent.rows[0].id,
                name: agent.rows[0].name,
                phone: agent.rows[0].phone,
                vehicle_type: agent.rows[0].vehicle_type
            }
        });
    } catch (error) {
        console.error('Agent login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get assigned deliveries for agent
router.get('/agent/deliveries', async (req: Request, res: Response) => {
    try {
        const agentId = req.headers['agent-id']; // From auth middleware

        const deliveries = await query(`
            SELECT 
                d.*,
                o.id as order_id,
                o.total_amount,
                l.title as product_title,
                l.images[1] as product_image,
                u.name as buyer_name,
                u.phone as buyer_phone,
                JSON_PARSE(o.shipping_address) as delivery_address
            FROM deliveries d
            JOIN orders o ON o.id = d.order_id
            JOIN listings l ON l.id = o.listing_id
            JOIN users u ON u.id = o.buyer_id
            WHERE d.agent_id = $1 
            AND d.status IN ('assigned', 'picked_up', 'out_for_delivery')
            ORDER BY d.created_at DESC
        `, [agentId]);

        res.json(deliveries.rows);
    } catch (error) {
        console.error('Error fetching agent deliveries:', error);
        res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
});

// Update delivery status with photos and signature
router.put('/agent/:orderId/update', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status, location, description, photos, signature, customerPresent, openBoxVerified } = req.body;
        const agentId = req.headers['agent-id'];

        await transaction(async (client) => {
            // Update delivery status
            await client.query(`
                UPDATE deliveries 
                SET status = $1, updated_at = NOW(), last_location = $2
                WHERE order_id = $3 AND agent_id = $4
            `, [status, location, orderId, agentId]);

            // Add timeline entry
            const delivery = await client.query('SELECT id FROM deliveries WHERE order_id = $1', [orderId]);

            if (delivery.rows.length > 0) {
                await client.query(`
                    INSERT INTO delivery_timeline (delivery_id, status, description, timestamp, location, agent_notes)
                    VALUES ($1, $2, $3, NOW(), $4, $5)
                `, [delivery.rows[0].id, status, description, location, JSON.stringify({ photos, signature, customerPresent, openBoxVerified })]);
            }

            // Handle specific status updates
            if (status === 'delivered') {
                // Update delivery with completion details
                await client.query(`
                    UPDATE deliveries 
                    SET 
                        delivery_photos = $1, 
                        signature = $2, 
                        actual_delivery = NOW(),
                        customer_present = $3,
                        open_box_verified = $4
                    WHERE order_id = $5
                `, [JSON.stringify(photos), signature, customerPresent, openBoxVerified, orderId]);

                // Update order status
                await client.query(`
                    UPDATE orders 
                    SET status = 'delivered', delivered_at = NOW()
                    WHERE id = $1
                `, [orderId]);

                // Get order details for notifications
                const order = await client.query(`
                    SELECT o.*, e.id as escrow_id 
                    FROM orders o
                    LEFT JOIN escrows e ON e.order_id = o.id
                    WHERE o.id = $1
                `, [orderId]);

                if (order.rows.length > 0) {
                    const o = order.rows[0];

                    // Notify buyer about delivery
                    await createNotification(
                        o.buyer_id,
                        'order',
                        'Order Delivered',
                        'Your order has been delivered successfully. Please confirm receipt.',
                        `/delivery/${orderId}`,
                        { orderId, requiresConfirmation: true }
                    );

                    // If escrow exists and auto-release is enabled, start countdown
                    if (o.escrow_id) {
                        // Escrow will auto-release after 7 days unless buyer disputes
                        await createNotification(
                            o.buyer_id,
                            'system',
                            'Confirm Delivery',
                            'Please confirm delivery within 7 days or funds will be automatically released to the seller.',
                            `/delivery/${orderId}`,
                            { orderId, autoReleaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
                        );
                    }
                }
            }

            // Notify buyer of status updates
            const order = await client.query('SELECT buyer_id FROM orders WHERE id = $1', [orderId]);
            if (order.rows.length > 0) {
                await createNotification(
                    order.rows[0].buyer_id,
                    'order',
                    `Delivery Update: ${status.replace('_', ' ')}`,
                    description,
                    `/delivery/${orderId}`,
                    { orderId, status, location }
                );
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ error: 'Failed to update delivery status' });
    }
});

// Upload delivery photos
router.post('/agent/:orderId/photos', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { photos, photoType } = req.body; // photoType: 'pickup', 'delivery', 'damage', 'signature'
        const agentId = req.headers['agent-id'];

        // Store photos (in real implementation, upload to S3/MinIO)
        const photoUrls = photos.map((photo: string, index: number) =>
            `https://storage.instasell.com/delivery/${orderId}/${photoType}_${index}_${Date.now()}.jpg`
        );

        await query(`
            INSERT INTO delivery_photos (delivery_id, photo_urls, photo_type, uploaded_by, uploaded_at)
            SELECT d.id, $1, $2, $3, NOW()
            FROM deliveries d
            WHERE d.order_id = $4 AND d.agent_id = $3
        `, [JSON.stringify(photoUrls), photoType, agentId, orderId]);

        res.json({ success: true, photoUrls });
    } catch (error) {
        console.error('Error uploading delivery photos:', error);
        res.status(500).json({ error: 'Failed to upload photos' });
    }
});

// Digital signature capture
router.post('/agent/:orderId/signature', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { signature, signerName, signatureType } = req.body; // signatureType: 'pickup', 'delivery'
        const agentId = req.headers['agent-id'];

        // Store signature (base64 image)
        const signatureUrl = `https://storage.instasell.com/signatures/${orderId}_${signatureType}_${Date.now()}.png`;

        await query(`
            UPDATE deliveries 
            SET ${signatureType}_signature = $1, 
                ${signatureType}_signer_name = $2,
                updated_at = NOW()
            WHERE order_id = $3 AND agent_id = $4
        `, [signatureUrl, signerName, orderId, agentId]);

        res.json({ success: true, signatureUrl });
    } catch (error) {
        console.error('Error saving signature:', error);
        res.status(500).json({ error: 'Failed to save signature' });
    }
});

// Open-box verification for expensive items
router.post('/agent/:orderId/open-box', async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { verificationPhotos, customerApproval, itemCondition, notes } = req.body;
        const agentId = req.headers['agent-id'];

        await transaction(async (client) => {
            // Update delivery with open-box verification
            await client.query(`
                UPDATE deliveries 
                SET 
                    open_box_verified = true,
                    open_box_photos = $1,
                    open_box_customer_approval = $2,
                    open_box_condition = $3,
                    open_box_notes = $4,
                    open_box_verified_at = NOW()
                WHERE order_id = $5 AND agent_id = $6
            `, [JSON.stringify(verificationPhotos), customerApproval, itemCondition, notes, orderId, agentId]);

            // If customer rejected the item condition
            if (!customerApproval) {
                // Update order status to disputed
                await client.query(`
                    UPDATE orders 
                    SET status = 'disputed'
                    WHERE id = $1
                `, [orderId]);

                // Create automatic dispute
                await client.query(`
                    INSERT INTO disputes (
                        order_id, reporter_id, reason, description, 
                        evidence, status, created_at
                    )
                    SELECT 
                        $1, buyer_id, 'Item condition mismatch', 
                        'Customer rejected item during open-box verification', 
                        $2, 'pending', NOW()
                    FROM orders WHERE id = $1
                `, [orderId, JSON.stringify({ openBoxPhotos: verificationPhotos, agentNotes: notes })]);

                // Lock escrow funds
                const escrow = await client.query('SELECT id FROM escrows WHERE order_id = $1', [orderId]);
                if (escrow.rows.length > 0) {
                    await client.query(`
                        UPDATE escrows 
                        SET status = 'disputed', updated_at = NOW()
                        WHERE id = $1
                    `, [escrow.rows[0].id]);
                }
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error processing open-box verification:', error);
        res.status(500).json({ error: 'Failed to process verification' });
    }
});

// Get delivery agent performance metrics
router.get('/agent/metrics', async (req: Request, res: Response) => {
    try {
        const agentId = req.headers['agent-id'];

        const metrics = await query(`
            SELECT 
                COUNT(*) as total_deliveries,
                COUNT(CASE WHEN status = 'delivered' THEN 1 END) as successful_deliveries,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_deliveries,
                AVG(CASE WHEN status = 'delivered' THEN 
                    EXTRACT(EPOCH FROM (actual_delivery - created_at))/3600 
                END) as avg_delivery_hours,
                AVG(rating) as avg_rating
            FROM deliveries 
            WHERE agent_id = $1
        `, [agentId]);

        res.json(metrics.rows[0]);
    } catch (error) {
        console.error('Error fetching agent metrics:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});