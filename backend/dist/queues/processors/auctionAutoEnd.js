"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAuctionAutoEnd = processAuctionAutoEnd;
exports.scheduleAuctionAutoEnd = scheduleAuctionAutoEnd;
const db_1 = require("../../db");
async function processAuctionAutoEnd(job) {
    const { auctionId } = job.data;
    console.log(`Processing auction auto-end for auction ${auctionId}`);
    try {
        // Check if auction still needs to be ended (idempotency check)
        const auctionResult = await (0, db_1.query)(`
            SELECT 
                a.id,
                a.status,
                a.endTime,
                a.sellerId,
                a.productId,
                p.title,
                ab.id as winningBidId,
                ab.bidderId as winnerId,
                ab.amount as winningAmount
            FROM auctions a
            JOIN products p ON p.id = a.productId
            LEFT JOIN auction_bids ab ON ab.auctionId = a.id AND ab.isWinning = true
            WHERE a.id = $1
        `, [auctionId]);
        if (auctionResult.rows.length === 0) {
            console.log(`Auction ${auctionId} not found, skipping`);
            return;
        }
        const auction = auctionResult.rows[0];
        // Check if auction is already ended (idempotency)
        if (auction.status !== 'ACTIVE') {
            console.log(`Auction ${auctionId} already ended with status ${auction.status}, skipping`);
            return;
        }
        // Check if auction end time has actually passed
        const now = new Date();
        const auctionEndTime = new Date(auction.endtime);
        if (now < auctionEndTime) {
            console.log(`Auction ${auctionId} end time not yet reached, rescheduling`);
            // Reschedule the job for the correct time
            const delay = auctionEndTime.getTime() - now.getTime();
            await job.queue.add('auction-auto-end', job.data, { delay });
            return;
        }
        // End the auction in a transaction
        await (0, db_1.transaction)(async (client) => {
            // Update auction status
            await client.query(`
                UPDATE auctions 
                SET status = 'ENDED', winnerId = $1, winningBidId = $2, updatedAt = NOW()
                WHERE id = $3 AND status = 'ACTIVE'
            `, [auction.winnerid, auction.winningbidid, auctionId]);
            // If there's a winner, create order
            if (auction.winnerid && auction.winningamount) {
                const orderResult = await client.query(`
                    INSERT INTO orders (
                        buyerId, sellerId, subtotal, totalAmount, 
                        status, paymentStatus, createdAt
                    )
                    VALUES ($1, $2, $3, $4, 'PENDING', 'PENDING', NOW())
                    RETURNING id
                `, [
                    auction.winnerid,
                    auction.sellerid,
                    auction.winningamount,
                    auction.winningamount
                ]);
                const orderId = orderResult.rows[0].id;
                // Create order item
                await client.query(`
                    INSERT INTO order_items (orderId, productId, quantity, price, total)
                    VALUES ($1, $2, 1, $3, $4)
                `, [
                    orderId,
                    auction.productid,
                    auction.winningamount,
                    auction.winningamount
                ]);
                // Update product status
                await client.query(`
                    UPDATE products SET status = 'SOLD' WHERE id = $1
                `, [auction.productid]);
                console.log(`Created order ${orderId} for auction winner ${auction.winnerid}`);
                // Schedule notification jobs
                const { scheduleNotification } = await Promise.resolve().then(() => __importStar(require('./notificationDispatch')));
                await scheduleNotification(auction.winnerid, 'auction_won', 'Auction Won!', `Congratulations! You won the auction for "${auction.title}"`, {
                    data: { auctionId, orderId, amount: auction.winningamount },
                    channels: ['push', 'email'],
                    priority: 1
                });
                await scheduleNotification(auction.sellerid, 'auction_ended', 'Auction Ended', `Your auction for "${auction.title}" has ended with a winning bid`, {
                    data: { auctionId, orderId, amount: auction.winningamount },
                    channels: ['push', 'email'],
                    priority: 1
                });
            }
            else {
                // No winner - auction ended without bids
                await client.query(`
                    UPDATE products SET status = 'ACTIVE' WHERE id = $1
                `, [auction.productid]);
                console.log(`Auction ${auctionId} ended without winner`);
                // Notify seller
                const { scheduleNotification } = await Promise.resolve().then(() => __importStar(require('./notificationDispatch')));
                await scheduleNotification(auction.sellerid, 'auction_no_bids', 'Auction Ended', `Your auction for "${auction.title}" has ended without any bids`, {
                    data: { auctionId },
                    channels: ['push', 'email'],
                    priority: 2
                });
            }
            // Release funds for non-winning bidders
            await client.query(`
                UPDATE wallets 
                SET availableBalance = availableBalance + ab.amount
                FROM auction_bids ab
                WHERE wallets.userId = ab.bidderId 
                AND ab.auctionId = $1 
                AND ab.isWinning = false
            `, [auctionId]);
            console.log(`Released funds for non-winning bidders in auction ${auctionId}`);
        });
        console.log(`Successfully ended auction ${auctionId}`);
    }
    catch (error) {
        console.error(`Error processing auction auto-end for ${auctionId}:`, error);
        throw error; // Let Bull handle retries
    }
}
// Schedule auction auto-end job
async function scheduleAuctionAutoEnd(auctionId, endTime) {
    const { queues } = await Promise.resolve().then(() => __importStar(require('../config')));
    const delay = endTime.getTime() - Date.now();
    if (delay <= 0) {
        // Auction should have already ended, process immediately
        await queues.auctionAutoEnd.add('auction-auto-end', {
            auctionId,
            endTime
        }, { priority: 1 });
    }
    else {
        // Schedule for future
        await queues.auctionAutoEnd.add('auction-auto-end', {
            auctionId,
            endTime
        }, {
            delay,
            priority: 1,
            jobId: `auction-${auctionId}` // Prevent duplicate jobs
        });
    }
    console.log(`Scheduled auction auto-end for ${auctionId} at ${endTime}`);
}
//# sourceMappingURL=auctionAutoEnd.js.map