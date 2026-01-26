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
exports.processCleanupTasks = processCleanupTasks;
exports.scheduleCleanupTask = scheduleCleanupTask;
exports.scheduleDailyCleanup = scheduleDailyCleanup;
exports.scheduleEmergencyCleanup = scheduleEmergencyCleanup;
const db_1 = require("../../db");
async function processCleanupTasks(job) {
    const { taskType, olderThan, batchSize = 1000 } = job.data;
    console.log(`Processing cleanup task: ${taskType}`);
    try {
        let deletedCount = 0;
        switch (taskType) {
            case 'expired_tokens':
                deletedCount = await cleanupExpiredTokens(olderThan, batchSize);
                break;
            case 'old_logs':
                deletedCount = await cleanupOldLogs(olderThan, batchSize);
                break;
            case 'temp_files':
                deletedCount = await cleanupTempFiles(olderThan, batchSize);
                break;
            case 'webhook_events':
                deletedCount = await cleanupWebhookEvents(olderThan, batchSize);
                break;
            default:
                throw new Error(`Unknown cleanup task type: ${taskType}`);
        }
        console.log(`Cleanup task ${taskType} completed: ${deletedCount} items processed`);
    }
    catch (error) {
        console.error(`Error processing cleanup task ${taskType}:`, error);
        throw error; // Let Bull handle retries
    }
}
// Cleanup expired refresh tokens
async function cleanupExpiredTokens(olderThan, batchSize = 1000) {
    const cutoffDate = olderThan || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    console.log(`Cleaning up expired tokens older than ${cutoffDate}`);
    // Delete expired refresh tokens
    const result = await (0, db_1.query)(`
        DELETE FROM refresh_tokens 
        WHERE (expiresAt < NOW() OR isRevoked = true) 
        AND createdAt < $1
        LIMIT $2
    `, [cutoffDate, batchSize]);
    const deletedCount = result.rowCount || 0;
    console.log(`Deleted ${deletedCount} expired refresh tokens`);
    return deletedCount;
}
// Cleanup old audit logs and transaction logs
async function cleanupOldLogs(olderThan, batchSize = 1000) {
    const cutoffDate = olderThan || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    console.log(`Cleaning up old logs older than ${cutoffDate}`);
    let totalDeleted = 0;
    // Cleanup audit logs (keep for 90 days)
    const auditResult = await (0, db_1.query)(`
        DELETE FROM audit_logs 
        WHERE createdAt < $1
        AND id IN (
            SELECT id FROM audit_logs 
            WHERE createdAt < $1 
            ORDER BY createdAt ASC 
            LIMIT $2
        )
    `, [cutoffDate, batchSize]);
    const auditDeleted = auditResult.rowCount || 0;
    totalDeleted += auditDeleted;
    console.log(`Deleted ${auditDeleted} old audit logs`);
    // Cleanup transaction logs (keep for 90 days, except for important transactions)
    const transactionResult = await (0, db_1.query)(`
        DELETE FROM transaction_logs 
        WHERE createdAt < $1
        AND type NOT IN ('payment_succeeded', 'refund_processed', 'escrow_released')
        AND id IN (
            SELECT id FROM transaction_logs 
            WHERE createdAt < $1 
            AND type NOT IN ('payment_succeeded', 'refund_processed', 'escrow_released')
            ORDER BY createdAt ASC 
            LIMIT $2
        )
    `, [cutoffDate, batchSize]);
    const transactionDeleted = transactionResult.rowCount || 0;
    totalDeleted += transactionDeleted;
    console.log(`Deleted ${transactionDeleted} old transaction logs`);
    return totalDeleted;
}
// Cleanup temporary files (this would integrate with file storage)
async function cleanupTempFiles(olderThan, batchSize = 1000) {
    const cutoffDate = olderThan || new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    console.log(`Cleaning up temporary files older than ${cutoffDate}`);
    // This would typically involve:
    // 1. Querying for temporary file records
    // 2. Deleting files from storage (S3, local filesystem, etc.)
    // 3. Removing database records
    // For now, we'll just clean up any temporary upload records
    const result = await (0, db_1.query)(`
        DELETE FROM temp_uploads 
        WHERE createdAt < $1
        AND id IN (
            SELECT id FROM temp_uploads 
            WHERE createdAt < $1 
            ORDER BY createdAt ASC 
            LIMIT $2
        )
    `, [cutoffDate, batchSize]);
    const deletedCount = result.rowCount || 0;
    console.log(`Deleted ${deletedCount} temporary file records`);
    // In production, you would also delete the actual files:
    // const fs = require('fs').promises;
    // const path = require('path');
    // for (const file of filesToDelete) {
    //     try {
    //         await fs.unlink(path.join(uploadDir, file.filename));
    //     } catch (error) {
    //         console.error(`Failed to delete file ${file.filename}:`, error);
    //     }
    // }
    return deletedCount;
}
// Cleanup processed webhook events
async function cleanupWebhookEvents(olderThan, batchSize = 1000) {
    const cutoffDate = olderThan || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    console.log(`Cleaning up webhook events older than ${cutoffDate}`);
    // Delete processed webhook events older than cutoff
    const result = await (0, db_1.query)(`
        DELETE FROM webhook_events 
        WHERE processed = true 
        AND createdAt < $1
        AND id IN (
            SELECT id FROM webhook_events 
            WHERE processed = true 
            AND createdAt < $1 
            ORDER BY createdAt ASC 
            LIMIT $2
        )
    `, [cutoffDate, batchSize]);
    const deletedCount = result.rowCount || 0;
    console.log(`Deleted ${deletedCount} processed webhook events`);
    return deletedCount;
}
// Schedule cleanup task
async function scheduleCleanupTask(taskType, options = {}) {
    const { queues } = await Promise.resolve().then(() => __importStar(require('../config')));
    const jobData = {
        taskType,
        olderThan: options.olderThan,
        batchSize: options.batchSize || 1000,
    };
    const jobOptions = {
        priority: options.priority || 4, // Low priority
    };
    if (options.delay) {
        jobOptions.delay = options.delay;
    }
    await queues.cleanupTasks.add('cleanup-tasks', jobData, jobOptions);
    console.log(`Scheduled cleanup task: ${taskType}`);
}
// Schedule all daily cleanup tasks
async function scheduleDailyCleanup() {
    const now = new Date();
    // Schedule different cleanup tasks with different retention periods
    await Promise.all([
        // Cleanup expired tokens (daily)
        scheduleCleanupTask('expired_tokens', {
            olderThan: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days
            delay: 0,
            priority: 3
        }),
        // Cleanup old logs (weekly)
        scheduleCleanupTask('old_logs', {
            olderThan: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days
            delay: 5 * 60 * 1000, // 5 minutes delay
            priority: 4
        }),
        // Cleanup temp files (hourly)
        scheduleCleanupTask('temp_files', {
            olderThan: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours
            delay: 10 * 60 * 1000, // 10 minutes delay
            priority: 3
        }),
        // Cleanup webhook events (daily)
        scheduleCleanupTask('webhook_events', {
            olderThan: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days
            delay: 15 * 60 * 1000, // 15 minutes delay
            priority: 4
        })
    ]);
    console.log('Scheduled all daily cleanup tasks');
}
// Emergency cleanup (for when storage is running low)
async function scheduleEmergencyCleanup() {
    const now = new Date();
    // More aggressive cleanup with shorter retention periods
    await Promise.all([
        scheduleCleanupTask('expired_tokens', {
            olderThan: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days
            batchSize: 5000,
            priority: 1
        }),
        scheduleCleanupTask('old_logs', {
            olderThan: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days
            batchSize: 5000,
            priority: 1
        }),
        scheduleCleanupTask('temp_files', {
            olderThan: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours
            batchSize: 5000,
            priority: 1
        }),
        scheduleCleanupTask('webhook_events', {
            olderThan: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours
            batchSize: 5000,
            priority: 1
        })
    ]);
    console.log('Scheduled emergency cleanup tasks');
}
//# sourceMappingURL=cleanupTasks.js.map