export declare class EscrowService {
    /**
     * Create escrow entry when buyer makes payment
     */
    static createEscrow(orderId: string, buyerId: string, sellerId: string, amount: number, paymentIntentId: string): Promise<any>;
    /**
     * Release escrow funds to seller
     */
    static releaseEscrow(escrowId: string, reason: 'delivery_confirmed' | 'auto_release' | 'manual_release'): Promise<any>;
    /**
     * Auto-release escrows that have passed the holding period
     */
    static autoReleaseExpiredEscrows(): Promise<any[]>;
    /**
     * Get platform's total holding funds (for compounding)
     */
    static getPlatformHoldingFunds(): Promise<any>;
    /**
     * Seller manual withdrawal request
     */
    static requestWithdrawal(sellerId: string, amount: number, method: 'bank' | 'upi' | 'card'): Promise<any>;
    /**
     * Process withdrawal (admin action)
     */
    static processWithdrawal(withdrawalId: string, status: 'approved' | 'rejected', adminNotes?: string): Promise<any>;
    /**
     * Lock funds when dispute is raised
     */
    static lockFundsForDispute(orderId: string, disputeId: string): Promise<void>;
}
//# sourceMappingURL=escrow.service.d.ts.map