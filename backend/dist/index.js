"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const config_1 = __importDefault(require("./config"));
const csrf_1 = require("./middleware/csrf");
const rateLimiting_1 = require("./middleware/rateLimiting");
// Import routes
const health_1 = __importDefault(require("./routes/health"));
const auth_1 = __importDefault(require("./routes/auth"));
const listings_1 = __importDefault(require("./routes/listings"));
const auctions_1 = __importDefault(require("./routes/auctions"));
const orders_1 = __importDefault(require("./routes/orders"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const admin_1 = __importDefault(require("./routes/admin"));
const messages_1 = __importDefault(require("./routes/messages"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const delivery_1 = __importDefault(require("./routes/delivery"));
const channels_1 = __importDefault(require("./routes/channels"));
const payments_1 = __importDefault(require("./routes/payments"));
const queues_1 = __importDefault(require("./routes/queues"));
const cart_1 = __importDefault(require("./routes/cart"));
const watchlist_1 = __importDefault(require("./routes/watchlist"));
const addresses_1 = __importDefault(require("./routes/addresses"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const deals_1 = __importDefault(require("./routes/deals"));
// Import queue manager
const queues_2 = require("./queues");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Configure Socket.IO with environment-specific settings
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: config_1.default.server.corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
});
exports.io = io;
// Trust proxy if configured (for load balancers)
if (config_1.default.server.trustProxy) {
    app.set('trust proxy', 1);
}
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: config_1.default.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.default.server.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: config_1.default.server.bodyLimit }));
app.use(express_1.default.urlencoded({ extended: true, limit: config_1.default.server.bodyLimit }));
// CSRF protection setup
app.use(csrf_1.setupCSRF);
// Apply CSRF protection to state-changing operations
app.use(csrf_1.csrfProtection);
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.default.security.rateLimiting.windowMs,
    max: config_1.default.security.rateLimiting.maxRequests,
    skipSuccessfulRequests: config_1.default.security.rateLimiting.skipSuccessfulRequests,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config_1.default.security.rateLimiting.windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply general rate limiting to all API routes
app.use('/api', rateLimiting_1.generalLimiter);
// Health check routes (no rate limiting)
app.use('/health', health_1.default);
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/listings', listings_1.default);
app.use('/api/auctions', auctions_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/wallet', wallet_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/delivery', delivery_1.default);
app.use('/api/channels', channels_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/queues', queues_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/watchlist', watchlist_1.default);
app.use('/api/addresses', addresses_1.default);
app.use('/api/user/dashboard', dashboard_1.default);
app.use('/api/deals', deals_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'InstaSell API',
        version: process.env.npm_package_version || '1.0.0',
        environment: config_1.default.nodeEnv,
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            api: '/api',
            docs: '/api/docs', // Future API documentation
        },
    });
});
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    // Join auction room
    socket.on('join_auction', (auctionId) => {
        if (typeof auctionId === 'string' && auctionId.length > 0) {
            socket.join(`auction:${auctionId}`);
            console.log(`📺 User ${socket.id} joined auction ${auctionId}`);
        }
    });
    // Leave auction room
    socket.on('leave_auction', (auctionId) => {
        if (typeof auctionId === 'string' && auctionId.length > 0) {
            socket.leave(`auction:${auctionId}`);
            console.log(`📺 User ${socket.id} left auction ${auctionId}`);
        }
    });
    // Join user room for notifications
    socket.on('join_user', (userId) => {
        if (typeof userId === 'string' && userId.length > 0) {
            socket.join(`user:${userId}`);
            console.log(`👤 User ${socket.id} joined user room ${userId}`);
        }
    });
    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
    });
    // Handle connection errors
    socket.on('error', (error) => {
        console.error(`🔌 Socket error for ${socket.id}:`, error);
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
});
// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('🚨 Unhandled error:', {
        error: err.message,
        stack: config_1.default.isDevelopment ? err.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    // Don't expose internal errors in production
    const message = config_1.default.isProduction ? 'Internal server error' : err.message;
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        error: message,
        timestamp: new Date().toISOString(),
        ...(config_1.default.isDevelopment && { stack: err.stack }),
    });
});
// Server startup
const server = httpServer.listen(config_1.default.server.port, config_1.default.server.host, async () => {
    console.log(`🚀 InstaSell API Server started`);
    console.log(`📍 Environment: ${config_1.default.nodeEnv}`);
    console.log(`🌐 Server: http://${config_1.default.server.host}:${config_1.default.server.port}`);
    console.log(`🏥 Health: http://${config_1.default.server.host}:${config_1.default.server.port}/health`);
    console.log(`📊 API: http://${config_1.default.server.host}:${config_1.default.server.port}/api`);
    // Initialize queue system
    try {
        await queues_2.queueManager.initialize();
        console.log(`⚡ Queue system initialized successfully`);
    }
    catch (error) {
        console.error('❌ Failed to initialize queue system:', error);
        // Don't exit - server can still function without queues
    }
    if (config_1.default.isDevelopment) {
        console.log(`🔧 Development mode enabled`);
        console.log(`📝 Log level: ${config_1.default.logging.level}`);
    }
});
// Set server timeout
server.timeout = config_1.default.server.timeout;
// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
    console.log(`🛑 Received ${signal}, starting graceful shutdown...`);
    // Shutdown queue system first
    try {
        await queues_2.queueManager.shutdown();
        console.log('✅ Queue system shut down');
    }
    catch (error) {
        console.error('❌ Error shutting down queue system:', error);
    }
    server.close((err) => {
        if (err) {
            console.error('❌ Error during server shutdown:', err);
            process.exit(1);
        }
        console.log('✅ HTTP server closed');
        // Close Socket.IO server
        io.close(() => {
            console.log('✅ Socket.IO server closed');
            process.exit(0);
        });
    });
    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('⏰ Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});
//# sourceMappingURL=index.js.map