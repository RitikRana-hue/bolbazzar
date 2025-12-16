# InstaSell Marketplace

A complete, production-ready eBay-style marketplace platform with advanced auction system, real-time features, and comprehensive seller tools.

## 🚀 Features

### Core Marketplace
- **Product Listings** - Direct buy and auction listings
- **Real-time Auctions** - Live bidding with auto-extension
- **Advanced Search** - Category, price, location, and keyword filters
- **User Profiles** - Buyer and seller profiles with ratings
- **Watchlist** - Save favorite products and sellers

### Payment & Money Flow
- **Multiple Payment Methods** - Cards, UPI, Net Banking, Wallet
- **Escrow System** - 7-day holding with automatic release
- **Seller Payouts** - Manual withdrawals and automatic releases
- **Gas Wallet** - Seller auction fees and subscription system
- **Refund Processing** - Automated refund workflows

### Delivery & Tracking
- **Delivery Agent System** - Dedicated delivery partner app
- **Real-time Tracking** - GPS tracking with status updates
- **Open-box Verification** - Photo verification for expensive items
- **Digital Signatures** - Electronic signature capture
- **Delivery Photos** - Visual proof of delivery

### Communication
- **Payment-gated Chat** - Secure buyer-seller messaging
- **Contact Exchange** - Phone number sharing after payment
- **Notifications** - Multi-channel alerts (Push, Email, SMS, In-app)
- **Channel Subscriptions** - Follow sellers, categories, keywords

### Admin Dashboard
- **User Management** - User roles, status, and analytics
- **Product Moderation** - Listing approval and management
- **Dispute Resolution** - Complete dispute handling workflow
- **Financial Overview** - Revenue, transactions, and payouts
- **System Monitoring** - Logs, analytics, and performance metrics

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Socket.IO** - Real-time bidirectional communication

### Database
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and migrations
- **Redis** - Caching and session storage

### External Services
- **Stripe** - Payment processing
- **AWS S3** - File storage
- **SendGrid** - Email delivery
- **FCM/APNS** - Push notifications

## 📁 Project Structure

```
instasell-marketplace/
├── apps/
│   ├── api/                    # Backend API
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── migrations/     # Database migrations
│   │   │   ├── seeds/          # Database seeds
│   │   │   └── utils/          # Utility functions
│   │   ├── prisma/             # Prisma schema
│   │   └── package.json
│   └── web/                    # Frontend application
│       ├── app/                # Next.js App Router
│       │   ├── components/     # Reusable components
│       │   ├── account/        # User account pages
│       │   ├── admin/          # Admin dashboard
│       │   ├── auctions/       # Auction pages
│       │   ├── checkout/       # Checkout flow
│       │   └── ...             # Other pages
│       └── package.json
├── docs/                       # Documentation
├── infra/                      # Infrastructure
│   └── docker/                 # Docker configurations
└── package.json               # Root package.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd instasell-marketplace
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/instasell"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# API URLs
API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Payment
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email
SENDGRID_API_KEY="SG...."
FROM_EMAIL="noreply@instasell.com"

# File Upload
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_BUCKET_NAME="instasell-uploads"
AWS_REGION="us-east-1"

# Push Notifications
FCM_SERVER_KEY="your-fcm-key"
```

4. **Set up the database**
```bash
# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

5. **Start the development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:api    # Backend on :3001
npm run dev:web    # Frontend on :3000
```

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL schema with 35+ tables:

- **User Management** - Users, profiles, addresses
- **Product System** - Products, categories, images
- **Auction Engine** - Auctions, bids, winners
- **Order Processing** - Orders, items, payments
- **Wallet System** - Wallets, gas wallets, transactions
- **Delivery Tracking** - Deliveries, agents, photos
- **Messaging** - Conversations, messages, contacts
- **Notifications** - Alerts, channels, preferences
- **Admin Tools** - Logs, disputes, analytics

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for complete documentation.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing

### Auctions
- `GET /api/auctions` - Get active auctions
- `GET /api/auctions/:id` - Get auction details
- `POST /api/auctions/:id/bid` - Place bid
- `GET /api/auctions/user/bids` - Get user bids

### Payments
- `POST /api/payments/card/create-intent` - Create payment intent
- `POST /api/payments/upi/pay` - Process UPI payment
- `POST /api/payments/wallet/topup` - Top up wallet
- `GET /api/payments/transactions` - Get transaction history

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/disputes` - Dispute management
- `GET /api/admin/finances` - Financial overview

See individual route files for complete API documentation.

## 🎨 UI Components

### Core Components
- **ProductCard** - Product display with auction support
- **AuctionCard** - Specialized auction listing card
- **Timer** - Real-time countdown with auto-extension
- **NotificationBadge** - Notification indicators and lists

### Layout Components
- **Header** - Navigation with search and user menu
- **Footer** - Site links and information
- **Sidebar** - Category navigation and filters

### Form Components
- **PaymentForm** - Multi-method payment processing
- **AddressForm** - Shipping address management
- **ProductForm** - Listing creation and editing

## 🔄 Real-time Features

### Socket.IO Events
- **Auction Updates** - Live bid updates and timer sync
- **Notifications** - Instant notification delivery
- **Chat Messages** - Real-time messaging
- **Delivery Tracking** - Live location updates

### WebSocket Rooms
- `auction_{id}` - Auction-specific updates
- `user_{id}` - User-specific notifications
- `order_{id}` - Order status updates

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
1. Build the applications
```bash
npm run build
```

2. Set production environment variables

3. Run database migrations
```bash
npm run db:migrate:prod
```

4. Start the production servers
```bash
npm run start
```

### Environment-specific Configurations
- **Development** - Hot reload, debug logging
- **Staging** - Production build, test data
- **Production** - Optimized build, monitoring

## 📈 Monitoring & Analytics

### Performance Monitoring
- Database query performance
- API response times
- Real-time connection metrics
- Error tracking and logging

### Business Analytics
- User engagement metrics
- Auction success rates
- Payment conversion rates
- Revenue and commission tracking

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Session management
- Password hashing with bcrypt

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Payment Security
- PCI DSS compliance
- Secure payment processing
- Encrypted sensitive data
- Fraud detection

## 🧪 Testing

### Test Coverage
- Unit tests for services
- Integration tests for APIs
- End-to-end tests for user flows
- Performance tests for auctions

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the FAQ section

---

**InstaSell Marketplace** - Built with ❤️ for modern e-commerce# bolbazzar
# bolbazzar
# bolbazzar
