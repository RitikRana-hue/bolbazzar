export declare class AuctionService {
    static handleAutoExtension(auctionId: string): Promise<boolean>;
    static processAutomaticBid(auctionId: string, newBidAmount: number): Promise<void>;
    static placeBid(auctionId: string, bidderId: string, amount: number, maxBid?: number, isAutomatic?: boolean): Promise<any>;
    static endAuction(auctionId: string): Promise<any>;
    static checkExpiredAuctions(): Promise<void>;
    static getAuctionAnalytics(auctionId: string): Promise<any>;
    static getSuggestedStartingPrice(categoryId: string, condition: string): Promise<number>;
}
//# sourceMappingURL=auction.service.d.ts.map