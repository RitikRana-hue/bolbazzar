import Stripe from 'stripe';
import config from '../config';

if (!config.payment.stripe.secretKey) {
    throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(config.payment.stripe.secretKey, {
    apiVersion: '2023-10-16',
    typescript: true,
});

export class StripeService {
    /**
     * Create a payment intent for order payment
     */
    static async createPaymentIntent(params: {
        amount: number;
        currency: string;
        orderId: string;
        userId: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.PaymentIntent> {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
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
                        capture_method: 'manual' as const,
                    },
                },
            });

            return paymentIntent;
        } catch (error) {
            console.error('Stripe createPaymentIntent error:', error);
            throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Retrieve a payment intent
     */
    static async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
        try {
            return await stripe.paymentIntents.retrieve(paymentIntentId);
        } catch (error) {
            console.error('Stripe retrievePaymentIntent error:', error);
            throw new Error(`Failed to retrieve payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Confirm a payment intent
     */
    static async confirmPaymentIntent(
        paymentIntentId: string,
        paymentMethodId?: string
    ): Promise<Stripe.PaymentIntent> {
        try {
            const params: Stripe.PaymentIntentConfirmParams = {};

            if (paymentMethodId) {
                params.payment_method = paymentMethodId;
            }

            return await stripe.paymentIntents.confirm(paymentIntentId, params);
        } catch (error) {
            console.error('Stripe confirmPaymentIntent error:', error);
            throw new Error(`Failed to confirm payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a refund
     */
    static async createRefund(params: {
        paymentIntentId: string;
        amount?: number;
        reason?: Stripe.RefundCreateParams.Reason;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Refund> {
        try {
            const refundParams: Stripe.RefundCreateParams = {
                payment_intent: params.paymentIntentId,
                reason: params.reason || 'requested_by_customer',
                metadata: params.metadata,
            };

            if (params.amount) {
                refundParams.amount = Math.round(params.amount * 100); // Convert to cents
            }

            return await stripe.refunds.create(refundParams);
        } catch (error) {
            console.error('Stripe createRefund error:', error);
            throw new Error(`Failed to create refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Retrieve a refund
     */
    static async retrieveRefund(refundId: string): Promise<Stripe.Refund> {
        try {
            return await stripe.refunds.retrieve(refundId);
        } catch (error) {
            console.error('Stripe retrieveRefund error:', error);
            throw new Error(`Failed to retrieve refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a transfer to seller (for marketplace)
     */
    static async createTransfer(params: {
        amount: number;
        currency: string;
        destination: string; // Stripe account ID
        metadata?: Record<string, string>;
    }): Promise<Stripe.Transfer> {
        try {
            return await stripe.transfers.create({
                amount: Math.round(params.amount * 100), // Convert to cents
                currency: params.currency.toLowerCase(),
                destination: params.destination,
                metadata: params.metadata,
            });
        } catch (error) {
            console.error('Stripe createTransfer error:', error);
            throw new Error(`Failed to create transfer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a payout to bank account
     */
    static async createPayout(params: {
        amount: number;
        currency: string;
        method?: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Payout> {
        try {
            return await stripe.payouts.create({
                amount: Math.round(params.amount * 100), // Convert to cents
                currency: params.currency.toLowerCase(),
                method: (params.method || 'standard') as any,
                metadata: params.metadata,
            });
        } catch (error) {
            console.error('Stripe createPayout error:', error);
            throw new Error(`Failed to create payout: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Construct webhook event from request
     */
    static constructWebhookEvent(
        payload: string | Buffer,
        signature: string,
        endpointSecret: string
    ): Stripe.Event {
        try {
            return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
        } catch (error) {
            console.error('Stripe webhook construction error:', error);
            throw new Error(`Invalid webhook signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * List payment intents with filters
     */
    static async listPaymentIntents(params?: {
        customer?: string;
        created?: Stripe.RangeQueryParam | number;
        limit?: number;
    }): Promise<Stripe.ApiList<Stripe.PaymentIntent>> {
        try {
            return await stripe.paymentIntents.list(params);
        } catch (error) {
            console.error('Stripe listPaymentIntents error:', error);
            throw new Error(`Failed to list payment intents: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get balance
     */
    static async getBalance(): Promise<Stripe.Balance> {
        try {
            return await stripe.balance.retrieve();
        } catch (error) {
            console.error('Stripe getBalance error:', error);
            throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * List balance transactions for reconciliation
     */
    static async listBalanceTransactions(params?: {
        created?: Stripe.RangeQueryParam | number;
        type?: string;
        limit?: number;
    }): Promise<Stripe.ApiList<Stripe.BalanceTransaction>> {
        try {
            return await stripe.balanceTransactions.list(params);
        } catch (error) {
            console.error('Stripe listBalanceTransactions error:', error);
            throw new Error(`Failed to list balance transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a customer
     */
    static async createCustomer(params: {
        email: string;
        name?: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Customer> {
        try {
            return await stripe.customers.create({
                email: params.email,
                name: params.name,
                metadata: params.metadata,
            });
        } catch (error) {
            console.error('Stripe createCustomer error:', error);
            throw new Error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Retrieve a customer
     */
    static async retrieveCustomer(customerId: string): Promise<Stripe.Customer> {
        try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer.deleted) {
                throw new Error('Customer has been deleted');
            }
            return customer as Stripe.Customer;
        } catch (error) {
            console.error('Stripe retrieveCustomer error:', error);
            throw new Error(`Failed to retrieve customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update a customer
     */
    static async updateCustomer(
        customerId: string,
        params: Stripe.CustomerUpdateParams
    ): Promise<Stripe.Customer> {
        try {
            return await stripe.customers.update(customerId, params);
        } catch (error) {
            console.error('Stripe updateCustomer error:', error);
            throw new Error(`Failed to update customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}