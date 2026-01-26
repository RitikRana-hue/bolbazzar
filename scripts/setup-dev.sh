#!/bin/bash

# InstaSell Development Setup Script

echo "🚀 Setting up InstaSell for development..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Setup environment files
echo "⚙️  Setting up environment files..."

if [ ! -f "apps/api/.env" ]; then
    cp .env.example apps/api/.env
    echo "✅ Created apps/api/.env from template"
else
    echo "ℹ️  apps/api/.env already exists"
fi

if [ ! -f "apps/web/.env.local" ]; then
    cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
EOF
    echo "✅ Created apps/web/.env.local"
else
    echo "ℹ️  apps/web/.env.local already exists"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Create logs directory
mkdir -p logs

echo ""
echo "🎉 Development setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up PostgreSQL and Redis (run ./setup-db.sh if you have them installed)"
echo "2. Update environment files with your database credentials:"
echo "   - apps/api/.env"
echo "   - apps/web/.env.local"
echo "3. Start development servers: npm run dev"
echo ""
echo "🔗 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:3001"
echo ""
echo "📚 For more information, see README.md and DEPLOYMENT.md"