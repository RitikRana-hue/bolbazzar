import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { addToCartSchema, updateCartItemSchema } from '../validation/schemas';
import { auditMiddleware } from '../middleware/auditLog';

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

/**
 * GET /api/cart
 * Get user's cart with items
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        // Get or create cart
        let cartResult = await query(`
            SELECT id FROM carts WHERE "userId" = $1
        `, [userId]);

        let cartId: string;

        if (cartResult.rows.length === 0) {
            // Create cart if doesn't exist
            const newCart = await query(`
                INSERT INTO carts ("userId", "createdAt", "updatedAt")
                VALUES ($1, NOW(), NOW())
                RETURNING id
            `, [userId]);
            cartId = newCart.rows[0].id;
        } else {
            cartId = cartResult.rows[0].id;
        }

        // Get cart items with product details
        const itemsResult = await query(`
            SELECT 
                ci.id,
                ci."productId",
                ci.quantity,
                ci.price,
                ci."createdAt",
                p.title,
                p.status,
                p.stock,
                p.price as "currentPrice",
                pi.url as "imageUrl"
            FROM cart_items ci
            JOIN products p ON p.id = ci."productId"
            LEFT JOIN product_images pi ON pi."productId" = p.id AND pi."isPrimary" = true
            WHERE ci."cartId" = $1
            ORDER BY ci."createdAt" DESC
        `, [cartId]);

        // Calculate totals
        let subtotal = 0;
        const items = itemsResult.rows.map((item: any) => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            subtotal += itemTotal;

            return {
                id: item.id,
                productId: item.productid,
                title: item.title,
                quantity: item.quantity,
                price: parseFloat(item.price),
                currentPrice: parseFloat(item.currentprice),
                total: itemTotal,
                imageUrl: item.imageurl,
                status: item.status,
                stock: item.stock,
                isAvailable: item.status === 'ACTIVE' && item.stock >= item.quantity
            };
        });

        res.json({
            success: true,
            cart: {
                id: cartId,
                items,
                itemCount: items.length,
                subtotal,
                updatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve cart'
        });
    }
});

/**
 * POST /api/cart/items
 * Add item to cart
 */
router.post('/items',
    validateBody(addToCartSchema),
    auditMiddleware('ADD_TO_CART', 'cart'),
    async (req: Request, res: Response) => {
        try {
            const userId = req.user!.id;
            const { productId, quantity } = req.body;

            // Validate product exists and is available
            const productResult = await query(`
                SELECT id, title, price, status, stock, "sellerId"
                FROM products
                WHERE id = $1
            `, [productId]);

            if (productResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            const product = productResult.rows[0];

            // Check if user is trying to buy their own product
            if (product.sellerid === userId) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot add your own product to cart'
                });
            }

            // Check product availability
            if (product.status !== 'ACTIVE') {
                return res.status(400).json({
                    success: false,
                    error: 'Product is not available for purchase'
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    error: `Only ${product.stock} items available in stock`
                });
            }

            await transaction(async (client) => {
                // Get or create cart
                let cartResult = await client.query(`
                    SELECT id FROM carts WHERE "userId" = $1
                `, [userId]);

                let cartId: string;

                if (cartResult.rows.length === 0) {
                    const newCart = await client.query(`
                        INSERT INTO carts ("userId", "createdAt", "updatedAt")
                        VALUES ($1, NOW(), NOW())
                        RETURNING id
                    `, [userId]);
                    cartId = newCart.rows[0].id;
                } else {
                    cartId = cartResult.rows[0].id;
                }

                // Check if item already in cart
                const existingItem = await client.query(`
                    SELECT id, quantity FROM cart_items
                    WHERE "cartId" = $1 AND "productId" = $2
                `, [cartId, productId]);

                if (existingItem.rows.length > 0) {
                    // Update quantity
                    const newQuantity = existingItem.rows[0].quantity + quantity;

                    if (newQuantity > product.stock) {
                        throw new Error(`Cannot add more items. Only ${product.stock} available in stock`);
                    }

                    await client.query(`
                        UPDATE cart_items
                        SET quantity = $1, price = $2, "updatedAt" = NOW()
                        WHERE id = $3
                    `, [newQuantity, product.price, existingItem.rows[0].id]);
                } else {
                    // Add new item
                    await client.query(`
                        INSERT INTO cart_items ("cartId", "productId", quantity, price, "createdAt", "updatedAt")
                        VALUES ($1, $2, $3, $4, NOW(), NOW())
                    `, [cartId, productId, quantity, product.price]);
                }

                // Update cart timestamp
                await client.query(`
                    UPDATE carts SET "updatedAt" = NOW() WHERE id = $1
                `, [cartId]);
            });

            res.json({
                success: true,
                message: 'Item added to cart successfully'
            });

        } catch (error: any) {
            console.error('Add to cart error:', error);
            res.status(400).json({
                success: false,
                error: error.message || 'Failed to add item to cart'
            });
        }
    });

/**
 * PATCH /api/cart/items/:itemId
 * Update cart item quantity
 */
router.patch('/items/:itemId',
    validateBody(updateCartItemSchema),
    auditMiddleware('UPDATE_CART_ITEM', 'cart'),
    async (req: Request, res: Response) => {
        try {
            const userId = req.user!.id;
            const { itemId } = req.params;
            const { quantity } = req.body;

            // Verify item belongs to user's cart
            const itemResult = await query(`
                SELECT ci.id, ci."productId", p.stock, p.status
                FROM cart_items ci
                JOIN carts c ON c.id = ci."cartId"
                JOIN products p ON p.id = ci."productId"
                WHERE ci.id = $1 AND c."userId" = $2
            `, [itemId, userId]);

            if (itemResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Cart item not found'
                });
            }

            const item = itemResult.rows[0];

            // Validate stock
            if (item.status !== 'ACTIVE') {
                return res.status(400).json({
                    success: false,
                    error: 'Product is no longer available'
                });
            }

            if (quantity > item.stock) {
                return res.status(400).json({
                    success: false,
                    error: `Only ${item.stock} items available in stock`
                });
            }

            // Update quantity
            await query(`
                UPDATE cart_items
                SET quantity = $1, "updatedAt" = NOW()
                WHERE id = $2
            `, [quantity, itemId]);

            res.json({
                success: true,
                message: 'Cart item updated successfully'
            });

        } catch (error) {
            console.error('Update cart item error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update cart item'
            });
        }
    });

/**
 * DELETE /api/cart/items/:itemId
 * Remove item from cart
 */
router.delete('/items/:itemId',
    auditMiddleware('REMOVE_FROM_CART', 'cart'),
    async (req: Request, res: Response) => {
        try {
            const userId = req.user!.id;
            const { itemId } = req.params;

            // Verify item belongs to user's cart and delete
            const result = await query(`
                DELETE FROM cart_items ci
                USING carts c
                WHERE ci."cartId" = c.id
                AND ci.id = $1
                AND c."userId" = $2
                RETURNING ci.id
            `, [itemId, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Cart item not found'
                });
            }

            res.json({
                success: true,
                message: 'Item removed from cart successfully'
            });

        } catch (error) {
            console.error('Remove cart item error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to remove item from cart'
            });
        }
    });

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/',
    auditMiddleware('CLEAR_CART', 'cart'),
    async (req: Request, res: Response) => {
        try {
            const userId = req.user!.id;

            // Delete all items from user's cart
            await query(`
                DELETE FROM cart_items ci
                USING carts c
                WHERE ci."cartId" = c.id
                AND c."userId" = $1
            `, [userId]);

            res.json({
                success: true,
                message: 'Cart cleared successfully'
            });

        } catch (error) {
            console.error('Clear cart error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to clear cart'
            });
        }
    });

export default router;
