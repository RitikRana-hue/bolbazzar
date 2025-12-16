-- Payment System Tables

-- Payment intents (for card payments)
CREATE TABLE IF NOT EXISTS payment_intents (
    id VARCHAR(255) PRIMARY KEY, -- Stripe payment intent ID
    order_id UUID NOT NULL REFERENCES orders(id),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    status VARCHAR(50) NOT NULL,
    payment_method_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- UPI payments
CREATE TABLE IF NOT EXISTS upi_payments (
    id VARCHAR(255) PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(12, 2) NOT NULL,
    upi_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'processing',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Net banking payments
CREATE TABLE IF NOT EXISTS netbanking_payments (
    id VARCHAR(255) PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(12, 2) NOT NULL,
    bank_code VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'initiated',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Gas wallets for sellers
CREATE TABLE IF NOT EXISTS gas_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_topped_up DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_used DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment methods for users
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('card', 'upi', 'bank_account')),
    nickname VARCHAR(255),
    
    -- Card specific fields
    last4 VARCHAR(4),
    brand VARCHAR(50),
    exp_month INTEGER,
    exp_year INTEGER,
    
    -- UPI specific fields
    upi_id VARCHAR(255),
    
    -- Bank account specific fields
    bank_name VARCHAR(255),
    account_last4 VARCHAR(4),
    account_type VARCHAR(50),
    
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(255) PRIMARY KEY, -- Stripe refund ID or custom ID
    order_id UUID NOT NULL REFERENCES orders(id),
    amount DECIMAL(12, 2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    processed_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced transactions table (if not exists from previous migration)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    reference_id VARCHAR(255),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet transaction history
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallet_type VARCHAR(50) NOT NULL CHECK (wallet_type IN ('main', 'gas')),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    amount DECIMAL(12, 2) NOT NULL,
    balance_before DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    reference_id VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payment webhooks log
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_payment_intents_order_id ON payment_intents(order_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);
CREATE INDEX idx_upi_payments_order_id ON upi_payments(order_id);
CREATE INDEX idx_upi_payments_user_id ON upi_payments(user_id);
CREATE INDEX idx_upi_payments_status ON upi_payments(status);
CREATE INDEX idx_netbanking_payments_order_id ON netbanking_payments(order_id);
CREATE INDEX idx_netbanking_payments_user_id ON netbanking_payments(user_id);
CREATE INDEX idx_netbanking_payments_status ON netbanking_payments(status);
CREATE INDEX idx_gas_wallets_user_id ON gas_wallets(user_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_type ON payment_methods(type);
CREATE INDEX idx_payment_methods_default ON payment_methods(is_default);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_reference_id ON transactions(reference_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(wallet_type, transaction_type);
CREATE INDEX idx_payment_webhooks_provider ON payment_webhooks(provider);
CREATE INDEX idx_payment_webhooks_event_type ON payment_webhooks(event_type);
CREATE INDEX idx_payment_webhooks_processed ON payment_webhooks(processed);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON payment_intents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_upi_payments_updated_at BEFORE UPDATE ON upi_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_netbanking_payments_updated_at BEFORE UPDATE ON netbanking_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gas_wallets_updated_at BEFORE UPDATE ON gas_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create wallet transaction history
CREATE OR REPLACE FUNCTION create_wallet_transaction()
RETURNS TRIGGER AS $$
DECLARE
    old_balance DECIMAL(12, 2) := 0;
    new_balance DECIMAL(12, 2) := 0;
    transaction_type VARCHAR(50);
    wallet_type VARCHAR(50) := 'main';
BEGIN
    -- Determine if this is main wallet or gas wallet
    IF TG_TABLE_NAME = 'gas_wallets' THEN
        wallet_type := 'gas';
        old_balance := COALESCE(OLD.balance, 0);
        new_balance := NEW.balance;
    ELSE
        wallet_type := 'main';
        old_balance := COALESCE(OLD.available_balance, 0);
        new_balance := NEW.available_balance;
    END IF;

    -- Determine transaction type
    IF new_balance > old_balance THEN
        transaction_type := 'credit';
    ELSE
        transaction_type := 'debit';
    END IF;

    -- Insert wallet transaction record
    INSERT INTO wallet_transactions (
        user_id, wallet_type, transaction_type, amount,
        balance_before, balance_after, description, created_at
    )
    VALUES (
        NEW.user_id, wallet_type, transaction_type, ABS(new_balance - old_balance),
        old_balance, new_balance, 
        CASE 
            WHEN transaction_type = 'credit' THEN 'Wallet credited'
            ELSE 'Wallet debited'
        END,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for wallet transaction history
CREATE TRIGGER wallet_transaction_history 
    AFTER UPDATE ON wallets 
    FOR EACH ROW 
    WHEN (OLD.available_balance IS DISTINCT FROM NEW.available_balance)
    EXECUTE FUNCTION create_wallet_transaction();

CREATE TRIGGER gas_wallet_transaction_history 
    AFTER UPDATE ON gas_wallets 
    FOR EACH ROW 
    WHEN (OLD.balance IS DISTINCT FROM NEW.balance)
    EXECUTE FUNCTION create_wallet_transaction();

-- Add payment-related columns to existing tables if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP;

-- Update existing orders to have payment status
UPDATE orders SET payment_status = 'completed' WHERE status IN ('paid', 'shipped', 'delivered', 'completed');
UPDATE orders SET payment_status = 'failed' WHERE status = 'payment_failed';
UPDATE orders SET payment_status = 'refunded' WHERE status = 'refunded';