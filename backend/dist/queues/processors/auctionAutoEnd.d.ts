import { Job } from 'bull';
import { AuctionAutoEndJob } from '../config';
export declare function processAuctionAutoEnd(job: Job<AuctionAutoEndJob>): Promise<void>;
export declare function scheduleAuctionAutoEnd(auctionId: string, endTime: Date): Promise<void>;
//# sourceMappingURL=auctionAutoEnd.d.ts.map