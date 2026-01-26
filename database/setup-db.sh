#!/bin/bash

# InstaSell Database Setup Script

echo "🚀 Setting up InstaSell Database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis is not installed. Please install Redis first."
    echo "   macOS: brew install redis"
    echo "   Ubuntu: sudo apt-get install redis-server"
    exit 1
fi

# Start PostgreSQL service
echo "📦 Starting PostgreSQL..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start postgresql
else
    sudo systemctl start postgresql
fi

# Start Redis service
echo "📦 Starting Redis..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start redis
else
    sudo systemctl start redis-server
fi

# Create database
echo "🗄️  Creating database..."
createdb instasell 2>/dev/null || echo "Database 'instasell' already exists"

# Run migrations
echo "🔄 Running database migrations..."
cd apps/api
npm run migrate

# Seed demo data
echo "🌱 Seeding demo data..."
npm run seed

echo "✅ Database setup complete!"
echo ""
echo "📋 Database Information:"
echo "   Database: instasell"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Redis: localhost:6379"
echo ""
echo "🚀 You can now start the development servers:"
echo "   npm run dev"