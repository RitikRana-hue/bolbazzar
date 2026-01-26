#!/bin/bash

# Safe Database Migration Script
# This script runs migrations with safety checks and rollback capability

set -e

echo "🔄 Safe Database Migration Runner"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL not set${NC}"
    echo "Please set DATABASE_URL environment variable"
    exit 1
fi

# Parse command line arguments
DRY_RUN=false
FORCE=false
BACKUP=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --no-backup)
            BACKUP=false
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--dry-run] [--no-backup] [--force]"
            exit 1
            ;;
    esac
done

# Display configuration
echo -e "${BLUE}Configuration:${NC}"
echo "  Environment: ${NODE_ENV:-development}"
echo "  Dry Run: $DRY_RUN"
echo "  Backup: $BACKUP"
echo "  Force: $FORCE"
echo ""

# Step 1: Check database connection
echo -e "${BLUE}Step 1: Testing database connection...${NC}"
if psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi
echo ""

# Step 2: Check if migration tracking table exists
echo -e "${BLUE}Step 2: Checking migration tracking...${NC}"
if psql "$DATABASE_URL" -c "SELECT 1 FROM migration_history LIMIT 1" &> /dev/null 2>&1; then
    echo -e "${GREEN}✅ Migration tracking table exists${NC}"
    
    # Show executed migrations
    echo ""
    echo "Previously executed migrations:"
    psql "$DATABASE_URL" -t -c "SELECT filename, executed_at FROM migration_history ORDER BY executed_at" | while read -r line; do
        if [ -n "$line" ]; then
            echo "  $line"
        fi
    done
else
    echo -e "${YELLOW}⚠️  Migration tracking table does not exist (will be created)${NC}"
fi
echo ""

# Step 3: Create backup (if enabled)
if [ "$BACKUP" = true ] && [ "$DRY_RUN" = false ]; then
    echo -e "${BLUE}Step 3: Creating database backup...${NC}"
    
    BACKUP_DIR="backups"
    mkdir -p "$BACKUP_DIR"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/db_backup_${TIMESTAMP}.sql"
    
    echo "Backup file: $BACKUP_FILE"
    
    if pg_dump "$DATABASE_URL" > "$BACKUP_FILE"; then
        echo -e "${GREEN}✅ Backup created successfully${NC}"
        echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
    else
        echo -e "${RED}❌ Backup failed${NC}"
        if [ "$FORCE" = false ]; then
            echo "Use --force to skip backup and continue"
            exit 1
        else
            echo -e "${YELLOW}⚠️  Continuing without backup (--force enabled)${NC}"
        fi
    fi
else
    echo -e "${BLUE}Step 3: Skipping backup${NC}"
    if [ "$BACKUP" = false ]; then
        echo "  (--no-backup flag set)"
    else
        echo "  (dry run mode)"
    fi
fi
echo ""

# Step 4: Check pending migrations
echo -e "${BLUE}Step 4: Checking for pending migrations...${NC}"

MIGRATION_DIR="apps/api/src/migrations"
if [ ! -d "$MIGRATION_DIR" ]; then
    echo -e "${RED}❌ Migration directory not found: $MIGRATION_DIR${NC}"
    exit 1
fi

# Get list of migration files
MIGRATION_FILES=$(find "$MIGRATION_DIR" -name "*.sql" ! -name "migration-tracker.sql" | sort)
MIGRATION_COUNT=$(echo "$MIGRATION_FILES" | wc -l)

echo "Found $MIGRATION_COUNT migration files"
echo ""

# Get list of executed migrations
EXECUTED_MIGRATIONS=$(psql "$DATABASE_URL" -t -c "SELECT filename FROM migration_history" 2>/dev/null || echo "")

# Find pending migrations
PENDING_MIGRATIONS=""
PENDING_COUNT=0

for migration_file in $MIGRATION_FILES; do
    filename=$(basename "$migration_file")
    
    if echo "$EXECUTED_MIGRATIONS" | grep -q "$filename"; then
        echo -e "${GREEN}✓${NC} $filename (already executed)"
    else
        echo -e "${YELLOW}⏳${NC} $filename (pending)"
        PENDING_MIGRATIONS="$PENDING_MIGRATIONS $migration_file"
        ((PENDING_COUNT++))
    fi
done

echo ""
echo "Pending migrations: $PENDING_COUNT"
echo ""

if [ $PENDING_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ No pending migrations${NC}"
    exit 0
fi

# Step 5: Confirm execution
if [ "$DRY_RUN" = false ] && [ "$FORCE" = false ]; then
    echo -e "${YELLOW}⚠️  About to execute $PENDING_COUNT migration(s)${NC}"
    echo ""
    read -p "Continue? (yes/no): " -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Migration cancelled"
        exit 0
    fi
fi

# Step 6: Execute migrations
if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}Step 5: DRY RUN - Would execute the following migrations:${NC}"
    for migration_file in $PENDING_MIGRATIONS; do
        echo "  - $(basename "$migration_file")"
    done
    echo ""
    echo -e "${YELLOW}⚠️  This was a dry run. No changes were made.${NC}"
    exit 0
fi

echo -e "${BLUE}Step 5: Executing migrations...${NC}"
echo ""

# Change to API directory
cd apps/api

# Run migrations using TypeScript
if npm run migrate; then
    echo ""
    echo -e "${GREEN}✅ All migrations completed successfully${NC}"
    
    # Show final migration status
    echo ""
    echo "Current migration status:"
    psql "$DATABASE_URL" -c "SELECT filename, executed_at, execution_time_ms FROM migration_history ORDER BY executed_at DESC LIMIT 10"
    
    exit 0
else
    echo ""
    echo -e "${RED}❌ Migration failed${NC}"
    
    if [ "$BACKUP" = true ] && [ -f "$BACKUP_FILE" ]; then
        echo ""
        echo -e "${YELLOW}To restore from backup, run:${NC}"
        echo "  psql \$DATABASE_URL < $BACKUP_FILE"
    fi
    
    exit 1
fi
