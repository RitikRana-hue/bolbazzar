"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_DELAYS = exports.JOB_PRIORITIES = exports.queues = exports.QUEUE_NAMES = void 0;
const bull_1 = __importDefault(require("bull"));
const config_1 = __importDefault(require("../config"));
// Redis connection configuration for Bull
const redisConfig = {
    redis: {
        port: parseInt(config_1.default.redis.url.split(':')[2] || '6379'),
        host: config_1.default.redis.url.split('://')[1].split(':')[0],
        password: config_1.default.redis.password,
        db: config_1.default.redis.db,
        keyPrefix: config_1.default.redis.keyPrefix + 'bull:',
        maxRetriesPerRequest: config_1.default.redis.maxRetriesPerRequest,
        retryDelayOnFailover: config_1.default.redis.retryDelayOnFailover,
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
exports.QUEUE_NAMES = {
    AUCTION_AUTO_END: 'auction-auto-end',
    ESCROW_AUTO_RELEASE: 'escrow-auto-release',
    EMAIL_SENDING: 'email-sending',
    NOTIFICATION_DISPATCH: 'notification-dispatch',
    CLEANUP_TASKS: 'cleanup-tasks',
};
// Create queue instances
exports.queues = {
    auctionAutoEnd: new bull_1.default(exports.QUEUE_NAMES.AUCTION_AUTO_END, redisConfig),
    escrowAutoRelease: new bull_1.default(exports.QUEUE_NAMES.ESCROW_AUTO_RELEASE, redisConfig),
    emailSending: new bull_1.default(exports.QUEUE_NAMES.EMAIL_SENDING, redisConfig),
    notificationDispatch: new bull_1.default(exports.QUEUE_NAMES.NOTIFICATION_DISPATCH, redisConfig),
    cleanupTasks: new bull_1.default(exports.QUEUE_NAMES.CLEANUP_TASKS, redisConfig),
};
// Job priorities
exports.JOB_PRIORITIES = {
    CRITICAL: 1,
    HIGH: 2,
    NORMAL: 3,
    LOW: 4,
};
// Job delays (in milliseconds)
exports.JOB_DELAYS = {
    IMMEDIATE: 0,
    SHORT: 5 * 1000, // 5 seconds
    MEDIUM: 30 * 1000, // 30 seconds
    LONG: 5 * 60 * 1000, // 5 minutes
};
exports.default = redisConfig;
//# sourceMappingURL=config.js.map