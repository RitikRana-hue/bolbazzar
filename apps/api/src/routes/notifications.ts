import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';

interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

const router = Router();

// Apply authentication middleware
router.use(authenticateToken);

// Get user notifications
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { type, limit = 50 } = req.query;

        let whereClause = 'WHERE "userId" = $1';
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
                "isRead",
                "actionUrl",
                metadata
            FROM notifications 
            ${whereClause}
            ORDER BY timestamp DESC
            LIMIT ${params.length + 1}
        `, [...params, limit]);

        res.json(notifications.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        await query(`
            UPDATE notifications 
            SET "isRead" = true 
            WHERE id = $1 AND "userId" = $2
        `, [id, userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read
router.put('/read-all', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        await query(`
            UPDATE notifications 
            SET "isRead" = true 
            WHERE "userId" = $1 AND "isRead" = false
        `, [userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

// Delete notification
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        await query(`
            DELETE FROM notifications 
            WHERE id = $1 AND "userId" = $2
        `, [id, userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// Get notification count
router.get('/count', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const result = await query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN "isRead" = false THEN 1 END) as unread
            FROM notifications 
            WHERE "userId" = $1
        `, [userId]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching notification count:', error);
        res.status(500).json({ error: 'Failed to fetch notification count' });
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
            INSERT INTO notifications ("userId", type, title, message, "actionUrl", metadata, timestamp, "isRead")
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), false)
        `, [userId, type, title, message, actionUrl, JSON.stringify(metadata)]);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export default router;