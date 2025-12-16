// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        VERIFY_EMAIL: '/auth/verify-email',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },
    USERS: {
        PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/profile',
        CHANGE_PASSWORD: '/users/change-password',
        UPLOAD_AVATAR: '/users/avatar',
    },
    LISTINGS: {
        BASE: '/listings',
        SEARCH: '/listings/search',
        CATEGORIES: '/listings/categories',
        FEATURED: '/listings/featured',
        MY_LISTINGS: '/listings/my-listings',
    },
    AUCTIONS: {
        BASE: '/auctions',
        LIVE: '/auctions/live',
        BID: '/auctions/:id/bid',
        MY_BIDS: '/auctions/my-bids',
    },
    ORDERS: {
        BASE: '/orders',
        CONFIRM_PAYMENT: '/orders/:id/confirm-payment',
        TRACK: '/orders/:id/track',
        REFUND: '/orders/:id/refund',
    },
    WALLET: {
        BASE: '/wallet',
        TOPUP: '/wallet/topup',
        WITHDRAW: '/wallet/withdraw',
        TRANSACTIONS: '/wallet/transactions',
    },
    MESSAGES: {
        CONVERSATIONS: '/messages/conversations',
        SEND: '/messages/conversations/:id',
    },
    NOTIFICATIONS: {
        BASE: '/notifications',
        MARK_READ: '/notifications/:id/read',
        MARK_ALL_READ: '/notifications/mark-all-read',
    },
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        USERS: '/admin/users',
        DISPUTES: '/admin/disputes',
        ANALYTICS: '/admin/analytics',
    },
} as const;

// User roles
export const USER_ROLES = {
    BUYER: 'buyer',
    SELLER: 'seller',
    ADMIN: 'admin',
    DELIVERY_AGENT: 'delivery_agent',
} as const;

// Order statuses
export const ORDER_STATUSES = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
} as const;

// Auction statuses
export const AUCTION_STATUSES = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    ENDED: 'ended',
    CANCELLED: 'cancelled',
} as const;

// Payment statuses
export const PAYMENT_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
} as const;

// Listing conditions
export const LISTING_CONDITIONS = {
    NEW: 'new',
    LIKE_NEW: 'like_new',
    EXCELLENT: 'excellent',
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
    AUCTION_WON: 'auction_won',
    AUCTION_OUTBID: 'auction_outbid',
    ORDER_CONFIRMED: 'order_confirmed',
    ORDER_SHIPPED: 'order_shipped',
    ORDER_DELIVERED: 'order_delivered',
    PAYMENT_RECEIVED: 'payment_received',
    MESSAGE_RECEIVED: 'message_received',
    LISTING_APPROVED: 'listing_approved',
    LISTING_REJECTED: 'listing_rejected',
    SYSTEM_MAINTENANCE: 'system_maintenance',
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES_PER_LISTING: 10,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    SEARCH_PAGE_SIZE: 24,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 5000,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 255,
    PHONE_MAX_LENGTH: 20,
    ADDRESS_MAX_LENGTH: 200,
    CITY_MAX_LENGTH: 50,
    STATE_MAX_LENGTH: 50,
    ZIP_CODE_MAX_LENGTH: 10,
} as const;

// Price limits
export const PRICE_LIMITS = {
    MIN_PRICE: 0.01,
    MAX_PRICE: 999999.99,
    MIN_BID_INCREMENT: 0.01,
    MAX_BID_INCREMENT: 10000,
} as const;

// Time constants
export const TIME_CONSTANTS = {
    AUCTION_MIN_DURATION: 1 * 60 * 60 * 1000, // 1 hour
    AUCTION_MAX_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
    AUCTION_EXTENSION_TIME: 5 * 60 * 1000, // 5 minutes
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    DEBOUNCE_DELAY: 300, // 300ms
    THROTTLE_DELAY: 1000, // 1 second
} as const;

// Local storage keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    CART_ITEMS: 'cart_items',
    SEARCH_HISTORY: 'search_history',
    THEME_PREFERENCE: 'theme_preference',
    LANGUAGE_PREFERENCE: 'language_preference',
    NOTIFICATION_SETTINGS: 'notification_settings',
} as const;

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    INSUFFICIENT_FUNDS: 'Insufficient funds in your wallet.',
    AUCTION_ENDED: 'This auction has already ended.',
    BID_TOO_LOW: 'Your bid must be higher than the current bid.',
    LISTING_NOT_AVAILABLE: 'This listing is no longer available.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Successfully logged in!',
    LOGOUT_SUCCESS: 'Successfully logged out!',
    REGISTRATION_SUCCESS: 'Account created successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    PASSWORD_CHANGED: 'Password changed successfully!',
    LISTING_CREATED: 'Listing created successfully!',
    LISTING_UPDATED: 'Listing updated successfully!',
    BID_PLACED: 'Bid placed successfully!',
    ORDER_PLACED: 'Order placed successfully!',
    PAYMENT_SUCCESSFUL: 'Payment processed successfully!',
    MESSAGE_SENT: 'Message sent successfully!',
    WALLET_TOPPED_UP: 'Wallet topped up successfully!',
} as const;

// Feature flags
export const FEATURES = {
    AUCTIONS_ENABLED: true,
    CHAT_ENABLED: true,
    NOTIFICATIONS_ENABLED: true,
    DELIVERY_TRACKING_ENABLED: true,
    SOCIAL_LOGIN_ENABLED: false,
    DARK_MODE_ENABLED: true,
    MULTI_LANGUAGE_ENABLED: false,
    ANALYTICS_ENABLED: true,
    MAINTENANCE_MODE: false,
} as const;

// Social media links
export const SOCIAL_LINKS = {
    FACEBOOK: 'https://facebook.com/instasell',
    TWITTER: 'https://twitter.com/instasell',
    INSTAGRAM: 'https://instagram.com/instasell',
    LINKEDIN: 'https://linkedin.com/company/instasell',
    YOUTUBE: 'https://youtube.com/instasell',
} as const;

// Contact information
export const CONTACT_INFO = {
    EMAIL: 'support@instasell.com',
    PHONE: '+1 (555) 123-4567',
    ADDRESS: '123 Marketplace St, Commerce City, CC 12345',
    BUSINESS_HOURS: 'Monday - Friday: 9:00 AM - 6:00 PM EST',
} as const;

// SEO constants
export const SEO = {
    DEFAULT_TITLE: 'InstaSell - eBay-Style Marketplace',
    DEFAULT_DESCRIPTION: 'Buy and sell items with real-time auctions and secure payments',
    DEFAULT_KEYWORDS: 'marketplace, auctions, buy, sell, ecommerce, online shopping',
    SITE_NAME: 'InstaSell',
    TWITTER_HANDLE: '@instasell',
} as const;

// Currency and locale
export const LOCALE_SETTINGS = {
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_LOCALE: 'en-US',
    SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    SUPPORTED_LOCALES: ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES'],
} as const;

// Theme colors
export const THEME_COLORS = {
    PRIMARY: '#3B82F6', // blue-500
    SECONDARY: '#6B7280', // gray-500
    SUCCESS: '#10B981', // emerald-500
    WARNING: '#F59E0B', // amber-500
    ERROR: '#EF4444', // red-500
    INFO: '#06B6D4', // cyan-500
} as const;