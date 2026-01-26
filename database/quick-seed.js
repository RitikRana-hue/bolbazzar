const { query } = require('./db.ts');

async function quickSeed() {
    console.log('🌱 Quick seeding database...');

    try {
        // Add sample categories
        await query(`
            INSERT INTO categories (id, name, slug, description, icon, "parentId", "isActive", "sortOrder")
            VALUES 
                ('cat1', 'Electronics', 'electronics', 'Electronic devices and gadgets', '💻', NULL, true, 1),
                ('cat2', 'Fashion', 'fashion', 'Clothing and accessories', '👕', NULL, true, 2),
                ('cat3', 'Home & Garden', 'home-garden', 'Home improvement and garden items', '🏠', NULL, true, 3)
            ON CONFLICT (id) DO NOTHING
        `);

        // Add sample products
        await query(`
            INSERT INTO products (id, title, description, price, "originalPrice", condition, "categoryId", "sellerId", status, "isActive", views, "createdAt", "updatedAt")
            VALUES 
                ('prod1', 'iPhone 15 Pro Max', 'Latest iPhone with amazing features', 999.99, 1199.99, 'NEW', 'cat1', 'seller1', 'ACTIVE', true, 150, NOW(), NOW()),
                ('prod2', 'MacBook Pro 16"', 'Powerful laptop for professionals', 2499.99, 2799.99, 'LIKE_NEW', 'cat1', 'seller1', 'ACTIVE', true, 89, NOW(), NOW()),
                ('prod3', 'Designer Watch', 'Luxury timepiece', 599.99, 899.99, 'GOOD', 'cat2', 'seller2', 'ACTIVE', true, 45, NOW(), NOW()),
                ('prod4', 'Garden Set', 'Complete garden furniture set', 299.99, 399.99, 'GOOD', 'cat3', 'seller3', 'ACTIVE', true, 23, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
        `);

        // Add sample users
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 12);

        await query(`
            INSERT INTO users (id, email, username, password, role, "isEmailVerified", "isActive", "createdAt", "updatedAt")
            VALUES 
                ('seller1', 'seller1@instasell.com', 'seller1', $1, 'SELLER', true, true, NOW(), NOW()),
                ('seller2', 'seller2@instasell.com', 'seller2', $1, 'SELLER', true, true, NOW(), NOW()),
                ('seller3', 'seller3@instasell.com', 'seller3', $1, 'SELLER', true, true, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
        `, [hashedPassword]);

        console.log('✅ Quick seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

quickSeed();
