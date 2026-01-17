#!/bin/bash

# Prisma Schema Validation Script
# Validates that Prisma schema matches the actual database

set -e

echo "🔍 Prisma Schema Validation"
echo "============================"
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
    exit 1
fi

# Change to API directory
cd apps/api

echo -e "${BLUE}Step 1: Validating Prisma schema syntax...${NC}"
if npx prisma validate; then
    echo -e "${GREEN}✅ Prisma schema syntax is valid${NC}"
else
    echo -e "${RED}❌ Prisma schema has syntax errors${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 2: Checking database connection...${NC}"
if psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 3: Introspecting database schema...${NC}"
echo "This will check if the database schema matches Prisma schema"
echo ""

# Create a temporary directory for comparison
TEMP_DIR=$(mktemp -d)
CURRENT_SCHEMA="prisma/schema.prisma"
INTROSPECTED_SCHEMA="$TEMP_DIR/introspected.prisma"

# Backup current schema
cp "$CURRENT_SCHEMA" "$TEMP_DIR/original.prisma"

# Introspect database
if npx prisma db pull --force --schema="$INTROSPECTED_SCHEMA" 2>&1 | tee "$TEMP_DIR/introspect.log"; then
    echo -e "${GREEN}✅ Database introspection successful${NC}"
else
    echo -e "${RED}❌ Database introspection failed${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 4: Comparing schemas...${NC}"

# Extract model definitions (simplified comparison)
grep -E "^model |^enum " "$CURRENT_SCHEMA" | sort > "$TEMP_DIR/current_models.txt" || true
grep -E "^model |^enum " "$INTROSPECTED_SCHEMA" | sort > "$TEMP_DIR/introspected_models.txt" || true

if diff -u "$TEMP_DIR/current_models.txt" "$TEMP_DIR/introspected_models.txt" > "$TEMP_DIR/diff.txt"; then
    echo -e "${GREEN}✅ Prisma schema matches database schema${NC}"
    SCHEMA_MATCHES=true
else
    echo -e "${YELLOW}⚠️  Differences found between Prisma schema and database${NC}"
    echo ""
    echo "Differences:"
    cat "$TEMP_DIR/diff.txt"
    SCHEMA_MATCHES=false
fi
echo ""

echo -e "${BLUE}Step 5: Checking for pending migrations...${NC}"

# Generate a migration to see if there are changes
MIGRATION_NAME="check_$(date +%Y%m%d_%H%M%S)"
if npx prisma migrate diff \
    --from-schema-datamodel "$CURRENT_SCHEMA" \
    --to-schema-datasource "$CURRENT_SCHEMA" \
    --script > "$TEMP_DIR/pending_changes.sql" 2>/dev/null; then
    
    if [ -s "$TEMP_DIR/pending_changes.sql" ]; then
        echo -e "${YELLOW}⚠️  Pending schema changes detected${NC}"
        echo ""
        echo "Pending SQL changes:"
        cat "$TEMP_DIR/pending_changes.sql"
        echo ""
        echo -e "${YELLOW}Run 'npx prisma migrate dev' to create a migration${NC}"
    else
        echo -e "${GREEN}✅ No pending schema changes${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not check for pending changes${NC}"
fi
echo ""

echo -e "${BLUE}Step 6: Generating Prisma Client...${NC}"
if npx prisma generate; then
    echo -e "${GREEN}✅ Prisma Client generated successfully${NC}"
else
    echo -e "${RED}❌ Prisma Client generation failed${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi
echo ""

# Cleanup
rm -rf "$TEMP_DIR"

echo "============================"
echo "Validation Summary"
echo "============================"
echo ""

if [ "$SCHEMA_MATCHES" = true ]; then
    echo -e "${GREEN}✅ All checks passed${NC}"
    echo ""
    echo "Your Prisma schema is in sync with the database"
    exit 0
else
    echo -e "${YELLOW}⚠️  Schema differences detected${NC}"
    echo ""
    echo "Recommendations:"
    echo "1. Review the differences above"
    echo "2. If database is correct: run 'npx prisma db pull' to update schema"
    echo "3. If Prisma schema is correct: run 'npx prisma db push' or create a migration"
    exit 1
fi
