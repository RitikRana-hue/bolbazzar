#!/bin/bash

# Production Readiness Validation Script
# This script validates that the project is ready for production deployment

set -e

echo "🔍 Production Readiness Validation"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print error
error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print info
info() {
    echo "ℹ️  $1"
}

echo "1. Environment Configuration Check"
echo "-----------------------------------"

# Check if .env files exist
if [ ! -f "apps/api/.env.development" ]; then
    error ".env.development not found"
else
    success ".env.development exists"
fi

if [ ! -f "apps/api/.env.staging" ]; then
    warning ".env.staging not found"
else
    success ".env.staging exists"
fi

if [ ! -f "apps/api/.env.production" ]; then
    warning ".env.production not found"
else
    success ".env.production exists"
fi

echo ""
echo "2. Database Configuration Check"
echo "--------------------------------"

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    warning "DATABASE_URL not set in environment"
else
    success "DATABASE_URL is set"
    
    # Check if it's not using default credentials
    if echo "$DATABASE_URL" | grep -q "CHANGE_ME"; then
        error "DATABASE_URL contains placeholder credentials"
    else
        success "DATABASE_URL has custom credentials"
    fi
fi

# Check database connection pooling settings
if [ -z "$DB_POOL_MIN" ]; then
    warning "DB_POOL_MIN not set, using default"
else
    success "DB_POOL_MIN is set to $DB_POOL_MIN"
fi

if [ -z "$DB_POOL_MAX" ]; then
    warning "DB_POOL_MAX not set, using default"
else
    success "DB_POOL_MAX is set to $DB_POOL_MAX"
fi

echo ""
echo "3. Security Configuration Check"
echo "--------------------------------"

# Check JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    error "JWT_SECRET not set"
elif [ ${#JWT_SECRET} -lt 32 ]; then
    error "JWT_SECRET is too short (minimum 32 characters)"
elif echo "$JWT_SECRET" | grep -q "CHANGE_ME"; then
    error "JWT_SECRET contains placeholder value"
else
    success "JWT_SECRET is properly configured"
fi

# Check SESSION_SECRET
if [ -z "$SESSION_SECRET" ]; then
    warning "SESSION_SECRET not set"
elif echo "$SESSION_SECRET" | grep -q "CHANGE_ME"; then
    error "SESSION_SECRET contains placeholder value"
else
    success "SESSION_SECRET is properly configured"
fi

# Check BCRYPT_ROUNDS
if [ -z "$BCRYPT_ROUNDS" ]; then
    warning "BCRYPT_ROUNDS not set, using default"
else
    if [ "$BCRYPT_ROUNDS" -lt 10 ]; then
        warning "BCRYPT_ROUNDS is low ($BCRYPT_ROUNDS), recommend 12+ for production"
    else
        success "BCRYPT_ROUNDS is set to $BCRYPT_ROUNDS"
    fi
fi

echo ""
echo "4. Payment Configuration Check"
echo "-------------------------------"

# Check Stripe keys
if [ -z "$STRIPE_SECRET_KEY" ]; then
    error "STRIPE_SECRET_KEY not set"
elif echo "$STRIPE_SECRET_KEY" | grep -q "CHANGE_ME"; then
    error "STRIPE_SECRET_KEY contains placeholder value"
elif echo "$STRIPE_SECRET_KEY" | grep -q "sk_test"; then
    warning "Using Stripe TEST keys (not production)"
else
    success "Stripe SECRET key is configured"
fi

if [ -z "$STRIPE_PUBLISHABLE_KEY" ]; then
    error "STRIPE_PUBLISHABLE_KEY not set"
elif echo "$STRIPE_PUBLISHABLE_KEY" | grep -q "CHANGE_ME"; then
    error "STRIPE_PUBLISHABLE_KEY contains placeholder value"
else
    success "Stripe PUBLISHABLE key is configured"
fi

echo ""
echo "5. Redis Configuration Check"
echo "-----------------------------"

# Check Redis URL
if [ -z "$REDIS_URL" ]; then
    error "REDIS_URL not set"
else
    success "REDIS_URL is set"
fi

# Check Redis password for production
if [ "$NODE_ENV" = "production" ]; then
    if [ -z "$REDIS_PASSWORD" ]; then
        error "REDIS_PASSWORD not set for production"
    elif echo "$REDIS_PASSWORD" | grep -q "CHANGE_ME"; then
        error "REDIS_PASSWORD contains placeholder value"
    else
        success "REDIS_PASSWORD is configured"
    fi
fi

echo ""
echo "6. Server Configuration Check"
echo "------------------------------"

# Check API_URL
if [ -z "$API_URL" ]; then
    warning "API_URL not set"
elif echo "$API_URL" | grep -q "localhost"; then
    warning "API_URL points to localhost"
else
    success "API_URL is set to $API_URL"
fi

# Check FRONTEND_URL
if [ -z "$FRONTEND_URL" ]; then
    warning "FRONTEND_URL not set"
elif echo "$FRONTEND_URL" | grep -q "localhost"; then
    warning "FRONTEND_URL points to localhost"
else
    success "FRONTEND_URL is set to $FRONTEND_URL"
fi

# Check CORS_ORIGINS
if [ -z "$CORS_ORIGINS" ]; then
    warning "CORS_ORIGINS not set"
else
    success "CORS_ORIGINS is configured"
fi

# Check TRUST_PROXY for production
if [ "$NODE_ENV" = "production" ]; then
    if [ "$TRUST_PROXY" != "true" ]; then
        warning "TRUST_PROXY should be 'true' for production behind proxy/load balancer"
    else
        success "TRUST_PROXY is enabled"
    fi
fi

echo ""
echo "7. Migration Files Check"
echo "------------------------"

# Check if migration files exist
MIGRATION_DIR="apps/api/src/migrations"
if [ ! -d "$MIGRATION_DIR" ]; then
    error "Migration directory not found"
else
    success "Migration directory exists"
    
    # Count migration files
    MIGRATION_COUNT=$(find "$MIGRATION_DIR" -name "*.sql" ! -name "migration-tracker.sql" | wc -l)
    info "Found $MIGRATION_COUNT migration files"
    
    # List migration files
    find "$MIGRATION_DIR" -name "*.sql" ! -name "migration-tracker.sql" | sort | while read -r file; do
        info "  - $(basename "$file")"
    done
fi

echo ""
echo "8. Database Connection Test"
echo "----------------------------"

if [ -n "$DATABASE_URL" ]; then
    info "Testing database connection..."
    
    # Try to connect using psql if available
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
            success "Database connection successful"
        else
            error "Database connection failed"
        fi
    else
        warning "psql not available, skipping connection test"
    fi
else
    warning "DATABASE_URL not set, skipping connection test"
fi

echo ""
echo "9. Node Modules Check"
echo "---------------------"

if [ ! -d "node_modules" ]; then
    warning "node_modules not found, run 'npm install'"
else
    success "node_modules exists"
fi

if [ ! -d "apps/api/node_modules" ]; then
    warning "apps/api/node_modules not found"
else
    success "apps/api/node_modules exists"
fi

echo ""
echo "10. TypeScript Compilation Check"
echo "---------------------------------"

if [ -d "apps/api/dist" ]; then
    success "apps/api/dist exists (compiled)"
else
    warning "apps/api/dist not found, run 'npm run build'"
fi

echo ""
echo "11. File Upload Configuration Check"
echo "------------------------------------"

FILE_UPLOAD_PROVIDER=${FILE_UPLOAD_PROVIDER:-local}
info "File upload provider: $FILE_UPLOAD_PROVIDER"

if [ "$FILE_UPLOAD_PROVIDER" = "aws" ]; then
    if [ -z "$AWS_ACCESS_KEY_ID" ] || echo "$AWS_ACCESS_KEY_ID" | grep -q "CHANGE_ME"; then
        error "AWS_ACCESS_KEY_ID not properly configured"
    else
        success "AWS_ACCESS_KEY_ID is configured"
    fi
    
    if [ -z "$AWS_SECRET_ACCESS_KEY" ] || echo "$AWS_SECRET_ACCESS_KEY" | grep -q "CHANGE_ME"; then
        error "AWS_SECRET_ACCESS_KEY not properly configured"
    else
        success "AWS_SECRET_ACCESS_KEY is configured"
    fi
    
    if [ -z "$AWS_BUCKET_NAME" ] || echo "$AWS_BUCKET_NAME" | grep -q "CHANGE_ME"; then
        error "AWS_BUCKET_NAME not properly configured"
    else
        success "AWS_BUCKET_NAME is configured"
    fi
elif [ "$FILE_UPLOAD_PROVIDER" = "local" ]; then
    success "Using local file upload"
    
    UPLOAD_DIR=${LOCAL_UPLOAD_DIR:-./uploads}
    if [ ! -d "$UPLOAD_DIR" ]; then
        warning "Upload directory $UPLOAD_DIR does not exist"
    else
        success "Upload directory exists"
    fi
fi

echo ""
echo "12. Email Configuration Check"
echo "------------------------------"

EMAIL_PROVIDER=${EMAIL_PROVIDER:-console}
info "Email provider: $EMAIL_PROVIDER"

if [ "$EMAIL_PROVIDER" = "sendgrid" ]; then
    if [ -z "$SENDGRID_API_KEY" ] || echo "$SENDGRID_API_KEY" | grep -q "CHANGE_ME"; then
        error "SENDGRID_API_KEY not properly configured"
    else
        success "SENDGRID_API_KEY is configured"
    fi
elif [ "$EMAIL_PROVIDER" = "console" ]; then
    if [ "$NODE_ENV" = "production" ]; then
        warning "Using console email provider in production"
    else
        success "Using console email provider for development"
    fi
fi

echo ""
echo "13. Monitoring Configuration Check"
echo "-----------------------------------"

if [ "$NODE_ENV" = "production" ]; then
    if [ -z "$SENTRY_DSN" ] || echo "$SENTRY_DSN" | grep -q "CHANGE_ME"; then
        warning "SENTRY_DSN not configured for production monitoring"
    else
        success "SENTRY_DSN is configured"
    fi
    
    if [ "$ENABLE_METRICS" != "true" ]; then
        warning "Metrics not enabled for production"
    else
        success "Metrics are enabled"
    fi
fi

echo ""
echo "=================================="
echo "Validation Summary"
echo "=================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    success "All checks passed! ✨"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo "Review warnings before deploying to production"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found${NC}"
    echo "Fix errors before deploying to production"
    exit 1
fi
