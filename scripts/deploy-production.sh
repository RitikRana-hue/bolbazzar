#!/bin/bash

# InstaSell Production Deployment Script

set -e

echo "🚀 Starting InstaSell Production Deployment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "   Please copy .env.production.example to .env.production and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Validate required environment variables
required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "STRIPE_SECRET_KEY" "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set!"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create necessary directories
mkdir -p logs/nginx
mkdir -p backups
mkdir -p infra/nginx/ssl

echo "📁 Created necessary directories"

# Build and start services
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
services=("postgres" "redis" "api" "web" "nginx")
for service in "${services[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "$service.*Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service failed to start"
        docker-compose -f docker-compose.prod.yml logs $service
        exit 1
    fi
done

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml exec api npm run migrate

# Optional: Seed initial data (uncomment if needed)
# echo "🌱 Seeding initial data..."
# docker-compose -f docker-compose.prod.yml exec api npm run seed

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Service Information:"
echo "   Web Application: http://localhost (or your domain)"
echo "   API: http://localhost/api"
echo "   Grafana: http://localhost:3001"
echo "   Prometheus: http://localhost:9090"
echo ""
echo "📊 To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.prod.yml down"