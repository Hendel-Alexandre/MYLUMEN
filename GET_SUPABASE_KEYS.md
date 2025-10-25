# 🔑 How to Get Your Supabase API Keys

## ⚠️ Issue Detected

Your Supabase API keys don't match your project URL. Here's how to fix it:

**Your Project URL:**
```
https://qhbrkcqopqjjaemifjtt.supabase.co
```

**Your API keys are from:** A different project (ref: fhjknsvhwzrxarbfiqpx)

---

## 📝 Step-by-Step: Get the Correct Keys

### 1. **Open Your Supabase Dashboard**
Go to: https://qhbrkcqopqjjaemifjtt.supabase.co

### 2. **Navigate to Settings**
- Click on **Settings** (gear icon in the left sidebar)
- Click on **API** under Project Settings

### 3. **Copy Your Keys**

You'll see two important keys:

#### **A. Project URL** (should match)
```
https://qhbrkcqopqjjaemifjtt.supabase.co
```

#### **B. anon/public key**
- Look for "Project API keys" section
- Copy the **anon public** key (starts with `eyJhbGc...`)
- This is safe to use client-side

#### **C. service_role key**
- In the same section, find **service_role** key
- Click "Reveal" to show it
- Copy the full key (starts with `eyJhbGc...`)
- ⚠️ **This is secret! Server-side only!**

---

## 📋 Update Your .env File

Replace these lines in your `.env` file:

```env
# Current (WRONG - from different project)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoamtuc3Zod3pyeGFyYmZpcXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDg4NDksImV4cCI6MjA3NjkyNDg0OX0.6L62_dyr688418iHMGuznsjMv1R3BNj7XmrtgIY2po0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoamtuc3Zod3pyeGFyYmZpcXB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM0ODg0OSwiZXhwIjoyMDc2OTI0ODQ5fQ.w7ECDvt5sGIOJmUybr_Tf1DV0Fb-WfvIrvcqxLFSFso

# Update to (CORRECT - from YOUR project)
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_new_anon_key_here>
SUPABASE_SERVICE_ROLE_KEY=<your_new_service_role_key_here>
```

The new keys should have `"ref":"qhbrkcqopqjjaemifjtt"` in their JWT payload (matching your URL).

---

## 🔍 How to Verify Your Keys

### Decode the JWT (optional)
Visit: https://jwt.io

Paste your `NEXT_PUBLIC_SUPABASE_ANON_KEY` and check the decoded payload:

**Correct payload should show:**
```json
{
  "iss": "supabase",
  "ref": "qhbrkcqopqjjaemifjtt",  // ✅ This should match your URL
  "role": "anon",
  ...
}
```

**Wrong payload shows:**
```json
{
  "iss": "supabase",
  "ref": "fhjknsvhwzrxarbfiqpx",  // ❌ Different project!
  "role": "anon",
  ...
}
```

---

## ✅ After Updating

1. **Save your .env file**
2. **Restart your development server** (stop and run `npm run dev` again)
3. **Test the connection:**
   - Visit: http://localhost:3000/api/supabase/test
   - Should return `"success": true`

---

## 🎯 Quick Checklist

- [ ] Go to https://qhbrkcqopqjjaemifjtt.supabase.co
- [ ] Click Settings → API
- [ ] Copy the **anon public** key
- [ ] Copy the **service_role** key (click Reveal)
- [ ] Update `.env` with both new keys
- [ ] Restart dev server
- [ ] Test at `/api/supabase/test`

---

## 🆘 Still Having Issues?

**Common Problems:**

1. **"Invalid API key" error**
   - Keys don't match your project URL
   - Get keys from the correct project dashboard

2. **"Project not found" error**
   - URL is wrong
   - Verify your project URL in Supabase dashboard

3. **"Unauthorized" error**
   - Service role key might be incorrect
   - Make sure you revealed and copied the full key

---

## 📞 Need Help?

If you're still stuck, share:
- Your Supabase project URL (from dashboard)
- The first 10 characters of your anon key
- Any error messages you see

**DO NOT share the full service_role key publicly!**
