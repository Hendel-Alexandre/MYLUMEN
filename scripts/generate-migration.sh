#!/bin/bash

# Generate Drizzle migration
# Usage: ./scripts/generate-migration.sh <migration_name>

if [ -z "$1" ]; then
  echo "❌ Error: Migration name is required"
  echo "Usage: ./scripts/generate-migration.sh <migration_name>"
  exit 1
fi

MIGRATION_NAME=$1

echo "🔄 Generating migration: $MIGRATION_NAME"

# Generate migration
bun drizzle-kit generate:sqlite --name="$MIGRATION_NAME"

echo "✅ Migration generated successfully"
echo "📝 Review the migration file in ./drizzle directory"
echo "▶️  Run 'bun run migrate' to apply the migration"
