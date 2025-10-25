#!/bin/bash

# Push schema changes directly to database (for development)
# Usage: ./scripts/db-push.sh

echo "⚠️  WARNING: This will push schema changes directly to the database"
echo "🔄 Use 'generate-migration.sh' for production-safe migrations"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 0
fi

echo "🔄 Pushing schema changes..."

# Push schema
bun drizzle-kit push:sqlite

echo "✅ Schema pushed successfully"
