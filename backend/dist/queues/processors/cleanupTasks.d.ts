import { Job } from 'bull';
import { CleanupTaskJob } from '../config';
export declare function processCleanupTasks(job: Job<CleanupTaskJob>): Promise<void>;
export declare function scheduleCleanupTask(taskType: CleanupTaskJob['taskType'], options?: {
    olderThan?: Date;
    batchSize?: number;
    delay?: number;
    priority?: number;
}): Promise<void>;
export declare function scheduleDailyCleanup(): Promise<void>;
export declare function scheduleEmergencyCleanup(): Promise<void>;
//# sourceMappingURL=cleanupTasks.d.ts.map