import { Router, Request, Response } from 'express';
import { query, transaction } from '../db';
import { authenticateToken, requireAdmin } from '../middleware/auth';

interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

const router = Router();

// Get all categories (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { parent, includeInactive = false } = req.query;

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        if (parent) {
            whereClause += ' AND c."parentId" = $1';
            params.push(parent);
        } else if (parent === null || parent === 'null') {
            whereClause += ' AND c."parentId" IS NULL';
        }

        if (!includeInactive) {
            whereClause += ` AND c."isActive" = true`;
        }

        const categories = await query(`
            SELECT 
                c.*,
                0 as "productCount",
                parent.name as "parentName"
            FROM categories c
            LEFT JOIN categories parent ON parent.id = c."parentId"
            ${whereClause}
            ORDER BY c."sortOrder" ASC, c.name ASC
        `, params);

        res.json(categories.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get category tree (hierarchical structure)
router.get('/tree', async (req: Request, res: Response) => {
    try {
        const categories = await query(`
            SELECT 
                c.*,
                COUNT(p.id) as "productCount"
            FROM categories c
            LEFT JOIN products p ON p."categoryId" = c.id AND p."isActive" = true
            WHERE c."isActive" = true
            GROUP BY c.id
            ORDER BY c."sortOrder" ASC, c.name ASC
        `);

        // Build tree structure
        const categoryMap = new Map();
        const rootCategories: any[] = [];

        // First pass: create map of all categories
        categories.rows.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        // Second pass: build tree
        categories.rows.forEach(cat => {
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children.push(categoryMap.get(cat.id));
                }
            } else {
                rootCategories.push(categoryMap.get(cat.id));
            }
        });

        res.json(rootCategories);
    } catch (error) {
        console.error('Error fetching category tree:', error);
        res.status(500).json({ error: 'Failed to fetch category tree' });
    }
});

// Get single category
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const category = await query(`
            SELECT 
                c.*,
                COUNT(p.id) as "productCount",
                parent.name as "parentName"
            FROM categories c
            LEFT JOIN products p ON p."categoryId" = c.id AND p."isActive" = true
            LEFT JOIN categories parent ON parent.id = c."parentId"
            WHERE c.id = $1 OR c.slug = $1
            GROUP BY c.id, parent.name
        `, [id]);

        if (category.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Get subcategories
        const subcategories = await query(`
            SELECT 
                c.*,
                COUNT(p.id) as "productCount"
            FROM categories c
            LEFT JOIN products p ON p."categoryId" = c.id AND p."isActive" = true
            WHERE c."parentId" = $1 AND c."isActive" = true
            GROUP BY c.id
            ORDER BY c."sortOrder" ASC, c.name ASC
        `, [category.rows[0].id]);

        res.json({
            ...category.rows[0],
            subcategories: subcategories.rows
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// Create category (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const {
            name,
            slug,
            description,
            image,
            parentId,
            sortOrder = 0
        } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ error: 'Name and slug are required' });
        }

        // Check if slug already exists
        const existing = await query(
            'SELECT id FROM categories WHERE slug = $1',
            [slug]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Slug already exists' });
        }

        const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const category = await query(`
            INSERT INTO categories (
                id, name, slug, description, image, "parentId", 
                "sortOrder", "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *
        `, [categoryId, name, slug, description, image, parentId, sortOrder]);

        res.status(201).json({
            message: 'Category created successfully',
            category: category.rows[0]
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const allowedFields = [
            'name', 'slug', 'description', 'image', 'parentId', 
            'isActive', 'sortOrder'
        ];

        const updates = [];
        const values = [];
        let paramCount = 0;

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                paramCount++;
                updates.push(`"${key}" = $${paramCount}`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Add updatedAt
        paramCount++;
        updates.push(`"updatedAt" = $${paramCount}`);
        values.push(new Date());

        // Add WHERE clause
        paramCount++;
        values.push(id);

        const result = await query(`
            UPDATE categories 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({
            message: 'Category updated successfully',
            category: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Check if category has products
        const products = await query(
            'SELECT COUNT(*) as count FROM products WHERE "categoryId" = $1 AND "isActive" = true',
            [id]
        );

        if (parseInt(products.rows[0].count) > 0) {
            return res.status(400).json({
                error: 'Cannot delete category with active products'
            });
        }

        // Check if category has subcategories
        const subcategories = await query(
            'SELECT COUNT(*) as count FROM categories WHERE "parentId" = $1 AND "isActive" = true',
            [id]
        );

        if (parseInt(subcategories.rows[0].count) > 0) {
            return res.status(400).json({
                error: 'Cannot delete category with subcategories'
            });
        }

        // Soft delete
        await query(
            'UPDATE categories SET "isActive" = false, "updatedAt" = NOW() WHERE id = $1',
            [id]
        );

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Get popular categories
router.get('/popular/list', async (req: Request, res: Response) => {
    try {
        const { limit = 10 } = req.query;

        const categories = await query(`
            SELECT 
                c.*,
                COUNT(p.id) as "productCount",
                COUNT(DISTINCT p."sellerId") as "sellerCount"
            FROM categories c
            LEFT JOIN products p ON p."categoryId" = c.id AND p."isActive" = true
            WHERE c."isActive" = true
            GROUP BY c.id
            HAVING COUNT(p.id) > 0
            ORDER BY COUNT(p.id) DESC, c.name ASC
            LIMIT $1
        `, [limit]);

        res.json(categories.rows);
    } catch (error) {
        console.error('Error fetching popular categories:', error);
        res.status(500).json({ error: 'Failed to fetch popular categories' });
    }
});

export default router;