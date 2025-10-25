# 🚀 Vercel Production API Fix Guide

## Root Cause
Your API routes return 404 in production because **environment variables are missing in Vercel**. The database connection fails during build/runtime, causing Next.js to skip API route generation.

---

## ✅ Step-by-Step Fix

### 1. Add Environment Variables to Vercel

Go to your Vercel project dashboard:
1. Navigate to: **https://vercel.com/your-username/lumenr**
2. Click **Settings** → **Environment Variables**
3. Add **ALL** the following variables for **Production, Preview, and Development**:

#### Required Database Variables
```bash
DATABASE_URL=libsql://db-95567ddd-ac07-4181-829f-fc12c0a9aca4-orchids.aws-us-west-2.turso.io
DATABASE_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjEzNTQ2MzMsImlkIjoiZGUzYzg1ZDQtMjdlZC00NTlhLThkMjktYzI4NmY0Y2Q2MjQwIiwicmlkIjoiZDdkYWQ2ZDgtNjBlZi00ZjEzLTkyMDItNGZkZjRmZTQwYmYxIn0.J8Gq1deHR4i_7jvvwW1AwuV-82Igb2pfubANgSpI8qCmkaiXkoxtRGyY6yzyO1jSbbZLbI_MOLb9Bq5ENcM3Bw

TURSO_CONNECTION_URL=libsql://db-95567ddd-ac07-4181-829f-fc12c0a9aca4-orchids.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjEzNTQ2MzMsImlkIjoiZGUzYzg1ZDQtMjdlZC00NTlhLThkMjktYzI4NmY0Y2Q2MjQwIiwicmlkIjoiZDdkYWQ2ZDgtNjBlZi00ZjEzLTkyMDItNGZkZjRmZTQwYmYxIn0.J8Gq1deHR4i_7jvvwW1AwuV-82Igb2pfubANgSpI8qCmkaiXkoxtRGyY6yzyO1jSbbZLbI_MOLb9Bq5ENcM3Bw
```

#### Required Supabase Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://qhbrkcqopqjjaemifjtt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoYnJrY3FvcHFqamFlbWlmanR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTMzMTAsImV4cCI6MjA3MzI2OTMxMH0.L3uftWCcH02DoJecjqbHYF7zjJvpe_RQwMFfOnxTAUQ
```

#### Optional Variables
```bash
NEXT_PUBLIC_APP_URL=https://lumenr.vercel.app
API_PORT=3001
```

### 2. Redeploy Your Application

After adding environment variables:

#### Option A: Via Vercel Dashboard
1. Go to **Deployments** tab
2. Click the **"Redeploy"** button on the latest deployment
3. Check **"Use existing Build Cache"** is **UNCHECKED** (force fresh build)
4. Click **Redeploy**

#### Option B: Via Git Push (Recommended)
```bash
git add .
git commit -m "Trigger redeployment with env vars"
git push origin main
```

### 3. Verify Deployment

Once redeployed, test these endpoints in your browser:

**Health Check:**
```
https://lumenr.vercel.app/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

**Core API Tests:**
```
https://lumenr.vercel.app/api/core/notifications
https://lumenr.vercel.app/api/core/analytics
https://lumenr.vercel.app/api/lumenr/clients
```

**Expected Response (if authenticated):**
- 401 Unauthorized (correct - means route exists!)
- 200 with data (if you pass auth token)

**Wrong Response (if still broken):**
- 404 HTML page
- "The page could not be found"

---

## 🔍 Troubleshooting

### If APIs Still Return 404:

#### Check Build Logs
1. Go to **Deployments** → Click latest deployment
2. Click **"Build Logs"**
3. Look for errors like:
   - `Database connection failed`
   - `Environment variable not found`
   - `Error: Cannot find module`

#### Common Issues:

**Issue 1: Missing Environment Variables**
- Symptom: Build succeeds but routes return 404
- Fix: Double-check ALL env vars are added in Vercel dashboard for **Production** environment

**Issue 2: Cached Build**
- Symptom: Changes not reflected after redeploy
- Fix: Redeploy with "Use existing Build Cache" **UNCHECKED**

**Issue 3: Import Errors**
- Symptom: Build fails with module errors
- Fix: Check that all imports in API routes are correct (we already verified this)

---

## 📋 Checklist

Before marking this as fixed, verify:

- [ ] All environment variables added to Vercel (Production, Preview, Development)
- [ ] Redeployed application (fresh build, no cache)
- [ ] Health endpoint returns `{"status":"ok"}` → https://lumenr.vercel.app/api/health
- [ ] API endpoints return 401/403 (not 404) when unauthenticated
- [ ] Frontend loads without console errors
- [ ] Browser network tab shows API calls returning JSON (not HTML 404 pages)

---

## 🎯 Expected Results After Fix

### Before Fix (Current State):
```
GET /api/core/notifications → 404 HTML
GET /api/lumenr/clients → 404 HTML
Console: SyntaxError: Unexpected token 'T'
```

### After Fix (Expected State):
```
GET /api/core/notifications → 401 JSON {"error":"Authentication required"}
GET /api/lumenr/clients → 401 JSON {"error":"Authentication required"}
Console: No JSON parse errors
```

---

## 🚨 Security Note

The environment variables in this guide contain sensitive tokens. After fixing:
1. Consider rotating Turso database tokens periodically
2. Keep `.env` file in `.gitignore` (already configured)
3. Never commit `.env` to git repository

---

## 📞 Need Help?

If APIs still return 404 after following all steps:
1. Check Vercel build logs for specific errors
2. Verify database is accessible: test connection from Vercel serverless function
3. Ensure `vercel.json` is in project root (we already have this)

---

**Last Updated:** January 2025
**Status:** Ready to deploy ✅
