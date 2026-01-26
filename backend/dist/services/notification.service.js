"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const db_1 = require("../db");
const notifications_1 = require("../routes/notifications");
class NotificationService {
    /**
     * Subscribe to a seller's channel
     */
    static async subscribeToSeller(userId, sellerId, notificationTypes = ['new_listings', 'auctions', 'price_drops']) {
        return await (0, db_1.transaction)(async (client) => {
            // Create or update subscription
            await client.query(`
                INSERT INTO channel_subscriptions (user_id, channel_type, channel_id, notification_types, subscribed_at, is_active)
                VALUES ($1, 'seller', $2, $3, NOW(), true)
                ON CONFLICT (user_id, channel_type, channel_id)
                DO UPDATE SET 
                    notification_types = $3,
                    is_active = true,
                    updated_at = NOW()
            `, [userId, sellerId, JSON.stringify(notificationTypes)]);
            // Get seller info
            const seller = await client.query('SELECT name FROM users WHERE id = $1', [sellerId]);
            // Notify user of successful subscription
            await (0, notifications_1.createNotification)(userId, 'system', 'Subscription Added', `You're now subscribed to ${seller.rows[0]?.name || 'seller'}'s channel`, `/account/channels`);
            return { success: true };
        });
    }
    /**
     * Subscribe to category notifications
     */
    static async subscribeToCategory(userId, categoryId, notificationTypes = ['new_listings', 'auctions', 'deals']) {
        return await (0, db_1.transaction)(async (client) => {
            await client.query(`
                INSERT INTO channel_subscriptions (user_id, channel_type, channel_id, notification_types, subscribed_at, is_active)
                VALUES ($1, 'category', $2, $3, NOW(), true)
                ON CONFLICT (user_id, channel_type, channel_id)
                DO UPDATE SET 
                    notification_types = $3,
                    is_active = true,
                    updated_at = NOW()
            `, [userId, categoryId, JSON.stringify(notificationTypes)]);
            const category = await client.query('SELECT name FROM categories WHERE id = $1', [categoryId]);
            await (0, notifications_1.createNotification)(userId, 'system', 'Category Subscription Added', `You're now subscribed to ${category.rows[0]?.name || 'category'} notifications`, `/account/channels`);
            return { success: true };
        });
    }
    /**
     * Subscribe to keyword alerts
     */
    static async subscribeToKeyword(userId, keyword, notificationTypes = ['new_listings', 'auctions', 'price_drops']) {
        return await (0, db_1.transaction)(async (client) => {
            await client.query(`
                INSERT INTO channel_subscriptions (user_id, channel_type, channel_id, notification_types, subscribed_at, is_active)
                VALUES ($1, 'keyword', $2, $3, NOW(), true)
                ON CONFLICT (user_id, channel_type, channel_id)
                DO UPDATE SET 
                    notification_types = $3,
                    is_active = true,
                    updated_at = NOW()
            `, [userId, keyword.toLowerCase(), JSON.stringify(notificationTypes)]);
            await (0, notifications_1.createNotification)(userId, 'system', 'Keyword Alert Added', `You'll now receive alerts for "${keyword}"`, `/account/channels`);
            return { success: true };
        });
    }
    /**
     * Send notifications for new listings
     */
    static async notifyNewListing(listingId, sellerId, categoryId, title, price) {
        try {
            // Get all relevant subscriptions
            const subscriptions = await (0, db_1.query)(`
                SELECT DISTINCT cs.user_id, cs.notification_types
                FROM channel_subscriptions cs
                WHERE cs.is_active = true
                AND (
                    (cs.channel_type = 'seller' AND cs.channel_id = $1) OR
                    (cs.channel_type = 'category' AND cs.channel_id = $2) OR
                    (cs.channel_type = 'keyword' AND LOWER($3) LIKE '%' || cs.channel_id || '%')
                )
                AND cs.user_id != $1
            `, [sellerId, categoryId, title.toLowerCase()]);
            // Send notifications to subscribers
            for (const sub of subscriptions.rows) {
                const notificationTypes = JSON.parse(sub.notification_types);
                if (notificationTypes.includes('new_listings')) {
                    await (0, notifications_1.createNotification)(sub.user_id, 'listing', 'New Listing Alert', `New item: ${title} - $${price.toFixed(2)}`, `/p/${listingId}`, { listingId, sellerId, categoryId, price });
                }
            }
            return { notificationsSent: subscriptions.rows.length };
        }
        catch (error) {
            console.error('Error sending new listing notifications:', error);
            return { error: 'Failed to send notifications' };
        }
    }
    /**
     * Send notifications for new auctions
     */
    static async notifyNewAuction(auctionId, listingId, sellerId, categoryId, title, startingBid, endTime) {
        try {
            const subscriptions = await (0, db_1.query)(`
                SELECT DISTINCT cs.user_id, cs.notification_types
                FROM channel_subscriptions cs
                WHERE cs.is_active = true
                AND (
                    (cs.channel_type = 'seller' AND cs.channel_id = $1) OR
                    (cs.channel_type = 'category' AND cs.channel_id = $2) OR
                    (cs.channel_type = 'keyword' AND LOWER($3) LIKE '%' || cs.channel_id || '%')
                )
                AND cs.user_id != $1
            `, [sellerId, categoryId, title.toLowerCase()]);
            for (const sub of subscriptions.rows) {
                const notificationTypes = JSON.parse(sub.notification_types);
                if (notificationTypes.includes('auctions')) {
                    await (0, notifications_1.createNotification)(sub.user_id, 'auction', 'New Auction Alert', `New auction: ${title} - Starting at $${startingBid.toFixed(2)}`, `/auctions/${auctionId}`, { auctionId, listingId, sellerId, startingBid, endTime });
                }
            }
            return { notificationsSent: subscriptions.rows.length };
        }
        catch (error) {
            console.error('Error sending new auction notifications:', error);
            return { error: 'Failed to send notifications' };
        }
    }
    /**
     * Send price drop notifications
     */
    static async notifyPriceDrop(listingId, sellerId, categoryId, title, oldPrice, newPrice) {
        try {
            const discountPercentage = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
            const subscriptions = await (0, db_1.query)(`
                SELECT DISTINCT cs.user_id, cs.notification_types
                FROM channel_subscriptions cs
                WHERE cs.is_active = true
                AND (
                    (cs.channel_type = 'seller' AND cs.channel_id = $1) OR
                    (cs.channel_type = 'category' AND cs.channel_id = $2) OR
                    (cs.channel_type = 'keyword' AND LOWER($3) LIKE '%' || cs.channel_id || '%')
                )
                AND cs.user_id != $1
            `, [sellerId, categoryId, title.toLowerCase()]);
            for (const sub of subscriptions.rows) {
                const notificationTypes = JSON.parse(sub.notification_types);
                if (notificationTypes.includes('price_drops')) {
                    await (0, notifications_1.createNotification)(sub.user_id, 'deal', 'Price Drop Alert', `${title} - ${discountPercentage}% off! Now $${newPrice.toFixed(2)} (was $${oldPrice.toFixed(2)})`, `/p/${listingId}`, { listingId, oldPrice, newPrice, discountPercentage });
                }
            }
            return { notificationsSent: subscriptions.rows.length };
        }
        catch (error) {
            console.error('Error sending price drop notifications:', error);
            return { error: 'Failed to send notifications' };
        }
    }
    /**
     * Send flash sale notifications
     */
    static async notifyFlashSale(saleId, title, discountPercentage, endTime) {
        try {
            // Get all users subscribed to deals
            const subscriptions = await (0, db_1.query)(`
                SELECT DISTINCT user_id
                FROM channel_subscriptions
                WHERE is_active = true
                AND notification_types::jsonb ? 'deals'
            `);
            for (const sub of subscriptions.rows) {
                await (0, notifications_1.createNotification)(sub.user_id, 'deal', 'Flash Sale Alert', `${discountPercentage}% off ${title} - Limited time!`, `/offers/${saleId}`, { saleId, discountPercentage, endTime });
            }
            return { notificationsSent: subscriptions.rows.length };
        }
        catch (error) {
            console.error('Error sending flash sale notifications:', error);
            return { error: 'Failed to send notifications' };
        }
    }
    /**
     * Send push notifications (integrate with FCM/APNS)
     */
    static async sendPushNotification(userId, title, body, data) {
        try {
            // Get user's device tokens
            const tokens = await (0, db_1.query)(`
                SELECT device_token, platform
                FROM user_devices
                WHERE user_id = $1 AND is_active = true
            `, [userId]);
            // In a real implementation, integrate with Firebase Cloud Messaging
            // or Apple Push Notification Service
            console.log(`Push notification to ${tokens.rows.length} devices:`, { title, body, data });
            // Store push notification record
            await (0, db_1.query)(`
                INSERT INTO push_notifications (user_id, title, body, data, sent_at, status)
                VALUES ($1, $2, $3, $4, NOW(), 'sent')
            `, [userId, title, body, JSON.stringify(data)]);
            return { success: true, deviceCount: tokens.rows.length };
        }
        catch (error) {
            console.error('Error sending push notification:', error);
            return { error: 'Failed to send push notification' };
        }
    }
    /**
     * Send email notifications
     */
    static async sendEmailNotification(userId, subject, template, data) {
        try {
            // Get user email preferences
            const user = await (0, db_1.query)(`
                SELECT email, email_notifications_enabled
                FROM users
                WHERE id = $1
            `, [userId]);
            if (!user.rows[0]?.email_notifications_enabled) {
                return { skipped: 'Email notifications disabled' };
            }
            // In a real implementation, integrate with email service (SendGrid, SES, etc.)
            console.log(`Email notification to ${user.rows[0].email}:`, { subject, template, data });
            // Store email record
            await (0, db_1.query)(`
                INSERT INTO email_notifications (user_id, email, subject, template, data, sent_at, status)
                VALUES ($1, $2, $3, $4, $5, NOW(), 'sent')
            `, [userId, user.rows[0].email, subject, template, JSON.stringify(data)]);
            return { success: true };
        }
        catch (error) {
            console.error('Error sending email notification:', error);
            return { error: 'Failed to send email notification' };
        }
    }
    /**
     * Get user's notification preferences
     */
    static async getUserNotificationPreferences(userId) {
        const preferences = await (0, db_1.query)(`
            SELECT 
                email_notifications_enabled,
                push_notifications_enabled,
                sms_notifications_enabled,
                notification_frequency,
                quiet_hours_start,
                quiet_hours_end
            FROM user_notification_preferences
            WHERE user_id = $1
        `, [userId]);
        return preferences.rows[0] || {
            email_notifications_enabled: true,
            push_notifications_enabled: true,
            sms_notifications_enabled: false,
            notification_frequency: 'immediate',
            quiet_hours_start: null,
            quiet_hours_end: null
        };
    }
    /**
     * Update user's notification preferences
     */
    static async updateNotificationPreferences(userId, preferences) {
        await (0, db_1.query)(`
            INSERT INTO user_notification_preferences (
                user_id, email_notifications_enabled, push_notifications_enabled,
                sms_notifications_enabled, notification_frequency,
                quiet_hours_start, quiet_hours_end, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET
                email_notifications_enabled = $2,
                push_notifications_enabled = $3,
                sms_notifications_enabled = $4,
                notification_frequency = $5,
                quiet_hours_start = $6,
                quiet_hours_end = $7,
                updated_at = NOW()
        `, [
            userId,
            preferences.email_notifications_enabled,
            preferences.push_notifications_enabled,
            preferences.sms_notifications_enabled,
            preferences.notification_frequency,
            preferences.quiet_hours_start,
            preferences.quiet_hours_end
        ]);
        return { success: true };
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map