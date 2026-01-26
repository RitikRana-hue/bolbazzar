-- Simple SQL seed for InstaSell database

-- Insert sample categories
INSERT INTO categories (id, name, slug, description, icon, "parentId", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES 
    ('cat1', 'Electronics', 'electronics', 'Electronic devices and gadgets', '💻', NULL, true, 1, NOW(), NOW()),
    ('cat2', 'Fashion', 'fashion', 'Clothing and accessories', '👕', NULL, true, 2, NOW(), NOW()),
    ('cat3', 'Home & Garden', 'home-garden', 'Home improvement and garden items', '🏠', NULL, true, 3, NOW(), NOW()),
    ('cat4', 'Sports', 'sports', 'Sports equipment and gear', '⚽', NULL, true, 4, NOW(), NOW()),
    ('cat5', 'Books', 'books', 'Books and media', '📚', NULL, true, 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, email, username, password, role, "isEmailVerified", "isActive", "createdAt", "updatedAt")
VALUES 
    ('user1', 'john@example.com', 'john_doe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'BUYER', true, true, NOW(), NOW()),
    ('user2', 'jane@example.com', 'jane_seller', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'SELLER', true, true, NOW(), NOW()),
    ('user3', 'admin@example.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'ADMIN', true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert user profiles
INSERT INTO user_profiles ("userId", firstName, lastName, bio, avatar, "createdAt", "updatedAt")
VALUES 
    ('user1', 'John', 'Doe', 'Passionate buyer looking for great deals', NULL, NOW(), NOW()),
    ('user2', 'Jane', 'Smith', 'Professional seller with quality products', NULL, NOW(), NOW()),
    ('user3', 'Admin', 'User', 'Platform administrator', NULL, NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

-- Insert sample products
INSERT INTO products (id, title, description, price, "originalPrice", condition, "categoryId", "sellerId", status, "isActive", views, "createdAt", "updatedAt")
VALUES 
    ('prod1', 'iPhone 15 Pro Max 256GB', 'Latest iPhone with amazing camera and performance. Brand new in box.', 999.99, 1199.99, 'NEW', 'cat1', 'user2', 'ACTIVE', true, 150, NOW(), NOW()),
    ('prod2', 'MacBook Pro 16" M3 Pro', 'Powerful laptop for professionals. Excellent condition.', 2499.99, 2799.99, 'LIKE_NEW', 'cat1', 'user2', 'ACTIVE', true, 89, NOW(), NOW()),
    ('prod3', 'Designer Leather Jacket', 'Genuine leather jacket, size M. Worn only a few times.', 299.99, 599.99, 'GOOD', 'cat2', 'user2', 'ACTIVE', true, 45, NOW(), NOW()),
    ('prod4', 'Garden Furniture Set', 'Complete outdoor dining set for 6 people. Good condition.', 399.99, 699.99, 'GOOD', 'cat3', 'user2', 'ACTIVE', true, 23, NOW(), NOW()),
    ('prod5', 'Mountain Bike', 'Professional mountain bike, 21 speeds. Excellent condition.', 599.99, 899.99, 'LIKE_NEW', 'cat4', 'user2', 'ACTIVE', true, 67, NOW(), NOW()),
    ('prod6', 'Programming Books Bundle', 'Collection of 10 programming books. Like new condition.', 89.99, 150.00, 'LIKE_NEW', 'cat5', 'user2', 'ACTIVE', true, 34, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert product images
INSERT INTO product_images (id, "productId", url, "isPrimary", "sortOrder", "createdAt", "updatedAt")
VALUES 
    ('img1', 'prod1', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', true, 1, NOW(), NOW()),
    ('img2', 'prod2', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', true, 1, NOW(), NOW()),
    ('img3', 'prod3', 'https://images.unsplash.com/photo-1551698628-9d984799ed2b?w=400', true, 1, NOW(), NOW()),
    ('img4', 'prod4', 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=400', true, 1, NOW(), NOW()),
    ('img5', 'prod5', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', true, 1, NOW(), NOW()),
    ('img6', 'prod6', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample auctions
INSERT INTO auctions (id, "productId", "startTime", "endTime", "startingBid", "currentBid", "bidCount", "minBidIncrement", status, "createdAt", "updatedAt")
VALUES 
    ('auc1', 'prod1', NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days', 799.99, 850.00, 5, 25.00, 'ACTIVE', NOW(), NOW()),
    ('auc2', 'prod2', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '1 day', 2299.99, 2350.00, 3, 50.00, 'ACTIVE', NOW(), NOW()),
    ('auc3', 'prod5', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '3 hours', 499.99, 550.00, 2, 25.00, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample bids
INSERT INTO auction_bids (id, "auctionId", "bidderId", amount, "isWinning", "createdAt", "updatedAt")
VALUES 
    ('bid1', 'auc1', 'user1', 850.00, true, NOW() - INTERVAL '30 minutes', NOW()),
    ('bid2', 'auc2', 'user1', 2350.00, true, NOW() - INTERVAL '1 hour', NOW()),
    ('bid3', 'auc3', 'user1', 550.00, true, NOW() - INTERVAL '45 minutes', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample watchlist items
INSERT INTO watchlist (id, "userId", "productId", "createdAt", "updatedAt")
VALUES 
    ('watch1', 'user1', 'prod1', NOW() - INTERVAL '2 hours', NOW()),
    ('watch2', 'user1', 'prod3', NOW() - INTERVAL '3 hours', NOW()),
    ('watch3', 'user1', 'prod5', NOW() - INTERVAL '1 hour', NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;
