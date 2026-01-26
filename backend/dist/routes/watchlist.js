"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const auditLog_1 = require("../middleware/auditLog");
const router = (0, express_1.Router)();
// All watchlist routes require authentication
router.use(auth_1.authenticateToken);
/**
 * GET /api/watchlist
 * Get user's watchlist with pagination
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;
        // Get total count
        const countResult = await (0, db_1.query)(`
            SELECT COUNT(*) as total
            FROM watchlists w
            JOIN products p ON p.id = w."productId"
            WHERE w."userId" = $1 AND p.status != 'DELETED'
        `, [userId]);
        const total = parseInt(countResult.rows[0].total);
        // Get watchlist items with product details
        const itemsResult = await (0, db_1.query)(`
            SELECT 
                w.id,
                w."productId",
                w."createdAt",
                p.title,
                p.price,
                p.status,
                p.condition,
                p.stock,
                p."sellerId",
                u.username as "sellerName",
                pi.url as "imageUrl",
                c.name as "categoryName",
                (SELECT COUNT(*) FROM auction_bids ab 
                 JOIN auctions a ON a.id = ab."auctionId" 
                 WHERE a."productId" = p.id) as "bidCount"
            FROM watchlists w
            JOIN products p ON p.id = w."productId"
            JOIN users u ON u.id = p."sellerId"
            LEFT JOIN product_images pi ON pi."productId" = p.id AND pi."isPrimary" = true
            LEFT JOIN categories c ON c.id = p."categoryId"
            WHERE w."userId" = $1 AND p.status != 'DELETED'
            ORDER BY w."createdAt" DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);
        const items = itemsResult.rows.map((item) => ({
            id: item.id,
            productId: item.productid,
            title: item.title,
            price: parseFloat(item.price),
            status: item.status,
            condition: item.condition,
            stock: item.stock,
            seller: {
                id: item.sellerid,
                username: item.sellername
            },
            imageUrl: item.imageurl,
            category: item.categoryname,
            bidCount: parseInt(item.bidcount) || 0,
            addedAt: item.createdat
        }));
        res.json({
            success: true,
            watchlist: items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get watchlist error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve watchlist'
        });
    }
});
/**
 * POST /api/watchlist
 * Add product to watchlist
 */
router.post('/', (0, validation_1.validateBody)(schemas_1.addToWatchlistSchema), (0, auditLog_1.auditMiddleware)('ADD_TO_WATCHLIST', 'watchlist'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        // Validate product exists
        const productResult = await (0, db_1.query)(`
                SELECT id, title, status, "sellerId"
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
        // Check if user is trying to watch their own product
        if (product.sellerid === userId) {
            return res.status(400).json({
                success: false,
                error: 'Cannot add your own product to watchlist'
            });
        }
        // Check if product is deleted
        if (product.status === 'DELETED') {
            return res.status(400).json({
                success: false,
                error: 'Product is no longer available'
            });
        }
        // Check if already in watchlist
        const existingResult = await (0, db_1.query)(`
                SELECT id FROM watchlists
                WHERE "userId" = $1 AND "productId" = $2
            `, [userId, productId]);
        if (existingResult.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Product already in watchlist'
            });
        }
        // Add to watchlist
        await (0, db_1.query)(`
                INSERT INTO watchlists ("userId", "productId", "createdAt")
                VALUES ($1, $2, NOW())
            `, [userId, productId]);
        res.json({
            success: true,
            message: 'Product added to watchlist successfully'
        });
    }
    catch (error) {
        console.error('Add to watchlist error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add product to watchlist'
        });
    }
});
/**
 * DELETE /api/watchlist/:productId
 * Remove product from watchlist
 */
router.delete('/:productId', (0, auditLog_1.auditMiddleware)('REMOVE_FROM_WATCHLIST', 'watchlist'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        // Remove from watchlist
        const result = await (0, db_1.query)(`
                DELETE FROM watchlists
                WHERE "userId" = $1 AND "productId" = $2
                RETURNING id
            `, [userId, productId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Product not found in watchlist'
            });
        }
        res.json({
            success: true,
            message: 'Product removed from watchlist successfully'
        });
    }
    catch (error) {
        console.error('Remove from watchlist error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove product from watchlist'
        });
    }
});
/**
 * GET /api/watchlist/check/:productId
 * Check if product is in user's watchlist
 */
router.get('/check/:productId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const result = await (0, db_1.query)(`
            SELECT id FROM watchlists
            WHERE "userId" = $1 AND "productId" = $2
        `, [userId, productId]);
        res.json({
            success: true,
            isWatched: result.rows.length > 0
        });
    }
    catch (error) {
        console.error('Check watchlist error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check watchlist status'
        });
    }
});
exports.default = router;
//# sourceMappingURL=watchlist.js.map