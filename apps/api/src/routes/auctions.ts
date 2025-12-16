import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import { createNotification } from './notifications';
import { io } from '../index'; // Socket.IO instance
import { authenticateToken, requireSeller } from '../middleware/auth';

interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

const router = Router();

// Apply authentication middleware to protected routes
router.use('/:id/bid', authenticateToken);
router.use('/user/bids', authenticateToken);
router.use('/:id/end', authenticateToken);
router.use('/:id/watch', authenticateToken);

// Get all active auctions
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            endingSoon, // within 24 hours
            search,
            sortBy = 'endTime',
            sortOrder = 'ASC',
            page = 1,
            limit = 20
        } = req.query;

        let whereClause = 'WHERE a.status = $1';
        const params = ['ACTIVE'];
        let paramCount = 1;

        if (category) {
            paramCount++;
            whereClause += ` AND c.slug = $${paramCount}`;
            params.push(category as string);
        }

        if (minPrice) {
            paramCount++;
            whereClause += ` AND a.currentPrice >= $${paramCount}`;
            params.push(minPrice as string);
        }

        if (maxPrice) {
            paramCount++;
            whereClause += ` AND a.currentPrice <= $${paramCount}`;
            params.push(maxPrice as string);
        }

        if (endingSoon === 'true') {
            paramCount++;
            whereClause += ` AND a.endTime <= $${paramCount}`;
            params.push(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        const result = await query(`
            SELECT 
                a.*,
                p.title,
                p.description,
                p.condition,
                c.name as categoryName,
                c.slug as categorySlug,
                u.username as sellerName,
                up.firstName as sellerFirstName,
                up.lastName as sellerLastName,
                (SELECT url FROM product_images WHERE productId = p.id AND isPrimary = true LIMIT 1) as primaryImage,
                (SELECT AVG(rating) FROM reviews WHERE targetId = p.sellerId) as sellerRating,
                CASE 
                    WHEN a.reservePrice IS NOT NULL AND a.currentPrice >= a.reservePrice 
                    THEN true 
                    ELSE false 
                END as isReserveMet
            FROM auctions a
            JOIN products p ON p.id = a.productId
            JOIN categories c ON c.id = p.categoryId
            JOIN users u ON u.id = a.sellerId
            LEFT JOIN user_profiles up ON up.userId = u.id
            ${whereClause}
            ORDER BY a.${sortBy} ${sortOrder}
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `, [...params, limit, offset]);

        // Get total count
        const countResult = await query(`
            SELECT COUNT(*) as total
            FROM auctions a
            JOIN products p ON p.id = a.productId
            JOIN categories c ON c.id = p.categoryId
            ${whereClause}
        `, params);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / parseInt(limit as string));

        res.json({
            auctions: result.rows,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching auctions:', error);
        res.status(500).json({ error: 'Failed to fetch auctions' });
    }
});

// Get single auction
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT 
                a.*,
                p.title,
                p.description,
                p.condition,
                p.brand,
                p.model,
                p.features,
                p.weight,
                p.dimensions,
                c.name as categoryName,
                c.slug as categorySlug,
                u.username as sellerName,
                u.id as sellerId,
                up.firstName as sellerFirstName,
                up.lastName as sellerLastName,
                up.avatar as sellerAvatar,
                up.location as sellerLocation,
                (SELECT AVG(rating) FROM reviews WHERE targetId = p.sellerId) as sellerRating,
                (SELECT COUNT(*) FROM reviews WHERE targetId = p.sellerId) as sellerReviewCount,
                CASE 
                    WHEN a.reservePrice IS NOT NULL AND a.currentPrice >= a.reservePrice 
                    THEN true 
                    ELSE false 
                END as isReserveMet
            FROM auctions a
            JOIN products p ON p.id = a.productId
            JOIN categories c ON c.id = p.categoryId
            JOIN users u ON u.id = a.sellerId
            LEFT JOIN user_profiles up ON up.userId = u.id
            WHERE a.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Auction not found' });
        }

        const auction = result.rows[0];

        // Get product images
        const images = await query(
            'SELECT * FROM product_images WHERE productId = $1 ORDER BY isPrimary DESC, sortOrder ASC',
            [auction.productId]
        );

        // Get recent bids
        const bids = await query(`
            SELECT 
                ab.*,
                u.username as bidderName,
                up.firstName,
                up.lastName,
                up.avatar as bidderAvatar
            FROM auction_bids ab
            JOIN users u ON u.id = ab.bidderId
            LEFT JOIN user_profiles up ON up.userId = u.id
            WHERE ab.auctionId = $1
            ORDER BY ab.createdAt DESC
            LIMIT 20
        `, [id]);

        res.json({
            ...auction,
            images: images.rows,
            bids: bids.rows
        });
    } catch (error) {
        console.error('Error fetching auction:', error);
        res.status(500).json({ error: 'Failed to fetch auction' });
    }
});

// Place bid
router.post('/:id/bid', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { amount, maxBid } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid bid amount is required' });
        }

        const result = await transaction(async (client) => {
            // Get auction details with lock
            const auction = await client.query(`
                SELECT a.*, p.sellerId, p.title
                FROM auctions a
                JOIN products p ON p.id = a.productId
                WHERE a.id = $1 AND a.status = 'ACTIVE'
                FOR UPDATE
            `, [id]);

            if (auction.rows.length === 0) {
                throw new Error('Auction not found or not active');
            }

            const auctionData = auction.rows[0];

            // Check if auction has ended
            if (new Date() > new Date(auctionData.endTime)) {
                throw new Error('Auction has ended');
            }

            // Check if user is not the seller
            if (auctionData.sellerId === userId) {
                throw new Error('Sellers cannot bid on their own auctions');
            }

            // Check if bid is higher than current price + increment
            const minBid = parseFloat(auctionData.currentPrice) + parseFloat(auctionData.bidIncrement);
            if (amount < minBid) {
                throw new Error(`Bid must be at least $${minBid.toFixed(2)}`);
            }

            // Check if user has sufficient wallet balance
            const wallet = await client.query(
                'SELECT availableBalance FROM wallets WHERE userId = $1',
                [userId]
            );

            if (wallet.rows.length === 0 || wallet.rows[0].availableBalance < amount) {
                throw new Error('Insufficient wallet balance');
            }

            // Create bid
            const bid = await client.query(`
                INSERT INTO auction_bids (auctionId, bidderId, amount, maxBid, isWinning)
                VALUES ($1, $2, $3, $4, true)
                RETURNING *
            `, [id, userId, amount, maxBid || amount]);

            // Mark previous winning bids as not winning
            await client.query(`
                UPDATE auction_bids 
                SET isWinning = false 
                WHERE auctionId = $1 AND id != $2
            `, [id, bid.rows[0].id]);

            // Update auction current price and bid count
            await client.query(`
                UPDATE auctions 
                SET currentPrice = $1, totalBids = totalBids + 1, updatedAt = NOW()
                WHERE id = $2
            `, [amount, id]);

            // Auto-extend if bid placed in last 5 minutes and auto-extend is enabled
            const timeLeft = new Date(auctionData.endTime).getTime() - new Date().getTime();
            if (auctionData.autoExtend && timeLeft <= 5 * 60 * 1000) { // 5 minutes
                const newEndTime = new Date(Date.now() + auctionData.extensionTime * 1000);
                await client.query(
                    'UPDATE auctions SET endTime = $1 WHERE id = $2',
                    [newEndTime, id]
                );
            }

            // Reserve funds in wallet
            await client.query(`
                UPDATE wallets 
                SET availableBalance = availableBalance - $1
                WHERE userId = $2
            `, [amount, userId]);

            return bid.rows[0];
        });

        // Emit real-time update
        io.to(`auction_${id}`).emit('newBid', {
            auctionId: id,
            bidId: result.id,
            amount,
            bidderId: userId,
            timestamp: result.createdAt
        });

        // Notify previous highest bidder
        const previousBids = await query(
            'SELECT bidderId FROM auction_bids WHERE auctionId = $1 AND id != $2 ORDER BY amount DESC LIMIT 1',
            [id, result.id]
        );

        if (previousBids.rows.length > 0) {
            await createNotification(
                previousBids.rows[0].bidderId,
                'auction',
                'Outbid Alert',
                'You have been outbid on an auction',
                `/auctions/${id}`,
                { auctionId: id, newBid: amount }
            );
        }

        res.json({
            message: 'Bid placed successfully',
            bid: result
        });
    } catch (error) {
        console.error('Error placing bid:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to place bid'
        });
    }
});

// Get user's bids
router.get('/user/bids', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { status = 'all', page = 1, limit = 20 } = req.query;

        let whereClause = 'WHERE ab.bidderId = $1';
        const params = [userId];

        if (status !== 'all') {
            whereClause += ' AND a.status = $2';
            params.push(status as string);
        }

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        const result = await query(`
            SELECT 
                ab.*,
                a.currentPrice,
                a.endTime,
                a.status as auctionStatus,
                p.title,
                p.condition,
                (SELECT url FROM product_images WHERE productId = p.id AND isPrimary = true LIMIT 1) as primaryImage,
                CASE WHEN ab.isWinning THEN true ELSE false END as isCurrentWinner
            FROM auction_bids ab
            JOIN auctions a ON a.id = ab.auctionId
            JOIN products p ON p.id = a.productId
            ${whereClause}
            ORDER BY ab.createdAt DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        res.json({ bids: result.rows });
    } catch (error) {
        console.error('Error fetching user bids:', error);
        res.status(500).json({ error: 'Failed to fetch bids' });
    }
});

// End auction (system/admin only)
router.post('/:id/end', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const result = await transaction(async (client) => {
            // Get auction with winning bid
            const auction = await client.query(`
                SELECT 
                    a.*,
                    p.title,
                    p.sellerId,
                    ab.bidderId as winnerId,
                    ab.amount as winningAmount,
                    ab.id as winningBidId
                FROM auctions a
                JOIN products p ON p.id = a.productId
                LEFT JOIN auction_bids ab ON ab.auctionId = a.id AND ab.isWinning = true
                WHERE a.id = $1 AND a.status = 'ACTIVE'
            `, [id]);

            if (auction.rows.length === 0) {
                throw new Error('Auction not found or already ended');
            }

            const auctionData = auction.rows[0];

            // Check authorization (seller or admin)
            if (auctionData.sellerId !== userId && req.user?.role !== 'admin') {
                throw new Error('Not authorized to end this auction');
            }

            // Update auction status
            await client.query(`
                UPDATE auctions 
                SET status = 'ENDED', winnerId = $1, winningBidId = $2, updatedAt = NOW()
                WHERE id = $3
            `, [auctionData.winnerId, auctionData.winningBidId, id]);

            // If there's a winner, create order
            if (auctionData.winnerId && auctionData.winningAmount) {
                // Create order
                const order = await client.query(`
                    INSERT INTO orders (
                        buyerId, sellerId, subtotal, totalAmount, 
                        status, paymentStatus
                    )
                    VALUES ($1, $2, $3, $4, 'PENDING', 'PENDING')
                    RETURNING *
                `, [
                    auctionData.winnerId,
                    auctionData.sellerId,
                    auctionData.winningAmount,
                    auctionData.winningAmount
                ]);

                // Create order item
                await client.query(`
                    INSERT INTO order_items (orderId, productId, quantity, price, total)
                    VALUES ($1, $2, 1, $3, $4)
                `, [
                    order.rows[0].id,
                    auctionData.productId,
                    auctionData.winningAmount,
                    auctionData.winningAmount
                ]);

                // Update product status
                await client.query(
                    'UPDATE products SET status = $1 WHERE id = $2',
                    ['SOLD', auctionData.productId]
                );

                // Notify winner
                await createNotification(
                    auctionData.winnerId,
                    'auction',
                    'Auction Won!',
                    `Congratulations! You won the auction for "${auctionData.title}"`,
                    `/orders/${order.rows[0].id}`,
                    { auctionId: id, orderId: order.rows[0].id }
                );

                // Notify seller
                await createNotification(
                    auctionData.sellerId,
                    'auction',
                    'Auction Ended',
                    `Your auction for "${auctionData.title}" has ended with a winning bid`,
                    `/account/orders`,
                    { auctionId: id, orderId: order.rows[0].id }
                );
            }

            // Release funds for non-winning bidders
            await client.query(`
                UPDATE wallets 
                SET availableBalance = availableBalance + ab.amount
                FROM auction_bids ab
                WHERE wallets.userId = ab.bidderId 
                AND ab.auctionId = $1 
                AND ab.isWinning = false
            `, [id]);

            return {
                ...auctionData,
                winnerId: auctionData.winnerId,
                winningAmount: auctionData.winningAmount
            };
        });

        // Emit real-time update
        io.to(`auction_${id}`).emit('auctionEnded', {
            auctionId: id,
            winnerId: result.winnerId,
            winningAmount: result.winningAmount
        });

        res.json({
            message: 'Auction ended successfully',
            auction: result
        });
    } catch (error) {
        console.error('Error ending auction:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to end auction'
        });
    }
});

// Get auction statistics
router.get('/:id/stats', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const stats = await query(`
            SELECT 
                COUNT(ab.id) as totalBids,
                COUNT(DISTINCT ab.bidderId) as uniqueBidders,
                MIN(ab.amount) as lowestBid,
                MAX(ab.amount) as highestBid,
                AVG(ab.amount) as averageBid,
                a.startingPrice,
                a.currentPrice,
                a.reservePrice,
                CASE 
                    WHEN a.reservePrice IS NOT NULL AND a.currentPrice >= a.reservePrice 
                    THEN true 
                    ELSE false 
                END as isReserveMet
            FROM auctions a
            LEFT JOIN auction_bids ab ON ab.auctionId = a.id
            WHERE a.id = $1
            GROUP BY a.id, a.startingPrice, a.currentPrice, a.reservePrice
        `, [id]);

        if (stats.rows.length === 0) {
            return res.status(404).json({ error: 'Auction not found' });
        }

        res.json({ stats: stats.rows[0] });
    } catch (error) {
        console.error('Error fetching auction stats:', error);
        res.status(500).json({ error: 'Failed to fetch auction statistics' });
    }
});

// Watch auction (join real-time updates)
router.post('/:id/watch', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // In a real implementation, this would be handled by Socket.IO
        // when a user joins the auction room

        res.json({ message: 'Watching auction for real-time updates' });
    } catch (error) {
        console.error('Error watching auction:', error);
        res.status(500).json({ error: 'Failed to watch auction' });
    }
});

export default router;