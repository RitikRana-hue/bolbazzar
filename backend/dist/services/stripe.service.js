"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../config"));
if (!config_1.default.payment.stripe.secretKey) {
    throw new Error('STRIPE_SECRET_KEY is required');
}
exports.stripe = new stripe_1.default(config_1.default.payment.stripe.secretKey, {
    apiVersion: '2023-10-16',
    typescript: true,
});
class StripeService {
    /**
     * Create a payment intent for order payment
     */
    static async createPaymentIntent(params) {
        try {
            const paymentIntent = await exports.stripe.paymentIntents.create({
                amount: Math.round(params.amount * 100), // Convert to cents
                currency: params.currency.toLowerCase(),
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    orderId: params.orderId,
                    userId: params.userId,
                    ...params.metadata,
                },
                payment_method_options: {
                    card: {
                        capture_method: 'manual',
                    },
                },
            });
            return paymentIntent;
        }
        catch (error) {
            console.error('Stripe createPaymentIntent error:', error);
            throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Retrieve a payment intent
     */
    static async retrievePaymentIntent(paymentIntentId) {
        try {
            return await exports.stripe.paymentIntents.retrieve(paymentIntentId);
        }
        catch (error) {
            console.error('Stripe retrievePaymentIntent error:', error);
            throw new Error(`Failed to retrieve payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Confirm a payment intent
     */
    static async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        try {
            const params = {};
            if (paymentMethodId) {
                params.payment_method = paymentMethodId;
            }
            return await exports.stripe.paymentIntents.confirm(paymentIntentId, params);
        }
        catch (error) {
            console.error('Stripe confirmPaymentIntent error:', error);
            throw new Error(`Failed to confirm payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create a refund
     */
    static async createRefund(params) {
        try {
            const refundParams = {
                payment_intent: params.paymentIntentId,
                reason: params.reason || 'requested_by_customer',
                metadata: params.metadata,
            };
            if (params.amount) {
                refundParams.amount = Math.round(params.amount * 100); // Convert to cents
            }
            return await exports.stripe.refunds.create(refundParams);
        }
        catch (error) {
            console.error('Stripe createRefund error:', error);
            throw new Error(`Failed to create refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Retrieve a refund
     */
    static async retrieveRefund(refundId) {
        try {
            return await exports.stripe.refunds.retrieve(refundId);
        }
        catch (error) {
            console.error('Stripe retrieveRefund error:', error);
            throw new Error(`Failed to retrieve refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create a transfer to seller (for marketplace)
     */
    static async createTransfer(params) {
        try {
            return await exports.stripe.transfers.create({
                amount: Math.round(params.amount * 100), // Convert to cents
                currency: params.currency.toLowerCase(),
                destination: params.destination,
                metadata: params.metadata,
            });
        }
        catch (error) {
            console.error('Stripe createTransfer error:', error);
            throw new Error(`Failed to create transfer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create a payout to bank account
     */
    static async createPayout(params) {
        try {
            return await exports.stripe.payouts.create({
                amount: Math.round(params.amount * 100), // Convert to cents
                currency: params.currency.toLowerCase(),
                method: (params.method || 'standard'),
                metadata: params.metadata,
            });
        }
        catch (error) {
            console.error('Stripe createPayout error:', error);
            throw new Error(`Failed to create payout: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Construct webhook event from request
     */
    static constructWebhookEvent(payload, signature, endpointSecret) {
        try {
            return exports.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
        }
        catch (error) {
            console.error('Stripe webhook construction error:', error);
            throw new Error(`Invalid webhook signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * List payment intents with filters
     */
    static async listPaymentIntents(params) {
        try {
            return await exports.stripe.paymentIntents.list(params);
        }
        catch (error) {
            console.error('Stripe listPaymentIntents error:', error);
            throw new Error(`Failed to list payment intents: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get balance
     */
    static async getBalance() {
        try {
            return await exports.stripe.balance.retrieve();
        }
        catch (error) {
            console.error('Stripe getBalance error:', error);
            throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * List balance transactions for reconciliation
     */
    static async listBalanceTransactions(params) {
        try {
            return await exports.stripe.balanceTransactions.list(params);
        }
        catch (error) {
            console.error('Stripe listBalanceTransactions error:', error);
            throw new Error(`Failed to list balance transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create a customer
     */
    static async createCustomer(params) {
        try {
            return await exports.stripe.customers.create({
                email: params.email,
                name: params.name,
                metadata: params.metadata,
            });
        }
        catch (error) {
            console.error('Stripe createCustomer error:', error);
            throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Retrieve a customer
     */
    static async retrieveCustomer(customerId) {
        try {
            const customer = await exports.stripe.customers.retrieve(customerId);
            if (customer.deleted) {
                throw new Error('Customer has been deleted');
            }
            return customer;
        }
        catch (error) {
            console.error('Stripe retrieveCustomer error:', error);
            throw new Error(`Failed to retrieve customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Update a customer
     */
    static async updateCustomer(customerId, params) {
        try {
            return await exports.stripe.customers.update(customerId, params);
        }
        catch (error) {
            console.error('Stripe updateCustomer error:', error);
            throw new Error(`Failed to update customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.StripeService = StripeService;
//# sourceMappingURL=stripe.service.js.map