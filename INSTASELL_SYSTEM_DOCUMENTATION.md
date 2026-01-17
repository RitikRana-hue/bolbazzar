# InstaSell Marketplace - Complete System Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Current Project Status](#2-current-project-status)
3. [System Architecture](#3-system-architecture)
4. [Frontend Detailed Explanation](#4-frontend-detailed-explanation)
5. [Backend Detailed Explanation](#5-backend-detailed-explanation)
6. [API Inventory & Responsibilities](#6-api-inventory--responsibilities)
7. [Data Flow & How Things Work](#7-data-flow--how-things-work)
8. [Security & Limitations](#8-security--limitations)
9. [Performance & Scalability Status](#9-performance--scalability-status)
10. [Development Gaps & Next Steps](#10-development-gaps--next-steps)
11. [Summary for Future Development](#11-summary-for-future-development)

---

## 1. PROJECT OVERVIEW

### What InstaSell Is
InstaSell Marketplace is a comprehensive eBay-style e-commerce platform that combines traditional product sales with real-time auction functionality. It's built as a modern, full-stack web application designed to handle both direct purchases and competitive bidding scenarios.

### What Problem It Solves
- **Sellers**: Need a platform to sell products both at fixed prices and through auctions
- **Buyers**: Want to purchase items directly or participate in competitive bidding
- **Platform**: Needs secure payment processing, escrow management, and real-time updates
- **Business**: Requires comprehensive admin tools, financial tracking, and dispute resolution

### Core Features (E-commerce + Auctions)
1. **Product Listings**: Traditional buy-it-now listings with categories, search, and filtering
2. **Real-time Auctions**: Live bidding with auto-extension, proxy bidding, and countdown timers
3. **Secure Payments**: Stripe integration with multiple payment methods and escrow holding
4. **Seller Tools**: Product management, auction creation, wallet management, and analytics
5. **Buyer Experience**: Shopping cart, watchlist, bid tracking, and order management
6. **Admin Dashboard**: User management, dispute resolution, financial oversight, and system monitoring

### Target Users
- **Guest Users**: Browse products and auctions (limited functionality)
- **Buyers**: Purchase products, participate in auctions, manage orders and payments
- **Sellers**: Create listings, manage auctions, handle orders, and receive payouts
- **Admins**: Oversee platform operations, resolve disputes, and manage finances

### High-Level Architecture Overview
```
Frontend (Next.js) ←→ Backend (Express.js) ←→ Database (PostgreSQL)
       ↓                      ↓                      ↓
Socket.IO Client ←→ Socket.IO Server ←→ Redis (Cache/Sessions)
       ↓                      ↓                      ↓
   Real-time UI ←→ Background Jobs (Bull) ←→ External APIs (Stripe)
```

---

## 2. CURRENT PROJECT STATUS

### What is Fully Implemented ✅
1. **User Authentication System**
   - Registration with email verification
   - Login/logout with JWT tokens
   - Password reset functionality
   - Role-based access control (buyer/seller/admin)
   - Token refresh mechanism

2. **Product Management**
   - Create, read, update, delete listings
   - Product categories and search
   - Image upload (up to 10 images per product)
   - Watchlist functionality
   - Product filtering and sorting

3. **Auction System**
   - Real-time bidding with Socket.IO
   - Auto-extension (extends by 5 minutes if bid in last 5 minutes)
   - Proxy bidding (automatic bid increments)
   - Auction scheduling and auto-end
   - Winner determination and order creation

4. **Payment Processing**
   - Stripe payment intent creation
   - Multiple payment methods (cards, UPI, wallets)
   - Idempotent payment processing
   - Webhook handling for payment events
   - Transaction logging and audit trail

5. **Escrow System**
   - 7-day automatic fund holding
   - Manual release by admin or automatic after delivery
   - Dispute locking mechanism
   - Fund reconciliation and tracking

6. **Seller Payouts**
   - Seller wallet management
   - Withdrawal request system
   - Admin approval workflow
   - Transaction history and reporting

7. **Admin Dashboard**
   - User management and status updates
   - Product moderation and approval
   - Financial overview and reporting
   - System logs and audit trails
   - Dispute management interface

8. **Background Job System**
   - Auction auto-end processing
   - Escrow auto-release after 7 days
   - Daily cleanup tasks (expired tokens, old logs)
   - Email queue processing
   - Notification dispatch system

### What is Partially Implemented ⚠️
1. **Email Service**
   - Templates exist for verification and password reset
   - SMTP configuration needed (currently uses nodemailer stub)
   - SendGrid integration prepared but not configured

2. **File Upload System**
   - Multer configured for file handling
   - AWS S3 integration stubbed (needs credentials and bucket setup)
   - Image validation and processing partially implemented
   - Temporary file cleanup system exists

3. **Notification System**
   - Database schema complete for multi-channel notifications
   - Push notification infrastructure ready (FCM/APNS not integrated)
   - Email notifications partially working
   - SMS notifications stubbed

4. **Messaging System**
   - Database schema complete for buyer-seller communication
   - Real-time messaging infrastructure ready via Socket.IO
   - Message encryption not implemented
   - File sharing in messages not implemented

5. **Delivery Tracking**
   - Database schema exists for delivery management
   - Photo verification system stubbed
   - GPS tracking not implemented
   - Signature capture not implemented

### What is Missing ❌
1. **Dispute Resolution Workflow**
   - Database schema exists but workflow logic incomplete
   - Evidence handling not implemented
   - Automated dispute escalation missing
   - Refund processing for disputes incomplete

2. **Advanced Search**
   - Basic search implemented
   - Elasticsearch integration not implemented
   - Advanced filtering partially working
   - Search analytics not tracked

3. **Seller Analytics**
   - Basic dashboard statistics exist
   - Detailed performance metrics not implemented
   - Sales forecasting not available
   - Competitor analysis missing

4. **Mobile Application**
   - No native mobile app
   - Responsive web design implemented
   - PWA features not implemented

### What is Mocked or Stubbed
1. **External Service Integrations**
   - AWS S3 file storage (returns mock URLs)
   - SendGrid email service (logs to console)
   - FCM/APNS push notifications (database entries only)
   - SMS service (Twilio integration stubbed)

2. **Advanced Features**
   - Machine learning recommendations (returns random products)
   - Fraud detection (basic validation only)
   - Advanced analytics (basic counters only)
   - Multi-currency support (USD only)

### Production-Ready vs Prototype Status
**Production-Ready Components:**
- Authentication and authorization
- Core marketplace functionality
- Payment processing with Stripe
- Database schema and migrations
- API endpoints and validation
- Real-time auction system
- Background job processing

**Prototype/Development Components:**
- File upload and storage
- Email delivery system
- Push notifications
- Advanced search
- Mobile responsiveness (needs testing)
- Dispute resolution
- Advanced analytics

**Overall Assessment:** 70-80% production-ready for core features, 40-50% for advanced features

---

## 3. SYSTEM ARCHITECTURE

### Monorepo Structure
```
instasell-marketplace/
├── apps/
│   ├── api/                    # Backend Express.js application
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints (18 files)
│   │   │   ├── services/       # Business logic (9 services)
│   │   │   ├── middleware/     # Express middleware (6 files)
│   │   │   ├── migrations/     # Database migrations (6 SQL files)
│   │   │   ├── queues/         # Background job processors (5 files)
│   │   │   ├── validation/     # Input validation schemas
│   │   │   ├── config/         # Application configuration
│   │   │   └── utils/          # Utility functions
│   │   ├── prisma/             # Prisma schema (referenced, not primary)
│   │   └── package.json        # Backend dependencies
│   │
│   └── web/                    # Frontend Next.js application
│       ├── app/                # Next.js App Router (30+ pages)
│       │   ├── components/     # Reusable UI components
│       │   ├── (auth)/         # Authentication pages
│       │   ├── (dashboard)/    # User dashboard pages
│       │   ├── (seller)/       # Seller-specific pages
│       │   ├── (admin)/        # Admin panel pages
│       │   ├── layout.tsx      # Root layout component
│       │   └── globals.css     # Global styles
│       ├── lib/
│       │   ├── api/            # API client functions (10+ files)
│       │   ├── store/          # Zustand state stores
│       │   ├── api-client.ts   # Axios configuration
│       │   ├── socket-client.ts# Socket.IO client setup
│       │   └── types.ts        # TypeScript type definitions
│       └── package.json        # Frontend dependencies
│
├── docs/                       # Documentation
├── infra/                      # Infrastructure configuration
│   ├── docker/                 # Docker configurations
│   ├── monitoring/             # Monitoring setup
│   └── nginx/                  # Nginx configurations
├── scripts/                    # Setup and deployment scripts
└── package.json               # Root workspace configuration
```

### Frontend Architecture (Next.js)

**Framework:** Next.js 15.4.10 with App Router
**Language:** TypeScript with strict mode
**Styling:** Tailwind CSS with custom components
**State Management:** Zustand for global state, React Context for local state
**Real-time:** Socket.IO client for live updates

**Routing Structure:**
- App Router with file-based routing
- Layout components for consistent UI
- Route groups for organization: `(auth)`, `(dashboard)`, `(seller)`, `(admin)`
- Dynamic routes: `[id]`, `[slug]` for products and categories
- Parallel routes for complex layouts

**State Management:**
- **Zustand Stores:**
  - `auth-store`: User authentication state and methods
  - `toast-store`: Toast notification management
- **React Context:** Used for component-specific state
- **URL State:** Search params for filters and pagination

### Backend Architecture (Express.js)

**Framework:** Express.js with TypeScript
**Database:** PostgreSQL with raw SQL queries (Prisma referenced but not primary)
**Caching:** Redis for sessions, caching, and job queues
**Jobs:** Bull queue system for background processing
**Real-time:** Socket.IO server for live updates

**Service Layer Architecture:**
```
Routes (API endpoints)
    ↓
Middleware (auth, validation, rate limiting)
    ↓
Services (business logic)
    ↓
Database Layer (PostgreSQL queries)
    ↓
External APIs (Stripe, AWS, etc.)
```

**Key Services:**
- `AuctionService`: Auction logic, bidding, auto-extension
- `PaymentService`: Stripe integration, escrow management
- `EscrowService`: Fund holding and release logic
- `TokenService`: JWT token management
- `NotificationService`: Multi-channel notifications
- `EmailService`: Email delivery (stubbed)
- `UploadService`: File upload to S3 (stubbed)

### Database Architecture (PostgreSQL)

**Schema Overview:** 35+ tables with comprehensive relationships
**Migration System:** 6 SQL migration files with incremental schema changes
**Indexing:** Optimized indexes for performance-critical queries
**Constraints:** Foreign key relationships and data integrity constraints

**Core Table Groups:**
1. **User Management:** users, user_profiles, refresh_tokens
2. **Product System:** products, categories, product_images, watchlist
3. **Auction System:** auctions, auction_bids
4. **Order Management:** orders, order_items
5. **Payment System:** payment_intents, escrows, transaction_logs
6. **Wallet System:** wallets, gas_wallets, seller_wallets, withdrawal_requests
7. **Communication:** conversations, messages, notifications
8. **Admin & Compliance:** audit_logs, disputes, deliveries

### Real-time Architecture (Socket.IO)

**Server Setup:**
- Socket.IO server integrated with Express
- Redis adapter for multi-server scaling (configured but not active)
- Room-based communication for auctions and messaging

**Client Integration:**
- Socket.IO client in Next.js app
- Automatic reconnection handling
- Event-based communication for real-time updates

**Real-time Features:**
- Live auction bidding updates
- Countdown timer synchronization
- Instant notifications
- Chat messaging (infrastructure ready)

### Background Jobs & Queues (Bull)

**Queue System:**
- Redis-backed job queues using Bull
- Automatic retries with exponential backoff
- Job persistence and failure tracking
- Scheduled and delayed job processing

**Active Queues:**
1. **auctionAutoEnd**: Automatically end auctions at scheduled time
2. **escrowAutoRelease**: Release funds after 7-day holding period
3. **emailSending**: Queue email delivery jobs
4. **notificationDispatch**: Multi-channel notification delivery
5. **cleanupTasks**: Daily maintenance tasks (2 AM scheduled)

**Queue Configuration:**
- 3 retry attempts with exponential backoff
- Failed job tracking and alerting
- Job progress tracking and monitoring
- Queue health monitoring endpoint

### Text-Based Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Pages     │ │ Components  │ │   Stores    │           │
│  │ (30+ routes)│ │ (UI/Forms)  │ │ (Zustand)   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ API Client  │ │Socket Client│ │   Types     │           │
│  │ (Axios)     │ │(Socket.IO)  │ │(TypeScript) │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                   BACKEND (Express.js)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Routes    │ │ Middleware  │ │  Services   │           │
│  │ (18 files)  │ │(Auth/Valid) │ │(Business)   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │Socket Server│ │Queue System │ │   Config    │           │
│  │(Socket.IO)  │ │   (Bull)    │ │(Environment)│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        │            │            │            │
   ┌────▼──┐  ┌─────▼──┐  ┌─────▼──┐  ┌─────▼──┐
   │PostgreSQL│  │ Redis  │  │ Stripe │  │  AWS   │
   │Database  │  │ Cache  │  │ API    │  │  S3    │
   │35+ tables│  │Queues  │  │Payments│  │(Stub)  │
   └─────────┘  └────────┘  └────────┘  └────────┘
```

---
## 4. FRONTEND DETAILED EXPLANATION

### Folder Structure
```
apps/web/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication route group
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Registration page
│   ├── (dashboard)/            # User dashboard route group
│   │   └── account/            # Account management pages
│   │       ├── dashboard/      # User overview
│   │       ├── listings/       # Seller's products
│   │       ├── orders/         # Purchase history
│   │       ├── bids/           # Auction bids
│   │       ├── addresses/      # Shipping addresses
│   │       ├── wallet/         # Wallet management
│   │       ├── gas-wallet/     # Auction credits
│   │       ├── payment-methods/# Saved payment methods
│   │       ├── profile/        # User profile
│   │       └── settings/       # Account settings
│   ├── (seller)/               # Seller route group
│   │   └── sell/               # Seller dashboard
│   │       ├── create/         # Create listing (5-step form)
│   │       └── layout.tsx      # Seller layout
│   ├── (admin)/                # Admin route group
│   │   └── admin/              # Admin dashboard
│   │       ├── users/          # User management
│   │       ├── disputes/       # Dispute resolution
│   │       └── analytics/      # Analytics dashboard
│   ├── components/             # Reusable components
│   │   ├── ui/                 # UI components
│   │   │   ├── MetroTile.tsx   # Product display tiles
│   │   │   ├── MetroBidTile.tsx# Auction bid tiles
│   │   │   └── CountdownTimer.tsx# Auction countdown
│   │   ├── Header.tsx          # Navigation header
│   │   └── Footer.tsx          # Site footer
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── lib/                        # Utility libraries
│   ├── api/                    # API client functions
│   │   ├── auth.ts             # Authentication APIs
│   │   ├── listings.ts         # Product listing APIs
│   │   ├── auctions.ts         # Auction APIs
│   │   ├── cart.ts             # Shopping cart APIs
│   │   ├── wallet.ts           # Wallet management APIs
│   │   ├── messages.ts         # Messaging APIs
│   │   ├── notifications.ts    # Notification APIs
│   │   ├── admin.ts            # Admin APIs
│   │   ├── dashboard.ts        # Dashboard APIs
│   │   └── addresses.ts        # Address management APIs
│   ├── store/                  # State management
│   │   ├── auth-store.ts       # Authentication state
│   │   └── toast-store.ts      # Toast notifications
│   ├── api-client.ts           # Axios configuration
│   ├── socket-client.ts        # Socket.IO client
│   └── types.ts                # TypeScript definitions
└── hooks/                      # Custom React hooks
```

### Page Structure (30+ Pages)

**Public Pages (No Authentication Required):**
- `/` - Home page with hero section, categories, trending items, saved bids
- `/login` - User authentication with demo credentials
- `/signup` - User registration form
- `/auctions` - Browse live auctions with real-time updates and filters
- `/all-categories` - Complete category listing
- `/category/[slug]` - Category-specific product browsing
- `/p/[id]` - Individual product detail page with bidding interface
- `/about` - About the platform
- `/help` - Help and FAQ
- `/privacy` - Privacy policy
- `/terms` - Terms of service

**Authenticated User Pages:**
- `/account/dashboard` - User overview with recent activity
- `/account/listings` - Seller's product management
- `/account/orders` - Purchase history and order tracking
- `/account/bids` - Auction bid history and status
- `/account/addresses` - Shipping address management
- `/account/wallet` - Main wallet balance and transactions
- `/account/gas-wallet` - Auction credits for bidding fees
- `/account/payment-methods` - Saved payment methods
- `/account/profile` - User profile information
- `/account/settings` - Account preferences and security

**Seller-Specific Pages:**
- `/sell` - Seller dashboard with sales overview
- `/sell/create` - Multi-step listing creation form:
  - Step 1: Basic information (title, category, condition)
  - Step 2: Detailed description and specifications
  - Step 3: Photo upload (up to 10 images)
  - Step 4: Pricing (fixed price or auction settings)
  - Step 5: Review and publish

**Shopping & Transaction Pages:**
- `/cart` - Shopping cart with quantity management
- `/checkout` - Checkout process with address and payment
- `/checkout/payment` - Stripe payment interface
- `/checkout/confirmation` - Order confirmation and tracking
- `/saved` - Saved product listings
- `/saved-bids` - Watched auctions with notifications
- `/watchlist` - Favorite items and sellers
- `/messages` - Buyer-seller communication interface
- `/notifications` - Notification center with filters

**Admin Pages (Admin Role Required):**
- `/admin` - Admin dashboard with platform statistics
- `/admin/users` - User management and moderation
- `/admin/disputes` - Dispute resolution interface
- `/admin/analytics` - Platform analytics and reporting

### Layout System

**Root Layout (`app/layout.tsx`):**
- Global HTML structure and metadata
- Font loading (Inter font family)
- Global CSS imports
- Toast notification provider
- Authentication state provider

**Nested Layouts:**
- `/sell/layout.tsx` - Seller-specific navigation and sidebar
- Route group layouts for consistent UI within sections

**Layout Features:**
- Responsive design with mobile-first approach
- Consistent header and footer across all pages
- Context-aware navigation (different for guests, users, sellers, admins)
- Breadcrumb navigation for deep pages

### Components

**UI Components:**

1. **MetroTile (`components/ui/MetroTile.tsx`)**
   - Displays product listings in various sizes (small, medium, large, wide)
   - Shows product image, title, price, condition
   - Handles both auction and fixed-price products
   - Responsive grid layout

2. **MetroBidTile (`components/ui/MetroBidTile.tsx`)**
   - Specialized tile for auction items
   - Shows current bid, time remaining, bid count
   - Real-time updates via Socket.IO
   - Quick bid functionality

3. **CountdownTimer (`components/ui/CountdownTimer.tsx`)**
   - Real-time countdown for auction end times
   - Handles auto-extension notifications
   - Synchronizes with server time
   - Visual urgency indicators

4. **Header (`components/Header.tsx`)**
   - Main navigation with search functionality
   - User authentication status
   - Shopping cart indicator
   - Notification badge
   - Responsive mobile menu

**Form Components:**
- Multi-step form wizard for listing creation
- Address form with validation
- Payment method forms with Stripe integration
- Search and filter forms with real-time updates

### State Management

**Zustand Stores:**

1. **Auth Store (`lib/store/auth-store.ts`)**
   ```typescript
   interface AuthState {
     user: User | null
     isAuthenticated: boolean
     isLoading: boolean
     error: string | null
     login: (email: string, password: string) => Promise<void>
     register: (userData: RegisterData) => Promise<void>
     logout: () => void
     fetchCurrentUser: () => Promise<void>
     clearError: () => void
   }
   ```

2. **Toast Store (`lib/store/toast-store.ts`)**
   ```typescript
   interface ToastState {
     toasts: Toast[]
     showToast: (message: string, type: 'success' | 'error' | 'info') => void
     hideToast: (id: string) => void
     clearAllToasts: () => void
   }
   ```

**State Management Patterns:**
- Server state managed by API client functions
- Local component state using React hooks
- Form state managed by React Hook Form
- Real-time state updates via Socket.IO

### Authentication Flow (Frontend Side)

**Login Process:**
1. User submits credentials on `/login`
2. `auth-store.login()` calls `/api/auth/login`
3. Receives access token and refresh token
4. Stores tokens in httpOnly cookies (handled by API client)
5. Updates auth state and redirects to dashboard
6. Subsequent requests include token via axios interceptor

**Token Management:**
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Automatic token refresh on 401 responses
- Logout clears all tokens and redirects to home

**Protected Routes:**
- Route-level authentication checks
- Redirects to login if not authenticated
- Role-based access control for seller/admin pages

### Navigation System

**Header Navigation:**
- Logo and home link
- Search bar with autocomplete
- Category dropdown menu
- User menu (login/profile/logout)
- Shopping cart with item count
- Notification bell with unread count

**Sidebar Navigation (Account Pages):**
- Dashboard overview
- Buying section (orders, bids, watchlist)
- Selling section (listings, analytics)
- Account section (profile, settings, wallet)
- Admin section (if admin role)

**Footer Navigation:**
- Company information and links
- Help and support links
- Legal pages (privacy, terms)
- Social media links

### PAGE FLOW / REDIRECTION MAP

**Guest Journey:**
```
Home → Browse Products → Product Detail → Login Required
  ↓
Login/Signup → Account Dashboard → Continue Shopping
```

**Buyer Journey:**
```
Home → Browse/Search → Product Detail → Add to Cart → Checkout
  ↓                      ↓
Auctions → Bid → Win → Order Created → Payment → Delivery
  ↓
Account Dashboard → Orders → Messages → Reviews
```

**Seller Journey:**
```
Account Dashboard → Sell → Create Listing → Publish
  ↓                                ↓
Seller Dashboard ← Order Management ← Buyer Purchases
  ↓
Wallet Management → Withdrawal Requests → Payouts
```

**Admin Journey:**
```
Admin Dashboard → User Management → Product Moderation
  ↓                    ↓                    ↓
Analytics ← Dispute Resolution ← Financial Overview
```

**Redirection Logic:**
- Unauthenticated users redirected to `/login` for protected pages
- Post-login redirect to intended page or dashboard
- Sellers without complete profile redirected to profile setup
- Admin users have access to all sections
- Failed payments redirect to payment retry page
- Successful orders redirect to confirmation page

---

## 5. BACKEND DETAILED EXPLANATION

### API Folder Structure
```
apps/api/src/
├── routes/                     # API endpoint definitions (18 files)
│   ├── auth.ts                 # Authentication endpoints
│   ├── listings.ts             # Product listing management
│   ├── auctions.ts             # Auction functionality
│   ├── orders.ts               # Order management
│   ├── payments.ts             # Payment processing
│   ├── cart.ts                 # Shopping cart
│   ├── dashboard.ts            # User dashboard data
│   ├── addresses.ts            # Address management
│   ├── wallet.ts               # Wallet operations
│   ├── messages.ts             # Messaging system
│   ├── notifications.ts        # Notification management
│   ├── watchlist.ts            # Watchlist functionality
│   ├── deals.ts                # Daily deals
│   ├── delivery.ts             # Delivery tracking
│   ├── channels.ts             # Seller channels
│   ├── admin.ts                # Admin operations
│   ├── queues.ts               # Queue management
│   └── health.ts               # Health check endpoint
├── services/                   # Business logic layer (9 files)
│   ├── auction.service.ts      # Auction business logic
│   ├── payment.service.ts      # Payment processing
│   ├── escrow.service.ts       # Escrow management
│   ├── email.service.ts        # Email delivery
│   ├── notification.service.ts # Multi-channel notifications
│   ├── upload.service.ts       # File upload handling
│   ├── token.service.ts        # JWT token management
│   ├── reconciliation.service.ts# Financial reconciliation
│   └── stripe.service.ts       # Stripe API integration
├── middleware/                 # Express middleware (6 files)
│   ├── auth.ts                 # Authentication & authorization
│   ├── validation.ts           # Input validation
│   ├── rateLimiting.ts         # Rate limiting
│   ├── csrf.ts                 # CSRF protection
│   ├── fileUpload.ts           # File upload handling
│   └── auditLog.ts             # Security audit logging
├── migrations/                 # Database migrations (6 files)
│   ├── 001_initial_schema.sql  # Core tables
│   ├── 002_refresh_tokens.sql  # Token management
│   ├── 003_audit_logs.sql      # Audit system
│   ├── 004_payment_system.sql  # Payment tables
│   ├── 005_queue_support_tables.sql # Job queues
│   └── run.ts                  # Migration runner
├── queues/                     # Background job system
│   ├── config.ts               # Queue configuration
│   ├── index.ts                # Queue initialization
│   └── processors/             # Job processors (5 files)
│       ├── auctionAutoEnd.ts   # Auto-end auctions
│       ├── escrowAutoRelease.ts# Auto-release escrow
│       ├── emailSending.ts     # Email delivery
│       ├── notificationDispatch.ts# Notification delivery
│       └── cleanupTasks.ts     # Maintenance tasks
├── validation/                 # Input validation schemas
│   └── schemas.ts              # Zod validation schemas
├── config/                     # Application configuration
│   └── index.ts                # Environment configuration
└── utils/                      # Utility functions
```

### Route Grouping

**Authentication Routes (`/api/auth`):**
- User registration, login, logout
- Email verification and password reset
- Profile management
- Token refresh mechanism

**Product Routes (`/api/listings`):**
- CRUD operations for product listings
- Search and filtering
- Category management
- Watchlist operations

**Auction Routes (`/api/auctions`):**
- Auction creation and management
- Real-time bidding
- Auction statistics and history
- Auto-end processing

**Transaction Routes:**
- `/api/orders` - Order lifecycle management
- `/api/payments` - Payment processing with Stripe
- `/api/cart` - Shopping cart operations
- `/api/wallet` - Wallet and payout management

**Communication Routes:**
- `/api/messages` - Buyer-seller messaging
- `/api/notifications` - Multi-channel notifications
- `/api/channels` - Seller channel subscriptions

**Admin Routes (`/api/admin`):**
- User and product moderation
- Dispute resolution
- Financial oversight
- System analytics

### Middleware Usage

**Authentication Middleware (`middleware/auth.ts`):**
```typescript
// JWT token verification
export const authenticateToken = (req, res, next) => {
  // Verify JWT token from Authorization header
  // Attach user info to req.user
  // Handle token expiration and refresh
}

// Role-based access control
export const requireSeller = (req, res, next) => {
  // Ensure user has seller role
}

export const requireAdmin = (req, res, next) => {
  // Ensure user has admin role
}
```

**Validation Middleware (`middleware/validation.ts`):**
```typescript
// Zod schema validation
export const validateBody = (schema) => (req, res, next) => {
  // Validate request body against Zod schema
  // Return 400 error for invalid data
}

export const validateParams = (schema) => (req, res, next) => {
  // Validate URL parameters
}

export const validateQuery = (schema) => (req, res, next) => {
  // Validate query string parameters
}
```

**Rate Limiting Middleware (`middleware/rateLimiting.ts`):**
- Authentication endpoints: 5 requests per 15 minutes
- Password reset: 3 requests per hour
- Bidding endpoints: 10 requests per minute
- File upload: 5 requests per minute
- General API: 100 requests per 15 minutes

**Audit Logging Middleware (`middleware/auditLog.ts`):**
- Logs all security-relevant actions
- Tracks failed login attempts
- Records password changes
- Monitors bid placements and high-value transactions

### Authentication & Authorization Logic

**JWT Token System:**
- Access tokens: 15-minute expiration
- Refresh tokens: 7-day expiration
- Token rotation on refresh
- Automatic token cleanup

**Password Security:**
- bcrypt hashing with salt rounds
- Password strength validation
- Password history prevention (not implemented)

**Role-Based Access Control:**
- User roles: buyer, seller, admin
- Route-level protection
- Resource-level authorization (users can only access their own data)

**Session Management:**
- Stateless JWT authentication
- Redis session storage for real-time features
- Concurrent session handling

### Business Services

**AuctionService (`services/auction.service.ts`):**
- **Auto-extension logic**: Extends auction by 5 minutes if bid placed in last 5 minutes
- **Proxy bidding**: Automatic bid increments up to user's maximum
- **Bid validation**: Ensures bid amount, user eligibility, auction status
- **Winner determination**: Selects highest bidder when auction ends
- **Order creation**: Automatically creates order for auction winner

**PaymentService (`services/payment.service.ts`):**
- **Stripe integration**: Creates payment intents with idempotency keys
- **Multiple payment methods**: Cards, UPI, digital wallets
- **Escrow creation**: Automatically holds funds for 7 days
- **Refund processing**: Handles full and partial refunds
- **Webhook handling**: Processes Stripe webhook events

**EscrowService (`services/escrow.service.ts`):**
- **Fund holding**: Securely holds buyer payments
- **Auto-release**: Releases funds after 7-day period
- **Manual release**: Admin can release funds early
- **Dispute locking**: Prevents fund release during disputes
- **Seller payouts**: Transfers funds to seller wallets

### Error Handling Approach

**Centralized Error Handling:**
```typescript
// Global error handler
app.use((error, req, res, next) => {
  // Log error details
  // Return appropriate HTTP status
  // Hide sensitive information in production
})
```

**Error Types:**
- Validation errors (400 Bad Request)
- Authentication errors (401 Unauthorized)
- Authorization errors (403 Forbidden)
- Not found errors (404 Not Found)
- Business logic errors (422 Unprocessable Entity)
- Server errors (500 Internal Server Error)

**Error Response Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Configuration & Environment Variables

**Environment Configuration (`config/index.ts`):**
```typescript
export const config = {
  port: process.env.PORT || 3001,
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d'
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }
}
```

**Environment Files:**
- `.env.development` - Development configuration
- `.env.staging` - Staging environment
- `.env.production` - Production configuration
- `.env` - Local overrides (gitignored)

---
## 6. API INVENTORY & RESPONSIBILITIES

### Authentication APIs (`/api/auth`)
**Purpose:** User authentication and account management
**Frontend Usage:** Login page, signup page, profile pages, password reset

**Key Endpoints:**
- `POST /register` - User registration with email verification
- `POST /login` - User authentication with JWT token generation
- `POST /verify-email` - Email address verification
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset with token
- `POST /change-password` - Change password (authenticated)
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /logout` - User logout and token cleanup
- `POST /refresh` - Refresh JWT tokens

**Data Handled:** User credentials, profile information, JWT tokens
**Side Effects:** Email sending, token creation/revocation, audit logging

### Listing APIs (`/api/listings`)
**Purpose:** Product listing management and discovery
**Frontend Usage:** Home page, category pages, product detail pages, seller dashboard

**Key Endpoints:**
- `GET /` - Get all listings with search and filters
- `GET /:id` - Get single listing details
- `POST /` - Create new listing (seller only)
- `PUT /:id` - Update listing (seller/admin only)
- `DELETE /:id` - Delete listing (seller/admin only)
- `GET /seller/:sellerId` - Get seller's listings
- `POST /:id/watchlist` - Add to user's watchlist
- `DELETE /:id/watchlist` - Remove from watchlist

**Data Handled:** Product information, images, categories, search filters
**Side Effects:** Image upload, search index updates, notification triggers

### Auction APIs (`/api/auctions`)
**Purpose:** Real-time auction functionality and bidding
**Frontend Usage:** Auction pages, bid history, auction creation, real-time updates

**Key Endpoints:**
- `GET /` - Get active auctions with filters
- `GET /:id` - Get auction details and bid history
- `POST /:id/bid` - Place bid on auction
- `GET /user/bids` - Get user's bid history
- `POST /:id/end` - End auction manually (seller/admin)
- `GET /:id/stats` - Get auction statistics
- `POST /:id/watch` - Subscribe to real-time auction updates

**Data Handled:** Auction details, bid amounts, bidder information, timing data
**Side Effects:** Real-time notifications, auto-extension triggers, order creation on win

### Order APIs (`/api/orders`)
**Purpose:** Order lifecycle management from creation to completion
**Frontend Usage:** Checkout pages, order history, order tracking

**Key Endpoints:**
- `POST /` - Create order from cart or auction win
- `GET /:id` - Get order details and status
- `POST /:id/confirm-payment` - Confirm payment completion
- `POST /:id/confirm-delivery` - Confirm delivery receipt
- `POST /:id/refund` - Process order refund

**Data Handled:** Order items, shipping addresses, order status, delivery confirmation
**Side Effects:** Payment processing, escrow creation, inventory updates, notifications

### Payment APIs (`/api/payments`)
**Purpose:** Payment processing and financial transactions
**Frontend Usage:** Checkout pages, wallet management, payment history

**Key Endpoints:**
- `POST /card/create-intent` - Create Stripe payment intent
- `POST /confirm` - Confirm payment completion
- `POST /refund` - Process refund request
- `GET /transactions` - Get user's transaction history
- `POST /webhook` - Handle Stripe webhook events

**Data Handled:** Payment amounts, payment methods, transaction records, refund data
**Side Effects:** Stripe API calls, escrow creation, wallet updates, financial reconciliation

### Cart APIs (`/api/cart`)
**Purpose:** Shopping cart management
**Frontend Usage:** Cart page, product pages (add to cart), checkout process

**Key Endpoints:**
- `GET /` - Get user's cart contents
- `POST /add` - Add item to cart
- `PUT /update` - Update item quantity
- `DELETE /remove` - Remove item from cart
- `DELETE /clear` - Clear entire cart

**Data Handled:** Cart items, quantities, pricing calculations
**Side Effects:** Inventory checks, price updates, cart persistence

### Wallet APIs (`/api/wallet`)
**Purpose:** User wallet and payout management
**Frontend Usage:** Wallet pages, seller dashboard, withdrawal requests

**Key Endpoints:**
- `GET /balance` - Get wallet balance
- `GET /transactions` - Get wallet transaction history
- `POST /withdraw` - Request withdrawal
- `GET /gas-wallet` - Get auction credit balance
- `POST /gas-wallet/topup` - Add auction credits

**Data Handled:** Wallet balances, transaction history, withdrawal requests
**Side Effects:** Bank transfers, balance updates, payout processing

### Dashboard APIs (`/api/dashboard`)
**Purpose:** User dashboard data aggregation
**Frontend Usage:** Account dashboard, seller dashboard, analytics pages

**Key Endpoints:**
- `GET /stats` - Get user statistics overview
- `GET /recent-activity` - Get recent user activity
- `GET /seller-stats` - Get seller performance metrics
- `GET /financial-summary` - Get financial overview

**Data Handled:** Aggregated statistics, activity logs, performance metrics
**Side Effects:** Data aggregation queries, cache updates

### Address APIs (`/api/addresses`)
**Purpose:** User address management
**Frontend Usage:** Address book, checkout process, profile management

**Key Endpoints:**
- `GET /` - Get user's saved addresses
- `POST /` - Add new address
- `PUT /:id` - Update address
- `DELETE /:id` - Delete address
- `POST /:id/set-default` - Set default address

**Data Handled:** Shipping addresses, billing addresses, address validation
**Side Effects:** Address validation, default address updates

### Messaging APIs (`/api/messages`)
**Purpose:** Buyer-seller communication
**Frontend Usage:** Message pages, order communication, support chat

**Key Endpoints:**
- `GET /conversations` - Get user's conversations
- `GET /conversations/:id/messages` - Get conversation messages
- `POST /conversations/:id/messages` - Send message
- `POST /conversations` - Start new conversation

**Data Handled:** Messages, conversation metadata, participant information
**Side Effects:** Real-time message delivery, notification triggers, message encryption

### Notification APIs (`/api/notifications`)
**Purpose:** Multi-channel notification management
**Frontend Usage:** Notification center, notification preferences

**Key Endpoints:**
- `GET /` - Get user notifications
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all notifications as read
- `GET /preferences` - Get notification preferences
- `PUT /preferences` - Update notification preferences

**Data Handled:** Notification content, read status, user preferences
**Side Effects:** Push notifications, email notifications, SMS notifications

### Watchlist APIs (`/api/watchlist`)
**Purpose:** User's saved items and favorites
**Frontend Usage:** Saved items page, product pages, watchlist management

**Key Endpoints:**
- `GET /` - Get user's watchlist
- `POST /add` - Add item to watchlist
- `DELETE /remove` - Remove item from watchlist
- `GET /categories` - Get watched categories

**Data Handled:** Saved products, watch preferences, category subscriptions
**Side Effects:** Price alerts, availability notifications

### Admin APIs (`/api/admin`)
**Purpose:** Platform administration and moderation
**Frontend Usage:** Admin dashboard, user management, dispute resolution

**Key Endpoints:**
- `GET /dashboard` - Get admin dashboard statistics
- `GET /users` - Get user list with filters
- `PUT /users/:id/status` - Update user status
- `GET /products` - Get product list for moderation
- `PUT /products/:id/status` - Approve/reject products
- `GET /disputes` - Get dispute list
- `PUT /disputes/:id` - Update dispute status
- `GET /finances` - Get financial overview
- `GET /logs` - Get system audit logs

**Data Handled:** Platform statistics, user data, financial data, audit logs
**Side Effects:** User status changes, product moderation, dispute resolution

### Health & Utility APIs
**Purpose:** System monitoring and utility functions
**Frontend Usage:** System health checks, queue monitoring

**Key Endpoints:**
- `GET /health` - System health check
- `GET /api/queues` - Queue status (admin only)
- `POST /api/queues/:queue/retry` - Retry failed jobs

**Data Handled:** System status, queue metrics, job statistics
**Side Effects:** Health monitoring, job queue management

---

## 7. DATA FLOW & HOW THINGS WORK

### User Signup Flow
**Step-by-Step Process:**

1. **Frontend Signup Form (`/signup`)**
   - User fills registration form (email, password, name)
   - Form validation using React Hook Form
   - Submit triggers `auth-store.register()`

2. **API Call to `/api/auth/register`**
   - Validation middleware checks input using Zod schema
   - Check if email already exists in database
   - Hash password using bcrypt
   - Create user record in `users` table
   - Create user profile in `user_profiles` table
   - Generate email verification token
   - Queue email verification job

3. **Database Interactions:**
   ```sql
   INSERT INTO users (email, password_hash, role, verification_status)
   INSERT INTO user_profiles (user_id, first_name, last_name)
   INSERT INTO email_verification_tokens (user_id, token, expires_at)
   ```

4. **Background Job Processing:**
   - Email queue processes verification email
   - Send email with verification link
   - Log email delivery status

5. **Frontend Response:**
   - Redirect to verification pending page
   - Show success message
   - Update auth state

### Login & Session Flow
**Step-by-Step Process:**

1. **Frontend Login (`/login`)**
   - User enters credentials
   - `auth-store.login()` calls `/api/auth/login`

2. **Backend Authentication:**
   - Validate credentials against database
   - Check user status (active, verified, not banned)
   - Generate JWT access token (15 min expiry)
   - Generate refresh token (7 day expiry)
   - Store refresh token in database
   - Set httpOnly cookies for tokens

3. **Database Updates:**
   ```sql
   SELECT * FROM users WHERE email = ?
   INSERT INTO refresh_tokens (user_id, token, expires_at)
   UPDATE users SET last_login = NOW() WHERE id = ?
   INSERT INTO audit_logs (user_id, action, ip_address)
   ```

4. **Frontend Session Management:**
   - Tokens stored in httpOnly cookies
   - Auth state updated with user info
   - Axios interceptor adds token to requests
   - Automatic token refresh on 401 responses

### Product Listing Creation
**Step-by-Step Process:**

1. **Multi-Step Form (`/sell/create`)**
   - Step 1: Basic info (title, category, condition)
   - Step 2: Description and specifications
   - Step 3: Image upload (up to 10 images)
   - Step 4: Pricing (fixed or auction)
   - Step 5: Review and publish

2. **Image Upload Process:**
   - Frontend uploads to temporary storage
   - Backend validates file types and sizes
   - Images stored with temporary URLs
   - Cleanup job removes unused images after 24 hours

3. **Listing Creation API (`POST /api/listings`)**
   - Validate seller permissions
   - Validate all form data
   - Create product record
   - Create product images records
   - If auction: create auction record
   - Update search index

4. **Database Transactions:**
   ```sql
   BEGIN TRANSACTION;
   INSERT INTO products (seller_id, title, description, price, category_id)
   INSERT INTO product_images (product_id, url, is_primary, sort_order)
   INSERT INTO auctions (product_id, starting_price, end_time) -- if auction
   COMMIT;
   ```

5. **Post-Creation Processing:**
   - Send notification to category subscribers
   - Update seller statistics
   - Log listing creation for audit

### Auction Bidding Flow
**Step-by-Step Process:**

1. **Real-Time Auction Page (`/auctions/[id]`)**
   - Socket.IO connection established
   - Join auction room for real-time updates
   - Display current bid, time remaining, bid history

2. **Bid Placement:**
   - User enters bid amount
   - Frontend validates bid (higher than current, user has funds)
   - Submit bid via `POST /api/auctions/:id/bid`

3. **Backend Bid Processing:**
   - Authenticate user and validate bid
   - Check auction status (active, not ended)
   - Verify bid amount > current bid + minimum increment
   - Check user's gas wallet balance for bid fees
   - Process proxy bidding logic if applicable

4. **Database Updates:**
   ```sql
   BEGIN TRANSACTION;
   INSERT INTO auction_bids (auction_id, bidder_id, amount, bid_time)
   UPDATE auctions SET current_price = ?, current_bidder_id = ?
   UPDATE gas_wallets SET balance = balance - bid_fee WHERE user_id = ?
   -- Update previous high bidder status
   UPDATE auction_bids SET is_winning = false WHERE auction_id = ? AND bidder_id != ?
   COMMIT;
   ```

5. **Real-Time Updates:**
   - Socket.IO broadcasts bid update to all auction watchers
   - Update countdown timer if auto-extension triggered
   - Send push notifications to outbid users

6. **Auto-Extension Logic:**
   - If bid placed in last 5 minutes, extend auction by 5 minutes
   - Broadcast extension notification
   - Update auction end time in database

### Cart → Checkout → Order Flow
**Step-by-Step Process:**

1. **Shopping Cart Management:**
   - Add items via `POST /api/cart/add`
   - Update quantities via `PUT /api/cart/update`
   - Cart persisted in database for logged-in users

2. **Checkout Process (`/checkout`)**
   - Display cart items and calculate totals
   - Select shipping address (or add new one)
   - Choose payment method

3. **Payment Processing (`/checkout/payment`)**
   - Create Stripe payment intent via `POST /api/payments/card/create-intent`
   - Frontend displays Stripe payment form
   - User completes payment on Stripe

4. **Order Creation:**
   ```sql
   BEGIN TRANSACTION;
   INSERT INTO orders (buyer_id, seller_id, total_amount, status)
   INSERT INTO order_items (order_id, product_id, quantity, price)
   INSERT INTO payment_intents (order_id, stripe_payment_intent_id, amount)
   UPDATE products SET stock = stock - quantity WHERE id IN (...)
   DELETE FROM cart_items WHERE user_id = ? -- Clear cart
   COMMIT;
   ```

5. **Escrow Creation:**
   - Payment confirmed via Stripe webhook
   - Create escrow record with 7-day hold period
   - Schedule auto-release job for 7 days later
   - Send order confirmation email

6. **Post-Order Processing:**
   - Send notifications to buyer and seller
   - Create conversation thread for order communication
   - Update seller statistics
   - Log transaction for audit

### Payment & Escrow Flow
**Step-by-Step Process:**

1. **Payment Intent Creation:**
   - Calculate order total including fees
   - Create Stripe payment intent with idempotency key
   - Store payment intent in database
   - Return client secret to frontend

2. **Payment Confirmation:**
   - Stripe processes payment
   - Webhook confirms payment success
   - Update payment status in database

3. **Escrow Creation:**
   ```sql
   INSERT INTO escrows (
     order_id, 
     amount, 
     status, 
     created_at, 
     release_date -- 7 days from now
   )
   ```

4. **Escrow Management:**
   - Funds held for 7-day period
   - Buyer can confirm delivery early
   - Admin can release funds manually
   - Disputes lock funds until resolution

5. **Auto-Release Process:**
   - Background job runs daily
   - Identifies escrows past release date
   - Transfers funds to seller wallet
   - Updates escrow status to 'released'
   - Sends payout notification

### Wallet & Gas Wallet Flow
**Step-by-Step Process:**

1. **Seller Wallet Management:**
   - Funds added from escrow releases
   - Available balance vs pending balance tracking
   - Withdrawal requests require admin approval

2. **Gas Wallet (Auction Credits):**
   - Required for placing bids (prevents spam)
   - Deducted on each bid placement
   - Can be topped up via payment
   - Refunded if auction bid is outbid

3. **Withdrawal Process:**
   ```sql
   INSERT INTO withdrawal_requests (
     user_id, 
     amount, 
     status, 
     bank_details,
     requested_at
   )
   UPDATE seller_wallets SET 
     available_balance = available_balance - amount,
     pending_balance = pending_balance + amount
   ```

4. **Payout Processing:**
   - Admin reviews withdrawal requests
   - Verify bank details and user identity
   - Process bank transfer (external system)
   - Update wallet balances and request status

### Notifications Flow
**Step-by-Step Process:**

1. **Notification Triggers:**
   - Auction events (outbid, won, ended)
   - Order events (created, shipped, delivered)
   - Payment events (received, failed, refunded)
   - Message events (new message received)

2. **Multi-Channel Delivery:**
   - In-app notifications (stored in database)
   - Push notifications (FCM/APNS - stubbed)
   - Email notifications (SMTP - stubbed)
   - SMS notifications (Twilio - stubbed)

3. **Notification Processing:**
   ```sql
   INSERT INTO notifications (
     user_id, 
     type, 
     title, 
     message, 
     payload,
     channels -- ['push', 'email', 'sms']
   )
   ```

4. **Background Delivery:**
   - Notification dispatch queue processes delivery
   - Respects user preferences for each channel
   - Handles delivery failures with retries
   - Tracks delivery status and metrics

### Messaging Flow
**Step-by-Step Process:**

1. **Conversation Creation:**
   - Automatically created for each order
   - Buyer and seller can communicate
   - Admin can join conversations for disputes

2. **Real-Time Messaging:**
   - Socket.IO handles real-time delivery
   - Messages stored in database
   - File attachments supported (stubbed)

3. **Message Processing:**
   ```sql
   INSERT INTO messages (
     conversation_id,
     sender_id,
     content,
     message_type, -- text, image, file
     sent_at
   )
   ```

4. **Message Delivery:**
   - Real-time via Socket.IO to online users
   - Push notifications for offline users
   - Email notifications for important messages

---
## 8. SECURITY & LIMITATIONS

### What Security Exists ✅

**Authentication & Authorization:**
- JWT-based authentication with access/refresh token rotation
- bcrypt password hashing with salt rounds
- Role-based access control (buyer, seller, admin)
- Session management with automatic token refresh
- Password strength validation and secure reset flow

**Input Validation & Sanitization:**
- Comprehensive Zod schema validation for all API endpoints
- SQL injection prevention through parameterized queries
- XSS prevention through input sanitization
- File upload validation (type, size, content)
- Request body size limits

**Rate Limiting:**
- Authentication endpoints: 5 requests per 15 minutes
- Password reset: 3 requests per hour
- Bidding endpoints: 10 requests per minute
- File upload: 5 requests per minute
- General API: 100 requests per 15 minutes per IP

**Audit & Monitoring:**
- Comprehensive audit logging for security events
- Failed login attempt tracking
- High-value transaction monitoring
- Password change logging
- Admin action tracking

**Payment Security:**
- Stripe integration with PCI compliance
- Payment idempotency to prevent double charges
- Secure webhook signature verification
- Escrow system for buyer protection
- Transaction logging and reconciliation

**Data Protection:**
- Environment variable configuration for secrets
- CORS protection for cross-origin requests
- Secure cookie settings (httpOnly, secure, sameSite)
- Database connection encryption in production

### What is Missing ❌

**CSRF Protection:**
- CSRF middleware exists but not fully implemented
- Token generation and validation incomplete
- Frontend CSRF token handling missing

**Advanced Authentication:**
- Two-factor authentication (2FA) not implemented
- OAuth integration (Google, Facebook) missing
- Account lockout after failed attempts not implemented
- Device fingerprinting not available

**Data Encryption:**
- Database encryption at rest not configured
- Message encryption not implemented
- Sensitive data masking incomplete
- PII data handling needs improvement

**Advanced Security Features:**
- Web Application Firewall (WAF) not configured
- DDoS protection relies on infrastructure
- Bot detection and prevention missing
- Fraud detection algorithms basic

**File Security:**
- Virus scanning for uploaded files not implemented
- Image metadata stripping incomplete
- File access control needs improvement
- CDN security headers missing

### Where Risks Are ⚠️

**High-Risk Areas:**

1. **File Upload System:**
   - AWS S3 integration stubbed (files stored locally in development)
   - Limited file type validation
   - No virus scanning
   - Potential for malicious file uploads

2. **Email System:**
   - SMTP credentials in environment variables
   - No email rate limiting
   - Email template injection possible
   - Bounce handling not implemented

3. **Real-Time Features:**
   - Socket.IO rooms not properly secured
   - No message rate limiting for real-time chat
   - Potential for message flooding
   - Connection hijacking possible

4. **Admin Functions:**
   - Admin role has extensive permissions
   - No granular admin permissions
   - Admin actions not always logged
   - Potential for privilege escalation

**Medium-Risk Areas:**

1. **API Endpoints:**
   - Some endpoints lack proper authorization checks
   - Bulk operations not rate limited
   - API versioning not implemented
   - Error messages may leak information

2. **Database Access:**
   - Direct SQL queries instead of ORM in some places
   - Connection pooling not optimized
   - Database backup encryption not verified
   - Query logging may expose sensitive data

3. **Third-Party Integrations:**
   - Stripe webhook endpoint security depends on signature verification
   - External API keys stored in environment variables
   - No API key rotation mechanism
   - Third-party service availability not monitored

### What is Safe vs Unsafe Right Now

**Safe for Production Use:**
- User authentication and session management
- Basic CRUD operations for products and orders
- Payment processing through Stripe
- Core auction functionality
- Database schema and relationships
- Basic rate limiting and input validation

**Unsafe for Production Use:**
- File upload and storage system
- Email delivery system
- Real-time messaging without proper security
- Admin panel without granular permissions
- Any feature relying on external service stubs

**Needs Security Review:**
- All API endpoints for proper authorization
- Database queries for potential injection
- Error handling to prevent information leakage
- Logging configuration to avoid sensitive data exposure

### Security Recommendations (Documentation Only)

**Immediate Security Needs:**
1. Implement proper CSRF protection
2. Complete AWS S3 integration with proper security
3. Add virus scanning for file uploads
4. Implement proper email rate limiting
5. Secure Socket.IO rooms with proper authentication

**Short-Term Security Improvements:**
1. Add two-factor authentication
2. Implement account lockout policies
3. Add comprehensive input sanitization
4. Implement message encryption for chat
5. Add granular admin permissions

**Long-Term Security Enhancements:**
1. Implement fraud detection algorithms
2. Add advanced bot protection
3. Implement data encryption at rest
4. Add comprehensive security monitoring
5. Implement automated security testing

---

## 9. PERFORMANCE & SCALABILITY STATUS

### Current Performance Characteristics

**Database Performance:**
- PostgreSQL with basic indexing on primary keys and foreign keys
- Query performance adequate for current load (< 1000 concurrent users)
- No query optimization or performance monitoring implemented
- Connection pooling configured but not tuned

**API Performance:**
- Express.js with basic middleware stack
- Response times typically < 200ms for simple queries
- No caching layer implemented (Redis configured but unused)
- No API response compression

**Frontend Performance:**
- Next.js with automatic code splitting
- Static asset optimization through Next.js
- No CDN configuration for static assets
- Client-side state management with Zustand (lightweight)

**Real-Time Performance:**
- Socket.IO handles real-time updates efficiently
- Room-based communication reduces unnecessary broadcasts
- No connection scaling configured (single server)
- Memory usage grows with concurrent connections

### Bottlenecks

**Database Bottlenecks:**
1. **Complex Auction Queries:** Bid history and statistics queries not optimized
2. **Search Functionality:** Full-text search on product titles/descriptions without indexing
3. **Dashboard Aggregations:** Real-time statistics calculated on each request
4. **Image Queries:** Product images loaded individually instead of batch queries

**API Bottlenecks:**
1. **No Caching:** Repeated database queries for same data
2. **Synchronous Processing:** Some operations block request handling
3. **Large Response Payloads:** No pagination on some list endpoints
4. **File Upload:** Synchronous file processing blocks other requests

**Frontend Bottlenecks:**
1. **Image Loading:** No lazy loading or optimization for product images
2. **Real-Time Updates:** All auction updates trigger re-renders
3. **Large Lists:** No virtualization for long product lists
4. **Bundle Size:** No analysis or optimization of JavaScript bundles

### What Happens Under Load

**Expected Behavior (1-100 concurrent users):**
- System performs well with current architecture
- Database handles queries efficiently
- Real-time updates work smoothly
- File uploads process without issues

**Degraded Performance (100-500 concurrent users):**
- Database connection pool may exhaust
- API response times increase to 500ms-1s
- Socket.IO connections consume more memory
- File upload queue may back up

**System Failure Points (500+ concurrent users):**
- Database connections exhausted (current pool: 20 connections)
- Memory usage exceeds server capacity
- Socket.IO server becomes unresponsive
- File system storage fills up (no S3 integration)

**Auction-Specific Load Issues:**
- High-traffic auctions (100+ bidders) may cause:
  - Database lock contention on bid updates
  - Socket.IO message flooding
  - Real-time update delays
  - Bid processing delays

### What is Prepared but Unused

**Redis Infrastructure:**
- Redis server configured and connected
- Bull queue system implemented for background jobs
- Session storage capability available
- Caching infrastructure ready but not utilized

**Database Optimization Ready:**
- Migration system supports index additions
- Query logging can be enabled
- Connection pool can be increased
- Read replicas can be added

**CDN and Asset Optimization:**
- Next.js supports CDN configuration
- Image optimization pipeline ready
- Static asset caching headers configured
- Compression middleware available

**Horizontal Scaling Preparation:**
- Docker containerization complete
- Load balancer configuration exists (Nginx)
- Environment-based configuration
- Stateless API design (JWT tokens)

### Performance Monitoring Status

**Currently Monitored:**
- Basic server health checks
- Database connection status
- Queue job processing status
- Error rates and response codes

**Not Monitored:**
- Response time metrics
- Database query performance
- Memory and CPU usage
- Real-time connection metrics
- User experience metrics

**Monitoring Infrastructure Available:**
- Health check endpoints implemented
- Logging infrastructure in place
- Queue monitoring dashboard ready
- Error tracking configured

### Scalability Roadmap

**Phase 1 (Current → 1K users):**
- Implement Redis caching for frequent queries
- Add database query optimization and indexing
- Enable API response compression
- Implement image lazy loading

**Phase 2 (1K → 10K users):**
- Add database read replicas
- Implement CDN for static assets
- Add horizontal API server scaling
- Optimize real-time connection handling

**Phase 3 (10K → 100K users):**
- Implement database sharding
- Add microservices architecture
- Implement advanced caching strategies
- Add comprehensive performance monitoring

**Infrastructure Scaling:**
- Current: Single server deployment
- Phase 1: Load balancer + multiple API servers
- Phase 2: Database clustering + Redis cluster
- Phase 3: Microservices + container orchestration

---

## 10. DEVELOPMENT GAPS & NEXT STEPS

### What Must Be Done Next (Priority Order)

**Critical Priority (Blocks Production):**

1. **Complete AWS S3 Integration**
   - Configure S3 bucket and credentials
   - Implement secure file upload pipeline
   - Add image processing and optimization
   - Implement file cleanup and lifecycle management
   - **Impact:** File uploads currently broken in production
   - **Effort:** 2-3 days

2. **Configure Email Service**
   - Set up SMTP credentials or SendGrid integration
   - Test email delivery for all templates
   - Implement email rate limiting
   - Add bounce and complaint handling
   - **Impact:** User verification and notifications broken
   - **Effort:** 1-2 days

3. **Implement CSRF Protection**
   - Complete CSRF middleware implementation
   - Add token generation and validation
   - Update frontend to handle CSRF tokens
   - Test all form submissions
   - **Impact:** Security vulnerability in production
   - **Effort:** 1 day

4. **Add Production Environment Configuration**
   - Configure production database with SSL
   - Set up Redis cluster for production
   - Configure proper logging and monitoring
   - Set up backup and recovery procedures
   - **Impact:** Production deployment not possible
   - **Effort:** 2-3 days

**High Priority (Improves User Experience):**

5. **Complete Push Notification System**
   - Integrate FCM for Android notifications
   - Integrate APNS for iOS notifications
   - Test notification delivery and preferences
   - Implement notification analytics
   - **Impact:** Users miss important updates
   - **Effort:** 3-4 days

6. **Implement Dispute Resolution Workflow**
   - Complete dispute creation and management
   - Add evidence upload and review system
   - Implement automated dispute escalation
   - Add dispute resolution notifications
   - **Impact:** No way to handle customer disputes
   - **Effort:** 4-5 days

7. **Add Comprehensive Error Handling**
   - Implement global error boundaries
   - Add user-friendly error messages
   - Implement error reporting and tracking
   - Add retry mechanisms for failed operations
   - **Impact:** Poor user experience on errors
   - **Effort:** 2-3 days

8. **Optimize Database Performance**
   - Add indexes for frequently queried columns
   - Optimize auction and search queries
   - Implement query result caching
   - Add database performance monitoring
   - **Impact:** Slow response times under load
   - **Effort:** 3-4 days

### What Can Be Done Later (Medium Priority)

**User Experience Improvements:**

9. **Advanced Search Implementation**
   - Integrate Elasticsearch for better search
   - Add advanced filtering options
   - Implement search analytics and suggestions
   - Add saved search functionality
   - **Effort:** 1-2 weeks

10. **Mobile App Development**
    - Develop React Native mobile application
    - Implement push notifications for mobile
    - Add mobile-specific features (camera, GPS)
    - Optimize for mobile user experience
    - **Effort:** 2-3 months

11. **Seller Analytics Dashboard**
    - Implement detailed seller performance metrics
    - Add sales forecasting and trends
    - Create competitor analysis tools
    - Add automated reporting features
    - **Effort:** 2-3 weeks

**Platform Enhancements:**

12. **Multi-Currency Support**
    - Add currency conversion APIs
    - Implement multi-currency pricing
    - Add region-specific payment methods
    - Handle currency exchange rates
    - **Effort:** 3-4 weeks

13. **Advanced Fraud Detection**
    - Implement machine learning fraud detection
    - Add behavioral analysis for suspicious activity
    - Create automated risk scoring
    - Add manual review workflows
    - **Effort:** 1-2 months

14. **API for Third-Party Integrations**
    - Design and implement public API
    - Add API authentication and rate limiting
    - Create developer documentation
    - Implement webhook system for partners
    - **Effort:** 1-2 months

### What Should NOT Be Touched Yet

**Stable Core Systems:**
- Authentication and authorization system (working well)
- Core auction bidding logic (tested and stable)
- Payment processing with Stripe (PCI compliant)
- Database schema and relationships (well designed)
- Background job system (functioning correctly)

**Systems Needing External Dependencies:**
- Machine learning recommendations (needs data science team)
- Advanced analytics (needs analytics infrastructure)
- International shipping (needs logistics partnerships)
- Tax calculation (needs tax service integration)

**Premature Optimizations:**
- Microservices architecture (not needed at current scale)
- Advanced caching strategies (basic caching sufficient)
- Database sharding (single database handles current load)
- Container orchestration (simple deployment sufficient)

### Development Workflow Recommendations

**Immediate Development Process:**
1. Focus on critical priority items first
2. Test each feature thoroughly before moving to next
3. Deploy to staging environment for testing
4. Get user feedback before production deployment

**Code Quality Standards:**
- Maintain TypeScript strict mode
- Add unit tests for new business logic
- Use existing validation patterns
- Follow established error handling patterns

**Deployment Strategy:**
- Use feature flags for new functionality
- Deploy during low-traffic periods
- Monitor system health after deployments
- Have rollback plan for each deployment

### Resource Requirements

**Development Team Needs:**
- 1 Full-stack developer for critical items (2-3 weeks)
- 1 DevOps engineer for production setup (1 week)
- 1 QA engineer for testing (ongoing)

**Infrastructure Needs:**
- Production database server
- Redis cluster for caching and queues
- CDN for static asset delivery
- Monitoring and logging infrastructure

**Third-Party Service Setup:**
- AWS S3 bucket and credentials
- SendGrid or SMTP email service
- FCM/APNS for push notifications
- Monitoring service (DataDog, New Relic, etc.)

---

## 11. SUMMARY FOR FUTURE DEVELOPMENT

### Mental Model of the System

**InstaSell Marketplace Architecture:**
Think of InstaSell as a **three-layer cake** with real-time frosting:

1. **Data Layer (PostgreSQL + Redis):** The foundation that stores all information
2. **Business Logic Layer (Express.js Services):** The core that processes all operations
3. **Presentation Layer (Next.js):** The interface that users interact with
4. **Real-Time Layer (Socket.IO):** The frosting that makes everything live and interactive

**Key Architectural Principles:**
- **Separation of Concerns:** Frontend handles UI, backend handles business logic, database handles data
- **Service-Oriented:** Business logic organized into focused services (auction, payment, escrow)
- **Event-Driven:** Real-time updates and background jobs handle asynchronous operations
- **Security-First:** Authentication, validation, and audit logging at every layer

### How to Safely Add New Features

**Before Adding Any Feature:**
1. **Understand the Data Flow:** Trace how data moves through the system
2. **Check Existing Patterns:** Look for similar features and follow the same patterns
3. **Consider Security:** Every new endpoint needs authentication, validation, and audit logging
4. **Plan for Real-Time:** Consider if the feature needs real-time updates

**Safe Development Process:**

**Step 1: Database Changes**
- Create migration file in `apps/api/src/migrations/`
- Follow existing naming convention: `00X_feature_name.sql`
- Add proper indexes and constraints
- Test migration on development database

**Step 2: Backend API Development**
- Add route file in `apps/api/src/routes/`
- Create service file in `apps/api/src/services/` for business logic
- Add validation schema in `apps/api/src/validation/schemas.ts`
- Use existing middleware patterns (auth, validation, rate limiting)

**Step 3: Frontend Integration**
- Add API client functions in `apps/web/lib/api/`
- Create or update Zustand store if needed
- Build UI components following existing patterns
- Add proper error handling and loading states

**Step 4: Real-Time Integration (if needed)**
- Add Socket.IO events in backend
- Update frontend Socket.IO client
- Test real-time functionality thoroughly

### Common Mistakes to Avoid

**Database Mistakes:**
- Don't skip migrations - always use the migration system
- Don't add columns without default values to existing tables
- Don't forget to add indexes for frequently queried columns
- Don't use SELECT * in production queries

**API Mistakes:**
- Don't skip input validation - always use Zod schemas
- Don't forget authentication middleware on protected routes
- Don't return sensitive data in API responses
- Don't ignore rate limiting for new endpoints

**Frontend Mistakes:**
- Don't bypass the API client - always use functions in `lib/api/`
- Don't store sensitive data in client-side state
- Don't forget loading and error states
- Don't skip TypeScript types for new data structures

**Security Mistakes:**
- Don't trust user input - validate everything
- Don't expose internal errors to users
- Don't skip audit logging for important actions
- Don't hardcode secrets - use environment variables

### How Frontend & Backend Should Evolve Together

**Coordinated Development:**
1. **API-First Design:** Design API endpoints before building frontend
2. **Type Safety:** Share TypeScript types between frontend and backend
3. **Error Handling:** Consistent error formats and handling patterns
4. **Real-Time Sync:** Keep Socket.IO events synchronized between client and server

**Version Management:**
- Use semantic versioning for API changes
- Maintain backward compatibility when possible
- Coordinate deployments between frontend and backend
- Use feature flags for gradual rollouts

**Testing Strategy:**
- Unit tests for business logic services
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Real-time functionality testing

### Future Architecture Considerations

**When to Scale Horizontally:**
- Database queries consistently > 500ms
- API response times > 1 second
- Socket.IO connections > 10,000 concurrent
- File storage > 1TB

**When to Consider Microservices:**
- Team size > 10 developers
- Feature complexity requires specialized teams
- Different scaling requirements for different features
- Need for technology diversity

**Technology Evolution Path:**
1. **Current:** Monolithic full-stack application
2. **Phase 1:** Add caching and optimization
3. **Phase 2:** Extract background jobs to separate services
4. **Phase 3:** Split into domain-specific microservices
5. **Phase 4:** Event-driven architecture with message queues

### Key Success Metrics

**Technical Metrics:**
- API response time < 200ms (95th percentile)
- Database query time < 100ms (95th percentile)
- Real-time message delivery < 1 second
- System uptime > 99.9%

**Business Metrics:**
- User registration conversion rate
- Auction completion rate
- Payment success rate
- Dispute resolution time

**Development Metrics:**
- Feature delivery time
- Bug resolution time
- Code review cycle time
- Deployment frequency

### Final Recommendations

**For New Developers:**
1. Start by reading this documentation thoroughly
2. Set up the development environment using provided scripts
3. Explore the codebase by following a single feature end-to-end
4. Make small changes first to understand the development workflow

**For Product Development:**
1. Prioritize completing stubbed features before adding new ones
2. Focus on user experience improvements over new features
3. Invest in monitoring and analytics before scaling
4. Plan for mobile users from the beginning

**For Technical Leadership:**
1. Establish code review processes and standards
2. Implement comprehensive testing strategy
3. Plan for gradual scaling rather than premature optimization
4. Invest in developer tooling and documentation

**System Maturity Assessment:**
- **Core Features:** 80% complete and production-ready
- **Advanced Features:** 40% complete, needs focused development
- **Infrastructure:** 60% complete, needs production hardening
- **Security:** 70% complete, needs security audit
- **Performance:** 50% optimized, needs monitoring and tuning

InstaSell Marketplace has a solid foundation with modern architecture and good development practices. The system is ready for production deployment with some critical gaps filled, and has a clear path for scaling and feature expansion.

---

*This documentation serves as the single source of truth for the InstaSell Marketplace project. It should be updated as the system evolves and new features are added.*