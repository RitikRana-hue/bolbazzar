"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNotificationDispatch = processNotificationDispatch;
exports.scheduleNotification = scheduleNotification;
exports.scheduleBulkNotifications = scheduleBulkNotifications;
const db_1 = require("../../db");
const emailSending_1 = require("./emailSending");
async function processNotificationDispatch(job) {
    const { userId, type, title, message, data = {}, channels } = job.data;
    console.log(`Processing notification dispatch for user ${userId}, type ${type}`);
    try {
        // Get user details
        const userResult = await (0, db_1.query)(`
            SELECT 
                u.id,
                u.email,
                u.username,
                up.firstName,
                up.lastName,
                up.pushToken,
                up.emailNotifications,
                up.pushNotifications,
                up.smsNotifications
            FROM users u
            LEFT JOIN user_profiles up ON up.userId = u.id
            WHERE u.id = $1 AND u.isActive = true
        `, [userId]);
        if (userResult.rows.length === 0) {
            console.log(`User ${userId} not found or inactive, skipping notification`);
            return;
        }
        const user = userResult.rows[0];
        const userName = user.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : user.username;
        // Store notification in database (for in-app notifications)
        const notificationResult = await (0, db_1.query)(`
            INSERT INTO notifications (
                userId, type, title, message, data, isRead, createdAt
            )
            VALUES ($1, $2, $3, $4, $5, false, NOW())
            RETURNING id
        `, [userId, type, title, message, JSON.stringify(data)]);
        const notificationId = notificationResult.rows[0].id;
        // Process each channel
        const results = await Promise.allSettled([
            // Push notifications
            channels.includes('push') && user.pushnotifications && user.pushtoken
                ? sendPushNotification(user.pushtoken, title, message, data)
                : Promise.resolve('push_skipped'),
            // Email notifications
            channels.includes('email') && user.emailnotifications
                ? sendEmailNotification(user.email, userName, type, title, message, data)
                : Promise.resolve('email_skipped'),
            // SMS notifications (if implemented)
            channels.includes('sms') && user.smsnotifications
                ? sendSMSNotification(user.phone, title, message)
                : Promise.resolve('sms_skipped')
        ]);
        // Log results
        const pushResult = results[0];
        const emailResult = results[1];
        const smsResult = results[2];
        console.log(`Notification ${notificationId} dispatch results:`, {
            push: pushResult.status === 'fulfilled' ? 'success' : 'failed',
            email: emailResult.status === 'fulfilled' ? 'success' : 'failed',
            sms: smsResult.status === 'fulfilled' ? 'success' : 'failed'
        });
        // Update notification with delivery status
        const deliveryChannels = [];
        if (pushResult.status === 'fulfilled' && pushResult.value !== 'push_skipped') {
            deliveryChannels.push('push');
        }
        if (emailResult.status === 'fulfilled' && emailResult.value !== 'email_skipped') {
            deliveryChannels.push('email');
        }
        if (smsResult.status === 'fulfilled' && smsResult.value !== 'sms_skipped') {
            deliveryChannels.push('sms');
        }
        await (0, db_1.query)(`
            UPDATE notifications 
            SET deliveredChannels = $1, deliveredAt = NOW()
            WHERE id = $2
        `, [JSON.stringify(deliveryChannels), notificationId]);
        console.log(`Successfully processed notification dispatch for user ${userId}`);
    }
    catch (error) {
        console.error(`Error processing notification dispatch for user ${userId}:`, error);
        throw error; // Let Bull handle retries
    }
}
// Send push notification
async function sendPushNotification(pushToken, title, message, data) {
    // This would integrate with Firebase Cloud Messaging, Apple Push Notification Service, etc.
    // For now, we'll log it
    console.log('=== PUSH NOTIFICATION ===');
    console.log(`Token: ${pushToken}`);
    console.log(`Title: ${title}`);
    console.log(`Message: ${message}`);
    console.log(`Data:`, data);
    console.log('========================');
    // In production, you would use something like:
    // const admin = require('firebase-admin');
    // await admin.messaging().send({
    //     token: pushToken,
    //     notification: { title, body: message },
    //     data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
    // });
    return 'push_sent';
}
// Send email notification
async function sendEmailNotification(email, userName, type, title, message, data) {
    // Map notification types to email templates
    const emailTemplateMap = {
        'auction_won': 'auction_won',
        'auction_ended': 'auction_ended',
        'payment_received': 'payment_received',
        'escrow_released': 'escrow_released',
        'order_shipped': 'order_shipped',
        'order_delivered': 'order_delivered',
    };
    const template = emailTemplateMap[type];
    if (template) {
        // Use specific email template
        await (0, emailSending_1.scheduleEmail)(email, template, {
            name: userName,
            ...data
        }, {
            subject: title,
            priority: 2
        });
    }
    else {
        // Use generic notification template
        await (0, emailSending_1.scheduleEmail)(email, 'generic_notification', {
            name: userName,
            title,
            message,
            ...data
        }, {
            subject: title,
            priority: 3
        });
    }
    return 'email_scheduled';
}
// Send SMS notification
async function sendSMSNotification(phone, title, message) {
    if (!phone) {
        return 'sms_no_phone';
    }
    // This would integrate with Twilio, AWS SNS, etc.
    console.log('=== SMS NOTIFICATION ===');
    console.log(`Phone: ${phone}`);
    console.log(`Title: ${title}`);
    console.log(`Message: ${message}`);
    console.log('=======================');
    // In production, you would use something like:
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //     body: `${title}: ${message}`,
    //     from: twilioPhoneNumber,
    //     to: phone
    // });
    return 'sms_sent';
}
// Schedule notification dispatch job
async function scheduleNotification(userId, type, title, message, options = {}) {
    const { queues } = await Promise.resolve().then(() => __importStar(require('../config')));
    const jobData = {
        userId,
        type,
        title,
        message,
        data: options.data || {},
        channels: options.channels || ['push', 'email'],
    };
    const jobOptions = {
        priority: options.priority || 2,
    };
    if (options.delay) {
        jobOptions.delay = options.delay;
    }
    await queues.notificationDispatch.add('notification-dispatch', jobData, jobOptions);
    console.log(`Scheduled notification for user ${userId}, type ${type}`);
}
// Schedule bulk notifications
async function scheduleBulkNotifications(notifications, options = {}) {
    const { queues } = await Promise.resolve().then(() => __importStar(require('../config')));
    const batchSize = options.batchSize || 50;
    // Process in batches
    for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const jobs = batch.map((notification, index) => ({
            name: 'notification-dispatch',
            data: {
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data || {},
                channels: notification.channels || ['push', 'email'],
            },
            opts: {
                priority: options.priority || 2,
                delay: (options.delay || 0) + (index * 50), // Stagger notifications
            }
        }));
        await queues.notificationDispatch.addBulk(jobs);
    }
    console.log(`Scheduled ${notifications.length} bulk notifications`);
}
//# sourceMappingURL=notificationDispatch.js.map