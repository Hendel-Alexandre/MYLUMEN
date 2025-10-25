# 🚀 Vercel Deployment Setup Guide

## Critical Issue: API Routes Returning 404

Your API routes are failing in production because **environment variables are not set in Vercel**. Here's how to fix it:

---

## 📋 Step 1: Set Environment Variables in Vercel

Go to your Vercel dashboard:
1. Navigate to **Settings** → **Environment Variables**
2. Add these **required** variables:

### Required Variables

```bash
# Turso Database (REQUIRED)
TURSO_CONNECTION_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Supabase Authentication (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
```

### Where to Find These Values:

#### Turso Database:
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Get your database URL
turso db show [your-database-name]

# Create auth token
turso db tokens create [your-database-name]
```

#### Supabase:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📋 Step 2: Verify Environment Setup

After setting environment variables in Vercel:

1. **Redeploy your application** (Vercel → Deployments → Redeploy)
2. **Test the health check endpoint**:

```bash
curl https://lumenr.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": {
    "hasSupabaseUrl": true,
    "hasSupabaseKey": true,
    "hasTursoUrl": true,
    "hasTursoToken": true
  },
  "database": {
    "configured": true,
    "error": null
  }
}
```

---

## 📋 Step 3: Test API Endpoints

Once health check passes, test your API routes:

```bash
# Test notifications (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://lumenr.vercel.app/api/core/notifications

# Test analytics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://lumenr.vercel.app/api/core/analytics

# Test clients
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://lumenr.vercel.app/api/lumenr/clients
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Environment variables not set"
**Solution:** Make sure you set variables in Vercel dashboard AND redeploy

### Issue 2: "Database connection error"
**Solution:** 
- Verify Turso credentials are correct
- Check Turso database is not paused
- Ensure auth token has proper permissions

### Issue 3: "Authentication failed"
**Solution:**
- Verify Supabase URL and anon key are correct
- Check token is being sent in `Authorization: Bearer TOKEN` header
- Make sure user is logged in and token is valid

### Issue 4: API still returns 404
**Solution:**
1. Check build logs in Vercel dashboard
2. Verify API routes exist in `.next/server` folder
3. Clear Vercel cache and redeploy
4. Check `vercel.json` configuration

---

## 📝 Quick Deployment Checklist

- [ ] Set all 4 environment variables in Vercel
- [ ] Redeploy application after setting variables
- [ ] Verify `/api/health` returns status "ok"
- [ ] Test protected API endpoints with valid auth token
- [ ] Check browser console for any CORS errors
- [ ] Verify database has necessary tables (run migrations if needed)

---

## 🔍 Debugging Production Issues

### Check Health Endpoint
```bash
curl https://lumenr.vercel.app/api/health
```

### Check Build Output
In Vercel dashboard:
1. Go to **Deployments**
2. Click on latest deployment
3. Check **Build Logs** for errors
4. Check **Function Logs** for runtime errors

### View Real-time Logs
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs https://lumenr.vercel.app
```

---

## 🎯 Expected Results After Fix

✅ `/api/health` returns `{"status": "ok"}`  
✅ `/api/core/notifications` returns notifications array  
✅ `/api/core/analytics` returns analytics data  
✅ `/api/lumenr/clients` returns clients array  
✅ All API endpoints return JSON (not HTML 404)  
✅ Frontend loads without console errors  

---

## 📞 Still Having Issues?

If issues persist after following this guide:

1. **Check the build logs** in Vercel dashboard
2. **Verify environment variables** are set for Production environment
3. **Test locally** with `npm run build && npm start`
4. **Check Turso database** is accessible and not paused
5. **Verify Supabase project** is active and credentials are correct

---

## 🚨 Critical Notes

- Environment variables must be set in **Vercel Dashboard**, not just in `.env` files
- Changes to environment variables require a **redeploy** to take effect
- The `NEXT_PUBLIC_*` variables are embedded at build time
- API routes must return JSON responses (never HTML)
- All API routes use App Router pattern (`src/app/api/.../route.ts`)
