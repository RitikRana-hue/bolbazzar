# 🛍️ InstaSell - eBay-Style Marketplace

A modern, full-stack marketplace platform with real-time auctions, secure payments, and responsive design.

## 🏗️ Project Structure

```
instasell/
├── 📱 frontend/          # Next.js Web Application
├── 🔧 backend/           # Node.js API Server  
├── 🤝 shared/            # Shared Resources
├── 📚 docs/              # Documentation
├── 🚀 deployment/        # Deployment & Infrastructure
├── ⚙️ scripts/           # Utility Scripts
└── 📦 package.json       # Root Configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Redis server
- PostgreSQL database

### Installation
```bash
# Clone and setup
git clone <repository-url>
cd instasell
npm run setup

# Start development servers
npm run dev
```

### Development Commands

```bash
# Development
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Start only frontend (localhost:3000)
npm run dev:backend      # Start only backend (localhost:3001)

# Building
npm run build            # Build both frontend & backend
npm run build:frontend   # Build only frontend
npm run build:backend    # Build only backend

# Testing
npm run test             # Test both frontend & backend
npm run test:frontend    # Test only frontend
npm run test:backend     # Test only backend

# Linting
npm run lint             # Lint both frontend & backend
npm run lint:frontend    # Lint only frontend
npm run lint:backend     # Lint only backend

# Database
npm run migrate          # Run database migrations
npm run seed             # Seed database with sample data

# Docker
npm run docker:up        # Start development containers
npm run docker:down      # Stop containers
npm run docker:logs      # View container logs

# Production
npm run setup:prod       # Setup production environment
npm run deploy           # Deploy to production
```

## 📱 Frontend (Next.js)

**Location**: `frontend/`

**Tech Stack**:
- Next.js 15 with App Router
- React 18
- TypeScript
- TailwindCSS
- Zustand (state management)
- NextAuth (authentication)
- Socket.io-client (real-time)

**Key Features**:
- Real-time auctions
- User authentication
- Shopping cart & checkout
- Responsive design
- SEO optimized

## 🔧 Backend (Node.js)

**Location**: `backend/`

**Tech Stack**:
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Socket.io
- JWT authentication
- Stripe integration

**Key Features**:
- RESTful API
- Real-time WebSocket connections
- Secure payment processing
- Database migrations
- Background jobs

## 🗂️ Folder Navigation

### Frontend Structure
```
frontend/
├── app/                  # Next.js App Router
│   ├── components/       # React components
│   ├── lib/             # Frontend utilities
│   └── hooks/           # Custom hooks
├── package.json         # Frontend dependencies
└── next.config.js       # Next.js config
```

### Backend Structure
```
backend/
├── src/                 # API source code
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   └── utils/           # Backend utilities
├── prisma/              # Database schema
└── package.json        # Backend dependencies
```

## 🔗 Environment Variables

Environment files are located in `shared/config/`:

- `.env.example` - Template for all environments
- `.env.development` - Development settings
- `.env.staging` - Staging settings  
- `.env.production` - Production settings

## 📚 Documentation

All documentation is centralized in the `docs/` folder:

- `README.md` - This file
- `PROJECT_STRUCTURE.md` - Detailed structure guide
- `INSTASELL_SYSTEM_DOCUMENTATION.md` - System documentation
- `PROJECT_ANALYSIS.md` - Project analysis
- `DESIGN_SYSTEM_AUDIT.md` - Design system audit

## 🚀 Deployment

Deployment configurations are in `deployment/`:

- `docker-compose.yml` - Development containers
- `docker-compose.prod.yml` - Production containers
- `ecosystem.config.js` - PM2 configuration
- `Makefile` - Build automation
- `deploy-production.sh` - Deployment script

### Quick Deploy
```bash
# Deploy to production
npm run deploy

# Or manually
cd deployment
make deploy
```

## 🛠️ Development Workflow

### 1. Setup Development Environment
```bash
npm run setup
```

### 2. Start Development Servers
```bash
npm run dev
```

### 3. Make Changes
- Frontend changes in `frontend/`
- Backend changes in `backend/`
- Shared configs in `shared/`

### 4. Test Changes
```bash
npm run test
npm run lint
```

### 5. Build for Production
```bash
npm run build
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Frontend: localhost:3000
   - Backend: localhost:3001
   - Redis: localhost:6379
   - PostgreSQL: localhost:5432

2. **Missing Dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Database Connection**
   ```bash
   npm run migrate
   npm run seed
   ```

4. **Redis Connection**
   ```bash
   # Start Redis
   brew services start redis  # macOS
   # or
   redis-server
   ```

## 📞 Support

For issues and questions:
1. Check `docs/` for documentation
2. Review `scripts/` for setup helpers
3. Check `deployment/` for deployment issues

## 📄 License

[Add your license information here]
