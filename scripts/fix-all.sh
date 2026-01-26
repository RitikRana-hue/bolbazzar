#!/bin/bash

# Automated Fix Script for bolbazzar
# This script runs all automated fixes and checks

set -e

echo "🚀 Starting automated fixes for bolbazzar..."
echo ""

# Change to web directory
cd "$(dirname "$0")/apps/web"

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔍 Running type check..."
npm run type-check || echo "⚠️  Type check found issues (will continue)"

echo ""
echo "🧹 Running ESLint auto-fix..."
npm run lint:fix || echo "⚠️  Some linting issues remain"

echo ""
echo "💅 Running Prettier format..."
npm run format || echo "⚠️  Some formatting issues remain"

echo ""
echo "🧪 Running tests..."
npm test || echo "⚠️  Some tests failed"

echo ""
echo "🏗️  Building project..."
npm run build || echo "⚠️  Build failed"

echo ""
echo "✅ Automated fixes complete!"
echo ""
echo "📋 Summary:"
echo "  - Dependencies installed"
echo "  - Type checking completed"
echo "  - Linting auto-fixed"
echo "  - Code formatted"
echo "  - Tests run"
echo "  - Build attempted"
echo ""
echo "📖 Next steps:"
echo "  1. Review FIXES_APPLIED.md for details"
echo "  2. Check remaining issues in Code Issues Panel"
echo "  3. Test the application manually"
echo "  4. Commit changes"
echo ""
echo "🎉 Done!"
