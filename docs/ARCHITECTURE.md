# InstaSell Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  - React 18 Components                                       │
│  - Tailwind CSS Styling                                      │
│  - Socket.IO Real-Time Updates                              │
│  - Stripe Payment UI                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│                  Backend (Express.js)                        │
│  - REST API Endpoints                                        │
│  - Socket.IO Server                                          │
│  - JWT Authentication                                        │
│  - Business Logic Services                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌────────┐   ┌────────┐   ┌──────────┐
    │ PostgreSQL│   │ Redis  │   │ MinIO    │
    │ Database   │   │ Cache  │   │ Storage  │
    └────────┘   └────────┘   └──────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: Zustand (optional)
- **Real-Time**: Socket.IO Client
- **Forms**: React Hook Form
- **Payments**: Stripe.js

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Real-Time**: Socket.IO
- **Payments**: Stripe SDK
- **Storage**: MinIO (S3-compatible)
- **Email**: SMTP (MailCatcher for dev)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Package Manager**: Yarn Workspaces
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier

## Core Services

### Authentication Service
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (buyer/seller/admin)

### Auction Service
- Real-time bidding via Socket.IO
- Anti-sniping logic (auto-extend on last-5s bids)
- Auction state management
- Redis locking for concurrent bid handling

### Payment Service
- Stripe integration (test mode)
- Escrow system (7-day hold)
- Transaction logging
- Refund processing

### Wallet Service
- User balance management
- Gas balance for auction listings
- Top-up and withdrawal flows
- Transaction history

### Listing Service
- CRUD operations for listings
- Direct purchase and auction types
- Inventory management
- Category filtering

### Notification Service
- In-app notifications
- Email notifications (SMTP)
- Channel subscriptions
- Real-time updates via Socket.IO

## Database Schema

### Core Tables
```
users
├── id (UUID)
├── email (unique)
├── password_hash
├── role (buyer/seller/admin)
├── verification_status
└── timestamps

listings
├── id (UUID)
├── seller_id (FK: users)
├── title, description
├── category_id (FK: categories)
├── type (direct/auction)
├── condition (new/refurbished)
├── price, stock
└── timestamps

auctions
├── id (UUID)
├── listing_id (FK: listings)
├── seller_id (FK: users)
├── start_at, end_at
├── min_bid, current_bid
├── current_bidder_id (FK: users)
├── status (pending/live/ended/cancelled)
└── created_at

bids
├── id (UUID)
├── auction_id (FK: auctions)
├── bidder_id (FK: users)
├── amount
└── created_at

orders
├── id (UUID)
├── buyer_id, seller_id (FK: users)
├── listing_id (FK: listings)
├── auction_id (FK: auctions, nullable)
├── quantity, total_amount
├── status (pending/processing/shipped/delivered/disputed/cancelled)
├── escrow_release_at
└── timestamps

wallets
├── user_id (PK, FK: users)
├── balance
├── gas_balance
└── updated_at

transactions
├── id (UUID)
├── user_id (FK: users)
├── amount
├── type (topup/charge/refund/hold/release)
├── reference_id
└── created_at
```

## API Architecture

### REST Endpoints Structure
```
/auth
  POST /signup
  POST /login
  GET /me

/listings
  GET / (with filters)
  GET /:id
  POST / (create)
  PUT /:id (update)
  DELETE /:id

/auctions
  POST / (create)
  POST /:id/bid (place bid)
  GET /:id/status
  GET /live
  GET /:id/bids

/orders
  POST / (create order)
  GET /:id
  POST /:id/confirm-payment
  POST /:id/confirm-delivery
  POST /:id/refund

/wallet
  GET /:userId
  POST /:userId/topup
  POST /:userId/use-gas
  POST /:userId/withdraw

/admin
  GET /disputes
  POST /disputes/:id/resolve
  GET /analytics
  GET /users
  POST /users/:id/suspend
```

### Real-Time Events (Socket.IO)
```
Client → Server:
- join_auction (auctionId)
- place_bid (auctionId, amount)
- leave_auction (auctionId)

Server → Client:
- bid_placed (bid, auctionExtended)
- auction_ended (auctionId, winner)
- new_message (message)
- notification (payload)
```

## Data Flow Examples

### Auction Bidding Flow
```
1. User views auction page
2. Socket.IO: join_auction event
3. User places bid
4. Backend: Acquire Redis lock
5. Database: Validate bid amount
6. Database: Check time remaining
7. If < 5 seconds: Extend end_at by 5 seconds
8. Create bid record
9. Update auction current_bid
10. Release Redis lock
11. Socket.IO: Broadcast bid_placed to all watchers
12. Frontend: Update UI in real-time
```

### Order & Escrow Flow
```
1. User creates order (direct purchase or auction win)
2. Backend: Create order record (status: pending)
3. Frontend: Redirect to Stripe checkout
4. User completes payment
5. Stripe webhook: payment_intent.succeeded
6. Backend: Create transaction (type: hold)
7. Order status: processing
8. Seller ships item
9. Buyer receives and confirms delivery
10. Backend: Create transaction (type: release)
11. Seller wallet: balance += order.total_amount
12. Order status: delivered
```

### Admin Dispute Resolution Flow
```
1. Buyer opens dispute within 7 days
2. Backend: Create dispute record (status: open)
3. Admin reviews dispute evidence
4. Admin clicks "Resolve"
5. Backend: Validate refund amount
6. Create transaction (type: refund)
7. Update buyer wallet (balance += refund)
8. Update dispute status: resolved
9. Notify buyer of resolution
```

## Concurrency & Safety

### Auction Bidding (Race Condition Prevention)
- Redis distributed lock (5-second TTL)
- Database transaction with FOR UPDATE
- Optimistic locking on auction current_bid

### Payment Processing
- Stripe idempotency keys
- Database transaction for order + transaction creation
- Webhook signature verification

### Inventory Management
- Stock decrement in transaction
- Prevent overselling with SELECT FOR UPDATE

## Caching Strategy

### Redis Keys
```
auction:{auctionId}          → Auction state (1 hour TTL)
user:{userId}:wallet         → Wallet balance (5 min TTL)
listings:category:{catId}    → Category listings (10 min TTL)
session:{sessionId}          → User session (7 days TTL)
```

## Monitoring & Logging

### Application Logs
- Request/response logging (Express middleware)
- Error logging with stack traces
- Database query logging (development)
- Socket.IO event logging

### Metrics to Track
- Active auctions count
- Bid frequency
- Payment success rate
- Order fulfillment time
- User registration rate

## Security Measures

1. **Authentication**: JWT with 7-day expiry
2. **Password**: bcryptjs with 10 rounds
3. **Database**: Parameterized queries (SQL injection prevention)
4. **CORS**: Configured for frontend origin
5. **Rate Limiting**: 100 requests per 15 minutes
6. **Input Validation**: Schema validation on all endpoints
7. **HTTPS**: Ready for production deployment

## Deployment Considerations

### Scaling Points
- Separate API servers behind load balancer
- PostgreSQL read replicas
- Redis cluster for cache
- CDN for static assets
- Separate WebSocket server for Socket.IO

### Environment Variables
- Database credentials
- JWT secret
- Stripe keys
- Storage credentials
- Email configuration

### Backup Strategy
- Daily PostgreSQL backups
- Redis persistence (RDB/AOF)
- MinIO versioning enabled

---

For detailed API documentation, see `API.md`
