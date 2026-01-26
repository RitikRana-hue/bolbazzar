-- Migration: Queue Support Tables
-- Description: Create tables needed for background job processing

-- Add new columns to existing notifications table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'deliveredchannels'
    ) THEN
        ALTER TABLE notifications ADD COLUMN deliveredChannels JSONB DEFAULT '[]';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'deliveredat'
    ) THEN
        ALTER TABLE notifications ADD COLUMN deliveredAt TIMESTAMP;
    END IF;
END $$;

-- Temporary uploads table for file cleanup
CREATE TABLE IF NOT EXISTS temp_uploads (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    filename VARCHAR(255) NOT NULL,
    originalName VARCHAR(255) NOT NULL,
    mimeType VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    path TEXT NOT NULL,
    userId TEXT REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(50) NOT NULL, -- 'profile_image', 'product_image', etc.
    isProcessed BOOLEAN DEFAULT false,
    expiresAt TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    createdAt TIMESTAMP DEFAULT NOW()
);

-- Indexes for temp_uploads
CREATE INDEX IF NOT EXISTS idx_temp_uploads_user_id ON temp_uploads(userId);
CREATE INDEX IF NOT EXISTS idx_temp_uploads_expires_at ON temp_uploads(expiresAt);
CREATE INDEX IF NOT EXISTS idx_temp_uploads_is_processed ON temp_uploads(isProcessed);
CREATE INDEX IF NOT EXISTS idx_temp_uploads_created_at ON temp_uploads(createdAt);

-- Webhook events table - add missing columns if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_events') THEN
        -- Add source column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'webhook_events' AND column_name = 'source'
        ) THEN
            ALTER TABLE webhook_events ADD COLUMN source VARCHAR(50) DEFAULT 'stripe';
        END IF;
        
        -- Add eventType column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'webhook_events' AND column_name = 'eventtype'
        ) THEN
            ALTER TABLE webhook_events ADD COLUMN eventType VARCHAR(100);
            -- Copy from type column if it exists
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'webhook_events' AND column_name = 'type'
            ) THEN
                EXECUTE 'UPDATE webhook_events SET eventType = type';
            END IF;
        END IF;
        
        -- Add eventId column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'webhook_events' AND column_name = 'eventid'
        ) THEN
            ALTER TABLE webhook_events ADD COLUMN eventId VARCHAR(255);
        END IF;
        
        -- Add payload column if it doesn't exist (rename from data if needed)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'webhook_events' AND column_name = 'payload'
        ) THEN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'webhook_events' AND column_name = 'data'
            ) THEN
                ALTER TABLE webhook_events RENAME COLUMN data TO payload;
            ELSE
                ALTER TABLE webhook_events ADD COLUMN payload JSONB DEFAULT '{}'::jsonb;
            END IF;
        END IF;
        
        -- Add attempts column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'webhook_events' AND column_name = 'attempts'
        ) THEN
            ALTER TABLE webhook_events ADD COLUMN attempts INTEGER DEFAULT 0;
        END IF;
        
        -- Add lastError column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'webhook_events' AND column_name = 'lasterror'
        ) THEN
            ALTER TABLE webhook_events ADD COLUMN lastError TEXT;
        END IF;
        
        -- Add updatedAt column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'webhook_events' AND column_name = 'updatedat'
        ) THEN
            ALTER TABLE webhook_events ADD COLUMN updatedAt TIMESTAMP DEFAULT NOW();
        END IF;
    ELSE
        -- Create table if it doesn't exist
        CREATE TABLE webhook_events (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
            source VARCHAR(50) NOT NULL DEFAULT 'stripe',
            eventType VARCHAR(100) NOT NULL,
            eventId VARCHAR(255) NOT NULL,
            payload JSONB NOT NULL,
            processed BOOLEAN DEFAULT false,
            processedAt TIMESTAMP,
            attempts INTEGER DEFAULT 0,
            lastError TEXT,
            createdAt TIMESTAMP DEFAULT NOW(),
            updatedAt TIMESTAMP DEFAULT NOW(),
            UNIQUE(source, eventId)
        );
    END IF;
END $$;

-- Indexes for webhook_events (create if not exists)
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(eventType);

-- Add seller_wallets table if it doesn't exist (referenced in escrow processor)
CREATE TABLE IF NOT EXISTS seller_wallets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    availableBalance DECIMAL(10,2) DEFAULT 0.00,
    pendingBalance DECIMAL(10,2) DEFAULT 0.00,
    totalEarned DECIMAL(10,2) DEFAULT 0.00,
    totalWithdrawn DECIMAL(10,2) DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(userId)
);

-- Indexes for seller_wallets
CREATE INDEX IF NOT EXISTS idx_seller_wallets_user_id ON seller_wallets(userId);

-- Add push notification settings to user_profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'pushtoken'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN pushToken TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'pushnotifications'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN pushNotifications BOOLEAN DEFAULT true;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'emailnotifications'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN emailNotifications BOOLEAN DEFAULT true;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'smsnotifications'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN smsNotifications BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN phone VARCHAR(20);
    END IF;
END $$;

-- Add completedAt to orders if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'completedat'
    ) THEN
        ALTER TABLE orders ADD COLUMN completedAt TIMESTAMP;
    END IF;
END $$;

-- Add releaseReason and releasedAt to escrows if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'escrows' AND column_name = 'releasereason'
    ) THEN
        ALTER TABLE escrows ADD COLUMN releaseReason VARCHAR(50);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'escrows' AND column_name = 'releasedat'
    ) THEN
        ALTER TABLE escrows ADD COLUMN releasedAt TIMESTAMP;
    END IF;
END $$;