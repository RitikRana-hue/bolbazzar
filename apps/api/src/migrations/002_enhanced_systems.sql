-- Enhanced Money Flow System Tables

-- Escrows table for holding funds
CREATE TABLE IF NOT EXISTS escrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_intent_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'holding' CHECK (status IN ('holding', 'released', 'disputed', 'refunded')),
    dispute_id UUID,
    release_reason VARCHAR(100),
    can_compound BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    release_date TIMESTAMP NOT NULL,
    released_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_escrows_order_id ON escrows(order_id);
CREATE INDEX idx_escrows_status ON escrows(status);
CREATE INDEX idx_escrows_release_date ON escrows(release_date);

-- Withdrawals table for seller payouts
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(12, 2) NOT NULL,
    method VARCHAR(50) NOT NULL CHECK (method IN ('bank', 'upi', 'card')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP
);

CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- Enhanced Delivery System Tables

-- Delivery agents table
CREATE TABLE IF NOT EXISTS delivery_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(50),
    license_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enhanced deliveries table
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES delivery_agents(id);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_photos JSONB;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS signature TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS pickup_signature TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS pickup_signer_name VARCHAR(255);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_signer_name VARCHAR(255);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS customer_present BOOLEAN;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS open_box_verified BOOLEAN DEFAULT false;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS open_box_photos JSONB;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS open_box_customer_approval BOOLEAN;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS open_box_condition VARCHAR(100);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS open_box_notes TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS open_box_verified_at TIMESTAMP;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS last_location VARCHAR(255);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Delivery photos table
CREATE TABLE IF NOT EXISTS delivery_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id),
    photo_urls JSONB NOT NULL,
    photo_type VARCHAR(50) NOT NULL CHECK (photo_type IN ('pickup', 'delivery', 'damage', 'signature', 'open_box')),
    uploaded_by UUID NOT NULL REFERENCES delivery_agents(id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enhanced delivery timeline
ALTER TABLE delivery_timeline ADD COLUMN IF NOT EXISTS agent_notes JSONB;

-- Post-Purchase Chat System Tables

-- Contact exchanges table
CREATE TABLE IF NOT EXISTS contact_exchanges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    phone_number VARCHAR(20) NOT NULL,
    exchanged_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Enhanced conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT true;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP;

-- Notification & Channel System Tables

-- Channel subscriptions table
CREATE TABLE IF NOT EXISTS channel_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN ('seller', 'category', 'keyword')),
    channel_id VARCHAR(255) NOT NULL, -- seller_id, category_id, or keyword
    notification_types JSONB NOT NULL DEFAULT '["new_listings", "auctions", "price_drops"]',
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, channel_type, channel_id)
);

CREATE INDEX idx_channel_subscriptions_user_id ON channel_subscriptions(user_id);
CREATE INDEX idx_channel_subscriptions_channel ON channel_subscriptions(channel_type, channel_id);
CREATE INDEX idx_channel_subscriptions_active ON channel_subscriptions(is_active);

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    email_notifications_enabled BOOLEAN DEFAULT true,
    push_notifications_enabled BOOLEAN DEFAULT true,
    sms_notifications_enabled BOOLEAN DEFAULT false,
    notification_frequency VARCHAR(50) DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User devices for push notifications
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    device_token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, device_token)
);

-- Push notifications log
CREATE TABLE IF NOT EXISTS push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
    sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMP
);

-- Email notifications log
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template VARCHAR(100) NOT NULL,
    data JSONB,
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'bounced', 'failed')),
    sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMP
);

-- Enhanced wallet system
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS pending_withdrawal DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_earned DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(12, 2) DEFAULT 0;

-- Enhanced orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_id UUID REFERENCES escrows(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_released_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- Enhanced users table for notifications
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true;

-- Create indexes for performance
CREATE INDEX idx_escrows_seller_id ON escrows(seller_id);
CREATE INDEX idx_escrows_buyer_id ON escrows(buyer_id);
CREATE INDEX idx_delivery_photos_delivery_id ON delivery_photos(delivery_id);
CREATE INDEX idx_contact_exchanges_conversation_id ON contact_exchanges(conversation_id);
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_push_notifications_user_id ON push_notifications(user_id);
CREATE INDEX idx_email_notifications_user_id ON email_notifications(user_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON escrows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channel_subscriptions_updated_at BEFORE UPDATE ON channel_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON user_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();