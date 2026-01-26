export interface ReconciliationReport {
    date: string;
    stripePayouts: number;
    platformFees: number;
    refunds: number;
    disputes: number;
    netAmount: number;
    recordCount: number;
    status: 'pending' | 'reconciled' | 'discrepancy';
    discrepancies?: string[];
}
export declare class ReconciliationService {
    /**
     * Run daily reconciliation for a specific date
     */
    static runDailyReconciliation(date: string): Promise<ReconciliationReport>;
    /**
     * Get database totals for a specific date
     */
    private static getDatabaseTotals;
    /**
     * Store reconciliation report in database
     */
    private static storeReconciliationReport;
    /**
     * Get reconciliation report for a specific date
     */
    static getReconciliationReport(date: string): Promise<ReconciliationReport | null>;
    /**
     * Get reconciliation summary for a date range
     */
    static getReconciliationSummary(startDate: string, endDate: string): Promise<{
        totalDays: number;
        reconciledDays: number;
        discrepancyDays: number;
        totalPayouts: number;
        totalRefunds: number;
        totalFees: number;
        netAmount: number;
    }>;
    /**
     * Auto-run reconciliation for yesterday (to be called by cron job)
     */
    static autoReconcileYesterday(): Promise<ReconciliationReport>;
    /**
     * Get pending reconciliations (dates that haven't been reconciled)
     */
    static getPendingReconciliations(daysBack?: number): Promise<string[]>;
    /**
     * Reconcile multiple pending dates
     */
    static reconcilePendingDates(dates: string[]): Promise<ReconciliationReport[]>;
}
//# sourceMappingURL=reconciliation.service.d.ts.map