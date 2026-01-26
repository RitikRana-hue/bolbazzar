"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationService = void 0;
const db_1 = require("../db");
const stripe_service_1 = require("./stripe.service");
class ReconciliationService {
    /**
     * Run daily reconciliation for a specific date
     */
    static async runDailyReconciliation(date) {
        try {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            // Get Stripe balance transactions for the date
            const stripeTransactions = await stripe_service_1.StripeService.listBalanceTransactions({
                created: {
                    gte: Math.floor(startDate.getTime() / 1000),
                    lt: Math.floor(endDate.getTime() / 1000)
                },
                limit: 100
            });
            // Calculate Stripe totals
            let stripePayouts = 0;
            let stripeFees = 0;
            let stripeRefunds = 0;
            let stripeDisputes = 0;
            for (const txn of stripeTransactions.data) {
                switch (txn.type) {
                    case 'payment':
                        stripePayouts += txn.net / 100; // Convert from cents
                        stripeFees += txn.fee / 100;
                        break;
                    case 'refund':
                        stripeRefunds += Math.abs(txn.amount) / 100;
                        break;
                    case 'adjustment':
                        stripeDisputes += Math.abs(txn.amount) / 100;
                        break;
                }
            }
            // Get our database totals for the same period
            const dbTotals = await this.getDatabaseTotals(date);
            // Compare and identify discrepancies
            const discrepancies = [];
            if (Math.abs(stripePayouts - dbTotals.payouts) > 0.01) {
                discrepancies.push(`Payout mismatch: Stripe ${stripePayouts}, DB ${dbTotals.payouts}`);
            }
            if (Math.abs(stripeFees - dbTotals.platformFees) > 0.01) {
                discrepancies.push(`Fee mismatch: Stripe ${stripeFees}, DB ${dbTotals.platformFees}`);
            }
            if (Math.abs(stripeRefunds - dbTotals.refunds) > 0.01) {
                discrepancies.push(`Refund mismatch: Stripe ${stripeRefunds}, DB ${dbTotals.refunds}`);
            }
            const netAmount = stripePayouts - stripeRefunds - stripeDisputes;
            const status = discrepancies.length > 0 ? 'discrepancy' : 'reconciled';
            // Store reconciliation report
            const report = {
                date,
                stripePayouts,
                platformFees: stripeFees,
                refunds: stripeRefunds,
                disputes: stripeDisputes,
                netAmount,
                recordCount: stripeTransactions.data.length,
                status,
                discrepancies: discrepancies.length > 0 ? discrepancies : undefined
            };
            await this.storeReconciliationReport(report);
            return report;
        }
        catch (error) {
            console.error('ReconciliationService.runDailyReconciliation error:', error);
            throw new Error(`Failed to run reconciliation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get database totals for a specific date
     */
    static async getDatabaseTotals(date) {
        try {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            // Get successful payments
            const paymentResult = await (0, db_1.query)(`
                SELECT 
                    COALESCE(SUM(amount), 0) as totalPayments,
                    COALESCE(SUM(platformFee), 0) as totalFees,
                    COUNT(*) as paymentCount
                FROM escrows 
                WHERE createdAt >= $1 AND createdAt < $2 
                AND status IN ('holding', 'released')
            `, [startDate.toISOString(), endDate.toISOString()]);
            // Get refunds
            const refundResult = await (0, db_1.query)(`
                SELECT COALESCE(SUM(amount), 0) as totalRefunds
                FROM refunds 
                WHERE createdAt >= $1 AND createdAt < $2
                AND status = 'succeeded'
            `, [startDate.toISOString(), endDate.toISOString()]);
            // Get disputes (if we have a disputes table)
            const disputeResult = await (0, db_1.query)(`
                SELECT COALESCE(SUM(amount), 0) as totalDisputes
                FROM escrows 
                WHERE updatedAt >= $1 AND updatedAt < $2
                AND status = 'disputed'
            `, [startDate.toISOString(), endDate.toISOString()]);
            return {
                payouts: parseFloat(paymentResult.rows[0].totalpayments || '0'),
                platformFees: parseFloat(paymentResult.rows[0].totalfees || '0'),
                refunds: parseFloat(refundResult.rows[0].totalrefunds || '0'),
                disputes: parseFloat(disputeResult.rows[0].totaldisputes || '0')
            };
        }
        catch (error) {
            console.error('Error getting database totals:', error);
            throw error;
        }
    }
    /**
     * Store reconciliation report in database
     */
    static async storeReconciliationReport(report) {
        try {
            await (0, db_1.query)(`
                INSERT INTO payment_reconciliation (
                    date, stripePayouts, platformFees, refunds, disputes,
                    netAmount, recordCount, status, reconciledAt
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                ON CONFLICT (date) DO UPDATE SET
                    stripePayouts = EXCLUDED.stripePayouts,
                    platformFees = EXCLUDED.platformFees,
                    refunds = EXCLUDED.refunds,
                    disputes = EXCLUDED.disputes,
                    netAmount = EXCLUDED.netAmount,
                    recordCount = EXCLUDED.recordCount,
                    status = EXCLUDED.status,
                    reconciledAt = NOW()
            `, [
                report.date,
                report.stripePayouts,
                report.platformFees,
                report.refunds,
                report.disputes,
                report.netAmount,
                report.recordCount,
                report.status
            ]);
            // Log discrepancies if any
            if (report.discrepancies && report.discrepancies.length > 0) {
                console.warn(`Reconciliation discrepancies for ${report.date}:`, report.discrepancies);
                // Store detailed discrepancy log
                for (const discrepancy of report.discrepancies) {
                    await (0, db_1.query)(`
                        INSERT INTO transaction_logs (
                            type, amount, status, description, metadata
                        )
                        VALUES ('reconciliation_discrepancy', 0, 'warning', $1, $2)
                    `, [discrepancy, JSON.stringify({ date: report.date, type: 'reconciliation' })]);
                }
            }
        }
        catch (error) {
            console.error('Error storing reconciliation report:', error);
            throw error;
        }
    }
    /**
     * Get reconciliation report for a specific date
     */
    static async getReconciliationReport(date) {
        try {
            const result = await (0, db_1.query)(`
                SELECT * FROM payment_reconciliation WHERE date = $1
            `, [date]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return {
                date: row.date,
                stripePayouts: parseFloat(row.stripepayouts),
                platformFees: parseFloat(row.platformfees),
                refunds: parseFloat(row.refunds),
                disputes: parseFloat(row.disputes),
                netAmount: parseFloat(row.netamount),
                recordCount: row.recordcount,
                status: row.status
            };
        }
        catch (error) {
            console.error('ReconciliationService.getReconciliationReport error:', error);
            throw new Error('Failed to get reconciliation report');
        }
    }
    /**
     * Get reconciliation summary for a date range
     */
    static async getReconciliationSummary(startDate, endDate) {
        try {
            const result = await (0, db_1.query)(`
                SELECT 
                    COUNT(*) as totalDays,
                    SUM(CASE WHEN status = 'reconciled' THEN 1 ELSE 0 END) as reconciledDays,
                    SUM(CASE WHEN status = 'discrepancy' THEN 1 ELSE 0 END) as discrepancyDays,
                    SUM(stripePayouts) as totalPayouts,
                    SUM(refunds) as totalRefunds,
                    SUM(platformFees) as totalFees,
                    SUM(netAmount) as netAmount
                FROM payment_reconciliation 
                WHERE date >= $1 AND date <= $2
            `, [startDate, endDate]);
            const row = result.rows[0];
            return {
                totalDays: parseInt(row.totaldays || '0'),
                reconciledDays: parseInt(row.reconcileddays || '0'),
                discrepancyDays: parseInt(row.discrepancydays || '0'),
                totalPayouts: parseFloat(row.totalpayouts || '0'),
                totalRefunds: parseFloat(row.totalrefunds || '0'),
                totalFees: parseFloat(row.totalfees || '0'),
                netAmount: parseFloat(row.netamount || '0')
            };
        }
        catch (error) {
            console.error('ReconciliationService.getReconciliationSummary error:', error);
            throw new Error('Failed to get reconciliation summary');
        }
    }
    /**
     * Auto-run reconciliation for yesterday (to be called by cron job)
     */
    static async autoReconcileYesterday() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateString = yesterday.toISOString().split('T')[0];
            console.log(`Running auto-reconciliation for ${dateString}`);
            const report = await this.runDailyReconciliation(dateString);
            if (report.status === 'discrepancy') {
                console.error(`Reconciliation discrepancies found for ${dateString}:`, report.discrepancies);
                // Here you could send alerts to administrators
            }
            else {
                console.log(`Reconciliation completed successfully for ${dateString}`);
            }
            return report;
        }
        catch (error) {
            console.error('Auto-reconciliation failed:', error);
            throw error;
        }
    }
    /**
     * Get pending reconciliations (dates that haven't been reconciled)
     */
    static async getPendingReconciliations(daysBack = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysBack);
            // Get all dates that should be reconciled
            const allDates = [];
            const currentDate = new Date(startDate);
            while (currentDate < endDate) {
                allDates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            // Get dates that have been reconciled
            const reconciledResult = await (0, db_1.query)(`
                SELECT date FROM payment_reconciliation 
                WHERE date >= $1 AND date < $2
            `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
            const reconciledDates = new Set(reconciledResult.rows.map((row) => row.date));
            // Return dates that haven't been reconciled
            return allDates.filter(date => !reconciledDates.has(date));
        }
        catch (error) {
            console.error('ReconciliationService.getPendingReconciliations error:', error);
            throw new Error('Failed to get pending reconciliations');
        }
    }
    /**
     * Reconcile multiple pending dates
     */
    static async reconcilePendingDates(dates) {
        const reports = [];
        for (const date of dates) {
            try {
                console.log(`Reconciling ${date}...`);
                const report = await this.runDailyReconciliation(date);
                reports.push(report);
                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            catch (error) {
                console.error(`Failed to reconcile ${date}:`, error);
                // Continue with other dates
            }
        }
        return reports;
    }
}
exports.ReconciliationService = ReconciliationService;
//# sourceMappingURL=reconciliation.service.js.map