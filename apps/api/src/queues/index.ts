import { queues } from './config';
import { processAuctionAutoEnd } from './processors/auctionAutoEnd';
import { processEscrowAutoRelease } from './processors/escrowAutoRelease';
import { processEmailSending } from './processors/emailSending';
import { processNotificationDispatch } from './processors/notificationDispatch';
import { processCleanupTasks, scheduleDailyCleanup } from './processors/cleanupTasks';

// Queue manager class
export class QueueManager {
    private static instance: QueueManager;
    private isInitialized = false;

    private constructor() { }

    static getInstance(): QueueManager {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager();
        }
        return QueueManager.instance;
    }

    // Initialize all queue processors
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('Queue manager already initialized');
            return;
        }

        console.log('Initializing queue processors...');

        try {
            // Register processors
            queues.auctionAutoEnd.process('auction-auto-end', processAuctionAutoEnd);
            queues.escrowAutoRelease.process('escrow-auto-release', processEscrowAutoRelease);
            queues.emailSending.process('email-sending', processEmailSending);
            queues.notificationDispatch.process('notification-dispatch', processNotificationDispatch);
            queues.cleanupTasks.process('cleanup-tasks', processCleanupTasks);

            // Set up error handlers
            this.setupErrorHandlers();

            // Set up event listeners
            this.setupEventListeners();

            // Schedule recurring jobs
            await this.scheduleRecurringJobs();

            this.isInitialized = true;
            console.log('Queue manager initialized successfully');

        } catch (error) {
            console.error('Failed to initialize queue manager:', error);
            throw error;
        }
    }

    // Setup error handlers for all queues
    private setupErrorHandlers(): void {
        Object.entries(queues).forEach(([name, queue]) => {
            queue.on('error', (error: Error) => {
                console.error(`Queue ${name} error:`, error);
            });

            queue.on('failed', (job, error: Error) => {
                console.error(`Job ${job.id} in queue ${name} failed:`, error);
            });

            queue.on('stalled', (job) => {
                console.warn(`Job ${job.id} in queue ${name} stalled`);
            });
        });
    }

    // Setup event listeners for monitoring
    private setupEventListeners(): void {
        Object.entries(queues).forEach(([name, queue]) => {
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
    private async scheduleRecurringJobs(): Promise<void> {
        try {
            // Schedule daily cleanup at 2 AM
            const now = new Date();
            const tomorrow2AM = new Date(now);
            tomorrow2AM.setDate(tomorrow2AM.getDate() + 1);
            tomorrow2AM.setHours(2, 0, 0, 0);

            const delay = tomorrow2AM.getTime() - now.getTime();

            // Schedule daily cleanup
            await queues.cleanupTasks.add('daily-cleanup', {
                taskType: 'expired_tokens',
                olderThan: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            }, {
                delay,
                repeat: { cron: '0 2 * * *' }, // Daily at 2 AM
                jobId: 'daily-cleanup'
            });

            console.log('Scheduled recurring cleanup jobs');

        } catch (error) {
            console.error('Failed to schedule recurring jobs:', error);
        }
    }

    // Graceful shutdown
    async shutdown(): Promise<void> {
        console.log('Shutting down queue manager...');

        try {
            await Promise.all(
                Object.entries(queues).map(async ([name, queue]) => {
                    console.log(`Closing queue ${name}...`);
                    await queue.close();
                })
            );

            this.isInitialized = false;
            console.log('Queue manager shut down successfully');

        } catch (error) {
            console.error('Error during queue manager shutdown:', error);
            throw error;
        }
    }

    // Get queue statistics
    async getQueueStats(): Promise<Record<string, any>> {
        const stats: Record<string, any> = {};

        for (const [name, queue] of Object.entries(queues)) {
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
            } catch (error) {
                console.error(`Error getting stats for queue ${name}:`, error);
                stats[name] = { error: error.message };
            }
        }

        return stats;
    }

    // Clean failed jobs
    async cleanFailedJobs(queueName?: string): Promise<void> {
        const queuesToClean = queueName ? [queueName] : Object.keys(queues);

        for (const name of queuesToClean) {
            const queue = queues[name as keyof typeof queues];
            if (queue) {
                try {
                    await queue.clean(24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 24 hours
                    console.log(`Cleaned failed jobs from queue ${name}`);
                } catch (error) {
                    console.error(`Error cleaning failed jobs from queue ${name}:`, error);
                }
            }
        }
    }

    // Pause/Resume queues
    async pauseQueue(queueName: string): Promise<void> {
        const queue = queues[queueName as keyof typeof queues];
        if (queue) {
            await queue.pause();
            console.log(`Paused queue ${queueName}`);
        } else {
            throw new Error(`Queue ${queueName} not found`);
        }
    }

    async resumeQueue(queueName: string): Promise<void> {
        const queue = queues[queueName as keyof typeof queues];
        if (queue) {
            await queue.resume();
            console.log(`Resumed queue ${queueName}`);
        } else {
            throw new Error(`Queue ${queueName} not found`);
        }
    }

    // Get queue instance
    getQueue(queueName: string) {
        return queues[queueName as keyof typeof queues];
    }

    // Check if initialized
    get initialized(): boolean {
        return this.isInitialized;
    }
}

// Export singleton instance
export const queueManager = QueueManager.getInstance();

// Export individual functions for convenience
export { scheduleAuctionAutoEnd } from './processors/auctionAutoEnd';
export { scheduleEscrowAutoRelease, cancelEscrowAutoRelease } from './processors/escrowAutoRelease';
export { scheduleEmail, scheduleBulkEmails } from './processors/emailSending';
export { scheduleNotification, scheduleBulkNotifications } from './processors/notificationDispatch';
export { scheduleCleanupTask, scheduleDailyCleanup, scheduleEmergencyCleanup } from './processors/cleanupTasks';