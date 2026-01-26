"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment-specific .env file
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
const envPath = path_1.default.resolve(process.cwd(), envFile);
// Try to load environment-specific file first, then fallback to .env
dotenv_1.default.config({ path: envPath });
dotenv_1.default.config(); // Fallback to .env
function validateRequiredEnvVars() {
    const required = [
        'DATABASE_URL',
        'JWT_SECRET',
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY'
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}\n` +
            `Please check your .env file or environment configuration.`);
    }
    // Validate JWT secret length
    if (process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }
}
function parseBoolean(value, defaultValue = false) {
    if (!value)
        return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
}
function parseNumber(value, defaultValue) {
    if (!value)
        return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
function parseArray(value, defaultValue = []) {
    if (!value)
        return defaultValue;
    return value.split(',').map(item => item.trim()).filter(Boolean);
}
// Validate environment variables
validateRequiredEnvVars();
const config = {
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseNumber(process.env.DB_PORT, 5432),
        database: process.env.DB_NAME || 'instasell',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        url: process.env.DATABASE_URL,
        pool: {
            min: parseNumber(process.env.DB_POOL_MIN, 2),
            max: parseNumber(process.env.DB_POOL_MAX, 10),
            idleTimeoutMillis: parseNumber(process.env.DB_POOL_IDLE_TIMEOUT_MS, 30000),
            connectionTimeoutMillis: parseNumber(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 2000),
            acquireTimeoutMillis: parseNumber(process.env.DB_POOL_ACQUIRE_TIMEOUT_MS, 60000),
        },
        ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        db: parseNumber(process.env.REDIS_DB, 0),
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'instasell:',
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        issuer: process.env.JWT_ISSUER || 'instasell',
        audience: process.env.JWT_AUDIENCE || 'instasell-users',
    },
    server: {
        port: parseNumber(process.env.PORT, 3001),
        host: process.env.HOST || '0.0.0.0',
        apiUrl: process.env.API_URL || `http://localhost:${parseNumber(process.env.PORT, 3001)}`,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        corsOrigins: parseArray(process.env.CORS_ORIGINS, ['http://localhost:3000']),
        trustProxy: parseBoolean(process.env.TRUST_PROXY, nodeEnv === 'production'),
        bodyLimit: process.env.BODY_LIMIT || '10mb',
        timeout: parseNumber(process.env.SERVER_TIMEOUT_MS, 30000),
    },
    security: {
        bcryptRounds: parseNumber(process.env.BCRYPT_ROUNDS, 12),
        passwordMinLength: parseNumber(process.env.PASSWORD_MIN_LENGTH, 6),
        maxLoginAttempts: parseNumber(process.env.MAX_LOGIN_ATTEMPTS, 5),
        lockoutTimeMinutes: parseNumber(process.env.LOCKOUT_TIME_MINUTES, 30),
        sessionSecret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
        sessionMaxAge: parseNumber(process.env.SESSION_MAX_AGE, 86400000), // 24 hours
        rateLimiting: {
            windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 minutes
            maxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
            skipSuccessfulRequests: parseBoolean(process.env.RATE_LIMIT_SKIP_SUCCESS, false),
        },
    },
    payment: {
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
            apiVersion: '2023-10-16',
        },
        razorpay: process.env.RAZORPAY_KEY_ID ? {
            keyId: process.env.RAZORPAY_KEY_ID,
            keySecret: process.env.RAZORPAY_KEY_SECRET,
        } : undefined,
    },
    email: {
        provider: process.env.EMAIL_PROVIDER || (nodeEnv === 'development' ? 'console' : 'sendgrid'),
        sendgrid: process.env.SENDGRID_API_KEY ? {
            apiKey: process.env.SENDGRID_API_KEY,
        } : undefined,
        smtp: process.env.SMTP_HOST ? {
            host: process.env.SMTP_HOST,
            port: parseNumber(process.env.SMTP_PORT, 587),
            secure: parseBoolean(process.env.SMTP_SECURE, false),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        } : undefined,
        from: {
            email: process.env.FROM_EMAIL || 'noreply@instasell.com',
            name: process.env.FROM_NAME || 'InstaSell Marketplace',
        },
    },
    fileUpload: {
        provider: process.env.FILE_UPLOAD_PROVIDER || 'local',
        maxFileSize: parseNumber(process.env.MAX_FILE_SIZE_MB, 10) * 1024 * 1024, // Convert to bytes
        maxFilesPerProduct: parseNumber(process.env.MAX_FILES_PER_PRODUCT, 10),
        allowedMimeTypes: parseArray(process.env.ALLOWED_MIME_TYPES, [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif'
        ]),
        aws: process.env.AWS_ACCESS_KEY_ID ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            bucketName: process.env.AWS_BUCKET_NAME,
            region: process.env.AWS_REGION || 'us-east-1',
            cdnUrl: process.env.AWS_CDN_URL,
        } : undefined,
        cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET,
        } : undefined,
        local: {
            uploadDir: process.env.LOCAL_UPLOAD_DIR || './uploads',
            baseUrl: process.env.LOCAL_UPLOAD_BASE_URL || '/uploads',
        },
    },
    auction: {
        minDurationHours: parseNumber(process.env.AUCTION_MIN_DURATION_HOURS, 1),
        maxDurationHours: parseNumber(process.env.AUCTION_MAX_DURATION_HOURS, 168), // 7 days
        extensionTimeSeconds: parseNumber(process.env.AUCTION_EXTENSION_TIME_SECONDS, 300), // 5 minutes
        bidIncrementMin: parseFloat(process.env.AUCTION_BID_INCREMENT_MIN || '1.00'),
        autoEndCheckIntervalMs: parseNumber(process.env.AUCTION_AUTO_END_CHECK_INTERVAL_MS, 60000), // 1 minute
    },
    escrow: {
        holdingDays: parseNumber(process.env.ESCROW_HOLDING_DAYS, 7),
        platformCommissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.05'), // 5%
        autoReleaseCheckIntervalMs: parseNumber(process.env.ESCROW_AUTO_RELEASE_CHECK_INTERVAL_MS, 3600000), // 1 hour
    },
    logging: {
        level: process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
        file: process.env.LOG_FILE_PATH ? {
            enabled: true,
            path: process.env.LOG_FILE_PATH,
            maxSize: process.env.LOG_MAX_SIZE || '10m',
            maxFiles: parseNumber(process.env.LOG_MAX_FILES, 5),
        } : undefined,
        console: {
            enabled: parseBoolean(process.env.LOG_CONSOLE_ENABLED, true),
            colorize: parseBoolean(process.env.LOG_CONSOLE_COLORIZE, nodeEnv !== 'production'),
        },
    },
    monitoring: {
        sentry: process.env.SENTRY_DSN ? {
            dsn: process.env.SENTRY_DSN,
            environment: nodeEnv,
        } : undefined,
        healthCheck: {
            intervalMs: parseNumber(process.env.HEALTH_CHECK_INTERVAL_MS, 30000),
            timeoutMs: parseNumber(process.env.HEALTH_CHECK_TIMEOUT_MS, 5000),
        },
        metrics: {
            enabled: parseBoolean(process.env.ENABLE_METRICS, nodeEnv === 'production'),
            port: parseNumber(process.env.METRICS_PORT, 9090),
        },
    },
};
exports.default = config;
//# sourceMappingURL=index.js.map