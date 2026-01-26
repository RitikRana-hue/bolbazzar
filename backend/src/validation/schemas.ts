import { z } from 'zod';

// Password policy schema
export const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

// Auth schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email format').max(255),
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens').optional(),
    password: passwordSchema,
    role: z.enum(['BUYER', 'SELLER']).default('BUYER')
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format').max(255),
    password: z.string().min(1, 'Password is required')
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email format').max(255)
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

// Listing schemas
export const createListingSchema = z.object({
    categoryId: z.string().cuid('Invalid category ID'),
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must not exceed 200 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must not exceed 5000 characters'),
    condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR', 'REFURBISHED']),
    brand: z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    price: z.number().positive('Price must be positive').max(1000000, 'Price too high'),
    originalPrice: z.number().positive().max(1000000).optional(),
    stock: z.number().int().positive().max(10000).default(1),
    weight: z.number().positive().max(1000).optional(),
    dimensions: z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive()
    }).optional(),
    features: z.record(z.string(), z.any()).optional(),
    tags: z.array(z.string().max(50)).max(20).default([]),
    images: z.array(z.object({
        url: z.string().url('Invalid image URL'),
        altText: z.string().max(200).optional()
    })).max(10).optional(),
    isAuction: z.boolean().default(false),
    auctionData: z.object({
        startingPrice: z.number().positive('Starting price must be positive'),
        reservePrice: z.number().positive().optional(),
        duration: z.number().int().min(1, 'Duration must be at least 1 hour').max(168, 'Duration cannot exceed 168 hours'),
        autoExtend: z.boolean().default(true)
    }).optional()
});

export const updateListingSchema = createListingSchema.partial();

// Auction schemas
export const placeBidSchema = z.object({
    amount: z.number().positive('Bid amount must be positive').max(10000000, 'Bid amount too high'),
    maxBid: z.number().positive().max(10000000).optional()
});

// Payment schemas
export const createPaymentIntentSchema = z.object({
    orderId: z.string().cuid('Invalid order ID'),
    amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too high'),
    currency: z.string().length(3, 'Currency must be 3 characters').default('USD')
});

export const processPaymentSchema = z.object({
    paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
    paymentMethodId: z.string().min(1, 'Payment method ID is required').optional()
});

// File upload schemas
export const fileUploadSchema = z.object({
    filename: z.string().min(1, 'Filename is required').max(255),
    mimetype: z.string().regex(/^(image\/(jpeg|jpg|png|webp|gif))$/, 'Only JPEG, PNG, WebP, and GIF images are allowed'),
    size: z.number().positive().max(10 * 1024 * 1024, 'File size must not exceed 10MB')
});

// Profile schemas
export const updateProfileSchema = z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
    bio: z.string().max(1000).optional(),
    location: z.string().max(100).optional(),
    website: z.string().url('Invalid website URL').optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional()
});

// Address schemas
export const addressSchema = z.object({
    type: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME'),
    name: z.string().min(1, 'Name is required').max(100),
    street: z.string().min(1, 'Street is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    zipCode: z.string().min(1, 'ZIP code is required').max(20),
    country: z.string().length(2, 'Country must be 2-letter code').default('US'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
    isDefault: z.boolean().default(false)
});

// Pagination schemas
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.string().max(50).optional(),
    sortOrder: z.enum(['ASC', 'DESC']).default('DESC')
});

// Search schemas
export const searchSchema = z.object({
    query: z.string().min(1).max(200).optional(),
    category: z.string().max(50).optional(),
    condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR', 'REFURBISHED']).optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    location: z.string().max(100).optional()
}).merge(paginationSchema);

// ID validation
export const idSchema = z.object({
    id: z.string().cuid('Invalid ID format')
});

export const uuidSchema = z.object({
    id: z.string().uuid('Invalid UUID format')
});


// ============================================
// CART SCHEMAS
// ============================================

export const addToCartSchema = z.object({
    productId: z.string().cuid('Invalid product ID'),
    quantity: z.number().int().positive('Quantity must be positive').max(100, 'Quantity cannot exceed 100')
});

export const updateCartItemSchema = z.object({
    quantity: z.number().int().positive('Quantity must be positive').max(100, 'Quantity cannot exceed 100')
});

// ============================================
// WATCHLIST SCHEMAS
// ============================================

export const addToWatchlistSchema = z.object({
    productId: z.string().cuid('Invalid product ID')
});

// ============================================
// ADDRESS SCHEMAS
// ============================================

export const createAddressSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    addressLine1: z.string().min(5, 'Address must be at least 5 characters').max(200),
    addressLine2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    postalCode: z.string().min(3).max(20),
    country: z.string().min(2).max(100),
    isDefault: z.boolean().optional()
});

export const updateAddressSchema = createAddressSchema.partial();

// ============================================
// DEALS SCHEMAS
// ============================================

export const getDealsSchema = z.object({
    category: z.string().optional(),
    minDiscount: z.number().min(0).max(100).optional(),
    featured: z.boolean().optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional()
});

// ============================================
// RECOMMENDATIONS SCHEMAS
// ============================================

export const getRecommendationsSchema = z.object({
    productId: z.string().cuid().optional(),
    limit: z.number().int().positive().max(50).optional()
});

// ============================================
// DISPUTES SCHEMAS
// ============================================

export const createDisputeSchema = z.object({
    orderId: z.string().cuid('Invalid order ID'),
    reason: z.enum(['NOT_RECEIVED', 'NOT_AS_DESCRIBED', 'DAMAGED', 'WRONG_ITEM', 'OTHER']),
    description: z.string().min(20, 'Description must be at least 20 characters').max(2000)
});

export const updateDisputeSchema = z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    resolution: z.string().max(2000).optional()
});

// ============================================
// PAGINATION SCHEMA
// ============================================

// Note: paginationSchema is already defined above
