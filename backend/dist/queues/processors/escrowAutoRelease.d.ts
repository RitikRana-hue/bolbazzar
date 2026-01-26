import { Job } from 'bull';
import { EscrowAutoReleaseJob } from '../config';
export declare function processEscrowAutoRelease(job: Job<EscrowAutoReleaseJob>): Promise<void>;
export declare function scheduleEscrowAutoRelease(escrowId: string, orderId: string, releaseTime: Date): Promise<void>;
export declare function cancelEscrowAutoRelease(escrowId: string): Promise<void>;
//# sourceMappingURL=escrowAutoRelease.d.ts.map