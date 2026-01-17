import Bull from 'bull';
import config from '../config';

// Redis connection configuration for Bull
const redisConfig = {
    redis: {
        port: parseInt(config.redis.url.split(':')[2] || '6379'),
        host: config.redis.url.split('://')[1].split(':')[0],
        password: config.redis.password,
        db: config.redis.db,
        keyPrefix: config.redis.keyPrefix + 'bull:',
        maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
        retryDelayOnFailover: config.redis.retryDelayOnFailover,
    },
    defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2 second delay
        },
    },
    settings: {
        stalledInterval: 30 * 1000, // Check for stalled jobs every 30 seconds
        maxStalledCount: 1, // Max number of times a job can be stalled
    },
};

// Queue definitions
export const QUEUE_NAMES = {
    AUCTION_AUTO_END: 'auction-auto-end',
    ESCROW_AUTO_RELEASE: 'escrow-auto-release',
    EMAIL_SENDING: 'email-sending',
    NOTIFICATION_DISPATCH: 'notification-dispatch',
    CLEANUP_TASKS: 'cleanup-tasks',
} as const;

// Create queue instances
export const queues = {
    auctionAutoEnd: new Bull(QUEUE_NAMES.AUCTION_AUTO_END, redisConfig),
    escrowAutoRelease: new Bull(QUEUE_NAMES.ESCROW_AUTO_RELEASE, redisConfig),
    emailSending: new Bull(QUEUE_NAMES.EMAIL_SENDING, redisConfig),
    notificationDispatch: new Bull(QUEUE_NAMES.NOTIFICATION_DISPATCH, redisConfig),
    cleanupTasks: new Bull(QUEUE_NAMES.CLEANUP_TASKS, redisConfig),
};

// Job types
export interface AuctionAutoEndJob {
    auctionId: string;
    endTime: Date;
}

export interface EscrowAutoReleaseJob {
    escrowId: string;
    orderId: string;
    releaseTime: Date;
}

export interface EmailSendingJob {
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
    priority?: number;
}

export interface NotificationDispatchJob {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    channels: ('push' | 'email' | 'sms')[];
}

export interface CleanupTaskJob {
    taskType: 'expired_tokens' | 'old_logs' | 'temp_files' | 'webhook_events';
    olderThan?: Date;
    batchSize?: number;
}

// Job priorities
export const JOB_PRIORITIES = {
    CRITICAL: 1,
    HIGH: 2,
    NORMAL: 3,
    LOW: 4,
} as const;

// Job delays (in milliseconds)
export const JOB_DELAYS = {
    IMMEDIATE: 0,
    SHORT: 5 * 1000, // 5 seconds
    MEDIUM: 30 * 1000, // 30 seconds
    LONG: 5 * 60 * 1000, // 5 minutes
} as const;

export default redisConfig;