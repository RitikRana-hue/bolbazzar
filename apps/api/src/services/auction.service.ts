import { query, transaction } from '../db';
import { io } from '../index';
import { createNotification } from '../routes/notifications';

export class AuctionService {
    // Auto-extend auction if bid placed in last 5 minutes
    static async handleAutoExtension(auctionId: string): Promise<boolean> {
        try {
            const result = await query(`
                SELECT endTime, autoExtend, extensionTime
                FROM auctions 
                WHERE id = $1 AND status = 'ACTIVE'
            `, [auctionId]);

            if (result.rows.length === 0) return false;

            const auction = result.rows[0];
            if (!auction.autoExtend) return false;

            const timeLeft = new Date(auction.endTime).getTime() - new Date().getTime();
            const extensionThreshold = 5 * 60 * 1000; // 5 minutes

            if (timeLeft <= extensionThreshold) {
                const newEndTime = new Date(Date.now() + auction.extensionTime * 1000);

                await query(
                    'UPDATE auctions SET endTime = $1 WHERE id = $2',
                    [newEndTime, auctionId]
                );

                // Emit real-time update
                io.to(`auction_${auctionId}`).emit('auctionExtended', {
                    auctionId,
                    newEndTime,
                    extensionTime: auction.extensionTime
                });

                return true;
            }

            return false;
        } catch (error) {
            console.error('Auto-extension error:', error);
            return false;
        }
    }

    // Process automatic bid (proxy bidding)
    static async processAutomaticBid(auctionId: string, newBidAmount: number): Promise<void> {
        try {
            // Get all automatic bids for this auction
            const autoBids = await query(`
                SELECT ab.*, u.username
                FROM auction_bids ab
                JOIN users u ON u.id = ab.bidderId
                WHERE ab.auctionId = $1 
                AND ab.maxBid > $2 
                AND ab.isAutomatic = true
                ORDER BY ab.maxBid DESC, ab.createdAt ASC
            `, [auctionId, newBidAmount]);

            if (autoBids.rows.length === 0) return;

            const highestAutoBid = autoBids.rows[0];

            // Calculate next bid amount
            const auction = await query(
                'SELECT bidIncrement FROM auctions WHERE id = $1',
                [auctionId]
            );

            const increment = parseFloat(auction.rows[0].bidIncrement);
            const nextBidAmount = newBidAmount + increment;

            if (nextBidAmount <= highestAutoBid.maxBid) {
                // Place automatic bid
                await this.placeBid(
                    auctionId,
                    highestAutoBid.bidderId,
                    nextBidAmount,
                    highestAutoBid.maxBid,
                    true
                );
            }
        } catch (error) {
            console.error('Automatic bid processing error:', error);
        }
    }

    // Place a bid (internal method)
    static async placeBid(
        auctionId: string,
        bidderId: string,
        amount: number,
        maxBid?: number,
        isAutomatic: boolean = false
    ): Promise<any> {
        return await transaction(async (client) => {
            // Get auction details with lock
            const auction = await client.query(`
                SELECT a.*, p.sellerId, p.title
                FROM auctions a
                JOIN products p ON p.id = a.productId
                WHERE a.id = $1 AND a.status = 'ACTIVE'
                FOR UPDATE
            `, [auctionId]);

            if (auction.rows.length === 0) {
                throw new Error('Auction not found or not active');
            }

            const auctionData = auction.rows[0];

            // Validate bid
            const minBid = parseFloat(auctionData.currentPrice) + parseFloat(auctionData.bidIncrement);
            if (amount < minBid) {
                throw new Error(`Bid must be at least ${minBid.toFixed(2)}`);
            }

            // Check wallet balance (for non-automatic bids)
            if (!isAutomatic) {
                const wallet = await client.query(
                    'SELECT availableBalance FROM wallets WHERE userId = $1',
                    [bidderId]
                );

                if (wallet.rows.length === 0 || wallet.rows[0].availableBalance < amount) {
                    throw new Error('Insufficient wallet balance');
                }
            }

            // Create bid
            const bid = await client.query(`
                INSERT INTO auction_bids (auctionId, bidderId, amount, maxBid, isWinning, isAutomatic)
                VALUES ($1, $2, $3, $4, true, $5)
                RETURNING *
            `, [auctionId, bidderId, amount, maxBid || amount, isAutomatic]);

            // Mark previous winning bids as not winning
            await client.query(`
                UPDATE auction_bids 
                SET isWinning = false 
                WHERE auctionId = $1 AND id != $2
            `, [auctionId, bid.rows[0].id]);

            // Update auction
            await client.query(`
                UPDATE auctions 
                SET currentPrice = $1, totalBids = totalBids + 1, updatedAt = NOW()
                WHERE id = $2
            `, [amount, auctionId]);

            // Reserve funds (for non-automatic bids)
            if (!isAutomatic) {
                await client.query(`
                    UPDATE wallets 
                    SET availableBalance = availableBalance - $1
                    WHERE userId = $2
                `, [amount, bidderId]);
            }

            return bid.rows[0];
        });
    }

    // End auction and create order if there's a winner
    static async endAuction(auctionId: string): Promise<any> {
        return await transaction(async (client) => {
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
            `, [auctionId]);

            if (auction.rows.length === 0) {
                throw new Error('Auction not found or already ended');
            }

            const auctionData = auction.rows[0];

            // Check if reserve price is met (if applicable)
            if (auctionData.reservePrice && auctionData.winningAmount < auctionData.reservePrice) {
                // Reserve not met - end auction without sale
                await client.query(`
                    UPDATE auctions 
                    SET status = 'ENDED', updatedAt = NOW()
                    WHERE id = $1
                `, [auctionId]);

                // Notify seller
                await createNotification(
                    auctionData.sellerId,
                    'auction',
                    'Auction Ended - Reserve Not Met',
                    `Your auction for "${auctionData.title}" ended without meeting the reserve price`,
                    `/account/listings`,
                    { auctionId, reason: 'reserve_not_met' }
                );

                // Release all funds
                await client.query(`
                    UPDATE wallets 
                    SET availableBalance = availableBalance + ab.amount
                    FROM auction_bids ab
                    WHERE wallets.userId = ab.bidderId AND ab.auctionId = $1
                `, [auctionId]);

                return { ...auctionData, reserveNotMet: true };
            }

            // Update auction status
            await client.query(`
                UPDATE auctions 
                SET status = 'ENDED', winnerId = $1, winningBidId = $2, updatedAt = NOW()
                WHERE id = $3
            `, [auctionData.winnerId, auctionData.winningBidId, auctionId]);

            // Create order if there's a winner
            if (auctionData.winnerId && auctionData.winningAmount) {
                const order = await client.query(`
                    INSERT INTO orders (
                        buyerId, sellerId, subtotal, totalAmount, 
                        status, paymentStatus
                    )
                    VALUES ($1, $2, $3, $4, 'PENDING', 'COMPLETED')
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

                // Create escrow entry
                const releaseDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
                await client.query(`
                    INSERT INTO escrows (orderId, buyerId, sellerId, amount, releaseDate, status)
                    VALUES ($1, $2, $3, $4, $5, 'HOLDING')
                `, [
                    order.rows[0].id,
                    auctionData.winnerId,
                    auctionData.sellerId,
                    auctionData.winningAmount,
                    releaseDate
                ]);

                // Notify winner
                await createNotification(
                    auctionData.winnerId,
                    'auction',
                    'Congratulations! You Won!',
                    `You won the auction for "${auctionData.title}"`,
                    `/orders/${order.rows[0].id}`,
                    { auctionId, orderId: order.rows[0].id }
                );

                // Notify seller
                await createNotification(
                    auctionData.sellerId,
                    'auction',
                    'Auction Sold!',
                    `Your auction for "${auctionData.title}" sold for $${auctionData.winningAmount}`,
                    `/account/orders`,
                    { auctionId, orderId: order.rows[0].id }
                );

                // Release funds for non-winning bidders
                await client.query(`
                    UPDATE wallets 
                    SET availableBalance = availableBalance + ab.amount
                    FROM auction_bids ab
                    WHERE wallets.userId = ab.bidderId 
                    AND ab.auctionId = $1 
                    AND ab.isWinning = false
                `, [auctionId]);

                return { ...auctionData, orderId: order.rows[0].id };
            }

            return auctionData;
        });
    }

    // Check and end expired auctions (cron job)
    static async checkExpiredAuctions(): Promise<void> {
        try {
            const expiredAuctions = await query(`
                SELECT id FROM auctions 
                WHERE status = 'ACTIVE' AND endTime <= NOW()
            `);

            for (const auction of expiredAuctions.rows) {
                try {
                    await this.endAuction(auction.id);
                    console.log(`Ended expired auction: ${auction.id}`);
                } catch (error) {
                    console.error(`Failed to end auction ${auction.id}:`, error);
                }
            }
        } catch (error) {
            console.error('Error checking expired auctions:', error);
        }
    }

    // Get auction analytics
    static async getAuctionAnalytics(auctionId: string): Promise<any> {
        try {
            const analytics = await query(`
                SELECT 
                    a.id,
                    a.startingPrice,
                    a.currentPrice,
                    a.reservePrice,
                    a.totalBids,
                    a.startTime,
                    a.endTime,
                    a.status,
                    COUNT(DISTINCT ab.bidderId) as uniqueBidders,
                    AVG(ab.amount) as averageBid,
                    MIN(ab.amount) as lowestBid,
                    MAX(ab.amount) as highestBid,
                    CASE 
                        WHEN a.reservePrice IS NOT NULL AND a.currentPrice >= a.reservePrice 
                        THEN true 
                        ELSE false 
                    END as isReserveMet,
                    EXTRACT(EPOCH FROM (a.endTime - a.startTime)) / 3600 as durationHours,
                    CASE 
                        WHEN a.status = 'ACTIVE' THEN EXTRACT(EPOCH FROM (a.endTime - NOW())) / 3600
                        ELSE 0
                    END as timeLeftHours
                FROM auctions a
                LEFT JOIN auction_bids ab ON ab.auctionId = a.id
                WHERE a.id = $1
                GROUP BY a.id
            `, [auctionId]);

            if (analytics.rows.length === 0) {
                throw new Error('Auction not found');
            }

            // Get bid history
            const bidHistory = await query(`
                SELECT 
                    ab.amount,
                    ab.createdAt,
                    u.username as bidderName,
                    ab.isWinning
                FROM auction_bids ab
                JOIN users u ON u.id = ab.bidderId
                WHERE ab.auctionId = $1
                ORDER BY ab.createdAt ASC
            `, [auctionId]);

            return {
                ...analytics.rows[0],
                bidHistory: bidHistory.rows
            };
        } catch (error) {
            console.error('Error getting auction analytics:', error);
            throw error;
        }
    }

    // Calculate suggested starting price based on similar items
    static async getSuggestedStartingPrice(categoryId: string, condition: string): Promise<number> {
        try {
            const result = await query(`
                SELECT AVG(currentPrice) as avgPrice
                FROM auctions a
                JOIN products p ON p.id = a.productId
                WHERE p.categoryId = $1 
                AND p.condition = $2 
                AND a.status = 'ENDED'
                AND a.winnerId IS NOT NULL
                AND a.createdAt >= NOW() - INTERVAL '30 days'
            `, [categoryId, condition]);

            const avgPrice = result.rows[0]?.avgPrice || 10;

            // Suggest starting at 60% of average final price
            return Math.max(0.99, Math.round(avgPrice * 0.6 * 100) / 100);
        } catch (error) {
            console.error('Error calculating suggested price:', error);
            return 0.99; // Default starting price
        }
    }
}