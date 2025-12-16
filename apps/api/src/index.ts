import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
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

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/listings', listingRoutes);
app.use('/auctions', auctionRoutes);
app.use('/orders', orderRoutes);
app.use('/wallet', walletRoutes);
app.use('/admin', adminRoutes);
app.use('/messages', messageRoutes);
app.use('/notifications', notificationRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/channels', channelRoutes);
app.use('/payments', paymentRoutes);

// Socket.IO events
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join auction room
    socket.on('join_auction', (auctionId: string) => {
        socket.join(`auction:${auctionId}`);
        console.log(`User ${socket.id} joined auction ${auctionId}`);
    });

    // Leave auction room
    socket.on('leave_auction', (auctionId: string) => {
        socket.leave(`auction:${auctionId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Export io for use in routes
export { io };

// Error handling middleware
app.use((err: any, _req: Request, res: Response) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
