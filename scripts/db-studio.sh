#!/bin/bash

# Open Drizzle Studio for database visualization
# Usage: ./scripts/db-studio.sh

echo "🚀 Starting Drizzle Studio..."
echo "📊 Opening database visualization in your browser"
echo ""

# Start Drizzle Studio
bun drizzle-kit studio

echo "👋 Drizzle Studio closed"
