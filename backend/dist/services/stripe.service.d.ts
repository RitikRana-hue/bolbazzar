import Stripe from 'stripe';
export declare const stripe: Stripe;
export declare class StripeService {
    /**
     * Create a payment intent for order payment
     */
    static createPaymentIntent(params: {
        amount: number;
        currency: string;
        orderId: string;
        userId: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.PaymentIntent>;
    /**
     * Retrieve a payment intent
     */
    static retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    /**
     * Confirm a payment intent
     */
    static confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<Stripe.PaymentIntent>;
    /**
     * Create a refund
     */
    static createRefund(params: {
        paymentIntentId: string;
        amount?: number;
        reason?: Stripe.RefundCreateParams.Reason;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Refund>;
    /**
     * Retrieve a refund
     */
    static retrieveRefund(refundId: string): Promise<Stripe.Refund>;
    /**
     * Create a transfer to seller (for marketplace)
     */
    static createTransfer(params: {
        amount: number;
        currency: string;
        destination: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Transfer>;
    /**
     * Create a payout to bank account
     */
    static createPayout(params: {
        amount: number;
        currency: string;
        method?: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Payout>;
    /**
     * Construct webhook event from request
     */
    static constructWebhookEvent(payload: string | Buffer, signature: string, endpointSecret: string): Stripe.Event;
    /**
     * List payment intents with filters
     */
    static listPaymentIntents(params?: {
        customer?: string;
        created?: Stripe.RangeQueryParam | number;
        limit?: number;
    }): Promise<Stripe.ApiList<Stripe.PaymentIntent>>;
    /**
     * Get balance
     */
    static getBalance(): Promise<Stripe.Balance>;
    /**
     * List balance transactions for reconciliation
     */
    static listBalanceTransactions(params?: {
        created?: Stripe.RangeQueryParam | number;
        type?: string;
        limit?: number;
    }): Promise<Stripe.ApiList<Stripe.BalanceTransaction>>;
    /**
     * Create a customer
     */
    static createCustomer(params: {
        email: string;
        name?: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Customer>;
    /**
     * Retrieve a customer
     */
    static retrieveCustomer(customerId: string): Promise<Stripe.Customer>;
    /**
     * Update a customer
     */
    static updateCustomer(customerId: string, params: Stripe.CustomerUpdateParams): Promise<Stripe.Customer>;
}
//# sourceMappingURL=stripe.service.d.ts.map