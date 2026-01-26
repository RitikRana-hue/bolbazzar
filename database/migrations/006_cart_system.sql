-- Migration: Cart System
-- Description: Add cart and cart items tables for shopping cart functionality

-- Cart table
CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    UNIQUE("userId")
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "cartId" TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    -- Prevent duplicate products in same cart
    UNIQUE("cartId", "productId")
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts("userId");
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items("cartId");
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items("productId");
