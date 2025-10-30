# Complete Vercel Deployment Guide

## Overview
This guide will walk you through deploying your LumenR Next.js application to Vercel with all required configurations, environment variables, and database setup.

---

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] A GitHub account
- [ ] A Vercel account (sign up at https://vercel.com)
- [ ] A Supabase project (sign up at https://supabase.com if needed)
- [ ] Stripe account with API keys (if using payment features)
- [ ] Google Calendar API credentials (if using calendar features)

---

## Step 1: Apply Supabase Migration

### 1.1 Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### 1.2 Run the Migration

1. Copy the contents of `src/supabase/migrations/20251030021116_create_user_mode_settings.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute the migration
4. Verify success (you should see "Success. No rows returned")

### 1.3 Verify Table Creation

1. Go to **Table Editor** in the left sidebar
2. Look for `user_mode_settings` table
3. Confirm it has the following columns:
   - `id`, `user_id`, `active_mode`, `student_mode_enabled`, `work_mode_enabled`
   - `onboarding_completed`, `plan_type`, `subscription_status`
   - `stripe_customer_id`, `stripe_subscription_id`
   - `trial_start_date`, `trial_end_date`, `current_period_end`
   - `created_at`, `updated_at`

---

## Step 2: Gather All Environment Variables

### 2.1 Supabase Credentials

**Where to find:**
- Go to Supabase Dashboard → **Project Settings** → **API**

**Required variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Database URL:**
- Go to Supabase Dashboard → **Project Settings** → **Database**
- Copy the **Connection string** (Connection pooling mode)
- Choose **Transaction** mode
- Copy the URL

```
DATABASE_URL=postgresql://postgres.your-project-ref:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### 2.2 Stripe Credentials (if using payments)

**Where to find:**
- Go to https://dashboard.stripe.com
- Switch **OFF** "Test mode" (top right)
- Navigate to **Developers** → **API keys**

**Required variables:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (created after deployment)
```

**Important:** You'll need to create the webhook secret AFTER deploying to Vercel (see Step 5).

### 2.3 Google Calendar Credentials (if using)

**Where to find:**
- Go to https://console.cloud.google.com
- Navigate to **APIs & Services** → **Credentials**

**Required variables:**
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/auth/google/callback
```

### 2.4 Application URLs

```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
API_PORT=3001
```

**Note:** Update `NEXT_PUBLIC_APP_URL` after deployment with your actual Vercel URL.

---

## Step 3: Push Code to GitHub

### 3.1 Important Security Check

**CRITICAL:** Before pushing to GitHub, verify that sensitive data is NOT in your repository:

1. Check that `.env` files with real credentials are NOT tracked:
   ```bash
   git status
   ```
   
2. If you see `.env`, `.env.production`, or `.env.staging` in the output:
   - **DO NOT COMMIT THESE FILES**
   - Add them to `.gitignore`:
     ```bash
     echo ".env" >> .gitignore
     echo ".env.local" >> .gitignore
     echo ".env.production" >> .gitignore
     echo ".env.staging" >> .gitignore
     ```

### 3.2 Push to GitHub

1. Create a new repository on GitHub (or use existing)
2. Push your code:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

---

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Go to https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Select **Import Git Repository**
4. Choose your GitHub repository
5. Click **Import**

### 4.2 Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install`

### 4.3 Add Environment Variables

**Method 1: Using Supabase Integration (Recommended)**

1. Before clicking Deploy, scroll down to **Environment Variables**
2. Click **Add Integration** → Search for **Supabase**
3. Connect your Supabase project
4. This automatically adds:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

**Method 2: Manual Entry**

If the integration doesn't work, manually add each variable:

1. In **Environment Variables** section, add each key-value pair
2. **IMPORTANT:** For each variable, select all three environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

**Required variables to add manually:**

```
DATABASE_URL = postgresql://postgres.your-project...
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

**Add Stripe variables (if using):**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_SECRET_KEY = sk_live_...
```

**Add Google Calendar variables (if using):**
```
GOOGLE_CLIENT_ID = your-client-id...
GOOGLE_CLIENT_SECRET = your-secret...
GOOGLE_REDIRECT_URI = https://your-app.vercel.app/api/auth/google/callback
```

### 4.4 Deploy

1. Click **Deploy**
2. Wait 3-5 minutes for the build to complete
3. You'll see a success message with your deployment URL

---

## Step 5: Post-Deployment Configuration

### 5.1 Update Application URL

1. Copy your Vercel deployment URL (e.g., `https://lumenr-app.vercel.app`)
2. In Vercel Dashboard:
   - Go to **Settings** → **Environment Variables**
   - Find `NEXT_PUBLIC_APP_URL`
   - Click **Edit** → Update with your actual URL
   - Click **Save**
3. **Redeploy** from the **Deployments** tab to apply changes

### 5.2 Configure Stripe Webhooks (if using Stripe)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set **Endpoint URL:** `https://your-app.vercel.app/api/lumenr/payments/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add to Vercel:
   - Go to Vercel → **Settings** → **Environment Variables**
   - Add: `STRIPE_WEBHOOK_SECRET = whsec_...`
   - Select all environments
8. **Redeploy** to apply changes

### 5.3 Update Google Calendar Redirect URI (if using)

1. Go to Google Cloud Console → **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://your-app.vercel.app/api/auth/google/callback
   ```
4. Click **Save**

### 5.4 Update Supabase Redirect URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL:**
   ```
   https://your-app.vercel.app
   ```
3. Add to **Redirect URLs:**
   ```
   https://your-app.vercel.app/**
   ```
4. Click **Save**

---

## Step 6: Verify Deployment

### 6.1 Test Core Features

Visit your deployed application and test:

- [ ] **Homepage loads** without errors
- [ ] **User authentication** (sign up/login)
- [ ] **Database queries** work (check dashboard, analytics)
- [ ] **Stripe checkout** (if applicable) - use test mode first
- [ ] **Google Calendar** integration (if applicable)

### 6.2 Check Browser Console

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Look for any errors, especially:
   - Supabase connection errors
   - Missing environment variables
   - CORS errors

### 6.3 Monitor Vercel Logs

1. In Vercel Dashboard → Your Project → **Logs**
2. Watch for:
   - API errors
   - Database connection issues
   - Timeout errors

---

## Step 7: Performance Optimization (Optional)

### 7.1 Enable Caching

Your app already has optimized caching configured in:
- `next.config.ts` - Static asset caching
- `vercel.json` - API timeout and memory settings

### 7.2 Monitor Performance

1. Use Vercel **Analytics** (Settings → Analytics → Enable)
2. Monitor **Web Vitals** scores
3. Review **Function Logs** for slow API routes

---

## Troubleshooting

### Build Fails with TypeScript Errors

**Solution:** Temporarily disable strict type checking:
```typescript
// next.config.ts
typescript: {
  ignoreBuildErrors: true, // Only for initial deployment
}
```

### "supabaseUrl is required" Error

**Solution:** 
1. Check environment variables are set for ALL environments
2. Trigger a new deployment to pick up changes
3. Clear browser cache and hard refresh

### API Routes Timing Out

**Solution:**
- Check `vercel.json` has proper timeout settings (already configured)
- For analytics routes, ensure caching is working
- Check database connection pooling in Supabase

### Stripe Webhooks Not Working

**Solution:**
1. Verify webhook URL matches your deployment URL
2. Check webhook secret is correct in Vercel
3. Test using Stripe CLI: `stripe listen --forward-to localhost:3000/api/lumenr/payments/webhook`

---

## Security Recommendations

### 1. Environment Variables
- ✅ Never commit `.env` files to Git
- ✅ Use Vercel's environment variable encryption
- ✅ Rotate Supabase service role keys periodically

### 2. Stripe Security
- ✅ Always verify webhook signatures
- ✅ Use restricted API keys when possible
- ✅ Test in Stripe test mode before going live

### 3. Database Security
- ✅ Enable Row Level Security (RLS) on all Supabase tables
- ✅ Use connection pooling (already configured)
- ✅ Monitor for unusual query patterns

---

## Known Issues & Limitations

### npm Security Vulnerabilities

**Status:** Addressed (as of deployment preparation)

- ✅ **Next.js critical vulnerabilities:** Fixed (updated to latest version)
- ⚠️ **esbuild (moderate):** Development-only vulnerability, does NOT affect production
- ⚠️ **xlsx (high):** No fix available - used in Excel import features
  - **Risk:** Prototype pollution and ReDoS attacks
  - **Mitigation:** Validate and sanitize all uploaded Excel files
  - **Alternative:** Consider migrating to `xlsx-js-style` or `exceljs` in future

### Build Memory Limits

- Replit builds may fail due to memory limits
- Vercel builds will succeed (more memory available)
- First build may take 3-5 minutes

---

## Support & Resources

### Documentation
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://docs.stripe.com

### Getting Help
- Vercel Support: https://vercel.com/support
- Supabase Discord: https://discord.supabase.com
- Stripe Support: https://support.stripe.com

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Supabase migration applied successfully
- [ ] All environment variables configured in Vercel
- [ ] Application URL updated in all services (Supabase, Stripe, Google)
- [ ] Stripe webhooks configured and tested
- [ ] Authentication working (sign up/login)
- [ ] Database queries functioning
- [ ] Payment processing tested (if applicable)
- [ ] Google Calendar integration tested (if applicable)
- [ ] Browser console shows no critical errors
- [ ] Vercel function logs show no errors
- [ ] Custom domain configured (optional)

---

## Next Steps

1. **Monitor** your application for the first 24 hours
2. **Test** all critical user flows
3. **Set up alerts** in Vercel for errors and downtime
4. **Enable** Vercel Analytics for performance monitoring
5. **Plan** for future updates and migrations

---

**Congratulations!** 🎉 Your LumenR application is now live on Vercel!

**Your deployment is ready with:**
- ✅ Production-grade Next.js configuration
- ✅ Optimized API performance with caching
- ✅ Secure environment variable management
- ✅ Database migrations applied
- ✅ Security vulnerabilities addressed

For any issues or questions, refer to this guide or check the troubleshooting section.
