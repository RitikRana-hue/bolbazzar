"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
/**
 * GET /api/deals
 * Get daily deals and promotions
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = (page - 1) * limit;
        const category = req.query.category;
        const minDiscount = parseInt(req.query.minDiscount) || 0;
        const featured = req.query.featured === 'true';
        // Build WHERE clause
        const conditions = [
            "p.status = 'ACTIVE'",
            "p.stock > 0",
            "p.\"originalPrice\" IS NOT NULL",
            "p.\"originalPrice\" > p.price"
        ];
        const params = [];
        let paramCount = 1;
        if (category) {
            conditions.push(`c.slug = $${paramCount}`);
            params.push(category);
            paramCount++;
        }
        if (minDiscount > 0) {
            conditions.push(`((p.\"originalPrice\" - p.price) / p.\"originalPrice\" * 100) >= $${paramCount}`);
            params.push(minDiscount);
            paramCount++;
        }
        if (featured) {
            conditions.push("p.\"isFeatured\" = true");
        }
        const whereClause = conditions.join(' AND ');
        // Get total count
        const countResult = await (0, db_1.query)(`
            SELECT COUNT(*) as total
            FROM products p
            LEFT JOIN categories c ON c.id = p."categoryId"
            WHERE ${whereClause}
        `, params);
        const total = parseInt(countResult.rows[0].total);
        // Get deals
        params.push(limit, offset);
        const result = await (0, db_1.query)(`
            SELECT 
                p.id,
                p.title,
                p.description,
                p.price,
                p."originalPrice",
                p.condition,
                p.stock,
                p.views,
                p."isFeatured",
                p."createdAt",
                ((p."originalPrice" - p.price) / p."originalPrice" * 100) as "discountPercentage",
                c.name as "categoryName",
                c.slug as "categorySlug",
                u.username as "sellerName",
                pi.url as "imageUrl",
                (SELECT COUNT(*) FROM reviews WHERE "productId" = p.id) as "reviewCount",
                (SELECT AVG(rating) FROM reviews WHERE "productId" = p.id) as "averageRating"
            FROM products p
            LEFT JOIN categories c ON c.id = p."categoryId"
            LEFT JOIN users u ON u.id = p."sellerId"
            LEFT JOIN product_images pi ON pi."productId" = p.id AND pi."isPrimary" = true
            WHERE ${whereClause}
            ORDER BY 
                p."isFeatured" DESC,
                ((p."originalPrice" - p.price) / p."originalPrice") DESC,
                p."createdAt" DESC
            LIMIT $${paramCount} OFFSET $${paramCount + 1}
        `, params);
        const deals = result.rows.map((deal) => ({
            id: deal.id,
            title: deal.title,
            description: deal.description,
            price: parseFloat(deal.price),
            originalPrice: parseFloat(deal.originalprice),
            discountPercentage: Math.round(parseFloat(deal.discountpercentage)),
            savings: parseFloat(deal.originalprice) - parseFloat(deal.price),
            condition: deal.condition,
            stock: deal.stock,
            views: deal.views,
            isFeatured: deal.isfeatured,
            category: {
                name: deal.categoryname,
                slug: deal.categoryslug
            },
            seller: {
                username: deal.sellername
            },
            imageUrl: deal.imageurl,
            reviewCount: parseInt(deal.reviewcount) || 0,
            averageRating: deal.averagerating ? parseFloat(deal.averagerating) : null,
            createdAt: deal.createdat
        }));
        res.json({
            success: true,
            deals,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get deals error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve deals'
        });
    }
});
/**
 * GET /api/deals/:id
 * Get specific deal details
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)(`
            SELECT 
                p.id,
                p.title,
                p.description,
                p.price,
                p."originalPrice",
                p.condition,
                p.brand,
                p.model,
                p.stock,
                p.views,
                p."isFeatured",
                p.features,
                p.tags,
                p."createdAt",
                ((p."originalPrice" - p.price) / p."originalPrice" * 100) as "discountPercentage",
                c.name as "categoryName",
                c.slug as "categorySlug",
                u.id as "sellerId",
                u.username as "sellerName",
                u.email as "sellerEmail",
                (SELECT json_agg(json_build_object('url', url, 'altText', "altText", 'isPrimary', "isPrimary"))
                 FROM product_images WHERE "productId" = p.id) as images,
                (SELECT COUNT(*) FROM reviews WHERE "productId" = p.id) as "reviewCount",
                (SELECT AVG(rating) FROM reviews WHERE "productId" = p.id) as "averageRating"
            FROM products p
            LEFT JOIN categories c ON c.id = p."categoryId"
            LEFT JOIN users u ON u.id = p."sellerId"
            WHERE p.id = $1 
            AND p.status = 'ACTIVE'
            AND p."originalPrice" IS NOT NULL
            AND p."originalPrice" > p.price
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Deal not found'
            });
        }
        const deal = result.rows[0];
        // Increment view count
        await (0, db_1.query)(`
            UPDATE products SET views = views + 1 WHERE id = $1
        `, [id]);
        res.json({
            success: true,
            deal: {
                id: deal.id,
                title: deal.title,
                description: deal.description,
                price: parseFloat(deal.price),
                originalPrice: parseFloat(deal.originalprice),
                discountPercentage: Math.round(parseFloat(deal.discountpercentage)),
                savings: parseFloat(deal.originalprice) - parseFloat(deal.price),
                condition: deal.condition,
                brand: deal.brand,
                model: deal.model,
                stock: deal.stock,
                views: deal.views + 1,
                isFeatured: deal.isfeatured,
                features: deal.features,
                tags: deal.tags,
                category: {
                    name: deal.categoryname,
                    slug: deal.categoryslug
                },
                seller: {
                    id: deal.sellerid,
                    username: deal.sellername
                },
                images: deal.images || [],
                reviewCount: parseInt(deal.reviewcount) || 0,
                averageRating: deal.averagerating ? parseFloat(deal.averagerating) : null,
                createdAt: deal.createdat
            }
        });
    }
    catch (error) {
        console.error('Get deal error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve deal'
        });
    }
});
exports.default = router;
//# sourceMappingURL=deals.js.map