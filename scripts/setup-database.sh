#!/bin/bash

# InstaSell Database Setup Script
# This script sets up the database for different environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-development}
FORCE_RECREATE=${2:-false}

echo -e "${BLUE}🗄️  InstaSell Database Setup${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Load environment variables
if [ -f "apps/api/.env.${ENVIRONMENT}" ]; then
    echo -e "${GREEN}✓ Loading environment from .env.${ENVIRONMENT}${NC}"
    export $(cat apps/api/.env.${ENVIRONMENT} | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ Environment file .env.${ENVIRONMENT} not found${NC}"
    exit 1
fi

# Validate required environment variables
required_vars=("DATABASE_URL" "DB_HOST" "DB_PORT" "DB_NAME" "DB_USER" "DB_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable $var is not set${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ Environment variables validated${NC}"

# Parse database connection details
DB_HOST_PARSED=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT_PARSED=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME_PARSED=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER_PARSED=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')

echo -e "${BLUE}Database Details:${NC}"
echo -e "  Host: ${DB_HOST_PARSED}"
echo -e "  Port: ${DB_PORT_PARSED}"
echo -e "  Database: ${DB_NAME_PARSED}"
echo -e "  User: ${DB_USER_PARSED}"
echo ""

# Function to check if PostgreSQL is running
check_postgres() {
    echo -e "${YELLOW}🔍 Checking PostgreSQL connection...${NC}"
    
    if command -v pg_isready >/dev/null 2>&1; then
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ PostgreSQL is running and accessible${NC}"
            return 0
        else
            echo -e "${RED}❌ PostgreSQL is not accessible${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  pg_isready not found, trying direct connection...${NC}"
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ PostgreSQL is running and accessible${NC}"
            return 0
        else
            echo -e "${RED}❌ PostgreSQL is not accessible${NC}"
            return 1
        fi
    fi
}

# Function to create database if it doesn't exist
create_database() {
    echo -e "${YELLOW}🏗️  Creating database if it doesn't exist...${NC}"
    
    # Check if database exists
    DB_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>/dev/null || echo "")
    
    if [ "$DB_EXISTS" = "1" ]; then
        if [ "$FORCE_RECREATE" = "true" ]; then
            echo -e "${YELLOW}⚠️  Database exists, recreating due to --force flag...${NC}"
            PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
            PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"
            echo -e "${GREEN}✓ Database recreated${NC}"
        else
            echo -e "${GREEN}✓ Database already exists${NC}"
        fi
    else
        echo -e "${YELLOW}📝 Creating database...${NC}"
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"
        echo -e "${GREEN}✓ Database created${NC}"
    fi
}

# Function to run migrations
run_migrations() {
    echo -e "${YELLOW}🔄 Running database migrations...${NC}"
    
    cd apps/api
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
    fi
    
    # Run migrations
    npm run migrate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migrations completed successfully${NC}"
    else
        echo -e "${RED}❌ Migration failed${NC}"
        exit 1
    fi
    
    cd ../..
}

# Function to seed database (optional)
seed_database() {
    if [ "$ENVIRONMENT" = "development" ] || [ "$ENVIRONMENT" = "staging" ]; then
        echo -e "${YELLOW}🌱 Seeding database with sample data...${NC}"
        
        cd apps/api
        npm run seed
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database seeded successfully${NC}"
        else
            echo -e "${YELLOW}⚠️  Seeding failed or skipped${NC}"
        fi
        
        cd ../..
    else
        echo -e "${BLUE}ℹ️  Skipping seeding for production environment${NC}"
    fi
}

# Function to validate database schema
validate_schema() {
    echo -e "${YELLOW}🔍 Validating database schema...${NC}"
    
    # Check if key tables exist
    key_tables=("users" "products" "auctions" "orders" "payments" "migration_history")
    
    for table in "${key_tables[@]}"; do
        TABLE_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='$table';" 2>/dev/null || echo "")
        
        if [ "$TABLE_EXISTS" = "1" ]; then
            echo -e "${GREEN}  ✓ Table '$table' exists${NC}"
        else
            echo -e "${RED}  ❌ Table '$table' missing${NC}"
            exit 1
        fi
    done
    
    echo -e "${GREEN}✓ Schema validation passed${NC}"
}

# Function to create database indexes
create_indexes() {
    echo -e "${YELLOW}📊 Creating database indexes...${NC}"
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << EOF
-- Performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_seller_status ON products(sellerId, status) WHERE isActive = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_status ON products(categoryId, status) WHERE isActive = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status_end_time ON auctions(status, endTime);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auction_bids_auction_amount ON auction_bids(auctionId, amount DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_buyer_status ON orders(buyerId, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_seller_status ON orders(sellerId, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read ON notifications(userId, isRead, createdAt DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created ON messages(conversationId, createdAt DESC);

-- Search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_title_search ON products USING gin(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));

-- Unique constraints for data integrity
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON users(email) WHERE isActive = true;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_unique ON users(username) WHERE username IS NOT NULL AND isActive = true;
EOF

    echo -e "${GREEN}✓ Indexes created${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}Starting database setup process...${NC}"
    echo ""
    
    # Check PostgreSQL connection
    if ! check_postgres; then
        echo -e "${RED}❌ Cannot connect to PostgreSQL. Please ensure it's running and accessible.${NC}"
        echo -e "${YELLOW}💡 For Docker: docker-compose up -d postgres${NC}"
        exit 1
    fi
    
    # Create database
    create_database
    
    # Run migrations
    run_migrations
    
    # Validate schema
    validate_schema
    
    # Create indexes
    create_indexes
    
    # Seed database (optional)
    if [ "$3" = "--seed" ]; then
        seed_database
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Database Information:${NC}"
    echo -e "  Environment: ${ENVIRONMENT}"
    echo -e "  Host: ${DB_HOST_PARSED}"
    echo -e "  Database: ${DB_NAME_PARSED}"
    echo -e "  Connection URL: ${DATABASE_URL}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "  1. Start the API server: cd apps/api && npm run dev"
    echo -e "  2. Start the web app: cd apps/web && npm run dev"
    echo -e "  3. Visit health check: http://localhost:3001/health"
}

# Parse command line arguments
case "$1" in
    --help|-h)
        echo "Usage: $0 [environment] [force_recreate] [--seed]"
        echo ""
        echo "Arguments:"
        echo "  environment     Environment to setup (development|staging|production) [default: development]"
        echo "  force_recreate  Force recreate database (true|false) [default: false]"
        echo "  --seed          Seed database with sample data"
        echo ""
        echo "Examples:"
        echo "  $0                           # Setup development database"
        echo "  $0 staging                   # Setup staging database"
        echo "  $0 development true --seed   # Recreate development database with seed data"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac