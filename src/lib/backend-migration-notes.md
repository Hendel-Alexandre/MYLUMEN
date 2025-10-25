# Backend Migration Notes

## ⚠️ CRITICAL: API Routes Architecture Issue

**Problem:** This project uses Vite (NOT Next.js), but contains 70+ Next.js-style API routes in `src/app/api/` that **do not work**.

**Current State:**
- ✅ Vite React frontend (working)
- ✅ Supabase authentication (working)
- ✅ Turso/LibSQL database via Drizzle ORM (working)
- ❌ Next.js API routes in `src/app/api/` (NOT WORKING - returns HTML 404s)

**Root Cause of "Unexpected end of JSON input" Errors:**
```javascript
// Frontend calls this:
fetch('/api/lumenr/business-profiles')

// Vite returns HTML 404 page (not JSON):
<!DOCTYPE html><html>...404 Not Found...</html>

// Frontend tries to parse:
response.json() // ❌ Error: Unexpected end of JSON input
```

## 🔧 Temporary Fix (Current)

All API calls have been **disabled/commented out** to prevent errors. The app uses:
- Supabase Auth for user management
- Direct Supabase database queries where possible
- localStorage for temporary data storage

## 🚀 Proper Solution (Future)

Choose ONE of these architectures:

### Option 1: Backend API Server (Recommended)
Add a proper backend using:
- **Express.js + Node.js**
- **Fastify**
- **Bun HTTP server**

Then expose real REST/GraphQL APIs that Vite can call.

### Option 2: Serverless Functions
Deploy API routes as:
- **Vercel Serverless Functions**
- **Netlify Functions**
- **Supabase Edge Functions**

### Option 3: Full Migration to Next.js
Convert entire project from Vite → Next.js to use built-in API routes.

## 📋 Files That Need Backend Integration

### Business Profile Management
- `src/pages/Settings.tsx` - Business profile CRUD
- `src/components/Layout/TopBar.tsx` - Display business name

### Data Management (70+ disabled API calls)
- Clients: `src/pages/Clients.tsx`
- Invoices: `src/pages/Invoices.tsx`
- Quotes: `src/pages/Quotes.tsx`
- Contracts: `src/pages/Contracts.tsx`
- Receipts: `src/pages/Receipts.tsx`
- Bookings: `src/pages/Calendar.tsx`, `src/pages/Bookings.tsx`
- Services: `src/pages/Services.tsx`
- Products: `src/pages/Products.tsx`
- Payments: `src/pages/Payments.tsx`

### Analytics & Notifications
- `src/components/Dashboard/InteractiveBanners.tsx`
- `src/components/Dashboard/NotificationsCenter.tsx`
- `src/components/notifications/NotificationsCenter.tsx`

## 🔍 Database Schema Location

Turso database schema: `src/db/schema.ts`

Currently accessible via:
```typescript
import { db } from '@/db'
import { businessProfiles, clients, invoices } from '@/db/schema'
```

**Note:** Direct database access only works server-side. Frontend needs API layer.

## 📝 Next Steps

1. Choose architecture (see options above)
2. Set up backend server/functions
3. Migrate API route logic from `src/app/api/` to new backend
4. Update frontend fetch calls to use new backend URLs
5. Test all CRUD operations
6. Remove commented-out code

## 🚨 Important Files

- `.env.local` - Contains Turso DB credentials
- `src/db/index.ts` - Database connection
- `src/db/schema.ts` - Database tables
- `src/integrations/supabase/client.ts` - Supabase auth client
