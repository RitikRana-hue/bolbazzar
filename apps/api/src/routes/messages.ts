import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';

// Helper function to create notifications
const createNotification = async (
    userId: string,
    type: string,
    title: string,
    message: string,
    actionUrl?: string,
    data?: any
) => {
    try {
        await query(`
            INSERT INTO notifications (user_id, type, title, message, action_url, data, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, [userId, type, title, message, actionUrl, JSON.stringify(data || {})]);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

const router = Router();

// Get user conversations
router.get('/conversations', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id; // Assuming auth middleware sets req.user

        const conversations = await query(`
            SELECT 
                c.id,
                c.participant_id,
                u.name as participant_name,
                u.avatar_url as participant_avatar,
                c.order_id,
                l.title as product_title,
                l.images[1] as product_image,
                c.last_message,
                c.last_message_time,
                c.unread_count
            FROM conversations c
            JOIN users u ON u.id = c.participant_id
            LEFT JOIN orders o ON o.id = c.order_id
            LEFT JOIN listings l ON l.id = o.listing_id
            WHERE c.user_id = $1
            ORDER BY c.last_message_time DESC
        `, [userId]);

        res.json(conversations.rows);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Verify user has access to this conversation
        const conversation = await query(
            'SELECT * FROM conversations WHERE id = $1 AND (user_id = $2 OR participant_id = $2)',
            [id, userId]
        );

        if (conversation.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await query(`
            SELECT 
                m.id,
                m.sender_id,
                u.name as sender_name,
                m.content,
                m.timestamp,
                m.type,
                m.is_read
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.conversation_id = $1
            ORDER BY m.timestamp ASC
        `, [id]);

        res.json(messages.rows);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send a message (only after payment)
router.post('/conversations/:id/messages', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content, type = 'text' } = req.body;
        const userId = req.user?.id;

        // Verify user has access to this conversation
        const conversation = await query(
            'SELECT * FROM conversations WHERE id = $1 AND (user_id = $2 OR participant_id = $2)',
            [id, userId]
        );

        if (conversation.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Check if chat is unlocked (payment made)
        const order = await query(`
            SELECT o.*, e.status as escrow_status
            FROM orders o
            LEFT JOIN escrows e ON e.order_id = o.id
            WHERE o.id = $1 AND o.status IN ('paid', 'shipped', 'delivered', 'completed')
        `, [conversation.rows[0].order_id]);

        if (order.rows.length === 0) {
            return res.status(403).json({
                error: 'Chat is locked until payment is completed',
                requiresPayment: true
            });
        }

        // Insert message
        const message = await query(`
            INSERT INTO messages (conversation_id, sender_id, content, type, timestamp, is_read)
            VALUES ($1, $2, $3, $4, NOW(), false)
            RETURNING *
        `, [id, userId, content, type]);

        // Update conversation last message
        await query(`
            UPDATE conversations 
            SET last_message = $1, last_message_time = NOW(), unread_count = unread_count + 1
            WHERE id = $2
        `, [content, id]);

        res.status(201).json(message.rows[0]);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Mark messages as read
router.put('/conversations/:id/read', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        await query(`
            UPDATE messages 
            SET is_read = true 
            WHERE conversation_id = $1 AND sender_id != $2
        `, [id, userId]);

        await query(`
            UPDATE conversations 
            SET unread_count = 0 
            WHERE id = $1 AND user_id = $2
        `, [id, userId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

export default router;
// Exchange contact numbers (post-purchase)
router.post('/conversations/:id/exchange-contact', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { phoneNumber } = req.body;
        const userId = req.user?.id;

        // Verify conversation exists and user has access
        const conversation = await query(
            'SELECT * FROM conversations WHERE id = $1 AND (user_id = $2 OR participant_id = $2)',
            [id, userId]
        );

        if (conversation.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Check if payment has been made
        const order = await query(`
            SELECT status FROM orders WHERE id = $1 AND status IN ('paid', 'shipped', 'delivered', 'completed')
        `, [conversation.rows[0].order_id]);

        if (order.rows.length === 0) {
            return res.status(403).json({ error: 'Contact exchange only available after payment' });
        }

        // Store contact exchange
        await query(`
            INSERT INTO contact_exchanges (conversation_id, user_id, phone_number, exchanged_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (conversation_id, user_id) 
            DO UPDATE SET phone_number = $3, exchanged_at = NOW()
        `, [id, userId, phoneNumber]);

        // Create system message about contact exchange
        await query(`
            INSERT INTO messages (conversation_id, sender_id, content, type, timestamp, is_read)
            VALUES ($1, $2, 'Contact number shared: ' || $3, 'system', NOW(), false)
        `, [id, userId, phoneNumber]);

        // Notify the other party
        const otherUserId = conversation.rows[0].user_id === userId
            ? conversation.rows[0].participant_id
            : conversation.rows[0].user_id;

        await createNotification(
            otherUserId,
            'message',
            'Contact Number Shared',
            'The other party has shared their contact number',
            `/messages?conversation=${id}`,
            { conversationId: id }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error exchanging contact:', error);
        res.status(500).json({ error: 'Failed to exchange contact' });
    }
});

// Get exchanged contact numbers
router.get('/conversations/:id/contacts', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Verify access and payment
        const conversation = await query(`
            SELECT c.*, o.status as order_status
            FROM conversations c
            JOIN orders o ON o.id = c.order_id
            WHERE c.id = $1 AND (c.user_id = $2 OR c.participant_id = $2)
            AND o.status IN ('paid', 'shipped', 'delivered', 'completed')
        `, [id, userId]);

        if (conversation.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied or payment required' });
        }

        // Get exchanged contacts
        const contacts = await query(`
            SELECT ce.*, u.name 
            FROM contact_exchanges ce
            JOIN users u ON u.id = ce.user_id
            WHERE ce.conversation_id = $1
        `, [id]);

        res.json(contacts.rows);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// Raise dispute (locks funds and begins resolution)
router.post('/conversations/:id/dispute', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason, description, evidence } = req.body;
        const userId = req.user?.id;

        const conversation = await query(
            'SELECT * FROM conversations WHERE id = $1 AND (user_id = $2 OR participant_id = $2)',
            [id, userId]
        );

        if (conversation.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const result = await transaction(async (client) => {
            // Create dispute
            const dispute = await client.query(`
                INSERT INTO disputes (order_id, reporter_id, reason, description, evidence, status, created_at)
                VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
                RETURNING *
            `, [conversation.rows[0].order_id, userId, reason, description, JSON.stringify(evidence)]);

            // Lock escrow funds
            await client.query(`
                UPDATE escrows 
                SET status = 'disputed', dispute_id = $1, updated_at = NOW()
                WHERE order_id = $2 AND status = 'holding'
            `, [dispute.rows[0].id, conversation.rows[0].order_id]);

            // Update order status
            await client.query(`
                UPDATE orders 
                SET status = 'disputed'
                WHERE id = $1
            `, [conversation.rows[0].order_id]);

            // Create system message
            await client.query(`
                INSERT INTO messages (conversation_id, sender_id, content, type, timestamp, is_read)
                VALUES ($1, $2, 'A dispute has been raised for this order. Funds are now locked pending resolution.', 'system', NOW(), false)
            `, [id, userId]);

            return {
                disputeId: dispute.rows[0].id,
                otherUserId: conversation.rows[0].user_id === userId
                    ? conversation.rows[0].participant_id
                    : conversation.rows[0].user_id
            };
        });

        // Notify other party
        await createNotification(
            result.otherUserId,
            'dispute',
            'Dispute Raised',
            `A dispute has been raised for order #${conversation.rows[0].order_id}`,
            `/account/disputes`,
            { orderId: conversation.rows[0].order_id, disputeId: result.disputeId }
        );

        res.status(201).json(result);
    } catch (error) {
        console.error('Error raising dispute:', error);
        res.status(500).json({ error: 'Failed to raise dispute' });
    }
});