import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from './config';
import { setupCSRF, csrfProtection } from './middleware/csrf';
import { generalLimiter } from './middleware/rateLimiting';

// Import routes
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import listingRoutes from './routes/listings';
import auctionRoutes from './routes/auctions';
import orderRoutes from './routes/orders';
import walletRoutes from './routes/wallet';
import adminRoutes from './routes/admin';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import deliveryRoutes from './routes/delivery';
import channelRoutes from './routes/channels';
import paymentRoutes from './routes/payments';
import queueRoutes from './routes/queues';
import cartRoutes from './routes/cart';
import watchlistRoutes from './routes/watchlist';
import addressesRoutes from './routes/addresses';
import dashboardRoutes from './routes/dashboard';
import dealsRoutes from './routes/deals';

// Import queue manager
import { queueManager } from './queues';

const app: Express = express();
const httpServer = createServer(app);

// Configure Socket.IO with environment-specific settings
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: config.server.corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Trust proxy if configured (for load balancers)
if (config.server.trustProxy) {
    app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
    origin: config.server.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: config.server.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.server.bodyLimit }));

// CSRF protection setup
app.use(setupCSRF);

// Apply CSRF protection to state-changing operations
app.use(csrfProtection);

// Rate limiting
const limiter = rateLimit({
    windowMs: config.security.rateLimiting.windowMs,
    max: config.security.rateLimiting.maxRequests,
    skipSuccessfulRequests: config.security.rateLimiting.skipSuccessfulRequests,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.security.rateLimiting.windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// Health check routes (no rate limiting)
app.use('/health', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/user/dashboard', dashboardRoutes);
app.use('/api/deals', dealsRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        name: 'InstaSell API',
        version: process.env.npm_package_version || '1.0.0',
        environment: config.nodeEnv,
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
    socket.on('join_auction', (auctionId: string) => {
        if (typeof auctionId === 'string' && auctionId.length > 0) {
            socket.join(`auction:${auctionId}`);
            console.log(`📺 User ${socket.id} joined auction ${auctionId}`);
        }
    });

    // Leave auction room
    socket.on('leave_auction', (auctionId: string) => {
        if (typeof auctionId === 'string' && auctionId.length > 0) {
            socket.leave(`auction:${auctionId}`);
            console.log(`📺 User ${socket.id} left auction ${auctionId}`);
        }
    });

    // Join user room for notifications
    socket.on('join_user', (userId: string) => {
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

// Export io for use in routes
export { io };

// 404 handler
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('🚨 Unhandled error:', {
        error: err.message,
        stack: config.isDevelopment ? err.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });

    // Don't expose internal errors in production
    const message = config.isProduction ? 'Internal server error' : err.message;
    const statusCode = err.status || err.statusCode || 500;

    res.status(statusCode).json({
        error: message,
        timestamp: new Date().toISOString(),
        ...(config.isDevelopment && { stack: err.stack }),
    });
});

// Server startup
const server = httpServer.listen(config.server.port, config.server.host, async () => {
    console.log(`🚀 InstaSell API Server started`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🌐 Server: http://${config.server.host}:${config.server.port}`);
    console.log(`🏥 Health: http://${config.server.host}:${config.server.port}/health`);
    console.log(`📊 API: http://${config.server.host}:${config.server.port}/api`);

    // Initialize queue system
    try {
        await queueManager.initialize();
        console.log(`⚡ Queue system initialized successfully`);
    } catch (error) {
        console.error('❌ Failed to initialize queue system:', error);
        // Don't exit - server can still function without queues
    }

    if (config.isDevelopment) {
        console.log(`🔧 Development mode enabled`);
        console.log(`📝 Log level: ${config.logging.level}`);
    }
});

// Set server timeout
server.timeout = config.server.timeout;

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
    console.log(`🛑 Received ${signal}, starting graceful shutdown...`);

    // Shutdown queue system first
    try {
        await queueManager.shutdown();
        console.log('✅ Queue system shut down');
    } catch (error) {
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
