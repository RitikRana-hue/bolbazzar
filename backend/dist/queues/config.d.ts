import Bull from 'bull';
declare const redisConfig: {
    redis: {
        port: number;
        host: string;
        password: string | undefined;
        db: number;
        keyPrefix: string;
        maxRetriesPerRequest: number;
        retryDelayOnFailover: number;
    };
    defaultJobOptions: {
        removeOnComplete: number;
        removeOnFail: number;
        attempts: number;
        backoff: {
            type: string;
            delay: number;
        };
    };
    settings: {
        stalledInterval: number;
        maxStalledCount: number;
    };
};
export declare const QUEUE_NAMES: {
    readonly AUCTION_AUTO_END: "auction-auto-end";
    readonly ESCROW_AUTO_RELEASE: "escrow-auto-release";
    readonly EMAIL_SENDING: "email-sending";
    readonly NOTIFICATION_DISPATCH: "notification-dispatch";
    readonly CLEANUP_TASKS: "cleanup-tasks";
};
export declare const queues: {
    auctionAutoEnd: Bull.Queue<any>;
    escrowAutoRelease: Bull.Queue<any>;
    emailSending: Bull.Queue<any>;
    notificationDispatch: Bull.Queue<any>;
    cleanupTasks: Bull.Queue<any>;
};
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
export declare const JOB_PRIORITIES: {
    readonly CRITICAL: 1;
    readonly HIGH: 2;
    readonly NORMAL: 3;
    readonly LOW: 4;
};
export declare const JOB_DELAYS: {
    readonly IMMEDIATE: 0;
    readonly SHORT: number;
    readonly MEDIUM: number;
    readonly LONG: number;
};
export default redisConfig;
//# sourceMappingURL=config.d.ts.map