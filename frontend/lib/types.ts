// Shared types for API responses
export interface User {
    id: string;
    email: string;
    username: string | null;
    role: 'BUYER' | 'SELLER' | 'ADMIN' | 'DELIVERY_AGENT';
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    balance?: number;
    availableBalance?: number;
    gasBalance?: number;
}

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    condition: string;
    brand?: string;
    model?: string;
    stock: number;
    status: string;
    categoryId: string;
    categoryName?: string;
    categorySlug?: string;
    sellerId: string;
    sellerName?: string;
    sellerAvatar?: string;
    sellerLocation?: string;
    sellerRating?: number;
    sellerReviewCount?: number;
    primaryImage?: string;
    images?: ProductImage[];
    favoriteCount: number;
    viewCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    auctionId?: string;
    auctionCurrentPrice?: number;
    auctionEndTime?: string;
    auctionTotalBids?: number;
    auctionStatus?: string;
}

export interface ProductImage {
    id: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive: boolean;
    sortOrder: number;
}

export interface Auction {
    id: string;
    productId: string;
    sellerId: string;
    startingPrice: number;
    reservePrice?: number;
    currentPrice: number;
    bidIncrement: number;
    startTime: string;
    endTime: string;
    status: string;
    totalBids: number;
    winnerId?: string;
    autoExtend: boolean;
    extensionTime: number;
    title?: string;
    description?: string;
    condition?: string;
    categoryName?: string;
    categorySlug?: string;
    sellerName?: string;
    sellerFirstName?: string;
    sellerLastName?: string;
    primaryImage?: string;
    sellerRating?: number;
    isReserveMet?: boolean;
}

export interface AuctionBid {
    id: string;
    auctionId: string;
    bidderId: string;
    amount: number;
    isWinning: boolean;
    isAutomatic: boolean;
    maxBid?: number;
    createdAt: string;
    bidderName?: string;
    firstName?: string;
    lastName?: string;
    bidderAvatar?: string;
}

export interface Order {
    id: string;
    buyerId: string;
    sellerId: string;
    addressId: string;
    status: string;
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod?: string;
    notes?: string;
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Address {
    id: string;
    userId: string;
    type: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
}

export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
