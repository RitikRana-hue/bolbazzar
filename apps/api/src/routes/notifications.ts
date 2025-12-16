import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// Get user notifications
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { type, limit = 50 } = req.query;

        let whereClause = 'WHERE user_id = $1';
        const params = [userId];

        if (type && type !== 'all') {
            whereClause += ' AND type = $2';
            params.push(type as string);
        }

        const notifications = await query(`
            SELECT 
                id,
                type,
                title,
                message,
                timestamp,
                is_read,
                action_url,
                metadata
            FROM notifications 
            ${whereClause}
            ORDER BY timestamp DESC
            LIMIT $${params.length + 1}
        `, [...params, limit]);

        res.json(notifications.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        await query(`
            UPDATE notifications 
            SET is_read = true 
            WHERE id = $1 AND user_id = $2
        `, [id, userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read
router.put('/read-all', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        await query(`
            UPDATE notifications 
            SET is_read = true 
            WHERE user_id = $1 AND is_read = false
        `, [userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

// Delete notification
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        await query(`
            DELETE FROM notifications 
            WHERE id = $1 AND user_id = $2
        `, [id, userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// Create notification (internal use)
export const createNotification = async (
    userId: string,
    type: string,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: any
) => {
    try {
        await query(`
            INSERT INTO notifications (user_id, type, title, message, action_url, metadata, timestamp, is_read)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), false)
        `, [userId, type, title, message, actionUrl, JSON.stringify(metadata)]);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export default router;