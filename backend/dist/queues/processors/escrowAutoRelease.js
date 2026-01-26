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
exports.processEscrowAutoRelease = processEscrowAutoRelease;
exports.scheduleEscrowAutoRelease = scheduleEscrowAutoRelease;
exports.cancelEscrowAutoRelease = cancelEscrowAutoRelease;
const db_1 = require("../../db");
async function processEscrowAutoRelease(job) {
    const { escrowId, orderId, releaseTime } = job.data;
    console.log(`Processing escrow auto-release for escrow ${escrowId}, order ${orderId}`);
    try {
        // Check if escrow still needs to be released (idempotency check)
        const escrowResult = await (0, db_1.query)(`
            SELECT 
                e.id,
                e.orderId,
                e.buyerId,
                e.sellerId,
                e.amount,
                e.platformFee,
                e.sellerAmount,
                e.status,
                e.releaseDate,
                o.status as orderStatus,
                p.title as productTitle
            FROM escrows e
            JOIN orders o ON o.id = e.orderId
            JOIN order_items oi ON oi.orderId = o.id
            JOIN products p ON p.id = oi.productId
            WHERE e.id = $1
            LIMIT 1
        `, [escrowId]);
        if (escrowResult.rows.length === 0) {
            console.log(`Escrow ${escrowId} not found, skipping`);
            return;
        }
        const escrow = escrowResult.rows[0];
        // Check if escrow is already released (idempotency)
        if (escrow.status !== 'holding') {
            console.log(`Escrow ${escrowId} already ${escrow.status}, skipping`);
            return;
        }
        // Check if release time has actually passed
        const now = new Date();
        const escrowReleaseTime = new Date(releaseTime);
        if (now < escrowReleaseTime) {
            console.log(`Escrow ${escrowId} release time not yet reached, rescheduling`);
            // Reschedule the job for the correct time
            const delay = escrowReleaseTime.getTime() - now.getTime();
            await job.queue.add('escrow-auto-release', job.data, { delay });
            return;
        }
        // Check if order is in a state that allows auto-release
        const allowedOrderStatuses = ['DELIVERED', 'COMPLETED'];
        if (!allowedOrderStatuses.includes(escrow.orderstatus)) {
            console.log(`Order ${orderId} status is ${escrow.orderstatus}, not eligible for auto-release`);
            // If order is cancelled or refunded, don't auto-release
            if (['CANCELLED', 'REFUNDED'].includes(escrow.orderstatus)) {
                console.log(`Order ${orderId} is ${escrow.orderstatus}, marking escrow as cancelled`);
                await (0, db_1.query)(`
                    UPDATE escrows 
                    SET status = 'cancelled', updatedAt = NOW()
                    WHERE id = $1
                `, [escrowId]);
                return;
            }
            // For other statuses, reschedule for later
            const delay = 24 * 60 * 60 * 1000; // Check again in 24 hours
            await job.queue.add('escrow-auto-release', job.data, { delay });
            return;
        }
        // Release the escrow in a transaction
        await (0, db_1.transaction)(async (client) => {
            // Update escrow status
            await client.query(`
                UPDATE escrows 
                SET status = 'released', releaseReason = 'auto_release', releasedAt = NOW()
                WHERE id = $1 AND status = 'holding'
            `, [escrowId]);
            // Add funds to seller wallet
            await client.query(`
                INSERT INTO seller_wallets (userId, availableBalance, totalEarned)
                VALUES ($1, $2, $2)
                ON CONFLICT (userId) DO UPDATE SET
                    availableBalance = seller_wallets.availableBalance + $2,
                    totalEarned = seller_wallets.totalEarned + $2,
                    updatedAt = NOW()
            `, [escrow.sellerid, escrow.selleramount]);
            // Update order status to completed
            await client.query(`
                UPDATE orders 
                SET status = 'COMPLETED', completedAt = NOW()
                WHERE id = $1
            `, [orderId]);
            // Log transaction
            await client.query(`
                INSERT INTO transaction_logs (
                    userId, orderId, type, amount, status, description
                )
                VALUES ($1, $2, 'escrow_auto_released', $3, 'completed', $4)
            `, [
                escrow.sellerid,
                orderId,
                escrow.selleramount,
                `Escrow auto-released for order ${orderId}`
            ]);
            console.log(`Released escrow ${escrowId} with amount ${escrow.selleramount} to seller ${escrow.sellerid}`);
        });
        // Schedule notification to seller
        const { scheduleNotification } = await Promise.resolve().then(() => __importStar(require('./notificationDispatch')));
        await scheduleNotification(escrow.sellerid, 'escrow_released', 'Funds Released', `Your funds for "${escrow.producttitle}" have been released to your wallet`, {
            data: {
                escrowId,
                orderId,
                amount: escrow.selleramount,
                reason: 'auto_release'
            },
            channels: ['push', 'email'],
            priority: 2
        });
        console.log(`Successfully auto-released escrow ${escrowId}`);
    }
    catch (error) {
        console.error(`Error processing escrow auto-release for ${escrowId}:`, error);
        throw error; // Let Bull handle retries
    }
}
// Schedule escrow auto-release job
async function scheduleEscrowAutoRelease(escrowId, orderId, releaseTime) {
    const { queues } = await Promise.resolve().then(() => __importStar(require('../config')));
    const delay = releaseTime.getTime() - Date.now();
    if (delay <= 0) {
        // Should be released immediately
        await queues.escrowAutoRelease.add('escrow-auto-release', {
            escrowId,
            orderId,
            releaseTime
        }, { priority: 2 });
    }
    else {
        // Schedule for future
        await queues.escrowAutoRelease.add('escrow-auto-release', {
            escrowId,
            orderId,
            releaseTime
        }, {
            delay,
            priority: 2,
            jobId: `escrow-${escrowId}` // Prevent duplicate jobs
        });
    }
    console.log(`Scheduled escrow auto-release for ${escrowId} at ${releaseTime}`);
}
// Cancel scheduled escrow auto-release (when manually released)
async function cancelEscrowAutoRelease(escrowId) {
    const { queues } = await Promise.resolve().then(() => __importStar(require('../config')));
    try {
        const job = await queues.escrowAutoRelease.getJob(`escrow-${escrowId}`);
        if (job) {
            await job.remove();
            console.log(`Cancelled scheduled escrow auto-release for ${escrowId}`);
        }
    }
    catch (error) {
        console.error(`Error cancelling escrow auto-release for ${escrowId}:`, error);
        // Don't throw - this is not critical
    }
}
//# sourceMappingURL=escrowAutoRelease.js.map