export declare class NotificationService {
    /**
     * Subscribe to a seller's channel
     */
    static subscribeToSeller(userId: string, sellerId: string, notificationTypes?: string[]): Promise<{
        success: boolean;
    }>;
    /**
     * Subscribe to category notifications
     */
    static subscribeToCategory(userId: string, categoryId: string, notificationTypes?: string[]): Promise<{
        success: boolean;
    }>;
    /**
     * Subscribe to keyword alerts
     */
    static subscribeToKeyword(userId: string, keyword: string, notificationTypes?: string[]): Promise<{
        success: boolean;
    }>;
    /**
     * Send notifications for new listings
     */
    static notifyNewListing(listingId: string, sellerId: string, categoryId: string, title: string, price: number): Promise<{
        notificationsSent: any;
        error?: undefined;
    } | {
        error: string;
        notificationsSent?: undefined;
    }>;
    /**
     * Send notifications for new auctions
     */
    static notifyNewAuction(auctionId: string, listingId: string, sellerId: string, categoryId: string, title: string, startingBid: number, endTime: string): Promise<{
        notificationsSent: any;
        error?: undefined;
    } | {
        error: string;
        notificationsSent?: undefined;
    }>;
    /**
     * Send price drop notifications
     */
    static notifyPriceDrop(listingId: string, sellerId: string, categoryId: string, title: string, oldPrice: number, newPrice: number): Promise<{
        notificationsSent: any;
        error?: undefined;
    } | {
        error: string;
        notificationsSent?: undefined;
    }>;
    /**
     * Send flash sale notifications
     */
    static notifyFlashSale(saleId: string, title: string, discountPercentage: number, endTime: string): Promise<{
        notificationsSent: any;
        error?: undefined;
    } | {
        error: string;
        notificationsSent?: undefined;
    }>;
    /**
     * Send push notifications (integrate with FCM/APNS)
     */
    static sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<{
        success: boolean;
        deviceCount: any;
        error?: undefined;
    } | {
        error: string;
        success?: undefined;
        deviceCount?: undefined;
    }>;
    /**
     * Send email notifications
     */
    static sendEmailNotification(userId: string, subject: string, template: string, data: any): Promise<{
        skipped: string;
        success?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        skipped?: undefined;
        error?: undefined;
    } | {
        error: string;
        skipped?: undefined;
        success?: undefined;
    }>;
    /**
     * Get user's notification preferences
     */
    static getUserNotificationPreferences(userId: string): Promise<any>;
    /**
     * Update user's notification preferences
     */
    static updateNotificationPreferences(userId: string, preferences: any): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=notification.service.d.ts.map