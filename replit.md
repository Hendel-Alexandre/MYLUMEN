# LumenR - Business Management Platform

## Overview

LumenR is a comprehensive business management platform designed for freelancers, consultants, and small businesses. It provides tools for client management, invoicing, payments, scheduling, and AI-powered business insights, aiming to streamline operations and enhance productivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

-   **Framework:** Next.js 15 (App Router) with React and TypeScript.
-   **Styling:** Tailwind CSS and Shadcn UI for a responsive, mobile-first design.
-   **Theming:** Dark/light theme support.
-   **Component Library:** Radix UI primitives for accessibility.
-   **Design Patterns:** Error boundaries, safe boundary components, custom hooks for reusable logic, and TypeScript for type safety.
-   **Visualizations:** Recharts for interactive analytics dashboards (Revenue, Client Growth, Expenses, Quote Status).
-   **Accessibility:** Keyboard navigation and focus indicators for interactive elements.

### Technical Implementations

-   **State Management:** React Context for global state (Auth, Theme) and React Query for server state and caching.
-   **API Structure:** Next.js API routes organized by feature domain (core, payments, AI, calendar, import).
-   **Authentication:** Supabase Auth with bearer token-based API authentication and user ownership checks.
-   **Database:** PostgreSQL (Supabase) with Drizzle ORM for type-safe queries and schema migrations.
-   **Data Access:** Drizzle ORM with `postgres.js` client and connection pooling.
-   **Key Features:**
    -   **Client Management:** Comprehensive client profiles, location fields, compact cards, and auto-tax calculation based on jurisdiction.
    -   **Client Import:** Bulk import clients via Excel with template generation, row-by-row validation, and error reporting.
    -   **Product Management:** Product catalog with pricing, categories, active/inactive status, image URLs, inventory tracking, and full CRUD operations.
    -   **Service Management:** Service catalog with hourly rates, duration tracking, categories, active/inactive status, and full CRUD operations.
    -   **Billing & Payments:** Stripe integration for payment processing, checkout sessions, webhook handling for invoice payments, revenue tracking, and payment history.
    -   **Receipt Management:** OCR receipt scanning with Tesseract.js for extracting vendor, date, and amount, and Excel import for receipts with validation.
    -   **Analytics Dashboard:** Interactive charts for revenue, client growth, expenses, and quote status, alongside a recent activity feed and AI-powered insights.
    -   **Authentication:** Google OAuth integration, password confirmation for signup, and enhanced form validation.
    -   **Calendar & Bookings:** Full-featured scheduling with day/week views, Google Calendar bidirectional sync (import/export), idempotent updates using google_event_id tracking, timezone-aware event conversion, client assignment, status management (scheduled/completed/cancelled/rescheduled), and responsive mobile/desktop UI.

### System Design Choices

-   **Frontend:** Next.js 15 App Router utilizing server and client components.
-   **Backend:** Next.js API routes handling business logic and data persistence.
-   **Database Schema:** Tables for clients, products, services, quotes, invoices, contracts, receipts, payments, business profiles, and bookings.
-   **Environment Configuration:** Utilizes environment variables for sensitive data and API keys.

## External Dependencies

-   **Authentication & Database:** Supabase (PostgreSQL, Supabase Auth).
-   **Payment Processing:** Stripe (@stripe/stripe-js, stripe) for secure payment processing and checkout sessions.
-   **Error Monitoring:** Sentry (production), custom error boundaries, console logging (development).
-   **UI Components:** Radix UI, Lucide React (icons), React Three Fiber & Drei (3D graphics), Sonner (notifications).
-   **Development Tools:** TypeScript, ESLint, Tailwind CSS, Drizzle Kit (database migrations).
-   **Data Processing:** `xlsx` library (Excel parsing), Tesseract.js (OCR).
-   **Charting:** Recharts.

## Recent Changes (October 26, 2025)

-   **Stripe Payment Integration:** Added Stripe checkout sessions for invoice payments, idempotent webhook handling (using transactionRef to prevent duplicate payments), and billing dashboard showing revenue, pending payments, and payment history with graceful error handling.
-   **Products Page:** Complete product catalog management with CRUD operations, category filtering, active/inactive status toggle, image URL support, inventory tracking (stock_quantity and track_inventory fields), and visual stock level indicators with color-coded badges.
-   **Services Page:** Complete service catalog management with CRUD operations, hourly rate pricing, duration tracking (in minutes), category filtering, active/inactive status toggle, and service statistics dashboard.
-   **Database Schema Updates:** Enhanced services table with category, duration (integer), and active (boolean) fields for better service management.
-   **Billing Dashboard Improvements:** Enhanced error handling with partial data loading, inline error banners with retry functionality, and graceful degradation when individual API calls fail.
-   **Navigation Enhancement:** Added Products, Services, and Billing links to the Financial section of the sidebar navigation.