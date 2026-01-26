export declare class QueueManager {
    private static instance;
    private isInitialized;
    private constructor();
    static getInstance(): QueueManager;
    initialize(): Promise<void>;
    private setupErrorHandlers;
    private setupEventListeners;
    private scheduleRecurringJobs;
    shutdown(): Promise<void>;
    getQueueStats(): Promise<Record<string, any>>;
    cleanFailedJobs(queueName?: string): Promise<void>;
    pauseQueue(queueName: string): Promise<void>;
    resumeQueue(queueName: string): Promise<void>;
    getQueue(queueName: string): import("bull").Queue<any>;
    get initialized(): boolean;
}
export declare const queueManager: QueueManager;
export { scheduleAuctionAutoEnd } from './processors/auctionAutoEnd';
export { scheduleEscrowAutoRelease, cancelEscrowAutoRelease } from './processors/escrowAutoRelease';
export { scheduleEmail, scheduleBulkEmails } from './processors/emailSending';
export { scheduleNotification, scheduleBulkNotifications } from './processors/notificationDispatch';
export { scheduleCleanupTask, scheduleDailyCleanup, scheduleEmergencyCleanup } from './processors/cleanupTasks';
//# sourceMappingURL=index.d.ts.map