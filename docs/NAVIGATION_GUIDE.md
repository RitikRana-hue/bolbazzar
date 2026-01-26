# 🧭 InstaSell - Quick Navigation Guide

## 🎯 Where to Find Everything

### 📱 Frontend Development
```
📁 frontend/
├── 📄 app/page.tsx              # Home page
├── 📄 app/layout.tsx             # Root layout
├── 📁 app/components/            # All React components
│   ├── 📄 Header.tsx             # Navigation header
│   ├── 📄 Footer.tsx             # Footer component
│   ├── 📄 ErrorBoundary.tsx     # Error handling
│   └── 📁 ui/                   # UI components
├── 📁 app/lib/                   # Frontend utilities
│   ├── 📄 api-client.ts          # API client
│   ├── 📄 socket-client.ts       # WebSocket client
│   ├── 📄 security.ts            # Security utilities
│   └── 📄 utils.ts               # General utilities
├── 📁 app/hooks/                 # Custom React hooks
├── 📄 package.json               # Frontend dependencies
└── 📄 next.config.js             # Next.js config
```

### 🔧 Backend Development
```
📁 backend/
├── 📁 src/
│   ├── 📁 controllers/           # API route handlers
│   ├── 📁 services/              # Business logic
│   ├── 📁 middleware/            # Express middleware
│   ├── 📁 routes/                # API endpoints
│   ├── 📁 utils/                 # Backend utilities
│   └── 📄 app.ts                 # Main app file
├── 📁 prisma/
│   └── 📄 schema.prisma          # Database schema
├── 📄 package.json               # Backend dependencies
└── 📄 tsconfig.json              # TypeScript config
```

### 🤝 Shared Resources
```
📁 shared/
├── 📁 config/
│   ├── 📄 .env.example           # Environment template
│   ├── 📄 .env.development       # Development env
│   ├── 📄 .env.staging           # Staging env
│   └── 📄 .env.production        # Production env
├── 📁 types/                     # Shared TypeScript types
└── 📁 utils/                     # Shared utilities
```

### 📚 Documentation
```
📁 docs/
├── 📄 README.md                  # Main documentation
├── 📄 PROJECT_STRUCTURE.md       # Structure details
├── 📄 INSTASELL_SYSTEM_DOCUMENTATION.md
├── 📄 PROJECT_ANALYSIS.md        # Project analysis
└── 📄 DESIGN_SYSTEM_AUDIT.md     # Design audit
```

### 🚀 Deployment & Infrastructure
```
📁 deployment/
├── 📁 infra/
│   ├── 📁 docker/                # Docker configs
│   ├── 📁 nginx/                  # Nginx configs
│   └── 📁 ssl/                    # SSL certificates
├── 📄 docker-compose.yml         # Development containers
├── 📄 docker-compose.prod.yml    # Production containers
├── 📄 ecosystem.config.js        # PM2 config
├── 📄 Makefile                    # Build automation
└── 📄 deploy-production.sh        # Deployment script
```

### ⚙️ Scripts & Utilities
```
📁 scripts/
├── 📄 setup-dev.sh               # Development setup
├── 📄 setup-production.sh        # Production setup
├── 📄 setup-db.sh                # Database setup
├── 📄 fix-all.sh                 # Quick fixes
├── 📄 run-migrations-safe.sh     # Database migrations
├── 📄 setup-database.sh          # Database init
├── 📄 validate-prisma-schema.sh  # Schema validation
├── 📄 validate-production-readiness.sh
└── 📄 validate-setup.sh          # Setup validation
```

## 🎮 Quick Commands

### Development
```bash
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Frontend only (localhost:3000)
npm run dev:backend      # Backend only (localhost:3001)
```

### Building
```bash
npm run build            # Build both
npm run build:frontend   # Frontend only
npm run build:backend    # Backend only
```

### Testing & Quality
```bash
npm run test             # Test both
npm run lint             # Lint both
```

### Database
```bash
npm run migrate          # Run migrations
npm run seed             # Seed data
```

### Deployment
```bash
npm run deploy           # Deploy to production
```

## 🔍 Finding Specific Files

### Need to modify the homepage?
→ `frontend/app/page.tsx`

### Need to change the header?
→ `frontend/app/components/Header.tsx`

### Need to add a new API endpoint?
→ `backend/src/routes/` and `backend/src/controllers/`

### Need to modify the database?
→ `backend/prisma/schema.prisma`

### Need to change environment variables?
→ `shared/config/.env*`

### Need to update deployment?
→ `deployment/` folder

### Need to run setup scripts?
→ `scripts/` folder

## 🎯 Common Tasks

### Add a new page
1. Create file in `frontend/app/`
2. Add components in `frontend/app/components/`
3. Add routes in `backend/src/routes/` (if needed)

### Add a new API endpoint
1. Create controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Add service in `backend/src/services/` (if needed)

### Update styles
1. Modify `frontend/app/globals.css`
2. Update Tailwind config: `frontend/tailwind.config.ts`
3. Add component styles in `frontend/app/components/`

### Database changes
1. Update `backend/prisma/schema.prisma`
2. Run `npm run migrate`
3. Update TypeScript types in `backend/src/types/`

## 📞 Quick Help

- **Frontend issues**: Check `frontend/` folder
- **Backend issues**: Check `backend/` folder  
- **Database issues**: Check `backend/prisma/` and run migrations
- **Deployment issues**: Check `deployment/` folder
- **Setup issues**: Run scripts from `scripts/` folder
- **Documentation**: Check `docs/` folder

## 🎉 Benefits of New Structure

✅ **Easy to find**: Everything is logically organized  
✅ **Clear separation**: Frontend, backend, and shared code分开  
✅ **Quick navigation**: Find what you need in seconds  
✅ **Better workflow**: Development, testing, deployment streamlined  
✅ **Team friendly**: Easy for new developers to onboard
