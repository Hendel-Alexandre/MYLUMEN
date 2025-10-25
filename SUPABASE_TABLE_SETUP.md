# Supabase Table Setup Guide

## Overview
Your app uses **two separate databases**:
- **Turso (SQLite)**: Main application data (clients, invoices, quotes, etc.)
- **Supabase (PostgreSQL)**: Storage and Realtime demo features

## Setup Required

The Supabase demo page needs a `clients` table in your Supabase database.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://fhjknsvhwzrxarbfiqpx.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run This SQL

Copy and paste this SQL query:

```sql
-- Create clients table for Supabase demo
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
DROP POLICY IF EXISTS "Allow all operations" ON clients;
CREATE POLICY "Allow all operations" ON clients
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
```

### Step 3: Execute the Query

Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

### Step 4: Verify Setup

1. Go back to your app: http://localhost:3000/supabase-features
2. The status should now show "Ready" and "Enabled"
3. Try uploading files and watching realtime changes

## Creating Storage Bucket (Optional)

To test file uploads, create a storage bucket:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name it: `documents`
4. Make it **public** or configure access policies
5. Click **Create bucket**

## What This Enables

- ✅ **Realtime subscriptions**: Watch database changes live
- ✅ **Storage uploads**: Upload and manage files
- ✅ **PostgreSQL queries**: Direct database access

## Notes

- This is separate from your main Turso database
- The demo page is just for testing Supabase features
- Your actual app data remains in Turso
