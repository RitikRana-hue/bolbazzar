import { Router, Request, Response } from 'express';
import { query } from '../db';
import { NotificationService } from '../services/notification.service';

const router = Router();

// Get user's channel subscriptions
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const subscriptions = await query(`
            SELECT 
                cs.*,
                CASE 
                    WHEN cs.channel_type = 'seller' THEN u.name
                    WHEN cs.channel_type = 'category' THEN c.name
                    ELSE cs.channel_id
                END as channel_name,
                CASE 
                    WHEN cs.channel_type = 'seller' THEN u.avatar_url
                    ELSE NULL
                END as channel_avatar,
                CASE 
                    WHEN cs.channel_type = 'seller' THEN (
                        SELECT COUNT(*) FROM listings WHERE seller_id = cs.channel_id
                    )
                    WHEN cs.channel_type = 'category' THEN (
                        SELECT COUNT(*) FROM listings WHERE category_id = cs.channel_id
                    )
                    ELSE 0
                END as total_listings
            FROM channel_subscriptions cs
            LEFT JOIN users u ON cs.channel_type = 'seller' AND u.id = cs.channel_id
            LEFT JOIN categories c ON cs.channel_type = 'category' AND c.id = cs.channel_id
            WHERE cs.user_id = $1
            ORDER BY cs.subscribed_at DESC
        `, [userId]);

        res.json(subscriptions.rows);
    } catch (error) {
        console.error('Error fetching channel subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Subscribe to a seller's channel
router.post('/seller/:sellerId', async (req: Request, res: Response) => {
    try {
        const { sellerId } = req.params;
        const { notificationTypes } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify seller exists
        const seller = await query('SELECT id, name FROM users WHERE id = $1 AND role = $2', [sellerId, 'seller']);
        if (seller.rows.length === 0) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        const result = await NotificationService.subscribeToSeller(userId, sellerId, notificationTypes);
        res.json(result);
    } catch (error) {
        console.error('Error subscribing to seller:', error);
        res.status(500).json({ error: 'Failed to subscribe to seller' });
    }
});

// Subscribe to category notifications
router.post('/category/:categoryId', async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;
        const { notificationTypes } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify category exists
        const category = await query('SELECT id, name FROM categories WHERE id = $1', [categoryId]);
        if (category.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const result = await NotificationService.subscribeToCategory(userId, categoryId, notificationTypes);
        res.json(result);
    } catch (error) {
        console.error('Error subscribing to category:', error);
        res.status(500).json({ error: 'Failed to subscribe to category' });
    }
});

// Subscribe to keyword alerts
router.post('/keyword', async (req: Request, res: Response) => {
    try {
        const { keyword, notificationTypes } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!keyword || keyword.trim().length < 2) {
            return res.status(400).json({ error: 'Keyword must be at least 2 characters long' });
        }

        const result = await NotificationService.subscribeToKeyword(userId, keyword.trim(), notificationTypes);
        res.json(result);
    } catch (error) {
        console.error('Error subscribing to keyword:', error);
        res.status(500).json({ error: 'Failed to subscribe to keyword' });
    }
});

// Update subscription settings
router.put('/:subscriptionId', async (req: Request, res: Response) => {
    try {
        const { subscriptionId } = req.params;
        const { notificationTypes, isActive } = req.body;
        const userId = req.user?.id;

        await query(`
            UPDATE channel_subscriptions 
            SET notification_types = $1, is_active = $2, updated_at = NOW()
            WHERE id = $3 AND user_id = $4
        `, [JSON.stringify(notificationTypes), isActive, subscriptionId, userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

// Unsubscribe from channel
router.delete('/:subscriptionId', async (req: Request, res: Response) => {
    try {
        const { subscriptionId } = req.params;
        const userId = req.user?.id;

        await query(`
            DELETE FROM channel_subscriptions 
            WHERE id = $1 AND user_id = $2
        `, [subscriptionId, userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

// Get notification preferences
router.get('/preferences', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const preferences = await NotificationService.getUserNotificationPreferences(userId);
        res.json(preferences);
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

// Update notification preferences
router.put('/preferences', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const preferences = req.body;

        const result = await NotificationService.updateNotificationPreferences(userId, preferences);
        res.json(result);
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// Get available sellers for subscription
router.get('/sellers', async (req: Request, res: Response) => {
    try {
        const { search, limit = 20 } = req.query;
        const userId = req.user?.id;

        let whereClause = "WHERE u.role = 'seller' AND u.id != $1";
        const params = [userId];

        if (search) {
            whereClause += " AND u.name ILIKE $2";
            params.push(`%${search}%`);
        }

        const sellers = await query(`
            SELECT 
                u.id, u.name, u.avatar_url,
                COUNT(l.id) as listing_count,
                AVG(r.rating) as avg_rating,
                COUNT(r.id) as review_count,
                EXISTS(
                    SELECT 1 FROM channel_subscriptions cs 
                    WHERE cs.user_id = $1 AND cs.channel_type = 'seller' AND cs.channel_id = u.id
                ) as is_subscribed
            FROM users u
            LEFT JOIN listings l ON l.seller_id = u.id
            LEFT JOIN reviews r ON r.seller_id = u.id
            ${whereClause}
            GROUP BY u.id, u.name, u.avatar_url
            ORDER BY listing_count DESC, avg_rating DESC
            LIMIT $${params.length + 1}
        `, [...params, limit]);

        res.json(sellers.rows);
    } catch (error) {
        console.error('Error fetching sellers:', error);
        res.status(500).json({ error: 'Failed to fetch sellers' });
    }
});

// Get available categories for subscription
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const categories = await query(`
            SELECT 
                c.id, c.name, c.description, c.icon_url,
                COUNT(l.id) as listing_count,
                EXISTS(
                    SELECT 1 FROM channel_subscriptions cs 
                    WHERE cs.user_id = $1 AND cs.channel_type = 'category' AND cs.channel_id = c.id
                ) as is_subscribed
            FROM categories c
            LEFT JOIN listings l ON l.category_id = c.id
            GROUP BY c.id, c.name, c.description, c.icon_url
            ORDER BY listing_count DESC
        `, [userId]);

        res.json(categories.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;