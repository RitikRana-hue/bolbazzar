import { query, transaction } from '../db';
import bcrypt from 'bcryptjs';

export async function seedDemoData() {
    console.log('🌱 Seeding demo data...');

    try {
        await transaction(async (client) => {
            // Create demo users
            const hashedPassword = await bcrypt.hash('password123', 12);

            // Admin user
            const admin = await client.query(`
                INSERT INTO users (email, username, password, role, isEmailVerified, isActive)
                VALUES ($1, $2, $3, $4, true, true)
                RETURNING id
            `, ['admin@instasell.com', 'admin', hashedPassword, 'admin']);

            await client.query(`
                INSERT INTO user_profiles (userId, firstName, lastName, bio)
                VALUES ($1, $2, $3, $4)
            `, [admin.rows[0].id, 'Admin', 'User', 'Platform administrator']);

            // Demo sellers
            const sellers = [];
            const sellerData = [
                { email: 'john@seller.com', username: 'john_seller', firstName: 'John', lastName: 'Smith', bio: 'Electronics specialist with 5+ years experience' },
                { email: 'sarah@seller.com', username: 'sarah_seller', firstName: 'Sarah', lastName: 'Johnson', bio: 'Fashion and lifestyle products expert' },
                { email: 'mike@seller.com', username: 'mike_seller', firstName: 'Mike', lastName: 'Wilson', bio: 'Collectibles and vintage items dealer' }
            ];

            for (const seller of sellerData) {
                const user = await client.query(`
                    INSERT INTO users (email, username, password, role, isEmailVerified, isActive)
                    VALUES ($1, $2, $3, $4, true, true)
                    RETURNING id
                `, [seller.email, seller.username, hashedPassword, 'seller']);

                await client.query(`
                    INSERT INTO user_profiles (userId, firstName, lastName, bio, location)
                    VALUES ($1, $2, $3, $4, $5)
                `, [user.rows[0].id, seller.firstName, seller.lastName, seller.bio, 'San Francisco, CA']);

                // Create wallets
                await client.query(`
                    INSERT INTO wallets (userId, balance, availableBalance, totalEarned)
                    VALUES ($1, $2, $3, $4)
                `, [user.rows[0].id, 1500.00, 1200.00, 5000.00]);

                await client.query(`
                    INSERT INTO gas_wallets (userId, balance, totalToppedUp, totalUsed)
                    VALUES ($1, $2, $3, $4)
                `, [user.rows[0].id, 50.00, 100.00, 50.00]);

                sellers.push({ id: user.rows[0].id, ...seller });
            }

            // Demo buyers
            const buyers = [];
            const buyerData = [
                { email: 'alice@buyer.com', username: 'alice_buyer', firstName: 'Alice', lastName: 'Brown' },
                { email: 'bob@buyer.com', username: 'bob_buyer', firstName: 'Bob', lastName: 'Davis' },
                { email: 'carol@buyer.com', username: 'carol_buyer', firstName: 'Carol', lastName: 'Miller' }
            ];

            for (const buyer of buyerData) {
                const user = await client.query(`
                    INSERT INTO users (email, username, password, role, isEmailVerified, isActive)
                    VALUES ($1, $2, $3, $4, true, true)
                `, [buyer.email, buyer.username, hashedPassword, 'buyer']);

                await client.query(`
                    INSERT INTO user_profiles (userId, firstName, lastName, location)
                    VALUES ($1, $2, $3, $4)
                `, [user.rows[0].id, buyer.firstName, buyer.lastName, 'New York, NY']);

                // Create wallet
                await client.query(`
                    INSERT INTO wallets (userId, balance, availableBalance)
                    VALUES ($1, $2, $3)
                `, [user.rows[0].id, 500.00, 500.00]);

                buyers.push({ id: user.rows[0].id, ...buyer });
            }

            // Create categories
            const categories = [
                { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, gadgets and more' },
                { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, accessories' },
                { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, decor, tools' },
                { name: 'Collectibles', slug: 'collectibles', description: 'Rare items, antiques, memorabilia' },
                { name: 'Sports', slug: 'sports', description: 'Equipment, apparel, accessories' },
                { name: 'Books', slug: 'books', description: 'Fiction, non-fiction, textbooks' }
            ];

            const categoryIds = [];
            for (const category of categories) {
                const result = await client.query(`
                    INSERT INTO categories (name, slug, description, isActive)
                    VALUES ($1, $2, $3, true)
                    RETURNING id
                `, [category.name, category.slug, category.description]);
                categoryIds.push(result.rows[0].id);
            }

            // Create demo products
            const products = [
                {
                    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
                    description: 'Brand new iPhone 15 Pro Max with 256GB storage. Includes original box, charger, and documentation. Never used, still in plastic wrap.',
                    condition: 'NEW',
                    brand: 'Apple',
                    model: 'iPhone 15 Pro Max',
                    price: 1199.99,
                    originalPrice: 1299.99,
                    categoryIndex: 0, // Electronics
                    sellerIndex: 0,
                    stock: 1,
                    tags: ['iphone', 'apple', 'smartphone', 'new'],
                    features: {
                        storage: '256GB',
                        color: 'Natural Titanium',
                        condition: 'Brand New',
                        warranty: '1 Year Apple Warranty'
                    }
                },
                {
                    title: 'MacBook Air M2 13-inch - Midnight',
                    description: 'Excellent condition MacBook Air with M2 chip. Used for light work, no scratches or dents. Includes original charger and box.',
                    condition: 'LIKE_NEW',
                    brand: 'Apple',
                    model: 'MacBook Air M2',
                    price: 899.99,
                    originalPrice: 1199.99,
                    categoryIndex: 0, // Electronics
                    sellerIndex: 0,
                    stock: 1,
                    tags: ['macbook', 'apple', 'laptop', 'm2'],
                    features: {
                        processor: 'Apple M2',
                        memory: '8GB',
                        storage: '256GB SSD',
                        screen: '13.6-inch Liquid Retina'
                    }
                },
                {
                    title: 'Designer Leather Handbag - Vintage Brown',
                    description: 'Authentic vintage leather handbag in excellent condition. Perfect for everyday use or special occasions.',
                    condition: 'GOOD',
                    brand: 'Coach',
                    price: 299.99,
                    originalPrice: 599.99,
                    categoryIndex: 1, // Fashion
                    sellerIndex: 1,
                    stock: 1,
                    tags: ['handbag', 'leather', 'vintage', 'coach'],
                    features: {
                        material: 'Genuine Leather',
                        color: 'Brown',
                        size: 'Medium',
                        authenticity: 'Verified Authentic'
                    }
                },
                {
                    title: 'Vintage Baseball Card Collection - 1980s',
                    description: 'Rare collection of 1980s baseball cards including rookie cards and hall of famers. All cards in protective sleeves.',
                    condition: 'GOOD',
                    price: 450.00,
                    categoryIndex: 3, // Collectibles
                    sellerIndex: 2,
                    stock: 1,
                    tags: ['baseball', 'cards', 'vintage', 'collectible', '1980s'],
                    features: {
                        era: '1980s',
                        quantity: '50+ cards',
                        condition: 'Near Mint to Mint',
                        includes: 'Protective sleeves and binder'
                    }
                }
            ];

            const productIds = [];
            for (const product of products) {
                const result = await client.query(`
                    INSERT INTO products (
                        sellerId, categoryId, title, description, condition,
                        brand, model, price, originalPrice, stock, tags,
                        features, status, isActive, viewCount, favoriteCount
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ACTIVE', true, $13, $14)
                    RETURNING id
                `, [
                    sellers[product.sellerIndex].id,
                    categoryIds[product.categoryIndex],
                    product.title,
                    product.description,
                    product.condition,
                    product.brand || null,
                    product.model || null,
                    product.price,
                    product.originalPrice || null,
                    product.stock,
                    product.tags,
                    JSON.stringify(product.features),
                    Math.floor(Math.random() * 100) + 50, // Random view count
                    Math.floor(Math.random() * 20) + 5    // Random favorite count
                ]);

                productIds.push(result.rows[0].id);

                // Add product images (mock URLs)
                const imageUrls = [
                    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=500',
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
                    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'
                ];

                for (let i = 0; i < 3; i++) {
                    await client.query(`
                        INSERT INTO product_images (productId, url, altText, isPrimary, sortOrder)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [
                        result.rows[0].id,
                        imageUrls[i % imageUrls.length],
                        product.title,
                        i === 0,
                        i
                    ]);
                }
            }

            // Create demo auctions
            const auctionProducts = [
                {
                    title: 'Rare Vintage Watch - Omega Speedmaster',
                    description: 'Authentic Omega Speedmaster from 1969. Excellent condition with original box and papers. A true collector\'s piece.',
                    condition: 'GOOD',
                    brand: 'Omega',
                    model: 'Speedmaster',
                    startingPrice: 2500.00,
                    reservePrice: 3500.00,
                    categoryIndex: 3, // Collectibles
                    sellerIndex: 2,
                    tags: ['omega', 'watch', 'vintage', 'speedmaster', 'collectible']
                },
                {
                    title: 'Gaming Laptop - ASUS ROG Strix',
                    description: 'High-performance gaming laptop with RTX 4070 and Intel i7. Perfect for gaming and content creation.',
                    condition: 'LIKE_NEW',
                    brand: 'ASUS',
                    model: 'ROG Strix',
                    startingPrice: 800.00,
                    reservePrice: 1200.00,
                    categoryIndex: 0, // Electronics
                    sellerIndex: 0,
                    tags: ['gaming', 'laptop', 'asus', 'rtx', 'i7']
                }
            ];

            for (const auctionProduct of auctionProducts) {
                // Create product
                const product = await client.query(`
                    INSERT INTO products (
                        sellerId, categoryId, title, description, condition,
                        brand, model, price, stock, tags, status, isActive
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, 'ACTIVE', true)
                    RETURNING id
                `, [
                    sellers[auctionProduct.sellerIndex].id,
                    categoryIds[auctionProduct.categoryIndex],
                    auctionProduct.title,
                    auctionProduct.description,
                    auctionProduct.condition,
                    auctionProduct.brand,
                    auctionProduct.model,
                    auctionProduct.startingPrice,
                    auctionProduct.tags
                ]);

                // Add product image
                await client.query(`
                    INSERT INTO product_images (productId, url, altText, isPrimary, sortOrder)
                    VALUES ($1, $2, $3, true, 0)
                `, [
                    product.rows[0].id,
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
                    auctionProduct.title
                ]);

                // Create auction
                const startTime = new Date();
                const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

                const auction = await client.query(`
                    INSERT INTO auctions (
                        productId, sellerId, startingPrice, reservePrice,
                        currentPrice, startTime, endTime, status, totalBids
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', $8)
                    RETURNING id
                `, [
                    product.rows[0].id,
                    sellers[auctionProduct.sellerIndex].id,
                    auctionProduct.startingPrice,
                    auctionProduct.reservePrice,
                    auctionProduct.startingPrice + 50, // Current price slightly higher
                    startTime,
                    endTime,
                    2 // Some bids already placed
                ]);

                // Add some demo bids
                const bidAmounts = [
                    auctionProduct.startingPrice + 25,
                    auctionProduct.startingPrice + 50
                ];

                for (let i = 0; i < bidAmounts.length; i++) {
                    await client.query(`
                        INSERT INTO auction_bids (auctionId, bidderId, amount, isWinning)
                        VALUES ($1, $2, $3, $4)
                    `, [
                        auction.rows[0].id,
                        buyers[i % buyers.length].id,
                        bidAmounts[i],
                        i === bidAmounts.length - 1 // Last bid is winning
                    ]);
                }
            }

            // Create demo orders
            const order = await client.query(`
                INSERT INTO orders (
                    buyerId, sellerId, addressId, status, subtotal, 
                    totalAmount, paymentStatus, paymentMethod
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, [
                buyers[0].id,
                sellers[0].id,
                1, // We'll create address separately
                'DELIVERED',
                299.99,
                299.99,
                'COMPLETED',
                'card'
            ]);

            // Create order item
            await client.query(`
                INSERT INTO order_items (orderId, productId, quantity, price, total)
                VALUES ($1, $2, 1, $3, $4)
            `, [order.rows[0].id, productIds[2], 299.99, 299.99]);

            // Create demo addresses
            const addresses = [
                {
                    userId: buyers[0].id,
                    name: 'Alice Brown',
                    street: '123 Main Street',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    phone: '+1-555-0123'
                },
                {
                    userId: sellers[0].id,
                    name: 'John Smith',
                    street: '456 Oak Avenue',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94102',
                    phone: '+1-555-0456'
                }
            ];

            for (const address of addresses) {
                await client.query(`
                    INSERT INTO addresses (userId, name, street, city, state, zipCode, phone, isDefault)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, true)
                `, [
                    address.userId,
                    address.name,
                    address.street,
                    address.city,
                    address.state,
                    address.zipCode,
                    address.phone
                ]);
            }

            // Create demo notifications
            const notifications = [
                {
                    userId: buyers[0].id,
                    type: 'order',
                    title: 'Order Delivered',
                    message: 'Your order has been successfully delivered',
                    actionUrl: '/account/orders'
                },
                {
                    userId: sellers[0].id,
                    type: 'auction',
                    title: 'New Bid on Your Auction',
                    message: 'Someone placed a bid on your vintage watch auction',
                    actionUrl: '/auctions/1'
                },
                {
                    userId: buyers[1].id,
                    type: 'payment',
                    title: 'Payment Successful',
                    message: 'Your payment of $899.99 has been processed',
                    actionUrl: '/account/transactions'
                }
            ];

            for (const notification of notifications) {
                await client.query(`
                    INSERT INTO notifications (userId, type, title, message, actionUrl, isRead)
                    VALUES ($1, $2, $3, $4, $5, false)
                `, [
                    notification.userId,
                    notification.type,
                    notification.title,
                    notification.message,
                    notification.actionUrl
                ]);
            }

            // Create demo reviews
            await client.query(`
                INSERT INTO reviews (productId, authorId, targetId, rating, title, comment, isVerified)
                VALUES ($1, $2, $3, 5, $4, $5, true)
            `, [
                productIds[2],
                buyers[0].id,
                sellers[1].id,
                'Excellent quality handbag!',
                'Beautiful handbag, exactly as described. Fast shipping and great communication from seller.'
            ]);

            // Add some items to watchlists
            for (let i = 0; i < 3; i++) {
                await client.query(`
                    INSERT INTO watchlist (userId, productId)
                    VALUES ($1, $2)
                `, [buyers[i % buyers.length].id, productIds[(i + 1) % productIds.length]]);
            }

            console.log('✅ Demo data seeded successfully!');
            console.log('\n📧 Demo Login Credentials:');
            console.log('Admin: admin@instasell.com / password123');
            console.log('Seller: john@seller.com / password123');
            console.log('Buyer: alice@buyer.com / password123');
        });
    } catch (error) {
        console.error('❌ Error seeding demo data:', error);
        throw error;
    }
}