# 🚀 Vercel API Routes Fix Guide

## Problem Summary
All API routes (`/api/core/*`, `/api/lumenr/*`) return **404 errors** in production at https://lumenr.vercel.app

**Root Cause:** Environment variables are missing in Vercel production, causing database connection failures and API route build issues.

---

## ✅ Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your **lumenr** project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add Required Environment Variables

Add these **EXACT** variables (copy from your local `.env` file):

```bash
# Database - CRITICAL
TURSO_CONNECTION_URL=libsql://db-95567ddd-ac07-4181-829f-fc12c0a9aca4-orchids.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjEzNTQ2MzMsImlkIjoiZGUzYzg1ZDQtMjdlZC00NTlhLThkMjktYzI4NmY0Y2Q2MjQwIiwicmlkIjoiZDdkYWQ2ZDgtNjBlZi00ZjEzLTkyMDItNGZkZjRmZTQwYmYxIn0.J8Gq1deHR4i_7jvvwW1AwuV-82Igb2pfubANgSpI8qCmkaiXkoxtRGyY6yzyO1jSbbZLbI_MOLb9Bq5ENcM3Bw

# Supabase Authentication - CRITICAL
NEXT_PUBLIC_SUPABASE_URL=https://qhbrkcqopqjjaemifjtt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoYnJrY3FvcHFqamFlbWlmanR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTMzMTAsImV4cCI6MjA3MzI2OTMxMH0.L3uftWCcH02DoJecjqbHYF7zjJvpe_RQwMFfOnxTAUQ

# App URL - Production
NEXT_PUBLIC_APP_URL=https://lumenr.vercel.app
```

**IMPORTANT:** 
- Set **Environment** to: `Production`, `Preview`, and `Development` (select all three)
- Click **Save** after adding each variable

### Step 3: Trigger Redeployment

After adding ALL environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on the latest deployment
3. Click **Redeploy**
4. Wait for build to complete (~2-3 minutes)

---

## 🧪 Verify the Fix

### Test 1: Health Check
```bash
curl https://lumenr.vercel.app/api/health
```
✅ **Expected:** `{"success":true,"data":{"status":"ok","timestamp":"..."}}`

### Test 2: Notifications (requires auth token)
```bash
curl https://lumenr.vercel.app/api/core/notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
✅ **Expected:** `{"success":true,"data":{"notifications":[...]}}`

### Test 3: Analytics (requires auth token)
```bash
curl https://lumenr.vercel.app/api/core/analytics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
✅ **Expected:** `{"success":true,"data":{"revenue":{...},"invoices":{...}}}`

---

## 🔍 Troubleshooting

### If APIs Still Return 404:

**Check Build Logs:**
1. Go to Vercel **Deployments** tab
2. Click on the latest deployment
3. Click **Building** to view logs
4. Look for errors related to database connection or API routes

**Common Issues:**
- ❌ Missing environment variables → Add them and redeploy
- ❌ Database connection timeout → Check Turso credentials
- ❌ Build errors → Check function logs in deployment details

### If APIs Return 401 Unauthorized:

This is **NORMAL** - it means the API is working but requires authentication.

**To get a valid token:**
1. Login to https://lumenr.vercel.app/login
2. Open browser DevTools → Application → Local Storage
3. Copy the value of `bearer_token`
4. Use in API requests: `Authorization: Bearer <token>`

### If APIs Return 503 Service Unavailable:

This means database is not configured:
- ✅ Double-check `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` in Vercel settings
- ✅ Redeploy after adding variables
- ✅ Check deployment build logs for database connection errors

---

## 📋 Complete Environment Variables Checklist

Mark each as you add them to Vercel:

- [ ] `TURSO_CONNECTION_URL` - Database URL
- [ ] `TURSO_AUTH_TOKEN` - Database auth token  
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL (https://lumenr.vercel.app)

**After adding all 5 variables:** Redeploy from Vercel dashboard

---

## 🎯 Expected Results After Fix

✅ Homepage loads: https://lumenr.vercel.app  
✅ Health API works: https://lumenr.vercel.app/api/health  
✅ All API routes respond (not 404)  
✅ Authenticated requests work with valid bearer token  
✅ Browser console shows no 404 errors for `/api/*` routes  

---

## 📞 Still Having Issues?

If APIs still return 404 after:
1. ✅ Adding all 5 environment variables to Vercel
2. ✅ Redeploying from Vercel dashboard  
3. ✅ Waiting for build to complete successfully

**Share these details:**
- Vercel deployment URL
- Screenshot of Vercel environment variables page
- Build log errors (if any)
- Browser console errors when accessing the app

---

## 🔐 Security Note

**NEVER commit `.env` file to Git.** The environment variables shown here are from your local `.env` file and should ONLY be added to:
- Vercel dashboard (for production)
- Your local `.env` file (for development)

The `.env` file is already in `.gitignore` to prevent accidental commits.
