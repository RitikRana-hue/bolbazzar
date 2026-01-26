"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const schemas_1 = require("../validation/schemas");
const auditLog_1 = require("../middleware/auditLog");
const router = (0, express_1.Router)();
// All address routes require authentication
router.use(auth_1.authenticateToken);
/**
 * GET /api/addresses
 * Get all user addresses
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await (0, db_1.query)(`
            SELECT 
                id,
                "fullName",
                phone,
                "addressLine1",
                "addressLine2",
                city,
                state,
                "postalCode",
                country,
                "isDefault",
                "createdAt",
                "updatedAt"
            FROM addresses
            WHERE "userId" = $1
            ORDER BY "isDefault" DESC, "createdAt" DESC
        `, [userId]);
        const addresses = result.rows.map((addr) => ({
            id: addr.id,
            fullName: addr.fullName,
            phone: addr.phone,
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country,
            isDefault: addr.isDefault,
            createdAt: addr.createdAt,
            updatedAt: addr.updatedAt
        }));
        res.json({
            success: true,
            addresses
        });
    }
    catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve addresses'
        });
    }
});
/**
 * GET /api/addresses/:id
 * Get specific address
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const result = await (0, db_1.query)(`
            SELECT 
                id,
                "fullName",
                phone,
                "addressLine1",
                "addressLine2",
                city,
                state,
                "postalCode",
                country,
                "isDefault",
                "createdAt",
                "updatedAt"
            FROM addresses
            WHERE id = $1 AND "userId" = $2
        `, [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Address not found'
            });
        }
        const addr = result.rows[0];
        res.json({
            success: true,
            address: {
                id: addr.id,
                fullName: addr.fullName,
                phone: addr.phone,
                addressLine1: addr.addressLine1,
                addressLine2: addr.addressLine2,
                city: addr.city,
                state: addr.state,
                postalCode: addr.postalCode,
                country: addr.country,
                isDefault: addr.isDefault,
                createdAt: addr.createdAt,
                updatedAt: addr.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Get address error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve address'
        });
    }
});
/**
 * POST /api/addresses
 * Create new address
 */
router.post('/', (0, validation_1.validateBody)(schemas_1.createAddressSchema), (0, auditLog_1.auditMiddleware)('CREATE_ADDRESS', 'address'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
        await (0, db_1.transaction)(async (client) => {
            // If this is set as default, unset other defaults
            if (isDefault) {
                await client.query(`
                        UPDATE addresses
                        SET "isDefault" = false
                        WHERE "userId" = $1
                    `, [userId]);
            }
            // Check if this is the first address (auto-default)
            const countResult = await client.query(`
                    SELECT COUNT(*) as count FROM addresses WHERE "userId" = $1
                `, [userId]);
            const isFirstAddress = parseInt(countResult.rows[0].count) === 0;
            // Create address
            const result = await client.query(`
                    INSERT INTO addresses (
                        "userId",
                        "fullName",
                        phone,
                        "addressLine1",
                        "addressLine2",
                        city,
                        state,
                        "postalCode",
                        country,
                        "isDefault",
                        "createdAt",
                        "updatedAt"
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
                    RETURNING *
                `, [
                userId,
                fullName,
                phone,
                addressLine1,
                addressLine2 || null,
                city,
                state,
                postalCode,
                country,
                isDefault || isFirstAddress
            ]);
            const newAddress = result.rows[0];
            res.status(201).json({
                success: true,
                message: 'Address created successfully',
                address: {
                    id: newAddress.id,
                    fullName: newAddress.fullName,
                    phone: newAddress.phone,
                    addressLine1: newAddress.addressLine1,
                    addressLine2: newAddress.addressLine2,
                    city: newAddress.city,
                    state: newAddress.state,
                    postalCode: newAddress.postalCode,
                    country: newAddress.country,
                    isDefault: newAddress.isDefault,
                    createdAt: newAddress.createdAt,
                    updatedAt: newAddress.updatedAt
                }
            });
        });
    }
    catch (error) {
        console.error('Create address error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create address'
        });
    }
});
/**
 * PUT /api/addresses/:id
 * Update address
 */
router.put('/:id', (0, validation_1.validateBody)(schemas_1.updateAddressSchema), (0, auditLog_1.auditMiddleware)('UPDATE_ADDRESS', 'address'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        // Verify address belongs to user
        const existingResult = await (0, db_1.query)(`
                SELECT id FROM addresses WHERE id = $1 AND "userId" = $2
            `, [id, userId]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Address not found'
            });
        }
        await (0, db_1.transaction)(async (client) => {
            // If setting as default, unset other defaults
            if (req.body.isDefault) {
                await client.query(`
                        UPDATE addresses
                        SET "isDefault" = false
                        WHERE "userId" = $1 AND id != $2
                    `, [userId, id]);
            }
            // Build update query dynamically
            const updates = [];
            const values = [];
            let paramCount = 1;
            const fields = [
                'fullName', 'phone', 'addressLine1', 'addressLine2',
                'city', 'state', 'postalCode', 'country', 'isDefault'
            ];
            fields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updates.push(`"${field}" = $${paramCount}`);
                    values.push(req.body[field]);
                    paramCount++;
                }
            });
            if (updates.length === 0) {
                throw new Error('No fields to update');
            }
            updates.push(`"updatedAt" = NOW()`);
            values.push(id, userId);
            const result = await client.query(`
                    UPDATE addresses
                    SET ${updates.join(', ')}
                    WHERE id = $${paramCount} AND "userId" = $${paramCount + 1}
                    RETURNING *
                `, values);
            const updatedAddress = result.rows[0];
            res.json({
                success: true,
                message: 'Address updated successfully',
                address: {
                    id: updatedAddress.id,
                    fullName: updatedAddress.fullName,
                    phone: updatedAddress.phone,
                    addressLine1: updatedAddress.addressLine1,
                    addressLine2: updatedAddress.addressLine2,
                    city: updatedAddress.city,
                    state: updatedAddress.state,
                    postalCode: updatedAddress.postalCode,
                    country: updatedAddress.country,
                    isDefault: updatedAddress.isDefault,
                    createdAt: updatedAddress.createdAt,
                    updatedAt: updatedAddress.updatedAt
                }
            });
        });
    }
    catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update address'
        });
    }
});
/**
 * DELETE /api/addresses/:id
 * Delete address
 */
router.delete('/:id', (0, auditLog_1.auditMiddleware)('DELETE_ADDRESS', 'address'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        await (0, db_1.transaction)(async (client) => {
            // Check if address is default
            const addressResult = await client.query(`
                    SELECT "isDefault" FROM addresses
                    WHERE id = $1 AND "userId" = $2
                `, [id, userId]);
            if (addressResult.rows.length === 0) {
                throw new Error('Address not found');
            }
            const wasDefault = addressResult.rows[0].isDefault;
            // Delete address
            await client.query(`
                    DELETE FROM addresses
                    WHERE id = $1 AND "userId" = $2
                `, [id, userId]);
            // If deleted address was default, set another as default
            if (wasDefault) {
                await client.query(`
                        UPDATE addresses
                        SET "isDefault" = true
                        WHERE "userId" = $1
                        AND id = (
                            SELECT id FROM addresses
                            WHERE "userId" = $1
                            ORDER BY "createdAt" DESC
                            LIMIT 1
                        )
                    `, [userId]);
            }
            res.json({
                success: true,
                message: 'Address deleted successfully'
            });
        });
    }
    catch (error) {
        console.error('Delete address error:', error);
        if (error.message === 'Address not found') {
            return res.status(404).json({
                success: false,
                error: 'Address not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to delete address'
        });
    }
});
/**
 * PATCH /api/addresses/:id/default
 * Set address as default
 */
router.patch('/:id/default', (0, auditLog_1.auditMiddleware)('SET_DEFAULT_ADDRESS', 'address'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        // Verify address belongs to user
        const existingResult = await (0, db_1.query)(`
                SELECT id FROM addresses WHERE id = $1 AND "userId" = $2
            `, [id, userId]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Address not found'
            });
        }
        await (0, db_1.transaction)(async (client) => {
            // Unset all defaults
            await client.query(`
                    UPDATE addresses
                    SET "isDefault" = false
                    WHERE "userId" = $1
                `, [userId]);
            // Set new default
            await client.query(`
                    UPDATE addresses
                    SET "isDefault" = true, "updatedAt" = NOW()
                    WHERE id = $1 AND "userId" = $2
                `, [id, userId]);
        });
        res.json({
            success: true,
            message: 'Default address updated successfully'
        });
    }
    catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to set default address'
        });
    }
});
exports.default = router;
//# sourceMappingURL=addresses.js.map