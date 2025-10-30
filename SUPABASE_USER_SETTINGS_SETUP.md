# Supabase user_mode_settings Table Setup

## Overview
The `user_mode_settings` table stores user preferences, subscription data, and onboarding status. This table must be created in your Supabase project dashboard because it requires the `auth` schema and Row Level Security (RLS).

## Why Manual Setup?
- The table references `auth.users(id)` which only exists in Supabase's auth schema
- RLS policies require `auth.uid()` function
- Direct PostgreSQL connections (like Drizzle) don't have access to the auth schema

## How to Apply the Migration

### Option 1: Supabase Dashboard SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `src/supabase/migrations/20251030021116_create_user_mode_settings.sql`
5. Click **Run** to execute the migration

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push
```

## Verification

After applying the migration, verify it worked:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see `user_mode_settings` in the list of tables
3. Check that RLS is enabled (lock icon should be visible)

## What This Creates

- **Table**: `public.user_mode_settings` with columns for:
  - User preferences (active_mode, student_mode_enabled, work_mode_enabled)
  - Onboarding status
  - Subscription details (plan_type, stripe IDs, trial dates)
  
- **RLS Policies**: Users can only access their own settings
  
- **Indexes**: Optimized lookups by user_id
  
- **Triggers**: Auto-update timestamps

## Note
The application will continue to work without this table, but users will see console errors about missing table. The app gracefully handles this by falling back to localStorage for some settings.
