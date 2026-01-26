interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    url: string;
    pool: {
        min: number;
        max: number;
        idleTimeoutMillis: number;
        connectionTimeoutMillis: number;
        acquireTimeoutMillis: number;
    };
    ssl: boolean | object;
}
interface RedisConfig {
    url: string;
    password?: string;
    db: number;
    keyPrefix: string;
    retryDelayOnFailover: number;
    maxRetriesPerRequest: number;
}
interface JWTConfig {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
}
interface ServerConfig {
    port: number;
    host: string;
    apiUrl: string;
    frontendUrl: string;
    corsOrigins: string[];
    trustProxy: boolean;
    bodyLimit: string;
    timeout: number;
}
interface SecurityConfig {
    bcryptRounds: number;
    passwordMinLength: number;
    maxLoginAttempts: number;
    lockoutTimeMinutes: number;
    sessionSecret: string;
    sessionMaxAge: number;
    rateLimiting: {
        windowMs: number;
        maxRequests: number;
        skipSuccessfulRequests: boolean;
    };
}
interface PaymentConfig {
    stripe: {
        secretKey: string;
        publishableKey: string;
        webhookSecret: string;
        apiVersion: string;
    };
    razorpay?: {
        keyId: string;
        keySecret: string;
    };
}
interface EmailConfig {
    provider: 'sendgrid' | 'smtp' | 'console';
    sendgrid?: {
        apiKey: string;
    };
    smtp?: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    from: {
        email: string;
        name: string;
    };
}
interface FileUploadConfig {
    provider: 'aws' | 'cloudinary' | 'local';
    maxFileSize: number;
    maxFilesPerProduct: number;
    allowedMimeTypes: string[];
    aws?: {
        accessKeyId: string;
        secretAccessKey: string;
        bucketName: string;
        region: string;
        cdnUrl?: string;
    };
    cloudinary?: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    local?: {
        uploadDir: string;
        baseUrl: string;
    };
}
interface AuctionConfig {
    minDurationHours: number;
    maxDurationHours: number;
    extensionTimeSeconds: number;
    bidIncrementMin: number;
    autoEndCheckIntervalMs: number;
}
interface EscrowConfig {
    holdingDays: number;
    platformCommissionRate: number;
    autoReleaseCheckIntervalMs: number;
}
interface LoggingConfig {
    level: 'error' | 'warn' | 'info' | 'debug';
    file?: {
        enabled: boolean;
        path: string;
        maxSize: string;
        maxFiles: number;
    };
    console: {
        enabled: boolean;
        colorize: boolean;
    };
}
interface MonitoringConfig {
    sentry?: {
        dsn: string;
        environment: string;
    };
    healthCheck: {
        intervalMs: number;
        timeoutMs: number;
    };
    metrics: {
        enabled: boolean;
        port: number;
    };
}
interface Config {
    nodeEnv: string;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
    database: DatabaseConfig;
    redis: RedisConfig;
    jwt: JWTConfig;
    server: ServerConfig;
    security: SecurityConfig;
    payment: PaymentConfig;
    email: EmailConfig;
    fileUpload: FileUploadConfig;
    auction: AuctionConfig;
    escrow: EscrowConfig;
    logging: LoggingConfig;
    monitoring: MonitoringConfig;
}
declare const config: Config;
export default config;
//# sourceMappingURL=index.d.ts.map