import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

/**
 * GET /api/user/dashboard
 * Get user dashboard summary statistics
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        // Get all stats in parallel for better performance
        const [
            ordersStats,
            bidsStats,
            walletStats,
            listingsStats,
            recentActivity
        ] = await Promise.all([
            // Orders statistics
            query(`
                SELECT 
                    COUNT(*) as "totalOrders",
                    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as "pendingOrders",
                    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as "completedOrders",
                    COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN "totalAmount" ELSE 0 END), 0) as "totalSpent"
                FROM orders
                WHERE "buyerId" = $1
            `, [userId]),

            // Bids statistics
            query(`
                SELECT 
                    COUNT(DISTINCT ab."auctionId") as "totalBids",
                    COUNT(CASE WHEN ab."isWinning" = true AND a.status = 'ACTIVE' THEN 1 END) as "winningBids",
                    COUNT(CASE WHEN a.status = 'ENDED' AND a."winnerId" = $1 THEN 1 END) as "wonAuctions"
                FROM auction_bids ab
                JOIN auctions a ON a.id = ab."auctionId"
                WHERE ab."bidderId" = $1
            `, [userId]),

            // Wallet statistics
            query(`
                SELECT 
                    COALESCE("availableBalance", 0) as "availableBalance",
                    COALESCE("pendingBalance", 0) as "pendingBalance",
                    COALESCE("totalEarned", 0) as "totalEarned",
                    COALESCE("totalSpent", 0) as "totalSpent"
                FROM wallets
                WHERE "userId" = $1
            `, [userId]),

            // Listings statistics (for sellers)
            query(`
                SELECT 
                    COUNT(*) as "totalListings",
                    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as "activeListings",
                    COUNT(CASE WHEN status = 'SOLD' THEN 1 END) as "soldListings",
                    COALESCE(SUM(CASE WHEN status = 'SOLD' THEN price ELSE 0 END), 0) as "totalRevenue"
                FROM products
                WHERE "sellerId" = $1 AND status != 'DELETED'
            `, [userId]),

            // Recent activity (last 10 items)
            query(`
                SELECT * FROM (
                    -- Recent orders
                    SELECT 
                        'order' as type,
                        o.id,
                        o.status,
                        o."totalAmount" as amount,
                        o."createdAt" as timestamp,
                        json_build_object(
                            'orderId', o.id,
                            'status', o.status,
                            'totalAmount', o."totalAmount"
                        ) as details
                    FROM orders o
                    WHERE o."buyerId" = $1
                    
                    UNION ALL
                    
                    -- Recent bids
                    SELECT 
                        'bid' as type,
                        ab.id,
                        a.status,
                        ab.amount,
                        ab."createdAt" as timestamp,
                        json_build_object(
                            'auctionId', a.id,
                            'productTitle', p.title,
                            'bidAmount', ab.amount,
                            'isWinning', ab."isWinning"
                        ) as details
                    FROM auction_bids ab
                    JOIN auctions a ON a.id = ab."auctionId"
                    JOIN products p ON p.id = a."productId"
                    WHERE ab."bidderId" = $1
                    
                    UNION ALL
                    
                    -- Recent listings
                    SELECT 
                        'listing' as type,
                        p.id,
                        p.status,
                        p.price as amount,
                        p."createdAt" as timestamp,
                        json_build_object(
                            'productId', p.id,
                            'title', p.title,
                            'price', p.price,
                            'status', p.status
                        ) as details
                    FROM products p
                    WHERE p."sellerId" = $1 AND p.status != 'DELETED'
                ) activities
                ORDER BY timestamp DESC
                LIMIT 10
            `, [userId])
        ]);

        // Parse results
        const orders = ordersStats.rows[0] || {
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            totalSpent: 0
        };

        const bids = bidsStats.rows[0] || {
            totalBids: 0,
            winningBids: 0,
            wonAuctions: 0
        };

        const wallet = walletStats.rows[0] || {
            availableBalance: 0,
            pendingBalance: 0,
            totalEarned: 0,
            totalSpent: 0
        };

        const listings = listingsStats.rows[0] || {
            totalListings: 0,
            activeListings: 0,
            soldListings: 0,
            totalRevenue: 0
        };

        const activity = recentActivity.rows.map(item => ({
            type: item.type,
            id: item.id,
            status: item.status,
            amount: parseFloat(item.amount) || 0,
            timestamp: item.timestamp,
            details: item.details
        }));

        // Calculate additional metrics
        const totalBalance = parseFloat(wallet.availableBalance) + parseFloat(wallet.pendingBalance);

        res.json({
            success: true,
            dashboard: {
                orders: {
                    total: parseInt(orders.totalOrders),
                    pending: parseInt(orders.pendingOrders),
                    completed: parseInt(orders.completedOrders),
                    totalSpent: parseFloat(orders.totalSpent)
                },
                bids: {
                    total: parseInt(bids.totalBids),
                    winning: parseInt(bids.winningBids),
                    won: parseInt(bids.wonAuctions)
                },
                wallet: {
                    availableBalance: parseFloat(wallet.availableBalance),
                    pendingBalance: parseFloat(wallet.pendingBalance),
                    totalBalance,
                    totalEarned: parseFloat(wallet.totalEarned),
                    totalSpent: parseFloat(wallet.totalSpent)
                },
                listings: {
                    total: parseInt(listings.totalListings),
                    active: parseInt(listings.activeListings),
                    sold: parseInt(listings.soldListings),
                    totalRevenue: parseFloat(listings.totalRevenue)
                },
                recentActivity: activity
            }
        });

    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve dashboard data'
        });
    }
});

/**
 * GET /api/user/activity
 * Get detailed user activity with pagination
 */
router.get('/activity', async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const offset = (page - 1) * limit;
        const type = req.query.type as string; // Filter by activity type

        let typeFilter = '';
        if (type && ['order', 'bid', 'listing'].includes(type)) {
            typeFilter = `WHERE type = '${type}'`;
        }

        // Get total count
        const countResult = await query(`
            SELECT COUNT(*) as total FROM (
                SELECT 'order' as type FROM orders WHERE "buyerId" = $1
                UNION ALL
                SELECT 'bid' as type FROM auction_bids WHERE "bidderId" = $1
                UNION ALL
                SELECT 'listing' as type FROM products WHERE "sellerId" = $1 AND status != 'DELETED'
            ) activities ${typeFilter}
        `, [userId]);

        const total = parseInt(countResult.rows[0].total);

        // Get activity items
        const result = await query(`
            SELECT * FROM (
                SELECT 
                    'order' as type,
                    o.id,
                    o.status,
                    o."totalAmount" as amount,
                    o."createdAt" as timestamp,
                    json_build_object(
                        'orderId', o.id,
                        'status', o.status,
                        'totalAmount', o."totalAmount",
                        'itemCount', (SELECT COUNT(*) FROM order_items WHERE "orderId" = o.id)
                    ) as details
                FROM orders o
                WHERE o."buyerId" = $1
                
                UNION ALL
                
                SELECT 
                    'bid' as type,
                    ab.id,
                    a.status,
                    ab.amount,
                    ab."createdAt" as timestamp,
                    json_build_object(
                        'auctionId', a.id,
                        'productTitle', p.title,
                        'bidAmount', ab.amount,
                        'isWinning', ab."isWinning",
                        'auctionStatus', a.status
                    ) as details
                FROM auction_bids ab
                JOIN auctions a ON a.id = ab."auctionId"
                JOIN products p ON p.id = a."productId"
                WHERE ab."bidderId" = $1
                
                UNION ALL
                
                SELECT 
                    'listing' as type,
                    p.id,
                    p.status,
                    p.price as amount,
                    p."createdAt" as timestamp,
                    json_build_object(
                        'productId', p.id,
                        'title', p.title,
                        'price', p.price,
                        'status', p.status,
                        'views', p.views
                    ) as details
                FROM products p
                WHERE p."sellerId" = $1 AND p.status != 'DELETED'
            ) activities
            ${typeFilter}
            ORDER BY timestamp DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        const activities = result.rows.map(item => ({
            type: item.type,
            id: item.id,
            status: item.status,
            amount: parseFloat(item.amount) || 0,
            timestamp: item.timestamp,
            details: item.details
        }));

        res.json({
            success: true,
            activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve activity data'
        });
    }
});

export default router;
