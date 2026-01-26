"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Get user notifications
router.get('/', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { type, limit = 50 } = req.query;
        let whereClause = 'WHERE user_id = $1';
        const params = [userId];
        if (type && type !== 'all') {
            whereClause += ' AND type = $2';
            params.push(type);
        }
        const notifications = await (0, db_1.query)(`
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
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        await (0, db_1.query)(`
            UPDATE notifications 
            SET is_read = true 
            WHERE id = $1 AND user_id = $2
        `, [id, userId]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});
// Mark all notifications as read
router.put('/read-all', async (req, res) => {
    try {
        const userId = req.user?.id;
        await (0, db_1.query)(`
            UPDATE notifications 
            SET is_read = true 
            WHERE user_id = $1 AND is_read = false
        `, [userId]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});
// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        await (0, db_1.query)(`
            DELETE FROM notifications 
            WHERE id = $1 AND user_id = $2
        `, [id, userId]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});
// Create notification (internal use)
const createNotification = async (userId, type, title, message, actionUrl, metadata) => {
    try {
        await (0, db_1.query)(`
            INSERT INTO notifications (user_id, type, title, message, action_url, metadata, timestamp, is_read)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), false)
        `, [userId, type, title, message, actionUrl, JSON.stringify(metadata)]);
    }
    catch (error) {
        console.error('Error creating notification:', error);
    }
};
exports.createNotification = createNotification;
exports.default = router;
//# sourceMappingURL=notifications.js.map