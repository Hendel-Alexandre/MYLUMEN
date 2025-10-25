# 🚀 Vercel Deployment Fix Guide

## Problem Summary
Your API routes are returning 404 errors in production because:
1. **Missing environment variables** in Vercel
2. **No Vercel configuration** for API route handling
3. **Database connection failing** silently in production
4. **Missing middleware** for proper API route handling

---

## ✅ Files Fixed (Already Applied)

1. ✅ **vercel.json** - Created with proper API route configuration
2. ✅ **src/middleware.ts** - Added CORS and API route middleware
3. ✅ **next.config.ts** - Added outputFileTracingIncludes for API routes
4. ✅ **src/db/index.ts** - Added environment variable validation
5. ✅ **.env.example** - Fixed environment variable names
6. ✅ **src/app/api/health/route.ts** - Health check endpoint

---

## 🔧 Required Actions in Vercel Dashboard

### Step 1: Set Environment Variables

Go to your Vercel project dashboard → **Settings** → **Environment Variables** and add:

#### **Required Variables:**

```bash
# Database (Turso)
TURSO_CONNECTION_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-token-here

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
```

**Important:**
- Apply to **Production**, **Preview**, and **Development** environments
- Click **"Save"** after adding each variable

### Step 2: Get Your Turso Database Credentials

If you don't have them:

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# List your databases
turso db list

# Get connection URL
turso db show your-database-name

# Create auth token
turso db tokens create your-database-name
```

Copy the **URL** and **token** to Vercel environment variables.

### Step 3: Verify Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Redeploy

After setting environment variables:

1. Go to **Deployments** tab in Vercel
2. Click **"Redeploy"** on the latest deployment
3. **OR** push a new commit to trigger automatic deployment

---

## 🧪 Testing After Deployment

### Test 1: Health Check
```bash
curl https://lumenr.vercel.app/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "checks": {
    "nextjs": true,
    "database": true,
    "supabase": true,
    "envVars": {
      "tursoUrl": true,
      "tursoToken": true,
      "supabaseUrl": true,
      "supabaseKey": true
    }
  },
  "message": "All systems operational"
}
```

### Test 2: Notifications API
```bash
curl -H "Authorization: Bearer your-test-token" \
     https://lumenr.vercel.app/api/core/notifications
```

**Expected:** JSON response with notifications array

### Test 3: Business Profiles API
```bash
curl -H "Authorization: Bearer your-test-token" \
     https://lumenr.vercel.app/api/lumenr/business-profiles
```

**Expected:** JSON response with business profiles array

---

## 🐛 Troubleshooting

### Issue: Still getting 404 errors

**Check:**
1. Environment variables are set in Vercel (all of them!)
2. Deployment completed successfully (no build errors)
3. Check Vercel function logs: Dashboard → **Deployments** → Select deployment → **Functions** tab

### Issue: "TURSO_CONNECTION_URL environment variable is not set"

**Fix:**
1. Verify the variable name is EXACTLY `TURSO_CONNECTION_URL` (case-sensitive)
2. Verify it's applied to the correct environment (Production)
3. Redeploy after adding variables

### Issue: "Authentication required" errors

**Fix:**
1. Verify Supabase environment variables are set
2. Check that your frontend is sending the `Authorization: Bearer <token>` header
3. Verify the token is valid (not expired)

### Issue: Database connection errors

**Fix:**
1. Test Turso connection locally:
   ```bash
   turso db shell your-database-name
   ```
2. Verify auth token hasn't expired:
   ```bash
   turso db tokens list your-database-name
   ```
3. Create new token if needed:
   ```bash
   turso db tokens create your-database-name
   ```

---

## 📊 Vercel Function Logs

To view real-time API errors:

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click on the active deployment
4. Click **Functions** tab
5. Click on any API route to see logs
6. Look for errors like:
   - `TURSO_CONNECTION_URL environment variable is not set`
   - `Invalid or expired token`
   - `Database connection failed`

---

## 🔍 Local Testing Before Deployment

Test locally to ensure everything works:

```bash
# 1. Copy .env.example to .env
cp .env.example .env

# 2. Fill in your credentials in .env
nano .env  # or use any text editor

# 3. Test database connection
npm run db:studio

# 4. Start dev server
npm run dev

# 5. Test health endpoint
curl http://localhost:3000/api/health

# 6. Test API routes with authentication
curl -H "Authorization: Bearer test-token" \
     http://localhost:3000/api/core/notifications
```

---

## ✅ Checklist

Before marking this as resolved, verify:

- [ ] All environment variables are set in Vercel
- [ ] Health check endpoint returns `"status": "healthy"`
- [ ] `/api/core/notifications` returns JSON (not 404)
- [ ] `/api/core/analytics` returns JSON (not 404)
- [ ] `/api/lumenr/business-profiles` returns JSON (not 404)
- [ ] `/api/lumenr/invoices` returns JSON (not 404)
- [ ] `/api/lumenr/clients` returns JSON (not 404)
- [ ] `/api/lumenr/services` returns JSON (not 404)
- [ ] No "SyntaxError: Unexpected token" errors in browser console
- [ ] Frontend loads without authentication errors

---

## 📝 Summary of Changes

### Configuration Files Created/Updated:
1. **vercel.json** - Vercel-specific config for API routes
2. **src/middleware.ts** - CORS and API route handling
3. **next.config.ts** - Output file tracing for dependencies
4. **src/db/index.ts** - Environment variable validation
5. **src/app/api/health/route.ts** - Health check endpoint

### What These Changes Do:
- **vercel.json**: Tells Vercel to properly handle API routes as serverless functions
- **middleware.ts**: Adds CORS headers and handles preflight requests
- **next.config.ts**: Ensures database files are included in serverless functions
- **db/index.ts**: Fails fast with clear error if env vars missing
- **health endpoint**: Allows you to quickly check if everything is configured

---

## 🆘 Still Having Issues?

1. **Check health endpoint first:** `https://lumenr.vercel.app/api/health`
2. **Review Vercel function logs** for specific error messages
3. **Verify environment variables** are exactly as shown above
4. **Test locally** to isolate if it's a production-only issue
5. **Check Turso dashboard** to ensure database is active

---

## 🎯 Expected Result

After following this guide:
- ✅ All `/api/core/*` endpoints return JSON
- ✅ All `/api/lumenr/*` endpoints return JSON  
- ✅ No 404 errors in browser console
- ✅ No "SyntaxError: Unexpected token" errors
- ✅ Frontend loads and displays data correctly
- ✅ Health check shows all systems operational

---

**Next Step:** Set the environment variables in Vercel dashboard and redeploy! 🚀
