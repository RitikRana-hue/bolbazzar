import { z } from 'zod';
export declare const passwordSchema: z.ZodString;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<{
        SELLER: "SELLER";
        BUYER: "BUYER";
    }>>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>;
export declare const createListingSchema: z.ZodObject<{
    categoryId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    condition: z.ZodEnum<{
        NEW: "NEW";
        LIKE_NEW: "LIKE_NEW";
        GOOD: "GOOD";
        FAIR: "FAIR";
        POOR: "POOR";
        REFURBISHED: "REFURBISHED";
    }>;
    brand: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    originalPrice: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodDefault<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    dimensions: z.ZodOptional<z.ZodObject<{
        length: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strip>>;
    features: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        altText: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    isAuction: z.ZodDefault<z.ZodBoolean>;
    auctionData: z.ZodOptional<z.ZodObject<{
        startingPrice: z.ZodNumber;
        reservePrice: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodNumber;
        autoExtend: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateListingSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    condition: z.ZodOptional<z.ZodEnum<{
        NEW: "NEW";
        LIKE_NEW: "LIKE_NEW";
        GOOD: "GOOD";
        FAIR: "FAIR";
        POOR: "POOR";
        REFURBISHED: "REFURBISHED";
    }>>;
    brand: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    model: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    originalPrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    stock: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    weight: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    dimensions: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        length: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strip>>>;
    features: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>>;
    images: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        altText: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>>;
    isAuction: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    auctionData: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        startingPrice: z.ZodNumber;
        reservePrice: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodNumber;
        autoExtend: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const placeBidSchema: z.ZodObject<{
    amount: z.ZodNumber;
    maxBid: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const createPaymentIntentSchema: z.ZodObject<{
    orderId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const processPaymentSchema: z.ZodObject<{
    paymentIntentId: z.ZodString;
    paymentMethodId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const fileUploadSchema: z.ZodObject<{
    filename: z.ZodString;
    mimetype: z.ZodString;
    size: z.ZodNumber;
}, z.core.$strip>;
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<{
        MALE: "MALE";
        FEMALE: "FEMALE";
        OTHER: "OTHER";
        PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY";
    }>>;
}, z.core.$strip>;
export declare const addressSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<{
        OTHER: "OTHER";
        HOME: "HOME";
        WORK: "WORK";
    }>>;
    name: z.ZodString;
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zipCode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        ASC: "ASC";
        DESC: "DESC";
    }>>;
}, z.core.$strip>;
export declare const searchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    condition: z.ZodOptional<z.ZodEnum<{
        NEW: "NEW";
        LIKE_NEW: "LIKE_NEW";
        GOOD: "GOOD";
        FAIR: "FAIR";
        POOR: "POOR";
        REFURBISHED: "REFURBISHED";
    }>>;
    minPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    location: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        ASC: "ASC";
        DESC: "DESC";
    }>>;
}, z.core.$strip>;
export declare const idSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const uuidSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const addToCartSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const updateCartItemSchema: z.ZodObject<{
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const addToWatchlistSchema: z.ZodObject<{
    productId: z.ZodString;
}, z.core.$strip>;
export declare const createAddressSchema: z.ZodObject<{
    fullName: z.ZodString;
    phone: z.ZodString;
    addressLine1: z.ZodString;
    addressLine2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodString;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateAddressSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodOptional<z.ZodString>;
    addressLine2: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const getDealsSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    minDiscount: z.ZodOptional<z.ZodNumber>;
    featured: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const getRecommendationsSchema: z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const createDisputeSchema: z.ZodObject<{
    orderId: z.ZodString;
    reason: z.ZodEnum<{
        OTHER: "OTHER";
        NOT_RECEIVED: "NOT_RECEIVED";
        NOT_AS_DESCRIBED: "NOT_AS_DESCRIBED";
        DAMAGED: "DAMAGED";
        WRONG_ITEM: "WRONG_ITEM";
    }>;
    description: z.ZodString;
}, z.core.$strip>;
export declare const updateDisputeSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        OPEN: "OPEN";
        IN_PROGRESS: "IN_PROGRESS";
        RESOLVED: "RESOLVED";
        CLOSED: "CLOSED";
    }>>;
    resolution: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map