-- Minimal correct SQL seed for InstaSell database

-- Insert sample categories
INSERT INTO categories (id, name, slug, description, "parentId", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES 
    ('cat1', 'Electronics', 'electronics', 'Electronic devices and gadgets', NULL, true, 1, NOW(), NOW()),
    ('cat2', 'Fashion', 'fashion', 'Clothing and accessories', NULL, true, 2, NOW(), NOW()),
    ('cat3', 'Home & Garden', 'home-garden', 'Home improvement and garden items', NULL, true, 3, NOW(), NOW()),
    ('cat4', 'Sports', 'sports', 'Sports equipment and gear', NULL, true, 4, NOW(), NOW()),
    ('cat5', 'Books', 'books', 'Books and media', NULL, true, 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, email, username, password, role, "isEmailVerified", "isActive", "createdAt", "updatedAt")
VALUES 
    ('user1', 'john@example.com', 'john_doe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'BUYER', true, true, NOW(), NOW()),
    ('user2', 'jane@example.com', 'jane_seller', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'SELLER', true, true, NOW(), NOW()),
    ('user3', 'admin@example.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W', 'ADMIN', true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, "sellerId", "categoryId", title, description, condition, price, "originalPrice", stock, status, "isActive", "viewCount", "favoriteCount", "createdAt", "updatedAt")
VALUES 
    ('prod1', 'user2', 'cat1', 'iPhone 15 Pro Max 256GB', 'Latest iPhone with amazing camera and performance. Brand new in box.', 'NEW', 999.99, 1199.99, 1, 'ACTIVE', true, 150, 25, NOW(), NOW()),
    ('prod2', 'user2', 'cat1', 'MacBook Pro 16" M3 Pro', 'Powerful laptop for professionals. Excellent condition.', 'LIKE_NEW', 2499.99, 2799.99, 1, 'ACTIVE', true, 89, 12, NOW(), NOW()),
    ('prod3', 'user2', 'cat2', 'Designer Leather Jacket', 'Genuine leather jacket, size M. Worn only a few times.', 'GOOD', 299.99, 599.99, 1, 'ACTIVE', true, 45, 8, NOW(), NOW()),
    ('prod4', 'user2', 'cat3', 'Garden Furniture Set', 'Complete outdoor dining set for 6 people. Good condition.', 'GOOD', 399.99, 699.99, 1, 'ACTIVE', true, 23, 5, NOW(), NOW()),
    ('prod5', 'user2', 'cat4', 'Mountain Bike', 'Professional mountain bike, 21 speeds. Excellent condition.', 'LIKE_NEW', 599.99, 899.99, 1, 'ACTIVE', true, 67, 15, NOW(), NOW()),
    ('prod6', 'user2', 'cat5', 'Programming Books Bundle', 'Collection of 10 programming books. Like new condition.', 'LIKE_NEW', 89.99, 150.00, 1, 'ACTIVE', true, 34, 7, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert product images
INSERT INTO product_images (id, "productId", url, "isPrimary", "sortOrder", "createdAt")
VALUES 
    ('img1', 'prod1', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', true, 1, NOW()),
    ('img2', 'prod2', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', true, 1, NOW()),
    ('img3', 'prod3', 'https://images.unsplash.com/photo-1551698628-9d984799ed2b?w=400', true, 1, NOW()),
    ('img4', 'prod4', 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=400', true, 1, NOW()),
    ('img5', 'prod5', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', true, 1, NOW()),
    ('img6', 'prod6', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, 1, NOW())
ON CONFLICT (id) DO NOTHING;
