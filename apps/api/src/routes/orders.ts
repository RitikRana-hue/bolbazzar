import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import { authenticateToken } from '../middleware/auth';
import { createNotification } from './notifications';
import { EscrowService } from '../services/escrow.service';

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

// Get user's orders
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { type = 'all', status, page = 1, limit = 20 } = req.query;

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        // Filter by user type (buyer/seller)
        if (type === 'buying') {
            whereClause += ' AND o."buyerId" = $1';
            params.push(userId);
        } else if (type === 'selling') {
            whereClause += ' AND o."sellerId" = $1';
            params.push(userId);
        } else {
            whereClause += ' AND (o."buyerId" = $1 OR o."sellerId" = $1)';
            params.push(userId);
        }

        // Filter by status
        if (status) {
            whereClause += ` AND o.status = $${params.length + 1}`;
            params.push(status);
        }

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        const orders = await query(`
            SELECT 
                o.*,
                buyer.username as "buyerName",
                buyer_profile."firstName" as "buyerFirstName",
                buyer_profile."lastName" as "buyerLastName",
                seller.username as "sellerName",
                seller_profile."firstName" as "sellerFirstName",
                seller_profile."lastName" as "sellerLastName",
                addr.name as "shippingName",
                addr.street as "shippingStreet",
                addr.city as "shippingCity",
                addr.state as "shippingState",
                addr."zipCode" as "shippingZipCode",
                e.status as "escrowStatus",
                e."releaseDate" as "escrowReleaseDate"
            FROM orders o
            JOIN users buyer ON buyer.id = o."buyerId"
            JOIN users seller ON seller.id = o."sellerId"
            LEFT JOIN user_profiles buyer_profile ON buyer_profile."userId" = buyer.id
            LEFT JOIN user_profiles seller_profile ON seller_profile."userId" = seller.id
            LEFT JOIN addresses addr ON addr.id = o."addressId"
            LEFT JOIN escrows e ON e."orderId" = o.id
            ${whereClause}
            ORDER BY o."createdAt" DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        // Get order items for each order
        for (const order of orders.rows) {
            const items = await query(`
                SELECT 
                    oi.*,
                    p.title,
                    p.condition,
                    p.brand,
                    p.model,
                    (SELECT url FROM product_images WHERE "productId" = p.id AND "isPrimary" = true LIMIT 1) as "primaryImage"
                FROM order_items oi
                JOIN products p ON p.id = oi."productId"
                WHERE oi."orderId" = $1
            `, [order.id]);

            order.items = items.rows;
        }

        res.json({
            orders: orders.rows,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string)
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get single order
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const order = await query(`
            SELECT 
                o.*,
                buyer.username as "buyerName",
                buyer.email as "buyerEmail",
                buyer_profile."firstName" as "buyerFirstName",
                buyer_profile."lastName" as "buyerLastName",
                buyer_profile.phone as "buyerPhone",
                seller.username as "sellerName",
                seller.email as "sellerEmail",
                seller_profile."firstName" as "sellerFirstName",
                seller_profile."lastName" as "sellerLastName",
                seller_profile.phone as "sellerPhone",
                addr.*,
                e.status as "escrowStatus",
                e."releaseDate" as "escrowReleaseDate",
                e.amount as "escrowAmount",
                d.status as "deliveryStatus",
                d."trackingNumber",
                d."estimatedDate" as "deliveryEstimatedDate",
                d."actualDate" as "deliveryActualDate"
            FROM orders o
            JOIN users buyer ON buyer.id = o."buyerId"
            JOIN users seller ON seller.id = o."sellerId"
            LEFT JOIN user_profiles buyer_profile ON buyer_profile."userId" = buyer.id
            LEFT JOIN user_profiles seller_profile ON seller_profile."userId" = seller.id
            LEFT JOIN addresses addr ON addr.id = o."addressId"
            LEFT JOIN escrows e ON e."orderId" = o.id
            LEFT JOIN deliveries d ON d."orderId" = o.id
            WHERE o.id = $1 AND (o."buyerId" = $2 OR o."sellerId" = $2)
        `, [id, userId]);

        if (order.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get order items
        const items = await query(`
            SELECT 
                oi.*,
                p.title,
                p.description,
                p.condition,
                p.brand,
                p.model,
                p.features,
                c.name as "categoryName"
            FROM order_items oi
            JOIN products p ON p.id = oi."productId"
            JOIN categories c ON c.id = p."categoryId"
            WHERE oi."orderId" = $1
        `, [id]);

        // Get product images for each item
        for (const item of items.rows) {
            const images = await query(
                'SELECT * FROM product_images WHERE "productId" = $1 ORDER BY "isPrimary" DESC, "sortOrder" ASC',
                [item.productId]
            );
            item.images = images.rows;
        }

        // Get payments
        const payments = await query(
            'SELECT * FROM payments WHERE "orderId" = $1 ORDER BY "createdAt" DESC',
            [id]
        );

        // Get delivery tracking if exists
        const tracking = await query(
            'SELECT * FROM delivery_tracking WHERE "deliveryId" = (SELECT id FROM deliveries WHERE "orderId" = $1) ORDER BY timestamp DESC',
            [id]
        );

        res.json({
            ...order.rows[0],
            items: items.rows,
            payments: payments.rows,
            tracking: tracking.rows
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Create order (for direct purchases)
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { productId, quantity = 1, addressId, notes } = req.body;

        if (!productId || !addressId) {
            return res.status(400).json({ error: 'Product ID and shipping address are required' });
        }

        const result = await transaction(async (client) => {
            // Get product details
            const product = await client.query(`
                SELECT p.*, u.id as "sellerId"
                FROM products p
                JOIN users u ON u.id = p."sellerId"
                WHERE p.id = $1 AND p.status = 'ACTIVE' AND p."isActive" = true
            `, [productId]);

            if (product.rows.length === 0) {
                throw new Error('Product not found or not available');
            }

            const productData = product.rows[0];

            // Check if user is not the seller
            if (productData.sellerId === userId) {
                throw new Error('Cannot purchase your own product');
            }

            // Check stock
            if (productData.stock < quantity) {
                throw new Error('Insufficient stock');
            }

            // Verify address belongs to user
            const address = await client.query(
                'SELECT * FROM addresses WHERE id = $1 AND "userId" = $2',
                [addressId, userId]
            );

            if (address.rows.length === 0) {
                throw new Error('Invalid shipping address');
            }

            // Calculate totals
            const subtotal = parseFloat(productData.price) * quantity;
            const shippingCost = 0; // Calculate based on location, weight, etc.
            const tax = subtotal * 0.08; // 8% tax (should be calculated based on location)
            const totalAmount = subtotal + shippingCost + tax;

            // Check wallet balance
            const wallet = await client.query(
                'SELECT "availableBalance" FROM wallets WHERE "userId" = $1',
                [userId]
            );

            if (wallet.rows.length === 0 || wallet.rows[0].availableBalance < totalAmount) {
                throw new Error('Insufficient wallet balance');
            }

            // Create order
            const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const order = await client.query(`
                INSERT INTO orders (
                    id, "buyerId", "sellerId", "addressId", subtotal, 
                    "shippingCost", tax, "totalAmount", notes, 
                    "createdAt", "updatedAt"
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
                RETURNING *
            `, [
                orderId, userId, productData.sellerId, addressId,
                subtotal, shippingCost, tax, totalAmount, notes
            ]);

            // Create order item
            const orderItemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await client.query(`
                INSERT INTO order_items (
                    id, "orderId", "productId", quantity, price, total
                )
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [orderItemId, orderId, productId, quantity, productData.price, subtotal]);

            // Update product stock
            await client.query(
                'UPDATE products SET stock = stock - $1, "updatedAt" = NOW() WHERE id = $2',
                [quantity, productId]
            );

            // Deduct from buyer's wallet
            await client.query(`
                UPDATE wallets 
                SET "availableBalance" = "availableBalance" - $1,
                    "updatedAt" = NOW()
                WHERE "userId" = $2
            `, [totalAmount, userId]);

            // Create escrow
            await EscrowService.createEscrow(
                orderId,
                userId,
                productData.sellerId,
                totalAmount,
                `order_${orderId}`
            );

            return order.rows[0];
        });

        // Send notifications
        await createNotification(
            result.sellerId,
            'order',
            'New Order Received',
            `You have received a new order #${result.id}`,
            `/account/orders/${result.id}`,
            { orderId: result.id, amount: result.totalAmount }
        );

        await createNotification(
            userId!,
            'order',
            'Order Placed Successfully',
            `Your order #${result.id} has been placed successfully`,
            `/account/orders/${result.id}`,
            { orderId: result.id, amount: result.totalAmount }
        );

        res.status(201).json({
            message: 'Order created successfully',
            order: result
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to create order'
        });
    }
});

// Update order status (seller only)
router.put('/:id/status', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { status, trackingNumber, notes } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await transaction(async (client) => {
            // Verify order belongs to seller
            const order = await client.query(
                'SELECT * FROM orders WHERE id = $1 AND "sellerId" = $2',
                [id, userId]
            );

            if (order.rows.length === 0) {
                throw new Error('Order not found or not authorized');
            }

            const orderData = order.rows[0];

            // Update order
            const updateFields = ['status = $1', '"updatedAt" = NOW()'];
            const updateValues = [status];
            let paramCount = 1;

            if (trackingNumber) {
                paramCount++;
                updateFields.push(`"trackingNumber" = $${paramCount}`);
                updateValues.push(trackingNumber);
            }

            if (status === 'SHIPPED') {
                paramCount++;
                updateFields.push(`"shippedAt" = $${paramCount}`);
                updateValues.push(new Date());
            }

            if (status === 'DELIVERED') {
                paramCount++;
                updateFields.push(`"deliveredAt" = $${paramCount}`);
                updateValues.push(new Date());
            }

            paramCount++;
            updateValues.push(id);

            await client.query(`
                UPDATE orders 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramCount}
            `, updateValues);

            // Auto-release escrow on delivery
            if (status === 'DELIVERED') {
                try {
                    const escrow = await client.query(
                        'SELECT id FROM escrows WHERE "orderId" = $1 AND status = \'HOLDING\'',
                        [id]
                    );

                    if (escrow.rows.length > 0) {
                        await EscrowService.releaseEscrow(escrow.rows[0].id, 'delivery_confirmed');
                    }
                } catch (escrowError) {
                    console.error('Error releasing escrow:', escrowError);
                }
            }

            return { ...orderData, status };
        });

        // Send notification to buyer
        const statusMessages = {
            CONFIRMED: 'Your order has been confirmed',
            PROCESSING: 'Your order is being processed',
            SHIPPED: 'Your order has been shipped',
            DELIVERED: 'Your order has been delivered',
            CANCELLED: 'Your order has been cancelled'
        };

        await createNotification(
            result.buyerId,
            'order',
            'Order Status Updated',
            statusMessages[status as keyof typeof statusMessages],
            `/account/orders/${id}`,
            { orderId: id, status, trackingNumber }
        );

        res.json({
            message: 'Order status updated successfully',
            order: result
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to update order status'
        });
    }
});

// Cancel order
router.post('/:id/cancel', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { reason } = req.body;

        const result = await transaction(async (client) => {
            // Get order details
            const order = await client.query(
                'SELECT * FROM orders WHERE id = $1 AND ("buyerId" = $2 OR "sellerId" = $2)',
                [id, userId]
            );

            if (order.rows.length === 0) {
                throw new Error('Order not found or not authorized');
            }

            const orderData = order.rows[0];

            // Check if order can be cancelled
            if (['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(orderData.status)) {
                throw new Error('Order cannot be cancelled');
            }

            // Update order status
            await client.query(`
                UPDATE orders 
                SET status = 'CANCELLED', "updatedAt" = NOW()
                WHERE id = $1
            `, [id]);

            // Refund to buyer's wallet
            await client.query(`
                UPDATE wallets 
                SET "availableBalance" = "availableBalance" + $1,
                    "updatedAt" = NOW()
                WHERE "userId" = $2
            `, [orderData.totalAmount, orderData.buyerId]);

            // Update escrow status
            await client.query(
                'UPDATE escrows SET status = \'REFUNDED\', "updatedAt" = NOW() WHERE "orderId" = $1',
                [id]
            );

            // Restore product stock
            const orderItems = await client.query(
                'SELECT "productId", quantity FROM order_items WHERE "orderId" = $1',
                [id]
            );

            for (const item of orderItems.rows) {
                await client.query(
                    'UPDATE products SET stock = stock + $1, "updatedAt" = NOW() WHERE id = $2',
                    [item.quantity, item.productId]
                );
            }

            // Create transaction record
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await client.query(`
                INSERT INTO transactions (
                    id, "userId", type, amount, status, "referenceId", 
                    description, "createdAt"
                )
                VALUES ($1, $2, 'REFUND', $3, 'COMPLETED', $4, $5, NOW())
            `, [
                transactionId,
                orderData.buyerId,
                orderData.totalAmount,
                id,
                `Order cancellation refund: ${reason || 'No reason provided'}`
            ]);

            return orderData;
        });

        // Send notifications
        const otherUserId = result.buyerId === userId ? result.sellerId : result.buyerId;
        const isSellerCancelling = result.sellerId === userId;

        await createNotification(
            otherUserId,
            'order',
            'Order Cancelled',
            `Order #${id} has been cancelled${isSellerCancelling ? ' by the seller' : ''}`,
            `/account/orders/${id}`,
            { orderId: id, reason, cancelledBy: isSellerCancelling ? 'seller' : 'buyer' }
        );

        res.json({
            message: 'Order cancelled successfully',
            refundAmount: result.totalAmount
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to cancel order'
        });
    }
});

// Confirm delivery (buyer only)
router.post('/:id/confirm-delivery', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const result = await transaction(async (client) => {
            // Verify order belongs to buyer
            const order = await client.query(
                'SELECT * FROM orders WHERE id = $1 AND "buyerId" = $2',
                [id, userId]
            );

            if (order.rows.length === 0) {
                throw new Error('Order not found or not authorized');
            }

            const orderData = order.rows[0];

            if (orderData.status !== 'SHIPPED') {
                throw new Error('Order must be shipped before confirming delivery');
            }

            // Update order status
            await client.query(`
                UPDATE orders 
                SET status = 'DELIVERED', "deliveredAt" = NOW(), "updatedAt" = NOW()
                WHERE id = $1
            `, [id]);

            // Release escrow
            const escrow = await client.query(
                'SELECT id FROM escrows WHERE "orderId" = $1 AND status = \'HOLDING\'',
                [id]
            );

            if (escrow.rows.length > 0) {
                await EscrowService.releaseEscrow(escrow.rows[0].id, 'delivery_confirmed');
            }

            return orderData;
        });

        // Send notification to seller
        await createNotification(
            result.sellerId,
            'order',
            'Delivery Confirmed',
            `Buyer has confirmed delivery for order #${id}`,
            `/account/orders/${id}`,
            { orderId: id }
        );

        res.json({
            message: 'Delivery confirmed successfully'
        });
    } catch (error) {
        console.error('Error confirming delivery:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to confirm delivery'
        });
    }
});

// Get order statistics (for dashboard)
router.get('/stats/summary', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const stats = await query(`
            SELECT 
                COUNT(CASE WHEN "buyerId" = $1 THEN 1 END) as "totalBought",
                COUNT(CASE WHEN "sellerId" = $1 THEN 1 END) as "totalSold",
                SUM(CASE WHEN "buyerId" = $1 THEN "totalAmount" ELSE 0 END) as "totalSpent",
                SUM(CASE WHEN "sellerId" = $1 THEN "totalAmount" ELSE 0 END) as "totalEarned",
                COUNT(CASE WHEN ("buyerId" = $1 OR "sellerId" = $1) AND status = 'PENDING' THEN 1 END) as "pendingOrders",
                COUNT(CASE WHEN ("buyerId" = $1 OR "sellerId" = $1) AND status = 'DELIVERED' THEN 1 END) as "completedOrders"
            FROM orders 
            WHERE "buyerId" = $1 OR "sellerId" = $1
        `, [userId]);

        res.json({ stats: stats.rows[0] });
    } catch (error) {
        console.error('Error fetching order stats:', error);
        res.status(500).json({ error: 'Failed to fetch order statistics' });
    }
});

export default router;