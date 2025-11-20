# Quick Setup Checklist - Multi-User Platform Backend

**Goal**: Activate backend functionality in 30-60 minutes
**Current Status**: Frontend deployed, backend configuration needed

---

## ☑️ Step 1: Run Supabase Migration (15 minutes)

### Quick Copy-Paste Method

1. **Open Supabase SQL Editor**
   - URL: https://supabase.com/dashboard → Your Project → SQL Editor

2. **Copy Migration File**
   ```bash
   cat /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel/supabase/migrations/002_multi_user_platform.sql
   ```

3. **Paste and Run**
   - New Query → Paste → Run
   - Wait ~30 seconds for completion

4. **Verify Success**
   ```sql
   SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
   ```
   Expected: 15 tables

**Status**: [ ] Complete

---

## ☑️ Step 2: Create Storage Bucket (5 minutes)

### Quick Steps

1. **Supabase Dashboard → Storage → Create Bucket**
   - Name: `user-content`
   - Public: ✅ Yes
   - Click Create

2. **Add RLS Policies**
   - Click bucket → Policies → New Policy
   - Copy-paste 4 policies from BACKEND_SETUP_GUIDE.md Step 2

**Status**: [ ] Complete

---

## ☑️ Step 3: Configure OAuth Providers (20 minutes)

### Google OAuth (7 minutes)

1. **Create OAuth App**
   - URL: https://console.cloud.google.com/apis/credentials
   - Create Credentials → OAuth Client ID → Web application

2. **Configure Redirect**
   ```
   Authorized redirect URIs:
   https://<your-supabase-ref>.supabase.co/auth/v1/callback
   ```

3. **Add to Supabase**
   - Supabase → Authentication → Providers → Google
   - Paste Client ID and Secret

**Status**: [ ] Complete

### GitHub OAuth (7 minutes)

1. **Create OAuth App**
   - URL: https://github.com/settings/developers
   - New OAuth App

2. **Configure**
   ```
   Homepage: https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app
   Callback: https://<your-supabase-ref>.supabase.co/auth/v1/callback
   ```

3. **Add to Supabase**
   - Supabase → Authentication → Providers → GitHub
   - Paste Client ID and Secret

**Status**: [ ] Complete

### Discord OAuth (6 minutes)

1. **Create Application**
   - URL: https://discord.com/developers/applications
   - New Application

2. **Add Redirect**
   - OAuth2 → Redirects → Add:
   ```
   https://<your-supabase-ref>.supabase.co/auth/v1/callback
   ```

3. **Add to Supabase**
   - Supabase → Authentication → Providers → Discord
   - Paste Client ID and Secret

**Status**: [ ] Complete

---

## ☑️ Step 4: Add Vercel Environment Variables (5 minutes)

### Get Supabase Credentials

1. **Supabase → Project Settings → API**
   - Copy Project URL
   - Copy `anon` `public` key
   - Copy `service_role` `secret` key

### Add to Vercel

1. **Vercel Dashboard**
   - URL: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/environment-variables

2. **Add Variables** (one at a time):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   NEXT_PUBLIC_LAMBDA_PHI=2.176435e-8
   ```

3. **Select Environment**: Production + Preview + Development

**Status**: [ ] Complete

---

## ☑️ Step 5: Redeploy (2 minutes)

### Trigger New Deployment

**Option A: Vercel Dashboard**
1. Deployments → Latest → Redeploy
2. Use existing build cache: ✅ Yes
3. Click Redeploy

**Option B: Make Small Change**
```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel
echo "# Backend configured" >> README.md
git add . && git commit -m "Add backend configuration" && git push
```

**Status**: [ ] Complete

---

## ☑️ Step 6: Test Core Features (15 minutes)

### Test Authentication

1. **Register Account**
   - Go to: `/auth/register`
   - Create account with email/password
   - ✅ Should redirect to login

2. **Login**
   - Use credentials from registration
   - ✅ Should redirect to profile page

3. **Google OAuth**
   - Logout → Login → "Continue with Google"
   - ✅ Should authenticate and redirect

**Status**: [ ] Complete

### Test Profile

1. **Edit Profile**
   - Go to: `/settings/profile`
   - Update display name and bio
   - Click Save
   - ✅ Changes should persist

2. **Upload Avatar**
   - Click avatar upload
   - Select image file
   - ✅ Should upload and display

**Status**: [ ] Complete

### Test Social Features

1. **View Leaderboard**
   - Go to: `/leaderboard`
   - ✅ Should show registered users

2. **View Activity Feed**
   - Go to: `/feed`
   - ✅ Should load (may be empty initially)

**Status**: [ ] Complete

---

## 📋 Quick Reference URLs

### Supabase
- Dashboard: https://supabase.com/dashboard
- SQL Editor: https://supabase.com/dashboard → SQL Editor
- Storage: https://supabase.com/dashboard → Storage
- Authentication: https://supabase.com/dashboard → Authentication

### OAuth Providers
- Google Console: https://console.cloud.google.com/
- GitHub Settings: https://github.com/settings/developers
- Discord Developers: https://discord.com/developers/applications

### Vercel
- Project Dashboard: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel
- Environment Variables: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/environment-variables
- Deployments: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/deployments

### Production Site
- Latest Deployment: https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app
- Login: `/auth/login`
- Register: `/auth/register`
- Profile Settings: `/settings/profile`

---

## ✅ Success Indicators

When everything is working:

- ✅ User registration works (email or OAuth)
- ✅ Login redirects to profile page
- ✅ Profile editing saves data
- ✅ Avatar uploads to Supabase Storage
- ✅ Leaderboard shows users
- ✅ No console errors about Supabase connection
- ✅ All 15 database tables exist
- ✅ OAuth providers don't show errors

---

## 🚨 Common Issues

**Migration fails with "relation already exists"**
- Drop existing tables first (destroys data)

**OAuth gives "redirect_uri_mismatch"**
- Verify callback URL matches exactly in OAuth app

**Images won't upload**
- Check Storage RLS policies are configured

**"NEXT_PUBLIC_SUPABASE_URL is undefined"**
- Redeploy after adding environment variables

---

## 📞 Support

- Full Guide: `BACKEND_SETUP_GUIDE.md`
- Implementation Docs: `MULTI_USER_IMPLEMENTATION_STATUS.md`
- API Reference: `lib/api/*.ts` (JSDoc comments)

---

**Estimated Total Time**: 30-60 minutes
**Difficulty**: Medium (OAuth app creation required)

**Current Step**: [ ] Migration → [ ] Storage → [ ] OAuth → [ ] Env Vars → [ ] Deploy → [ ] Test

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**
