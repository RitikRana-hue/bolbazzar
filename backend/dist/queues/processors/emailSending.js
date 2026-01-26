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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEmailSending = processEmailSending;
exports.scheduleEmail = scheduleEmail;
exports.scheduleBulkEmails = scheduleBulkEmails;
const config_1 = __importDefault(require("../../config"));
// Email templates
const EMAIL_TEMPLATES = {
    welcome: {
        subject: 'Welcome to InstaSell!',
        html: (data) => `
            <h1>Welcome ${data.name}!</h1>
            <p>Thank you for joining InstaSell marketplace.</p>
            <p>Your account has been successfully created.</p>
            <a href="${data.verificationUrl}">Verify your email</a>
        `
    },
    email_verification: {
        subject: 'Verify your email address',
        html: (data) => `
            <h1>Verify your email</h1>
            <p>Hi ${data.name},</p>
            <p>Please click the link below to verify your email address:</p>
            <a href="${data.verificationUrl}">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
        `
    },
    password_reset: {
        subject: 'Reset your password',
        html: (data) => `
            <h1>Reset your password</h1>
            <p>Hi ${data.name},</p>
            <p>You requested to reset your password. Click the link below:</p>
            <a href="${data.resetUrl}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    },
    auction_won: {
        subject: 'Congratulations! You won an auction',
        html: (data) => `
            <h1>Auction Won!</h1>
            <p>Hi ${data.name},</p>
            <p>Congratulations! You won the auction for "${data.productTitle}"</p>
            <p>Winning bid: $${data.amount}</p>
            <p>Please complete your payment to secure the item.</p>
            <a href="${data.orderUrl}">Complete Payment</a>
        `
    },
    auction_ended: {
        subject: 'Your auction has ended',
        html: (data) => `
            <h1>Auction Ended</h1>
            <p>Hi ${data.name},</p>
            <p>Your auction for "${data.productTitle}" has ended.</p>
            ${data.winnerId ?
            `<p>Final bid: $${data.amount}</p><p>The buyer will complete payment soon.</p>` :
            `<p>Unfortunately, there were no bids on this auction.</p>`}
        `
    },
    payment_received: {
        subject: 'Payment received for your sale',
        html: (data) => `
            <h1>Payment Received</h1>
            <p>Hi ${data.name},</p>
            <p>Payment of $${data.amount} has been received for "${data.productTitle}"</p>
            <p>The funds are being held in escrow and will be released after delivery confirmation.</p>
        `
    },
    escrow_released: {
        subject: 'Funds released to your account',
        html: (data) => `
            <h1>Funds Released</h1>
            <p>Hi ${data.name},</p>
            <p>Your funds of $${data.amount} for "${data.productTitle}" have been released to your wallet.</p>
            <p>You can now withdraw these funds to your bank account.</p>
            <a href="${data.walletUrl}">View Wallet</a>
        `
    },
    order_shipped: {
        subject: 'Your order has been shipped',
        html: (data) => `
            <h1>Order Shipped</h1>
            <p>Hi ${data.name},</p>
            <p>Your order for "${data.productTitle}" has been shipped!</p>
            <p>Tracking number: ${data.trackingNumber}</p>
            <p>Expected delivery: ${data.expectedDelivery}</p>
        `
    },
    order_delivered: {
        subject: 'Your order has been delivered',
        html: (data) => `
            <h1>Order Delivered</h1>
            <p>Hi ${data.name},</p>
            <p>Your order for "${data.productTitle}" has been delivered.</p>
            <p>If you have any issues, please contact support within 7 days.</p>
            <a href="${data.reviewUrl}">Leave a Review</a>
        `
    },
    generic_notification: {
        subject: 'Notification',
        html: (data) => `
            <h1>${data.title}</h1>
            <p>Hi ${data.name},</p>
            <p>${data.message}</p>
        `
    }
};
async function processEmailSending(job) {
    const { to, subject, template, data } = job.data;
    console.log(`Processing email sending to ${to} with template ${template}`);
    try {
        // Validate email address
        if (!isValidEmail(to)) {
            throw new Error(`Invalid email address: ${to}`);
        }
        // Get template
        const emailTemplate = EMAIL_TEMPLATES[template];
        if (!emailTemplate) {
            throw new Error(`Unknown email template: ${template}`);
        }
        // Prepare email content
        const emailSubject = subject || emailTemplate.subject;
        const emailHtml = emailTemplate.html(data);
        // Send email based on provider
        switch (config_1.default.email.provider) {
            case 'console':
                await sendConsoleEmail(to, emailSubject, emailHtml);
                break;
            case 'sendgrid':
                await sendSendGridEmail(to, emailSubject, emailHtml);
                break;
            case 'smtp':
                await sendSMTPEmail(to, emailSubject, emailHtml);
                break;
            default:
                throw new Error(`Unknown email provider: ${config_1.default.email.provider}`);
        }
        console.log(`Successfully sent email to ${to} with template ${template}`);
    }
    catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        // For certain errors, don't retry
        if (error instanceof Error) {
            if (error.message.includes('Invalid email') ||
                error.message.includes('Unknown email template')) {
                console.log(`Not retrying email job due to: ${error.message}`);
                return; // Don't throw, job will be marked as completed
            }
        }
        throw error; // Let Bull handle retries for other errors
    }
}
// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Console email (development)
async function sendConsoleEmail(to, subject, html) {
    console.log('=== EMAIL ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html}`);
    console.log('=============');
}
// SendGrid email
async function sendSendGridEmail(to, subject, html) {
    if (!config_1.default.email.sendgrid?.apiKey) {
        throw new Error('SendGrid API key not configured');
    }
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(config_1.default.email.sendgrid.apiKey);
    const msg = {
        to,
        from: {
            email: config_1.default.email.from.email,
            name: config_1.default.email.from.name,
        },
        subject,
        html,
    };
    await sgMail.send(msg);
}
// SMTP email
async function sendSMTPEmail(to, subject, html) {
    if (!config_1.default.email.smtp) {
        throw new Error('SMTP configuration not found');
    }
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
        host: config_1.default.email.smtp.host,
        port: config_1.default.email.smtp.port,
        secure: config_1.default.email.smtp.secure,
        auth: config_1.default.email.smtp.auth,
    });
    await transporter.sendMail({
        from: `"${config_1.default.email.from.name}" <${config_1.default.email.from.email}>`,
        to,
        subject,
        html,
    });
}
// Schedule email sending job
async function scheduleEmail(to, template, data, options = {}) {
    const { queues } = await Promise.resolve().then(() => __importStar(require('../config')));
    const jobData = {
        to,
        subject: options.subject || '',
        template,
        data,
        priority: options.priority || 3,
    };
    const jobOptions = {
        priority: options.priority || 3,
    };
    if (options.delay) {
        jobOptions.delay = options.delay;
    }
    await queues.emailSending.add('email-sending', jobData, jobOptions);
    console.log(`Scheduled email to ${to} with template ${template}`);
}
// Bulk email scheduling
async function scheduleBulkEmails(emails, options = {}) {
    const { queues } = await Promise.resolve().then(() => __importStar(require('../config')));
    const batchSize = options.batchSize || 100;
    // Process in batches to avoid overwhelming the queue
    for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        const jobs = batch.map((email, index) => ({
            name: 'email-sending',
            data: {
                to: email.to,
                subject: email.subject,
                template: email.template,
                data: email.data,
                priority: options.priority || 3,
            },
            opts: {
                priority: options.priority || 3,
                delay: (options.delay || 0) + (index * 100), // Stagger emails slightly
            }
        }));
        await queues.emailSending.addBulk(jobs);
    }
    console.log(`Scheduled ${emails.length} bulk emails`);
}
//# sourceMappingURL=emailSending.js.map