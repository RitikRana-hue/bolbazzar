import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import { createNotification } from './notifications';
import { authenticateToken } from '../middleware/auth';

interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

const router = Router();

// Apply authentication middleware to protected routes
router.use('/create', authenticateToken);
router.use('/:id/watchlist', authenticateToken);
router.post('/', authenticateToken);
router.put('/:id', authenticateToken);
router.delete('/:id', authenticateToken);

// Get all listings with filters
router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            category,
            condition,
            minPrice,
            maxPrice,
            location,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            page = 1,
            limit = 20
        } = req.query;

        let whereClause = 'WHERE p.status = $1 AND p.isActive = true';
        const params = ['ACTIVE'];
        let paramCount = 1;

        // Build dynamic WHERE clause
        if (category) {
            paramCount++;
            whereClause += ` AND c.slug = $${paramCount}`;
            params.push(category as string);
        }

        if (condition) {
            paramCount++;
            whereClause += ` AND p.condition = $${paramCount}`;
            params.push(condition as string);
        }

        if (minPrice) {
            paramCount++;
            whereClause += ` AND p.price >= $${paramCount}`;
            params.push(minPrice as string);
        }

        if (maxPrice) {
            paramCount++;
            whereClause += ` AND p.price <= $${paramCount}`;
            params.push(maxPrice as string);
        }

        if (location) {
            paramCount++;
            whereClause += ` AND up.location ILIKE $${paramCount}`;
            params.push(`%${location}%`);
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        // Calculate offset
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        const result = await query(`
            SELECT 
                p.*,
                c.name as categoryName,
                c.slug as categorySlug,
                u.username as sellerName,
                up.firstName,
                up.lastName,
                up.avatar as sellerAvatar,
                up.location as sellerLocation,
                (SELECT url FROM product_images WHERE productId = p.id AND isPrimary = true LIMIT 1) as primaryImage,
                (SELECT COUNT(*) FROM watchlist WHERE productId = p.id) as favoriteCount,
                (SELECT AVG(rating) FROM reviews WHERE targetId = p.sellerId) as sellerRating,
                a.id as auctionId,
                a.currentPrice as auctionCurrentPrice,
                a.endTime as auctionEndTime,
                a.totalBids as auctionTotalBids,
                a.status as auctionStatus
            FROM products p
            JOIN categories c ON c.id = p.categoryId
            JOIN users u ON u.id = p.sellerId
            LEFT JOIN user_profiles up ON up.userId = u.id
            LEFT JOIN auctions a ON a.productId = p.id
            ${whereClause}
            ORDER BY p.${sortBy} ${sortOrder}
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `, [...params, limit, offset]);

        // Get total count for pagination
        const countResult = await query(`
            SELECT COUNT(*) as total
            FROM products p
            JOIN categories c ON c.id = p.categoryId
            JOIN users u ON u.id = p.sellerId
            LEFT JOIN user_profiles up ON up.userId = u.id
            ${whereClause}
        `, params);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / parseInt(limit as string));

        res.json({
            products: result.rows,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages,
                hasNext: parseInt(page as string) < totalPages,
                hasPrev: parseInt(page as string) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

// Get single listing
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await query(`
            SELECT 
                p.*,
                c.name as categoryName,
                c.slug as categorySlug,
                u.username as sellerName,
                u.id as sellerId,
                up.firstName,
                up.lastName,
                up.avatar as sellerAvatar,
                up.location as sellerLocation,
                up.bio as sellerBio,
                (SELECT AVG(rating) FROM reviews WHERE targetId = p.sellerId) as sellerRating,
                (SELECT COUNT(*) FROM reviews WHERE targetId = p.sellerId) as sellerReviewCount,
                (SELECT COUNT(*) FROM watchlist WHERE productId = p.id) as favoriteCount,
                a.id as auctionId,
                a.startingPrice,
                a.currentPrice as auctionCurrentPrice,
                a.reservePrice,
                a.startTime as auctionStartTime,
                a.endTime as auctionEndTime,
                a.totalBids as auctionTotalBids,
                a.status as auctionStatus,
                a.autoExtend,
                a.winnerId as auctionWinnerId
            FROM products p
            JOIN categories c ON c.id = p.categoryId
            JOIN users u ON u.id = p.sellerId
            LEFT JOIN user_profiles up ON up.userId = u.id
            LEFT JOIN auctions a ON a.productId = p.id
            WHERE p.id = $1 AND p.isActive = true
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = result.rows[0];

        // Get product images
        const images = await query(
            'SELECT * FROM product_images WHERE productId = $1 ORDER BY isPrimary DESC, sortOrder ASC',
            [id]
        );

        // Get recent reviews
        const reviews = await query(`
            SELECT 
                r.*,
                u.username as authorName,
                up.firstName,
                up.lastName,
                up.avatar as authorAvatar
            FROM reviews r
            JOIN users u ON u.id = r.authorId
            LEFT JOIN user_profiles up ON up.userId = u.id
            WHERE r.productId = $1
            ORDER BY r.createdAt DESC
            LIMIT 10
        `, [id]);

        // Increment view count
        await query(
            'UPDATE products SET viewCount = viewCount + 1 WHERE id = $1',
            [id]
        );

        res.json({
            ...product,
            images: images.rows,
            reviews: reviews.rows
        });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ error: 'Failed to fetch listing' });
    }
});

// Create new listing
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const {
            categoryId,
            title,
            description,
            condition,
            brand,
            model,
            price,
            originalPrice,
            stock,
            weight,
            dimensions,
            features,
            tags,
            images,
            isAuction,
            auctionData
        } = req.body;

        // Validation
        if (!categoryId || !title || !description || !price) {
            return res.status(400).json({
                error: 'Category, title, description, and price are required'
            });
        }

        const result = await transaction(async (client) => {
            // Create product
            const product = await client.query(`
                INSERT INTO products (
                    sellerId, categoryId, title, description, condition,
                    brand, model, price, originalPrice, stock, weight,
                    dimensions, features, tags, status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'ACTIVE')
                RETURNING *
            `, [
                userId, categoryId, title, description, condition,
                brand, model, price, originalPrice, stock || 1, weight,
                dimensions ? JSON.stringify(dimensions) : null,
                features ? JSON.stringify(features) : null,
                tags || [],
            ]);

            const productId = product.rows[0].id;

            // Save images (URLs should be pre-uploaded by frontend)
            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const image = images[i];
                    await client.query(`
                        INSERT INTO product_images (productId, url, altText, isPrimary, sortOrder)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [productId, image.url || image, image.altText || title, i === 0, i]);
                }
            }

            // Create auction if specified
            if (isAuction && auctionData) {
                const {
                    startingPrice,
                    reservePrice,
                    duration, // in hours
                    autoExtend = true
                } = auctionData;

                const startTime = new Date();
                const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

                await client.query(`
                    INSERT INTO auctions (
                        productId, sellerId, startingPrice, reservePrice,
                        currentPrice, startTime, endTime, autoExtend, status
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SCHEDULED')
                `, [
                    productId, userId, startingPrice, reservePrice,
                    startingPrice, startTime, endTime, autoExtend
                ]);

                // Deduct gas wallet fee for auction
                const auctionFee = 2.50; // Base fee, could be dynamic based on category
                await client.query(`
                    UPDATE gas_wallets 
                    SET balance = balance - $1, totalUsed = totalUsed + $1
                    WHERE userId = $2 AND balance >= $1
                `, [auctionFee, userId]);
            }

            return product.rows[0];
        });

        // Send notification to followers
        await createNotification(
            userId,
            'listing',
            'New Listing Created',
            `Your listing "${title}" has been created successfully`,
            `/p/${result.id}`,
            { productId: result.id, isAuction }
        );

        res.status(201).json({
            message: 'Listing created successfully',
            product: result
        });
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ error: 'Failed to create listing' });
    }
});

// Update listing
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const updateData = req.body;

        // Verify ownership
        const product = await query(
            'SELECT sellerId FROM products WHERE id = $1',
            [id]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.rows[0].sellerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this listing' });
        }

        // Build update query dynamically
        const allowedFields = [
            'title', 'description', 'condition', 'brand', 'model',
            'price', 'originalPrice', 'stock', 'weight', 'dimensions',
            'features', 'tags', 'status'
        ];

        const updates = [];
        const values = [];
        let paramCount = 0;

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                paramCount++;
                updates.push(`${key} = $${paramCount}`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Add updatedAt
        paramCount++;
        updates.push(`updatedAt = $${paramCount}`);
        values.push(new Date());

        // Add WHERE clause
        paramCount++;
        values.push(id);

        const result = await query(`
            UPDATE products 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        res.json({
            message: 'Listing updated successfully',
            product: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({ error: 'Failed to update listing' });
    }
});

// Delete listing
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Verify ownership
        const product = await query(
            'SELECT sellerId, status FROM products WHERE id = $1',
            [id]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.rows[0].sellerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this listing' });
        }

        // Check if product has active orders
        const activeOrders = await query(
            'SELECT id FROM orders WHERE id IN (SELECT orderId FROM order_items WHERE productId = $1) AND status NOT IN ($2, $3, $4)',
            [id, 'DELIVERED', 'CANCELLED', 'REFUNDED']
        );

        if (activeOrders.rows.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete listing with active orders'
            });
        }

        // Soft delete (mark as inactive)
        await query(
            'UPDATE products SET isActive = false, status = $1 WHERE id = $2',
            ['DELETED', id]
        );

        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ error: 'Failed to delete listing' });
    }
});

// Get seller's listings
router.get('/seller/:sellerId', async (req: Request, res: Response) => {
    try {
        const { sellerId } = req.params;
        const { status = 'ACTIVE', page = 1, limit = 20 } = req.query;

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        const result = await query(`
            SELECT 
                p.*,
                c.name as categoryName,
                (SELECT url FROM product_images WHERE productId = p.id AND isPrimary = true LIMIT 1) as primaryImage,
                (SELECT COUNT(*) FROM watchlist WHERE productId = p.id) as favoriteCount,
                a.currentPrice as auctionCurrentPrice,
                a.endTime as auctionEndTime,
                a.totalBids as auctionTotalBids,
                a.status as auctionStatus
            FROM products p
            JOIN categories c ON c.id = p.categoryId
            LEFT JOIN auctions a ON a.productId = p.id
            WHERE p.sellerId = $1 AND p.status = $2 AND p.isActive = true
            ORDER BY p.createdAt DESC
            LIMIT $3 OFFSET $4
        `, [sellerId, status, limit, offset]);

        // Get total count
        const countResult = await query(
            'SELECT COUNT(*) as total FROM products WHERE sellerId = $1 AND status = $2 AND isActive = true',
            [sellerId, status]
        );

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / parseInt(limit as string));

        res.json({
            products: result.rows,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching seller listings:', error);
        res.status(500).json({ error: 'Failed to fetch seller listings' });
    }
});

// Add to watchlist
router.post('/:id/watchlist', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Check if already in watchlist
        const existing = await query(
            'SELECT id FROM watchlist WHERE userId = $1 AND productId = $2',
            [userId, id]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Already in watchlist' });
        }

        await query(
            'INSERT INTO watchlist (userId, productId) VALUES ($1, $2)',
            [userId, id]
        );

        // Update favorite count
        await query(
            'UPDATE products SET favoriteCount = favoriteCount + 1 WHERE id = $1',
            [id]
        );

        res.json({ message: 'Added to watchlist' });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ error: 'Failed to add to watchlist' });
    }
});

// Remove from watchlist
router.delete('/:id/watchlist', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const result = await query(
            'DELETE FROM watchlist WHERE userId = $1 AND productId = $2',
            [userId, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Not in watchlist' });
        }

        // Update favorite count
        await query(
            'UPDATE products SET favoriteCount = GREATEST(favoriteCount - 1, 0) WHERE id = $1',
            [id]
        );

        res.json({ message: 'Removed from watchlist' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
});

export default router;