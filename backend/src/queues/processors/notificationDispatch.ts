import { Job } from 'bull';
import { query } from '../../db';
import { NotificationDispatchJob } from '../config';
import { scheduleEmail } from './emailSending';

export async function processNotificationDispatch(job: Job<NotificationDispatchJob>): Promise<void> {
    const { userId, type, title, message, data = {}, channels } = job.data;

    console.log(`Processing notification dispatch for user ${userId}, type ${type}`);

    try {
        // Get user details
        const userResult = await query(`
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
        const notificationResult = await query(`
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

        await query(`
            UPDATE notifications 
            SET deliveredChannels = $1, deliveredAt = NOW()
            WHERE id = $2
        `, [JSON.stringify(deliveryChannels), notificationId]);

        console.log(`Successfully processed notification dispatch for user ${userId}`);

    } catch (error) {
        console.error(`Error processing notification dispatch for user ${userId}:`, error);
        throw error; // Let Bull handle retries
    }
}

// Send push notification
async function sendPushNotification(
    pushToken: string,
    title: string,
    message: string,
    data: Record<string, any>
): Promise<string> {
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
async function sendEmailNotification(
    email: string,
    userName: string,
    type: string,
    title: string,
    message: string,
    data: Record<string, any>
): Promise<string> {
    // Map notification types to email templates
    const emailTemplateMap: Record<string, string> = {
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
        await scheduleEmail(email, template, {
            name: userName,
            ...data
        }, {
            subject: title,
            priority: 2
        });
    } else {
        // Use generic notification template
        await scheduleEmail(email, 'generic_notification', {
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
async function sendSMSNotification(
    phone: string,
    title: string,
    message: string
): Promise<string> {
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
export async function scheduleNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    options: {
        data?: Record<string, any>;
        channels?: ('push' | 'email' | 'sms')[];
        priority?: number;
        delay?: number;
    } = {}
): Promise<void> {
    const { queues } = await import('../config');

    const jobData: NotificationDispatchJob = {
        userId,
        type,
        title,
        message,
        data: options.data || {},
        channels: options.channels || ['push', 'email'],
    };

    const jobOptions: any = {
        priority: options.priority || 2,
    };

    if (options.delay) {
        jobOptions.delay = options.delay;
    }

    await queues.notificationDispatch.add('notification-dispatch', jobData, jobOptions);

    console.log(`Scheduled notification for user ${userId}, type ${type}`);
}

// Schedule bulk notifications
export async function scheduleBulkNotifications(
    notifications: Array<{
        userId: string;
        type: string;
        title: string;
        message: string;
        data?: Record<string, any>;
        channels?: ('push' | 'email' | 'sms')[];
    }>,
    options: {
        priority?: number;
        delay?: number;
        batchSize?: number;
    } = {}
): Promise<void> {
    const { queues } = await import('../config');
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