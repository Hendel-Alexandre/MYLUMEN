# LumenR - Business Management Platform

## Overview

LumenR is a comprehensive business management platform built with Next.js 15, designed for freelancers, consultants, and small businesses. The application provides tools for client management, invoicing, payments, scheduling, and AI-powered business insights.

**Tech Stack:**
- Frontend: Next.js 15 (App Router), React, TypeScript
- Styling: Tailwind CSS, Shadcn UI components
- Database: PostgreSQL (Supabase)
- ORM: Drizzle ORM
- Authentication: Supabase Auth
- Deployment: Vercel

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** Next.js 15 with App Router
- Server and client components for optimal performance
- File-based routing in `src/app/` directory
- Protected routes wrapped in `(protected)` layout group
- Shared UI components in `src/components/`

**State Management:**
- React Context for global state (Auth, Theme, Mode)
- React Query (`@tanstack/react-query`) for server state and caching
- Local state with React hooks

**UI Design System:**
- Component library: Radix UI primitives with Shadcn customization
- Responsive design with mobile-first approach
- Dark/light theme support via ThemeContext
- Custom animations and micro-interactions

**Key Design Patterns:**
- Error boundaries for graceful error handling
- Safe boundary components to prevent hydration errors
- Custom hooks for reusable logic (useAuth, useOnboarding, useSubscription)
- TypeScript for type safety throughout the application

### Backend Architecture

**API Structure:**
- Next.js API routes organized by feature domain:
  - `/api/core/*` - Core business logic (clients, invoices, quotes, receipts, analytics)
  - `/api/payments/*` - Payment processing and widgets
  - `/api/ai/*` - AI-powered features
  - `/api/calendar/*` - Calendar integrations
  - `/api/import/*` - Data import functionality

**Database Schema:**
- PostgreSQL database via Supabase
- Drizzle ORM for type-safe database queries
- Migration system for schema evolution (`drizzle-kit`)
- Tables: clients, products, services, quotes, invoices, contracts, receipts, payments, business_profiles, bookings

**Authentication & Authorization:**
- Supabase Auth for user authentication
- Bearer token-based API authentication
- User ownership checks enforced at API level
- AuthContext provides auth state to entire application

**Data Access Patterns:**
- Drizzle ORM queries with PostgreSQL dialect
- Connection pooling via `postgres.js` client
- Graceful degradation when database is not configured
- Helper functions to check database status

### External Dependencies

**Authentication & Database:**
- Supabase (PostgreSQL database + Auth)
  - Project URL: Required in `NEXT_PUBLIC_SUPABASE_URL`
  - Anon key: Required in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Database URL: Required in `DATABASE_URL`

**Error Monitoring:**
- Sentry for production error tracking
- Custom error boundaries for client-side errors
- Console logging for development debugging

**UI Components:**
- Radix UI - Accessible component primitives
- Lucide React - Icon library
- React Three Fiber & Drei - 3D graphics (for visual effects)
- Sonner & custom toast system - Notifications

**Development Tools:**
- TypeScript for type checking
- ESLint for code quality
- Tailwind CSS for styling
- Drizzle Kit for database migrations

**Environment Configuration:**
The application requires several environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key (optional)
- `NEXT_PUBLIC_APP_URL` - Application URL for OAuth callbacks

**Deployment:**
- Deployed on Replit (migrated from Vercel on October 25, 2025)
- Development server runs on port 5000, bound to 0.0.0.0
- Environment variables configured via Replit Secrets
- Custom `vercel.json` configuration retained for potential future deployments

## Recent Changes

### October 25, 2025 - Vercel to Replit Migration
**Migration Summary:**
- Migrated Next.js application from Vercel to Replit environment
- Updated development and production scripts to use port 5000 with 0.0.0.0 binding
- Resolved corrupted image asset (datatrack-logo.png) by replacing with text-based logo
- Installed dependencies using npm with --legacy-peer-deps flag (due to date-fns/react-day-picker peer dependency conflict)
- Configured Supabase environment variables via Replit Secrets
- Set up development workflow to run Next.js dev server

**Technical Details:**
- Package manager: npm (detected from package-lock.json)
- Node.js version: 20.x
- Image assets: Replaced Image imports with gradient text logos for better compatibility
- Files modified:
  - `package.json` - Updated dev and start scripts
  - `src/app/page.tsx` - Replaced logo image with text
  - `src/app/chat/page.tsx` - Replaced logo image with text
  - `src/components/Layout/TopBar.tsx` - Replaced logo image with text
  - `src/components/Layout/AppSidebar.tsx` - Replaced logo image with text

**Environment Variables:**
All required Supabase credentials have been configured:
- ✅ DATABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY