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
    -   **Receipt Management:** OCR receipt scanning with Tesseract.js for extracting vendor, date, and amount, Excel import for receipts with validation, Supabase Storage integration for receipt images with signed URLs, type distinction (expense vs. client receipts), and client assignment for tracking client-related expenses.
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

### Receipt Image Management Enhancement
-   **Image Download:** Added download button to receipt detail modal with browser download trigger, descriptive filename generation (`receipt-{vendor}-{date}.jpg`), response validation, and user feedback via toast notifications.
-   **Image Attachment/Update:** Users can now attach images to existing receipts or update existing images via the detail modal. Features include file type validation (image/*), size validation (<10MB), Supabase Storage upload using shared helper, PUT API update with bearer token auth, loading state during upload, early auth guards for better error messages, and automatic UI refresh after update.
-   **Enhanced UX:** Receipts without images show "No image attached" with upload button, receipts with images display both download and update buttons, failed images show error state with upload option, and modal closes automatically after successful update to avoid page reload disruption.

### Receipt Enhancement Complete (All 8 Tasks)
-   **Database Schema:** Enhanced receipts table with `type` field ('expense' | 'client' with default 'expense'), optional `client_id` foreign key to clients table, and renamed `file_url` to `image_url` for consistency.
-   **Storage Integration:** Created Supabase Storage helper (`src/lib/receipt-storage.ts`) for receipt image uploads with user-scoped organization, image validation, and signed URL generation.
-   **API Enhancements:** Updated receipts API (GET/POST/PUT) to support type filtering, client association, image URL handling, and proper numeric conversion. Added validation for type transitions and client ID requirements.
-   **Camera Capture:** OCR component now supports getUserMedia camera capture with environment-facing mode, dual-mode toggle (Upload File / Use Camera), real-time video preview, and proper stream cleanup.
-   **Image Upload Workflow:** Integrated Supabase Storage upload into OCR form submission with loading feedback, error handling, and publicUrl persistence to database.
-   **Split View UI:** Redesigned receipts page with tabs for "My Expenses" (type='expense') and "Client Receipts" (type='client'), type-based filtering, client selection for client receipts, and separate totals per tab.
-   **Receipt Detail Modal:** Full-screen modal displaying receipt images with loading states, formatted display of all fields, category-colored badges, and conditional client name display.
-   **End-to-End Testing:** Complete flow from camera capture/file upload → OCR processing → image storage → database persistence → display in appropriate tab with image viewing capability.

### Previous Enhancements
-   **Stripe Payment Integration:** Added Stripe checkout sessions for invoice payments, idempotent webhook handling (using transactionRef to prevent duplicate payments), and billing dashboard showing revenue, pending payments, and payment history with graceful error handling.
-   **Products Page:** Complete product catalog management with CRUD operations, category filtering, active/inactive status toggle, image URL support, inventory tracking (stock_quantity and track_inventory fields), and visual stock level indicators with color-coded badges.
-   **Services Page:** Complete service catalog management with CRUD operations, hourly rate pricing, duration tracking (in minutes), category filtering, active/inactive status toggle, and service statistics dashboard.
-   **Database Schema Updates:** Enhanced services table with category, duration (integer), and active (boolean) fields for better service management.
-   **Billing Dashboard Improvements:** Enhanced error handling with partial data loading, inline error banners with retry functionality, and graceful degradation when individual API calls fail.
-   **Navigation Enhancement:** Added Products, Services, and Billing links to the Financial section of the sidebar navigation.