#!/bin/bash

# InstaSell Setup Validation Script
# This script validates that the environment is properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-development}

echo -e "${BLUE}🔍 InstaSell Setup Validation${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Load environment variables
if [ -f "apps/api/.env.${ENVIRONMENT}" ]; then
    export $(cat apps/api/.env.${ENVIRONMENT} | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ Environment file .env.${ENVIRONMENT} not found${NC}"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is open
check_port() {
    local host=$1
    local port=$2
    local service=$3
    
    if command_exists nc; then
        if nc -z "$host" "$port" 2>/dev/null; then
            echo -e "${GREEN}  ✓ $service is accessible on $host:$port${NC}"
            return 0
        else
            echo -e "${RED}  ❌ $service is not accessible on $host:$port${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}  ⚠️  netcat not available, skipping $service port check${NC}"
        return 0
    fi
}

# Function to validate environment variables
validate_env_vars() {
    echo -e "${YELLOW}🔧 Validating environment variables...${NC}"
    
    local required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "STRIPE_PUBLISHABLE_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        else
            echo -e "${GREEN}  ✓ $var is set${NC}"
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        for var in "${missing_vars[@]}"; do
            echo -e "${RED}  - $var${NC}"
        done
        return 1
    fi
    
    # Validate JWT secret length
    if [ ${#JWT_SECRET} -lt 32 ]; then
        echo -e "${RED}  ❌ JWT_SECRET must be at least 32 characters long${NC}"
        return 1
    else
        echo -e "${GREEN}  ✓ JWT_SECRET length is adequate${NC}"
    fi
    
    echo -e "${GREEN}✓ Environment variables validation passed${NC}"
    return 0
}

# Function to check system dependencies
check_dependencies() {
    echo -e "${YELLOW}📦 Checking system dependencies...${NC}"
    
    local deps=("node" "npm" "psql")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if command_exists "$dep"; then
            local version=""
            case "$dep" in
                "node")
                    version=$(node --version)
                    ;;
                "npm")
                    version=$(npm --version)
                    ;;
                "psql")
                    version=$(psql --version | head -n1)
                    ;;
            esac
            echo -e "${GREEN}  ✓ $dep is installed ($version)${NC}"
        else
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing system dependencies:${NC}"
        for dep in "${missing_deps[@]}"; do
            echo -e "${RED}  - $dep${NC}"
        done
        return 1
    fi
    
    echo -e "${GREEN}✓ System dependencies check passed${NC}"
    return 0
}

# Function to check database connection
check_database() {
    echo -e "${YELLOW}🗄️  Checking database connection...${NC}"
    
    # Parse database URL
    local db_host=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    local db_port=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    local db_name=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    local db_user=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    
    echo -e "${BLUE}  Database: $db_name on $db_host:$db_port${NC}"
    
    # Check if PostgreSQL is accessible
    if ! check_port "$db_host" "$db_port" "PostgreSQL"; then
        return 1
    fi
    
    # Try to connect to database
    if PGPASSWORD="$DB_PASSWORD" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Database connection successful${NC}"
        
        # Check if migration_history table exists
        local migration_table_exists=$(PGPASSWORD="$DB_PASSWORD" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='migration_history';" 2>/dev/null || echo "")
        
        if [ "$migration_table_exists" = "1" ]; then
            echo -e "${GREEN}  ✓ Migration system is initialized${NC}"
            
            # Count executed migrations
            local migration_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -tAc "SELECT COUNT(*) FROM migration_history;" 2>/dev/null || echo "0")
            echo -e "${GREEN}  ✓ $migration_count migrations executed${NC}"
        else
            echo -e "${YELLOW}  ⚠️  Migration system not initialized${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}  ❌ Database connection failed${NC}"
        return 1
    fi
}

# Function to check Redis connection
check_redis() {
    echo -e "${YELLOW}📊 Checking Redis connection...${NC}"
    
    if [ -n "$REDIS_URL" ]; then
        # Parse Redis URL
        local redis_host=$(echo $REDIS_URL | sed -n 's/redis:\/\/\([^:]*\):.*/\1/p')
        local redis_port=$(echo $REDIS_URL | sed -n 's/.*:\([0-9]*\)$/\1/p')
        
        if [ -z "$redis_host" ]; then
            redis_host="localhost"
        fi
        if [ -z "$redis_port" ]; then
            redis_port="6379"
        fi
        
        echo -e "${BLUE}  Redis: $redis_host:$redis_port${NC}"
        
        if check_port "$redis_host" "$redis_port" "Redis"; then
            return 0
        else
            echo -e "${YELLOW}  ⚠️  Redis is not accessible (optional for basic functionality)${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}  ⚠️  Redis URL not configured${NC}"
        return 0
    fi
}

# Function to check API server
check_api_server() {
    echo -e "${YELLOW}🚀 Checking API server...${NC}"
    
    local api_port=$(echo $PORT | grep -o '[0-9]*' || echo "3001")
    local api_host="localhost"
    
    if check_port "$api_host" "$api_port" "API Server"; then
        # Try to hit health endpoint
        if command_exists curl; then
            local health_url="http://$api_host:$api_port/health"
            if curl -s "$health_url" >/dev/null 2>&1; then
                echo -e "${GREEN}  ✓ API health endpoint is responding${NC}"
                return 0
            else
                echo -e "${YELLOW}  ⚠️  API server is running but health endpoint not responding${NC}"
                return 0
            fi
        else
            echo -e "${GREEN}  ✓ API server port is open${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}  ⚠️  API server is not running${NC}"
        return 0
    fi
}

# Function to check project structure
check_project_structure() {
    echo -e "${YELLOW}📁 Checking project structure...${NC}"
    
    local required_files=(
        "apps/api/package.json"
        "apps/web/package.json"
        "apps/api/src/index.ts"
        "apps/api/src/config/index.ts"
        "apps/api/src/db.ts"
        "apps/api/src/migrations/run.ts"
        "apps/web/lib/api-client.ts"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${GREEN}  ✓ $file exists${NC}"
        else
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing required files:${NC}"
        for file in "${missing_files[@]}"; do
            echo -e "${RED}  - $file${NC}"
        done
        return 1
    fi
    
    echo -e "${GREEN}✓ Project structure validation passed${NC}"
    return 0
}

# Function to check node modules
check_node_modules() {
    echo -e "${YELLOW}📦 Checking node modules...${NC}"
    
    if [ -d "apps/api/node_modules" ]; then
        echo -e "${GREEN}  ✓ API dependencies installed${NC}"
    else
        echo -e "${YELLOW}  ⚠️  API dependencies not installed${NC}"
        echo -e "${BLUE}    Run: cd apps/api && npm install${NC}"
    fi
    
    if [ -d "apps/web/node_modules" ]; then
        echo -e "${GREEN}  ✓ Web dependencies installed${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Web dependencies not installed${NC}"
        echo -e "${BLUE}    Run: cd apps/web && npm install${NC}"
    fi
    
    return 0
}

# Main validation function
main() {
    local validation_passed=true
    
    echo -e "${BLUE}Starting validation process...${NC}"
    echo ""
    
    # Check system dependencies
    if ! check_dependencies; then
        validation_passed=false
    fi
    echo ""
    
    # Check project structure
    if ! check_project_structure; then
        validation_passed=false
    fi
    echo ""
    
    # Check node modules
    check_node_modules
    echo ""
    
    # Validate environment variables
    if ! validate_env_vars; then
        validation_passed=false
    fi
    echo ""
    
    # Check database
    if ! check_database; then
        validation_passed=false
    fi
    echo ""
    
    # Check Redis
    check_redis
    echo ""
    
    # Check API server
    check_api_server
    echo ""
    
    # Final result
    if [ "$validation_passed" = true ]; then
        echo -e "${GREEN}🎉 Validation completed successfully!${NC}"
        echo ""
        echo -e "${BLUE}Your InstaSell environment is ready for ${ENVIRONMENT}.${NC}"
        echo ""
        echo -e "${YELLOW}Next steps:${NC}"
        echo -e "  1. Start the API server: cd apps/api && npm run dev"
        echo -e "  2. Start the web app: cd apps/web && npm run dev"
        echo -e "  3. Visit: http://localhost:3000"
        return 0
    else
        echo -e "${RED}❌ Validation failed!${NC}"
        echo ""
        echo -e "${YELLOW}Please fix the issues above before proceeding.${NC}"
        return 1
    fi
}

# Parse command line arguments
case "$1" in
    --help|-h)
        echo "Usage: $0 [environment]"
        echo ""
        echo "Arguments:"
        echo "  environment     Environment to validate (development|staging|production) [default: development]"
        echo ""
        echo "Examples:"
        echo "  $0                    # Validate development environment"
        echo "  $0 staging           # Validate staging environment"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac