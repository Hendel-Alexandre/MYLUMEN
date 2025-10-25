#!/bin/bash

echo "🧹 Clearing Next.js build cache..."

# Remove .next directory
rm -rf .next

# Remove node_modules/.cache
rm -rf node_modules/.cache

# Clear bun cache
bun pm cache rm

echo "✅ Cache cleared successfully!"
echo ""
echo "Now run: bun run dev"
