# LumenR - Business Management Platform

## Overview

LumenR is a comprehensive business management platform for freelancers, consultants, and small businesses. It provides tools for client management, invoicing, payments, scheduling, and AI-powered business insights to streamline operations and boost productivity. The platform aims to be an all-in-one solution for managing various aspects of a small business.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

-   **Frameworks:** Next.js 15 (App Router) with React and TypeScript.
-   **Styling:** Tailwind CSS and Shadcn UI for responsive, mobile-first design; dark/light theme support.
-   **Components:** Radix UI primitives for accessibility.
-   **Design Patterns:** Error boundaries, safe boundary components, custom hooks, TypeScript for type safety.
-   **Visualizations:** Recharts for interactive analytics dashboards (Revenue, Client Growth, Expenses, Quote Status).
-   **Accessibility:** Keyboard navigation and focus indicators.

### Technical Implementations

-   **State Management:** React Context (global state), React Query (server state and caching).
-   **API Structure:** Next.js API routes organized by feature domain (core, payments, AI, calendar, import).
-   **Authentication:** Supabase Auth with bearer token-based API authentication and user ownership checks, Google OAuth integration.
-   **Database:** PostgreSQL (Supabase) with Drizzle ORM for type-safe queries.
-   **Data Access:** Drizzle ORM with `postgres.js` client and connection pooling.
-   **Key Features:**
    -   **Client Management:** Profiles, location fields, auto-tax calculation, bulk import via Excel with validation.
    -   **Product & Service Management:** Catalogs with CRUD, pricing, categories, inventory (products), duration (services), and Excel import/export.
    -   **Billing & Payments:** Stripe integration for processing, checkout sessions, webhook handling, revenue tracking, payment history.
    -   **Receipt Management:** OCR scanning (Tesseract.js), Excel import, Supabase Storage for images, type distinction (expense/client), client assignment.
    -   **Analytics Dashboard:** Interactive charts, recent activity feed, AI-powered insights.
    -   **Calendar & Bookings:** Full scheduling, Google Calendar bidirectional sync, timezone-aware events, client assignment, status management.
    -   **Onboarding:** 3-step wizard for business info, location, and preferences.
    -   **PDF Generation:** Professional PDF templates for quotes and invoices using `@react-pdf/renderer`.
    -   **Trial & Subscription:** Secure access control, upgrade prompts, trial expiry management.
    -   **Contracts Management:** CRUD for contracts with type, status, dates, value, and dual signature tracking.
    -   **AI Autofill:** LocalStorage-based AI-powered autocomplete for form fields with smart ranking.
    -   **Integrations Management UI:** Dedicated section in settings to manage connections (e.g., Google Calendar).

### System Design Choices

-   **Frontend:** Next.js 15 App Router (server and client components).
-   **Backend:** Next.js API routes for business logic and data persistence.
-   **Database Schema:** Tables for clients, products, services, quotes, invoices, contracts, receipts, payments, business profiles, bookings, and user mode settings.
-   **Environment Configuration:** Utilizes environment variables for sensitive data.

## External Dependencies

-   **Authentication & Database:** Supabase (PostgreSQL, Supabase Auth).
-   **Payment Processing:** Stripe (`@stripe/stripe-js`, `stripe`).
-   **Error Monitoring:** Sentry (production).
-   **UI Components:** Radix UI, Lucide React (icons), React Three Fiber & Drei (3D graphics), Sonner (notifications).
-   **Development Tools:** TypeScript, ESLint, Tailwind CSS, Drizzle Kit.
-   **Data Processing:** `xlsx` (Excel parsing), Tesseract.js (OCR).
-   **Charting:** Recharts.
-   **PDF Generation:** `@react-pdf/renderer`.