"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleEmergencyCleanup = exports.scheduleDailyCleanup = exports.scheduleCleanupTask = exports.scheduleBulkNotifications = exports.scheduleNotification = exports.scheduleBulkEmails = exports.scheduleEmail = exports.cancelEscrowAutoRelease = exports.scheduleEscrowAutoRelease = exports.scheduleAuctionAutoEnd = exports.queueManager = exports.QueueManager = void 0;
const config_1 = require("./config");
const auctionAutoEnd_1 = require("./processors/auctionAutoEnd");
const escrowAutoRelease_1 = require("./processors/escrowAutoRelease");
const emailSending_1 = require("./processors/emailSending");
const notificationDispatch_1 = require("./processors/notificationDispatch");
const cleanupTasks_1 = require("./processors/cleanupTasks");
// Queue manager class
class QueueManager {
    constructor() {
        this.isInitialized = false;
    }
    static getInstance() {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager();
        }
        return QueueManager.instance;
    }
    // Initialize all queue processors
    async initialize() {
        if (this.isInitialized) {
            console.log('Queue manager already initialized');
            return;
        }
        console.log('Initializing queue processors...');
        try {
            // Register processors
            config_1.queues.auctionAutoEnd.process('auction-auto-end', auctionAutoEnd_1.processAuctionAutoEnd);
            config_1.queues.escrowAutoRelease.process('escrow-auto-release', escrowAutoRelease_1.processEscrowAutoRelease);
            config_1.queues.emailSending.process('email-sending', emailSending_1.processEmailSending);
            config_1.queues.notificationDispatch.process('notification-dispatch', notificationDispatch_1.processNotificationDispatch);
            config_1.queues.cleanupTasks.process('cleanup-tasks', cleanupTasks_1.processCleanupTasks);
            // Set up error handlers
            this.setupErrorHandlers();
            // Set up event listeners
            this.setupEventListeners();
            // Schedule recurring jobs
            await this.scheduleRecurringJobs();
            this.isInitialized = true;
            console.log('Queue manager initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize queue manager:', error);
            throw error;
        }
    }
    // Setup error handlers for all queues
    setupErrorHandlers() {
        Object.entries(config_1.queues).forEach(([name, queue]) => {
            queue.on('error', (error) => {
                console.error(`Queue ${name} error:`, error);
            });
            queue.on('failed', (job, error) => {
                console.error(`Job ${job.id} in queue ${name} failed:`, error);
            });
            queue.on('stalled', (job) => {
                console.warn(`Job ${job.id} in queue ${name} stalled`);
            });
        });
    }
    // Setup event listeners for monitoring
    setupEventListeners() {
        Object.entries(config_1.queues).forEach(([name, queue]) => {
            queue.on('completed', (job) => {
                console.log(`Job ${job.id} in queue ${name} completed`);
            });
            queue.on('progress', (job, progress) => {
                console.log(`Job ${job.id} in queue ${name} progress: ${progress}%`);
            });
            queue.on('waiting', (jobId) => {
                console.log(`Job ${jobId} in queue ${name} waiting`);
            });
            queue.on('active', (job) => {
                console.log(`Job ${job.id} in queue ${name} started`);
            });
        });
    }
    // Schedule recurring cleanup jobs
    async scheduleRecurringJobs() {
        try {
            // Schedule daily cleanup at 2 AM
            const now = new Date();
            const tomorrow2AM = new Date(now);
            tomorrow2AM.setDate(tomorrow2AM.getDate() + 1);
            tomorrow2AM.setHours(2, 0, 0, 0);
            const delay = tomorrow2AM.getTime() - now.getTime();
            // Schedule daily cleanup
            await config_1.queues.cleanupTasks.add('daily-cleanup', {
                taskType: 'expired_tokens',
                olderThan: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            }, {
                delay,
                repeat: { cron: '0 2 * * *' }, // Daily at 2 AM
                jobId: 'daily-cleanup'
            });
            console.log('Scheduled recurring cleanup jobs');
        }
        catch (error) {
            console.error('Failed to schedule recurring jobs:', error);
        }
    }
    // Graceful shutdown
    async shutdown() {
        console.log('Shutting down queue manager...');
        try {
            await Promise.all(Object.entries(config_1.queues).map(async ([name, queue]) => {
                console.log(`Closing queue ${name}...`);
                await queue.close();
            }));
            this.isInitialized = false;
            console.log('Queue manager shut down successfully');
        }
        catch (error) {
            console.error('Error during queue manager shutdown:', error);
            throw error;
        }
    }
    // Get queue statistics
    async getQueueStats() {
        const stats = {};
        for (const [name, queue] of Object.entries(config_1.queues)) {
            try {
                const [waiting, active, completed, failed, delayed] = await Promise.all([
                    queue.getWaiting(),
                    queue.getActive(),
                    queue.getCompleted(),
                    queue.getFailed(),
                    queue.getDelayed()
                ]);
                stats[name] = {
                    waiting: waiting.length,
                    active: active.length,
                    completed: completed.length,
                    failed: failed.length,
                    delayed: delayed.length,
                    total: waiting.length + active.length + completed.length + failed.length + delayed.length
                };
            }
            catch (error) {
                console.error(`Error getting stats for queue ${name}:`, error);
                stats[name] = { error: error instanceof Error ? error.message : 'Unknown error' };
            }
        }
        return stats;
    }
    // Clean failed jobs
    async cleanFailedJobs(queueName) {
        const queuesToClean = queueName ? [queueName] : Object.keys(config_1.queues);
        for (const name of queuesToClean) {
            const queue = config_1.queues[name];
            if (queue) {
                try {
                    await queue.clean(24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 24 hours
                    console.log(`Cleaned failed jobs from queue ${name}`);
                }
                catch (error) {
                    console.error(`Error cleaning failed jobs from queue ${name}:`, error);
                }
            }
        }
    }
    // Pause/Resume queues
    async pauseQueue(queueName) {
        const queue = config_1.queues[queueName];
        if (queue) {
            await queue.pause();
            console.log(`Paused queue ${queueName}`);
        }
        else {
            throw new Error(`Queue ${queueName} not found`);
        }
    }
    async resumeQueue(queueName) {
        const queue = config_1.queues[queueName];
        if (queue) {
            await queue.resume();
            console.log(`Resumed queue ${queueName}`);
        }
        else {
            throw new Error(`Queue ${queueName} not found`);
        }
    }
    // Get queue instance
    getQueue(queueName) {
        return config_1.queues[queueName];
    }
    // Check if initialized
    get initialized() {
        return this.isInitialized;
    }
}
exports.QueueManager = QueueManager;
// Export singleton instance
exports.queueManager = QueueManager.getInstance();
// Export individual functions for convenience
var auctionAutoEnd_2 = require("./processors/auctionAutoEnd");
Object.defineProperty(exports, "scheduleAuctionAutoEnd", { enumerable: true, get: function () { return auctionAutoEnd_2.scheduleAuctionAutoEnd; } });
var escrowAutoRelease_2 = require("./processors/escrowAutoRelease");
Object.defineProperty(exports, "scheduleEscrowAutoRelease", { enumerable: true, get: function () { return escrowAutoRelease_2.scheduleEscrowAutoRelease; } });
Object.defineProperty(exports, "cancelEscrowAutoRelease", { enumerable: true, get: function () { return escrowAutoRelease_2.cancelEscrowAutoRelease; } });
var emailSending_2 = require("./processors/emailSending");
Object.defineProperty(exports, "scheduleEmail", { enumerable: true, get: function () { return emailSending_2.scheduleEmail; } });
Object.defineProperty(exports, "scheduleBulkEmails", { enumerable: true, get: function () { return emailSending_2.scheduleBulkEmails; } });
var notificationDispatch_2 = require("./processors/notificationDispatch");
Object.defineProperty(exports, "scheduleNotification", { enumerable: true, get: function () { return notificationDispatch_2.scheduleNotification; } });
Object.defineProperty(exports, "scheduleBulkNotifications", { enumerable: true, get: function () { return notificationDispatch_2.scheduleBulkNotifications; } });
var cleanupTasks_2 = require("./processors/cleanupTasks");
Object.defineProperty(exports, "scheduleCleanupTask", { enumerable: true, get: function () { return cleanupTasks_2.scheduleCleanupTask; } });
Object.defineProperty(exports, "scheduleDailyCleanup", { enumerable: true, get: function () { return cleanupTasks_2.scheduleDailyCleanup; } });
Object.defineProperty(exports, "scheduleEmergencyCleanup", { enumerable: true, get: function () { return cleanupTasks_2.scheduleEmergencyCleanup; } });
//# sourceMappingURL=index.js.map