#!/bin/bash

# Run Drizzle migrations
# Usage: ./scripts/migrate.sh

echo "🔄 Running database migrations..."

# Run migrations
bun tsx src/db/migrations/run-migrations.ts

if [ $? -eq 0 ]; then
  echo "✅ All migrations applied successfully"
else
  echo "❌ Migration failed"
  exit 1
fi
