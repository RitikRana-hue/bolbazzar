import { Job } from 'bull';
import { EmailSendingJob } from '../config';
export declare function processEmailSending(job: Job<EmailSendingJob>): Promise<void>;
export declare function scheduleEmail(to: string, template: string, data: Record<string, any>, options?: {
    subject?: string;
    priority?: number;
    delay?: number;
}): Promise<void>;
export declare function scheduleBulkEmails(emails: Array<{
    to: string;
    template: string;
    data: Record<string, any>;
    subject?: string;
}>, options?: {
    priority?: number;
    delay?: number;
    batchSize?: number;
}): Promise<void>;
//# sourceMappingURL=emailSending.d.ts.map