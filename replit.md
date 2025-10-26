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

## Recent Changes (October 26, 2025 - Latest)

### Product Payment Links
-   **Stripe Checkout Integration:** Added payment link generation for active products with automatic Stripe checkout session creation
-   **Payment Link API:** Created `/api/lumenr/products/payment-link` route that generates unique checkout URLs for products
-   **Clipboard Integration:** One-click copy of payment links to clipboard for easy sharing with customers
-   **UI Integration:** Added "Copy Payment Link" option to product dropdown menu (visible only for active products)
-   **Features:** Supports quantity selection, automatic Stripe price creation, and secure checkout session generation

### Excel Import/Export for Products and Services
-   **Product Import/Export:**
    -   Template generation with all required columns (name, description, price, category, SKU, etc.)
    -   Row-by-row validation with detailed error reporting
    -   Bulk import API (`/api/lumenr/products/bulk-import`) with validation and user ownership checks
    -   Export current products to Excel with formatted columns and proper data types
    -   UI dialog with upload interface, validation feedback, and progress indicators
    -   **Comprehensive Numeric Validation:** Number.isFinite() checks reject NaN, Infinity, and non-numeric strings; required fields (price) must be > 0; optional fields (stockQuantity) validated as >= 0 when provided; empty strings treated as null for optional fields; normalized numeric storage without string coercion
-   **Service Import/Export:**
    -   Template generation for service catalog (name, description, unit price, billing type, category, etc.)
    -   Validation for required fields (name, unit price, billing type)
    -   Bulk import API (`/api/lumenr/services/bulk-import`) with server-side validation
    -   Export services with duration conversion and formatted pricing
    -   Matching UI components for seamless user experience
    -   **Comprehensive Numeric Validation:** Number.isFinite() checks for unitPrice and duration; required fields (unitPrice) must be > 0; optional fields (duration) validated as > 0 when provided; empty strings treated as null for optional fields; database-native numeric type storage
-   **Utilities:** Created reusable Excel utilities (`product-excel-import.ts`, `service-excel-import.ts`) using xlsx library
-   **Import Dialog Features:** File upload with accept filters, template download button, real-time validation feedback, error highlighting with row numbers, success/failure summary
-   **Data Integrity:** Multiple architect reviews ensured production-ready validation: invalid inputs rejected with clear errors, normalized values stored, no string-to-number conversion issues, proper handling of optional vs required fields

### Integrations Management UI
-   **Settings Page Enhancement:** Added dedicated "Integrations" section in Settings page between Business Profile and Appearance
-   **Integration Cards:** Visual cards for each integration showing:
    -   Service icon and name
    -   Connection status (Connected/Disconnected with visual indicators)
    -   Description of integration purpose
    -   Connect/Disconnect buttons with appropriate styling
-   **Supported Integrations:**
    -   **Google Calendar:** Sync appointments with Google Calendar (existing feature, UI for management added)
    -   **Outlook Calendar:** Two-way sync with Microsoft Outlook Calendar (placeholder for future implementation)
    -   **Email (Resend):** Send quotes and invoices via email (deferred pending API key)
-   **UX Improvements:** Color-coded status indicators, responsive design for mobile/desktop, toast notifications for connection state changes

### AI-Powered Autofill
-   **Intelligent Form Assistance:** AI-powered autocomplete that learns from previous entries to suggest values as users type
-   **useAutofill Hook:** Custom React hook managing suggestion storage, retrieval, and frequency/recency-based ranking algorithm
-   **AutocompleteInput Component:** Reusable input component with dropdown suggestions, keyboard navigation (arrow keys, Enter, Escape), and automatic learning from new entries
-   **Client Form Integration:** Fully integrated into clients form for three key fields:
    -   Company/Organization name suggestions
    -   Address suggestions
    -   City suggestions
-   **Data Storage:** Uses localStorage with namespace isolation per field type, preventing cross-contamination of suggestions
-   **Smart Ranking:** Suggestions ranked by combination of frequency (how often used) and recency (when last used), ensuring most relevant suggestions appear first
-   **Privacy-First:** All learning data stored locally in user's browser, no server-side tracking of form entries

## Recent Changes (October 26, 2025 - Previous)

### Email Integration (Pending Setup)
-   **Service:** Resend (email service for sending quotes, invoices, and documents to clients)
-   **Status:** API key not yet configured - user will add RESEND_API_KEY later
-   **Implementation Plan:** Email functionality code is ready but deferred until user provides API key
-   **Features Ready:** Send quotes/invoices via email, attachment support for PDFs

### Database Setup & Migration (Critical Fix)
-   **Database Tables Created:** All 11 missing database tables created successfully: `clients`, `products`, `services`, `quotes`, `invoices`, `contracts`, `receipts`, `payments`, `business_profiles`, `bookings`, and `user_mode_settings`.
-   **Schema Synchronization:** Resolved critical "relation does not exist" errors by creating all tables from the Drizzle schema definition.
-   **Subscription Management:** Added `user_mode_settings` table for tracking trial periods, subscription status, and onboarding completion.

### Authentication Enhancement
-   **Google OAuth Only:** Removed GitHub, Azure, and Facebook OAuth providers to simplify authentication flow and reduce configuration complexity.
-   **Streamlined Sign-In:** Both login and signup pages now exclusively use Google OAuth with clear, prominent sign-in buttons.
-   **Security:** Maintained bearer token-based API authentication and user ownership checks.

### Onboarding Experience
-   **3-Step Onboarding Wizard:** Created comprehensive onboarding flow collecting:
    1. **Location Data** (Country/Province/City) for tax calculation settings
    2. **Business Information** (Name, Address, Tax ID) for professional invoicing
    3. **Preferences** (Currency, Tax Region, Payment Instructions) for customized documents
-   **Data Persistence:** Onboarding data stored in `business_profiles` and `user_mode_settings` tables.
-   **Skip Protection:** Prevents skipping steps to ensure complete profile setup.
-   **Mobile Responsive:** Optimized for all screen sizes with clear progress indicators.

### PDF Document Generation
-   **Quote PDFs:** Professional PDF templates for quotes using @react-pdf/renderer with:
    - Clean header with business branding
    - Detailed line items table with products/services
    - Automatic subtotal, tax, and total calculations
    - Custom notes section
    - Professional footer
-   **Invoice PDFs:** Matching professional PDF templates for invoices with:
    - Payment status indicators
    - Due date highlighting
    - Deposit information when applicable
    - Payment instructions section
    - Consistent branding with quote templates
-   **Architecture Review:** Both templates reviewed and approved by architect for code quality and maintainability.

### Trial & Subscription Management
-   **Trial Expiry Restrictions:** Implemented secure access control on invoices page:
    - Disabled "New Invoice" button for expired trials with lock icon
    - Loading state protection prevents bypass during subscription verification
    - Clear upgrade prompts with direct link to billing page
    - Trial days counter for active trials (e.g., "Trial: 5 days remaining")
    - Toast notifications for expired trial attempts
-   **Security Hardening:** Fixed initial implementation vulnerabilities:
    - Proper `needsUpgrade` checking prevents bypass when subscription_status is stale
    - `canCreateInvoice` gate checks loading state, expiry, and days remaining
    - Tooltips and messaging differentiate between loading and expired states
-   **Architect Approved:** Security review confirmed no bypass vulnerabilities remain.

## Recent Changes (October 26, 2025 - Previous)

### Invoicing & Quotes Enhancement (Complete)
-   **LineItemsEditor Component:** Created reusable component for adding products/services as line items to invoices and quotes with auto-calculation of totals. Fixed critical bug ensuring totals recalculate when products/services are selected.
-   **Invoice Line Items:** Full invoicing system with product/service line items, automatic subtotal/tax/total calculation based on client tax settings, status tracking (unpaid/partially_paid/paid/overdue/cancelled), and due date management.
-   **Quote Line Items:** Enhanced quotes page with product/service line items, automatic total calculation, status tracking (draft/sent/accepted/declined/expired), and quote-to-invoice conversion feature.
-   **Quote to Invoice Conversion:** One-click conversion of accepted quotes to invoices, preserving all line items and client information.
-   **Tax Calculation:** Automatic tax calculation based on client's tax rate and auto-calculate settings.
-   **Business Profile Integration:** Database-backed business profile settings (name, logo, currency, tax region, payment instructions, invoice footer) for use in invoices and contracts.
-   **Contracts Management:** Enhanced contracts table with type, status (draft/sent/signed/expired/terminated), start/end dates, contract value, and dual signature tracking (client + user). Full CRUD operations with client association and content management.

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