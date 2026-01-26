import { Job } from 'bull';
import { NotificationDispatchJob } from '../config';
export declare function processNotificationDispatch(job: Job<NotificationDispatchJob>): Promise<void>;
export declare function scheduleNotification(userId: string, type: string, title: string, message: string, options?: {
    data?: Record<string, any>;
    channels?: ('push' | 'email' | 'sms')[];
    priority?: number;
    delay?: number;
}): Promise<void>;
export declare function scheduleBulkNotifications(notifications: Array<{
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    channels?: ('push' | 'email' | 'sms')[];
}>, options?: {
    priority?: number;
    delay?: number;
    batchSize?: number;
}): Promise<void>;
//# sourceMappingURL=notificationDispatch.d.ts.map