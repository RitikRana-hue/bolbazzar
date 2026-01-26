"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDisputeSchema = exports.createDisputeSchema = exports.getRecommendationsSchema = exports.getDealsSchema = exports.updateAddressSchema = exports.createAddressSchema = exports.addToWatchlistSchema = exports.updateCartItemSchema = exports.addToCartSchema = exports.uuidSchema = exports.idSchema = exports.searchSchema = exports.paginationSchema = exports.addressSchema = exports.updateProfileSchema = exports.fileUploadSchema = exports.processPaymentSchema = exports.createPaymentIntentSchema = exports.placeBidSchema = exports.updateListingSchema = exports.createListingSchema = exports.refreshTokenSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = exports.passwordSchema = void 0;
const zod_1 = require("zod");
// Password policy schema
exports.passwordSchema = zod_1.z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
// Auth schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').max(255),
    username: zod_1.z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens').optional(),
    password: exports.passwordSchema,
    role: zod_1.z.enum(['BUYER', 'SELLER']).default('BUYER')
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').max(255),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: exports.passwordSchema
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format').max(255)
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    password: exports.passwordSchema
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
// Listing schemas
exports.createListingSchema = zod_1.z.object({
    categoryId: zod_1.z.string().cuid('Invalid category ID'),
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must not exceed 200 characters'),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must not exceed 5000 characters'),
    condition: zod_1.z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR', 'REFURBISHED']),
    brand: zod_1.z.string().max(100).optional(),
    model: zod_1.z.string().max(100).optional(),
    price: zod_1.z.number().positive('Price must be positive').max(1000000, 'Price too high'),
    originalPrice: zod_1.z.number().positive().max(1000000).optional(),
    stock: zod_1.z.number().int().positive().max(10000).default(1),
    weight: zod_1.z.number().positive().max(1000).optional(),
    dimensions: zod_1.z.object({
        length: zod_1.z.number().positive(),
        width: zod_1.z.number().positive(),
        height: zod_1.z.number().positive()
    }).optional(),
    features: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    tags: zod_1.z.array(zod_1.z.string().max(50)).max(20).default([]),
    images: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string().url('Invalid image URL'),
        altText: zod_1.z.string().max(200).optional()
    })).max(10).optional(),
    isAuction: zod_1.z.boolean().default(false),
    auctionData: zod_1.z.object({
        startingPrice: zod_1.z.number().positive('Starting price must be positive'),
        reservePrice: zod_1.z.number().positive().optional(),
        duration: zod_1.z.number().int().min(1, 'Duration must be at least 1 hour').max(168, 'Duration cannot exceed 168 hours'),
        autoExtend: zod_1.z.boolean().default(true)
    }).optional()
});
exports.updateListingSchema = exports.createListingSchema.partial();
// Auction schemas
exports.placeBidSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Bid amount must be positive').max(10000000, 'Bid amount too high'),
    maxBid: zod_1.z.number().positive().max(10000000).optional()
});
// Payment schemas
exports.createPaymentIntentSchema = zod_1.z.object({
    orderId: zod_1.z.string().cuid('Invalid order ID'),
    amount: zod_1.z.number().positive('Amount must be positive').max(1000000, 'Amount too high'),
    currency: zod_1.z.string().length(3, 'Currency must be 3 characters').default('USD')
});
exports.processPaymentSchema = zod_1.z.object({
    paymentIntentId: zod_1.z.string().min(1, 'Payment intent ID is required'),
    paymentMethodId: zod_1.z.string().min(1, 'Payment method ID is required').optional()
});
// File upload schemas
exports.fileUploadSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1, 'Filename is required').max(255),
    mimetype: zod_1.z.string().regex(/^(image\/(jpeg|jpg|png|webp|gif))$/, 'Only JPEG, PNG, WebP, and GIF images are allowed'),
    size: zod_1.z.number().positive().max(10 * 1024 * 1024, 'File size must not exceed 10MB')
});
// Profile schemas
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(50).optional(),
    lastName: zod_1.z.string().min(1).max(50).optional(),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
    bio: zod_1.z.string().max(1000).optional(),
    location: zod_1.z.string().max(100).optional(),
    website: zod_1.z.string().url('Invalid website URL').optional(),
    dateOfBirth: zod_1.z.string().datetime().optional(),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional()
});
// Address schemas
exports.addressSchema = zod_1.z.object({
    type: zod_1.z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
    name: zod_1.z.string().min(1, 'Name is required').max(100),
    street: zod_1.z.string().min(1, 'Street is required').max(200),
    city: zod_1.z.string().min(1, 'City is required').max(100),
    state: zod_1.z.string().min(1, 'State is required').max(100),
    zipCode: zod_1.z.string().min(1, 'ZIP code is required').max(20),
    country: zod_1.z.string().length(2, 'Country must be 2-letter code').default('US'),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
    isDefault: zod_1.z.boolean().default(false)
});
// Pagination schemas
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    sortBy: zod_1.z.string().max(50).optional(),
    sortOrder: zod_1.z.enum(['ASC', 'DESC']).default('DESC')
});
// Search schemas
exports.searchSchema = zod_1.z.object({
    query: zod_1.z.string().min(1).max(200).optional(),
    category: zod_1.z.string().max(50).optional(),
    condition: zod_1.z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR', 'REFURBISHED']).optional(),
    minPrice: zod_1.z.coerce.number().positive().optional(),
    maxPrice: zod_1.z.coerce.number().positive().optional(),
    location: zod_1.z.string().max(100).optional()
}).merge(exports.paginationSchema);
// ID validation
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid ID format')
});
exports.uuidSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid UUID format')
});
// ============================================
// CART SCHEMAS
// ============================================
exports.addToCartSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid('Invalid product ID'),
    quantity: zod_1.z.number().int().positive('Quantity must be positive').max(100, 'Quantity cannot exceed 100')
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().positive('Quantity must be positive').max(100, 'Quantity cannot exceed 100')
});
// ============================================
// WATCHLIST SCHEMAS
// ============================================
exports.addToWatchlistSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid('Invalid product ID')
});
// ============================================
// ADDRESS SCHEMAS
// ============================================
exports.createAddressSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters').max(100),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    addressLine1: zod_1.z.string().min(5, 'Address must be at least 5 characters').max(200),
    addressLine2: zod_1.z.string().max(200).optional(),
    city: zod_1.z.string().min(2).max(100),
    state: zod_1.z.string().min(2).max(100),
    postalCode: zod_1.z.string().min(3).max(20),
    country: zod_1.z.string().min(2).max(100),
    isDefault: zod_1.z.boolean().optional()
});
exports.updateAddressSchema = exports.createAddressSchema.partial();
// ============================================
// DEALS SCHEMAS
// ============================================
exports.getDealsSchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    minDiscount: zod_1.z.number().min(0).max(100).optional(),
    featured: zod_1.z.boolean().optional(),
    page: zod_1.z.number().int().positive().optional(),
    limit: zod_1.z.number().int().positive().max(100).optional()
});
// ============================================
// RECOMMENDATIONS SCHEMAS
// ============================================
exports.getRecommendationsSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid().optional(),
    limit: zod_1.z.number().int().positive().max(50).optional()
});
// ============================================
// DISPUTES SCHEMAS
// ============================================
exports.createDisputeSchema = zod_1.z.object({
    orderId: zod_1.z.string().cuid('Invalid order ID'),
    reason: zod_1.z.enum(['NOT_RECEIVED', 'NOT_AS_DESCRIBED', 'DAMAGED', 'WRONG_ITEM', 'OTHER']),
    description: zod_1.z.string().min(20, 'Description must be at least 20 characters').max(2000)
});
exports.updateDisputeSchema = zod_1.z.object({
    status: zod_1.z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    resolution: zod_1.z.string().max(2000).optional()
});
// ============================================
// PAGINATION SCHEMA
// ============================================
// Note: paginationSchema is already defined above
//# sourceMappingURL=schemas.js.map