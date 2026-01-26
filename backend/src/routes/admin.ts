import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Dashboard statistics
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const stats = await Promise.all([
            // Total users
            query('SELECT COUNT(*) as total FROM users WHERE isActive = true'),

            // New users this month
            query(`
                SELECT COUNT(*) as total 
                FROM users 
                WHERE createdAt >= date_trunc('month', CURRENT_DATE) 
                AND isActive = true
            `),

            // Total products
            query('SELECT COUNT(*) as total FROM products WHERE isActive = true'),

            // Active auctions
            query('SELECT COUNT(*) as total FROM auctions WHERE status = $1', ['ACTIVE']),

            // Total orders
            query('SELECT COUNT(*) as total FROM orders'),

            // Orders this month
            query(`
                SELECT COUNT(*) as total 
                FROM orders 
                WHERE createdAt >= date_trunc('month', CURRENT_DATE)
            `),

            // Total revenue
            query(`
                SELECT COALESCE(SUM(totalAmount), 0) as total 
                FROM orders 
                WHERE status = 'DELIVERED'
            `),

            // Revenue this month
            query(`
                SELECT COALESCE(SUM(totalAmount), 0) as total 
                FROM orders 
                WHERE status = 'DELIVERED' 
                AND createdAt >= date_trunc('month', CURRENT_DATE)
            `),

            // Pending disputes
            query('SELECT COUNT(*) as total FROM disputes WHERE status = $1', ['OPEN']),

            // Platform wallet balance
            query('SELECT COALESCE(SUM(balance), 0) as total FROM wallets'),
        ]);

        const dashboard = {
            users: {
                total: parseInt(stats[0].rows[0].total),
                thisMonth: parseInt(stats[1].rows[0].total)
            },
            products: {
                total: parseInt(stats[2].rows[0].total)
            },
            auctions: {
                active: parseInt(stats[3].rows[0].total)
            },
            orders: {
                total: parseInt(stats[4].rows[0].total),
                thisMonth: parseInt(stats[5].rows[0].total)
            },
            revenue: {
                total: parseFloat(stats[6].rows[0].total),
                thisMonth: parseFloat(stats[7].rows[0].total)
            },
            disputes: {
                pending: parseInt(stats[8].rows[0].total)
            },
            platformBalance: parseFloat(stats[9].rows[0].total)
        };

        res.json({ dashboard });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// User management
router.get('/users', async (req: Request, res: Response) => {
    try {
        const {
            role,
            status = 'active',
            search,
            page = 1,
            limit = 20
        } = req.query;

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];
        let paramCount = 0;

        if (role) {
            paramCount++;
            whereClause += ` AND u.role = $${paramCount}`;
            params.push(role);
        }

        if (status === 'active') {
            whereClause += ' AND u.isActive = true';
        } else if (status === 'inactive') {
            whereClause += ' AND u.isActive = false';
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (u.email ILIKE $${paramCount} OR u.username ILIKE $${paramCount} OR up.firstName ILIKE $${paramCount} OR up.lastName ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        const result = await query(`
            SELECT 
                u.id, u.email, u.username, u.role, u.isActive, u.isEmailVerified,
                u.createdAt, u.lastLoginAt,
                up.firstName, up.lastName, up.phone, up.location,
                w.balance as walletBalance,
                gw.balance as gasWalletBalance,
                (SELECT COUNT(*) FROM products WHERE sellerId = u.id) as totalProducts,
                (SELECT COUNT(*) FROM orders WHERE buyerId = u.id OR sellerId = u.id) as totalOrders
            FROM users u
            LEFT JOIN user_profiles up ON up.userId = u.id
            LEFT JOIN wallets w ON w.userId = u.id
            LEFT JOIN gas_wallets gw ON gw.userId = u.id
            ${whereClause}
            ORDER BY u.createdAt DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        // Get total count
        const countResult = await query(`
            SELECT COUNT(*) as total
            FROM users u
            LEFT JOIN user_profiles up ON up.userId = u.id
            ${whereClause}
        `, params);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / parseInt(limit as string));

        res.json({
            users: result.rows,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user status
router.put('/users/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive, reason } = req.body;
        const adminId = req.user?.id;

        await transaction(async (client) => {
            // Update user status
            await client.query(
                'UPDATE users SET isActive = $1 WHERE id = $2',
                [isActive, id]
            );

            // Log admin action
            await client.query(`
                INSERT INTO admin_logs (adminId, action, target, targetId, details)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                adminId,
                isActive ? 'activate_user' : 'deactivate_user',
                'user',
                id,
                JSON.stringify({ reason })
            ]);
        });

        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

// Product management
router.get('/products', async (req: Request, res: Response) => {
    try {
        const {
            status,
            category,
            search,
            page = 1,
            limit = 20
        } = req.query;

        let whereClause = 'WHERE p.isActive = true';
        const params: any[] = [];
        let paramCount = 0;

        if (status) {
            paramCount++;
            whereClause += ` AND p.status = $${paramCount}`;
            params.push(status);
        }

        if (category) {
            paramCount++;
            whereClause += ` AND c.slug = $${paramCount}`;
            params.push(category);
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        const result = await query(`
            SELECT 
                p.*, 
                c.name as categoryName,
                u.username as sellerName,
                up.firstName as sellerFirstName,
                up.lastName as sellerLastName,
                (SELECT url FROM product_images WHERE productId = p.id AND isPrimary = true LIMIT 1) as primaryImage,
                (SELECT COUNT(*) FROM orders o JOIN order_items oi ON oi.orderId = o.id WHERE oi.productId = p.id) as totalOrders
            FROM products p
            JOIN categories c ON c.id = p.categoryId
            JOIN users u ON u.id = p.sellerId
            LEFT JOIN user_profiles up ON up.userId = u.id
            ${whereClause}
            ORDER BY p.createdAt DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        res.json({ products: result.rows });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Update product status
router.put('/products/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const adminId = req.user?.id;

        await transaction(async (client) => {
            // Update product status
            await client.query(
                'UPDATE products SET status = $1 WHERE id = $2',
                [status, id]
            );

            // Log admin action
            await client.query(`
                INSERT INTO admin_logs (adminId, action, target, targetId, details)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                adminId,
                'update_product_status',
                'product',
                id,
                JSON.stringify({ status, reason })
            ]);
        });

        res.json({ message: 'Product status updated successfully' });
    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ error: 'Failed to update product status' });
    }
});

// Dispute management
router.get('/disputes', async (req: Request, res: Response) => {
    try {
        const {
            status = 'OPEN',
            priority,
            page = 1,
            limit = 20
        } = req.query;

        let whereClause = 'WHERE d.status = $1';
        const params = [status];
        let paramCount = 1;

        if (priority) {
            paramCount++;
            whereClause += ` AND d.priority = $${paramCount}`;
            params.push(priority);
        }

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        const result = await query(`
            SELECT 
                d.*,
                o.id as orderId,
                o.totalAmount as orderAmount,
                u.username as userName,
                up.firstName as userFirstName,
                up.lastName as userLastName,
                p.title as productTitle
            FROM disputes d
            JOIN orders o ON o.id = d.orderId
            JOIN users u ON u.id = d.userId
            LEFT JOIN user_profiles up ON up.userId = u.id
            LEFT JOIN order_items oi ON oi.orderId = o.id
            LEFT JOIN products p ON p.id = oi.productId
            ${whereClause}
            ORDER BY d.createdAt DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        res.json({ disputes: result.rows });
    } catch (error) {
        console.error('Error fetching disputes:', error);
        res.status(500).json({ error: 'Failed to fetch disputes' });
    }
});

// Update dispute
router.put('/disputes/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo, resolution } = req.body;
        const adminId = req.user?.id;

        await transaction(async (client) => {
            const updates = [];
            const values = [];
            let paramCount = 0;

            if (status) {
                paramCount++;
                updates.push(`status = $${paramCount}`);
                values.push(status);
            }

            if (priority) {
                paramCount++;
                updates.push(`priority = $${paramCount}`);
                values.push(priority);
            }

            if (assignedTo) {
                paramCount++;
                updates.push(`assignedTo = $${paramCount}`);
                values.push(assignedTo);
            }

            if (resolution) {
                paramCount++;
                updates.push(`resolution = $${paramCount}`);
                values.push(resolution);
            }

            if (status === 'RESOLVED') {
                paramCount++;
                updates.push(`resolvedAt = $${paramCount}`);
                values.push(new Date());
            }

            paramCount++;
            updates.push(`updatedAt = $${paramCount}`);
            values.push(new Date());

            paramCount++;
            values.push(id);

            await client.query(`
                UPDATE disputes 
                SET ${updates.join(', ')}
                WHERE id = $${paramCount}
            `, values);

            // Log admin action
            await client.query(`
                INSERT INTO admin_logs (adminId, action, target, targetId, details)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                adminId,
                'update_dispute',
                'dispute',
                id,
                JSON.stringify({ status, priority, assignedTo, resolution })
            ]);
        });

        res.json({ message: 'Dispute updated successfully' });
    } catch (error) {
        console.error('Error updating dispute:', error);
        res.status(500).json({ error: 'Failed to update dispute' });
    }
});

// Financial overview
router.get('/finances', async (req: Request, res: Response) => {
    try {
        const { period = '30' } = req.query; // days

        const finances = await Promise.all([
            // Total platform revenue (commission)
            query(`
                SELECT COALESCE(SUM(totalAmount * 0.05), 0) as total
                FROM orders 
                WHERE status = 'DELIVERED'
                AND createdAt >= NOW() - INTERVAL '${period} days'
            `),

            // Total transactions
            query(`
                SELECT COUNT(*) as total, COALESCE(SUM(amount), 0) as volume
                FROM transactions 
                WHERE createdAt >= NOW() - INTERVAL '${period} days'
            `),

            // Pending withdrawals
            query(`
                SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
                FROM withdrawals 
                WHERE status = 'PENDING'
            `),

            // Escrow holdings
            query(`
                SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
                FROM escrows 
                WHERE status = 'HOLDING'
            `),

            // Refunds processed
            query(`
                SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
                FROM refunds 
                WHERE status = 'COMPLETED'
                AND createdAt >= NOW() - INTERVAL '${period} days'
            `)
        ]);

        res.json({
            finances: {
                platformRevenue: parseFloat(finances[0].rows[0].total),
                transactions: {
                    count: parseInt(finances[1].rows[0].total),
                    volume: parseFloat(finances[1].rows[0].volume)
                },
                pendingWithdrawals: {
                    count: parseInt(finances[2].rows[0].count),
                    amount: parseFloat(finances[2].rows[0].total)
                },
                escrowHoldings: {
                    count: parseInt(finances[3].rows[0].count),
                    amount: parseFloat(finances[3].rows[0].total)
                },
                refundsProcessed: {
                    count: parseInt(finances[4].rows[0].count),
                    amount: parseFloat(finances[4].rows[0].total)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching finances:', error);
        res.status(500).json({ error: 'Failed to fetch financial data' });
    }
});

// System logs
router.get('/logs', async (req: Request, res: Response) => {
    try {
        const {
            action,
            target,
            adminId,
            page = 1,
            limit = 50
        } = req.query;

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];
        let paramCount = 0;

        if (action) {
            paramCount++;
            whereClause += ` AND al.action = $${paramCount}`;
            params.push(action);
        }

        if (target) {
            paramCount++;
            whereClause += ` AND al.target = $${paramCount}`;
            params.push(target);
        }

        if (adminId) {
            paramCount++;
            whereClause += ` AND al.adminId = $${paramCount}`;
            params.push(adminId);
        }

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

        const result = await query(`
            SELECT 
                al.*,
                u.username as adminName,
                up.firstName as adminFirstName,
                up.lastName as adminLastName
            FROM admin_logs al
            JOIN users u ON u.id = al.adminId
            LEFT JOIN user_profiles up ON up.userId = u.id
            ${whereClause}
            ORDER BY al.createdAt DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        res.json({ logs: result.rows });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch system logs' });
    }
});

export default router;