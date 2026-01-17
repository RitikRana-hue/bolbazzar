-- Complete payment system tables for production

-- Payment intents table (Stripe integration)
CREATE TABLE IF NOT EXISTS payment_intents (
    id VARCHAR(255) PRIMARY KEY, -- Stripe payment intent ID
    orderId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    clientSecret VARCHAR(500),
    paymentMethodId VARCHAR(255),
    paymentMethodType VARCHAR(50),
    metadata JSONB,
    stripeCreatedAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_payment_intents_order FOREIGN KEY (orderId) REFERENCES orders(id),
    CONSTRAINT fk_payment_intents_user FOREIGN KEY (userId) REFERENCES users(id)
);

-- Payment confirmations table (idempotency)
CREATE TABLE IF NOT EXISTS payment_confirmations (
    id SERIAL PRIMARY KEY,
    paymentIntentId VARCHAR(255) NOT NULL,
    orderId VARCHAR(255) NOT NULL,
    idempotencyKey VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    confirmedAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_payment_confirmations_intent FOREIGN KEY (paymentIntentId) REFERENCES payment_intents(id),
    CONSTRAINT fk_payment_confirmations_order FOREIGN KEY (orderId) REFERENCES orders(id)
);

-- Escrow table (enhanced)
CREATE TABLE IF NOT EXISTS escrows (
    id SERIAL PRIMARY KEY,
    orderId VARCHAR(255) UNIQUE NOT NULL,
    buyerId VARCHAR(255) NOT NULL,
    sellerId VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    platformFee DECIMAL(10,2) NOT NULL DEFAULT 0,
    sellerAmount DECIMAL(10,2) NOT NULL,
    paymentIntentId VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'holding',
    releaseDate TIMESTAMP WITH TIME ZONE,
    releaseReason VARCHAR(100),
    disputeId VARCHAR(255),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    releasedAt TIMESTAMP WITH TIME ZONE,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_escrows_order FOREIGN KEY (orderId) REFERENCES orders(id),
    CONSTRAINT fk_escrows_buyer FOREIGN KEY (buyerId) REFERENCES users(id),
    CONSTRAINT fk_escrows_seller FOREIGN KEY (sellerId) REFERENCES users(id),
    CONSTRAINT fk_escrows_payment_intent FOREIGN KEY (paymentIntentId) REFERENCES payment_intents(id)
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(255) PRIMARY KEY, -- Stripe refund ID
    paymentIntentId VARCHAR(255) NOT NULL,
    orderId VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    processedBy VARCHAR(255),
    adminNotes TEXT,
    stripeCreatedAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_refunds_payment_intent FOREIGN KEY (paymentIntentId) REFERENCES payment_intents(id),
    CONSTRAINT fk_refunds_order FOREIGN KEY (orderId) REFERENCES orders(id)
);

-- Transaction logs table (enhanced)
CREATE TABLE IF NOT EXISTS transaction_logs (
    id SERIAL PRIMARY KEY,
    userId VARCHAR(255),
    orderId VARCHAR(255),
    paymentIntentId VARCHAR(255),
    refundId VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    referenceId VARCHAR(255),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_transaction_logs_user FOREIGN KEY (userId) REFERENCES users(id),
    CONSTRAINT fk_transaction_logs_order FOREIGN KEY (orderId) REFERENCES orders(id)
);

-- Payment reconciliation table
CREATE TABLE IF NOT EXISTS payment_reconciliation (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    stripePayouts DECIMAL(10,2) DEFAULT 0,
    platformFees DECIMAL(10,2) DEFAULT 0,
    refunds DECIMAL(10,2) DEFAULT 0,
    disputes DECIMAL(10,2) DEFAULT 0,
    netAmount DECIMAL(10,2) DEFAULT 0,
    recordCount INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    reconciledAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date)
);

-- Webhook events table (for idempotency and debugging)
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(255) PRIMARY KEY, -- Stripe event ID
    type VARCHAR(100) NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    data JSONB NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processedAt TIMESTAMP WITH TIME ZONE
);

-- Seller wallets table (enhanced)
CREATE TABLE IF NOT EXISTS seller_wallets (
    id SERIAL PRIMARY KEY,
    userId VARCHAR(255) UNIQUE NOT NULL,
    availableBalance DECIMAL(10,2) DEFAULT 0,
    pendingBalance DECIMAL(10,2) DEFAULT 0,
    totalEarned DECIMAL(10,2) DEFAULT 0,
    totalWithdrawn DECIMAL(10,2) DEFAULT 0,
    lastPayoutAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_seller_wallets_user FOREIGN KEY (userId) REFERENCES users(id)
);

-- Withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id SERIAL PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) NOT NULL DEFAULT 'stripe_transfer',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    stripeTransferId VARCHAR(255),
    bankAccount JSONB,
    adminNotes TEXT,
    requestedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processedAt TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_withdrawal_requests_user FOREIGN KEY (userId) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_order_id ON payment_intents(orderId);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(userId);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON payment_intents(createdAt);

CREATE INDEX IF NOT EXISTS idx_payment_confirmations_idempotency ON payment_confirmations(idempotencyKey);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_payment_intent ON payment_confirmations(paymentIntentId);

CREATE INDEX IF NOT EXISTS idx_escrows_order_id ON escrows(orderId);
CREATE INDEX IF NOT EXISTS idx_escrows_buyer_id ON escrows(buyerId);
CREATE INDEX IF NOT EXISTS idx_escrows_seller_id ON escrows(sellerId);
CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status);
CREATE INDEX IF NOT EXISTS idx_escrows_release_date ON escrows(releaseDate);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_intent ON refunds(paymentIntentId);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(orderId);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

CREATE INDEX IF NOT EXISTS idx_transaction_logs_user_id ON transaction_logs(userId);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_order_id ON transaction_logs(orderId);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_type ON transaction_logs(type);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON transaction_logs(createdAt);

CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(createdAt);

CREATE INDEX IF NOT EXISTS idx_seller_wallets_user_id ON seller_wallets(userId);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(userId);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_requested_at ON withdrawal_requests(requestedAt);