# Setup Instructions - Backend Activation

**Status**: Frontend deployed ✅ | Backend configuration needed ⏳

**Production URL**: https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app

---

## What You Need

Before starting, make sure you have access to:

- [x] Supabase project (already created)
- [ ] Google Cloud Console account
- [ ] GitHub account
- [ ] Discord Developer account
- [ ] Vercel project access

**Estimated Time**: 30-60 minutes

---

## Step-by-Step Setup

### 1️⃣ Run Database Migration (15 min)

**What this does**: Creates 15 database tables with Row-Level Security for the multi-user platform.

#### Instructions:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy Migration File**
   - File location: `supabase/migrations/002_multi_user_platform.sql`
   - Copy entire contents

4. **Execute Migration**
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for green "Success" message

5. **Verify Tables Created**
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

   **Expected**: 15 tables (user_accounts, user_profiles, etc.)

**Checkpoint**: [ ] Migration successful, 15 tables exist

---

### 2️⃣ Create Storage Bucket (5 min)

**What this does**: Enables users to upload avatar and banner images.

#### Instructions:

1. **Create Bucket**
   - Supabase Dashboard → Storage
   - Click "Create a new bucket"
   - Name: `user-content`
   - Public bucket: ✅ **Yes**
   - Click "Create bucket"

2. **Add Security Policies**
   - Click on `user-content` bucket
   - Click "Policies" tab
   - Click "New Policy"
   - For each policy, paste SQL from `storage_rls_policies.sql`
   - Or: Copy-paste all 4 policies from BACKEND_SETUP_GUIDE.md Step 2

3. **Verify Policies**
   - Should see 4 policies:
     - "Users can upload own content"
     - "Public images are viewable"
     - "Users can update own content"
     - "Users can delete own content"

**Checkpoint**: [ ] Bucket created with 4 RLS policies

---

### 3️⃣ Configure OAuth Providers (20 min)

**What this does**: Enables "Sign in with Google/GitHub/Discord" buttons.

#### Google OAuth (~7 min)

1. **Create OAuth Credentials**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `dna::}{::lang Platform`

2. **Configure Authorized URLs**
   - Authorized redirect URIs (click "Add URI"):
     ```
     https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback
     ```
     (Replace `<YOUR-SUPABASE-PROJECT-REF>` with your actual Supabase project reference)

3. **Copy Credentials**
   - Client ID: Copy this
   - Client Secret: Copy this

4. **Add to Supabase**
   - Supabase Dashboard → Authentication → Providers
   - Find "Google" → Click to expand
   - Toggle "Enable Sign in with Google"
   - Paste Client ID
   - Paste Client Secret
   - Click "Save"

**Checkpoint**: [ ] Google OAuth configured

#### GitHub OAuth (~7 min)

1. **Create OAuth App**
   - Go to: https://github.com/settings/developers
   - Click "OAuth Apps"
   - Click "New OAuth App"

2. **Fill Application Details**
   ```
   Application name: dna::}{::lang Platform
   Homepage URL: https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app
   Application description: Quantum research multi-user platform
   Authorization callback URL: https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback
   ```

3. **Generate Credentials**
   - Click "Register application"
   - Copy **Client ID**
   - Click "Generate a new client secret"
   - Copy **Client secret** (won't be shown again!)

4. **Add to Supabase**
   - Supabase Dashboard → Authentication → Providers
   - Find "GitHub" → Click to expand
   - Toggle "Enable Sign in with GitHub"
   - Paste Client ID
   - Paste Client Secret
   - Click "Save"

**Checkpoint**: [ ] GitHub OAuth configured

#### Discord OAuth (~6 min)

1. **Create Discord Application**
   - Go to: https://discord.com/developers/applications
   - Click "New Application"
   - Name: `dna::}{::lang Platform`
   - Accept Developer Terms → "Create"

2. **Configure OAuth2**
   - Navigate to "OAuth2" in left sidebar
   - Under "Redirects", click "Add Redirect"
   - Paste:
     ```
     https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback
     ```
   - Click "Save Changes"

3. **Copy Credentials**
   - Under "Client information":
     - Copy **Client ID**
     - Copy **Client Secret** (click "Reset Secret" if needed)

4. **Add to Supabase**
   - Supabase Dashboard → Authentication → Providers
   - Find "Discord" → Click to expand
   - Toggle "Enable Sign in with Discord"
   - Paste Client ID
   - Paste Client Secret
   - Click "Save"

**Checkpoint**: [ ] Discord OAuth configured

---

### 4️⃣ Add Environment Variables to Vercel (5 min)

**What this does**: Connects the deployed app to your Supabase backend.

#### Get Supabase Credentials

1. **Navigate to Supabase API Settings**
   - Supabase Dashboard → Project Settings → API

2. **Copy These Values**:
   - **Project URL**: `https://xxxxxxxxx.supabase.co`
   - **`anon` `public` key**: Long string starting with `eyJ...`
   - **`service_role` `secret` key**: Long string starting with `eyJ...` (⚠️ Keep secret!)

#### Add to Vercel Dashboard

1. **Open Vercel Environment Variables**
   - Go to: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/environment-variables

2. **Add Each Variable** (one at a time):

   **Variable 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase Project URL (from above)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Variable 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your `anon` `public` key (from above)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Variable 3:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Your `service_role` `secret` key (from above)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Variable 4:**
   - Key: `NEXT_PUBLIC_LAMBDA_PHI`
   - Value: `2.176435e-8`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

**Checkpoint**: [ ] 4 environment variables added to Vercel

---

### 5️⃣ Trigger New Deployment (2 min)

**What this does**: Rebuilds the app with new environment variables.

#### Option A: Redeploy via Vercel Dashboard

1. Go to: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/deployments

2. Find the latest deployment (top of list)

3. Click the "•••" menu → "Redeploy"

4. Modal appears:
   - ✅ Check "Use existing Build Cache"
   - Click "Redeploy"

5. Wait ~2-3 minutes for deployment to complete

**Checkpoint**: [ ] Deployment successful

---

### 6️⃣ Test Everything (15 min)

**What this does**: Verifies all features work correctly.

#### Test 1: User Registration

1. **Open Production Site**
   - URL: https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app/auth/register

2. **Fill Registration Form**
   ```
   Email: test@example.com
   Username: testuser
   Display Name: Test User
   Password: TestPass123!
   Confirm Password: TestPass123!
   ```

3. **Click "Create Account"**
   - ✅ Should show "Account created successfully!" or similar
   - ✅ Should redirect to login page

**Checkpoint**: [ ] Registration works

#### Test 2: Login

1. **Go to Login Page**
   - URL: `/auth/login`

2. **Enter Credentials**
   - Email: `test@example.com`
   - Password: `TestPass123!`

3. **Click "Login"**
   - ✅ Should redirect to `/profile/testuser`
   - ✅ Profile page should load showing username

**Checkpoint**: [ ] Email/password login works

#### Test 3: OAuth Login

1. **Logout** (if logged in)

2. **Go to Login Page**
   - URL: `/auth/login`

3. **Click "Continue with Google"**
   - ✅ Should redirect to Google consent screen
   - ✅ Select Google account
   - ✅ Should redirect back to profile page

4. **Try GitHub OAuth**
   - Logout → Login → "Continue with GitHub"
   - ✅ Should authenticate with GitHub

5. **Try Discord OAuth**
   - Logout → Login → "Continue with Discord"
   - ✅ Should authenticate with Discord

**Checkpoint**: [ ] OAuth logins work (at least one provider)

#### Test 4: Profile Editing

1. **While logged in, go to Settings**
   - URL: `/settings/profile`

2. **Update Profile**
   - Display Name: "Test User Updated"
   - Bio: "Testing the quantum platform!"
   - Research Interests: Add "Quantum Computing"

3. **Click "Save Changes"**
   - ✅ Should show success message
   - ✅ Navigate to profile page
   - ✅ Changes should be visible

**Checkpoint**: [ ] Profile editing works

#### Test 5: Image Upload

1. **In Settings, Upload Avatar**
   - Click avatar upload area
   - Select an image file (JPG/PNG, <5MB)
   - ✅ Upload progress should show
   - ✅ New avatar should display

2. **Verify in Supabase**
   - Supabase Dashboard → Storage → user-content → avatars
   - ✅ Your uploaded file should appear

**Checkpoint**: [ ] Image uploads work

#### Test 6: Check Other Pages

1. **Leaderboard**
   - Go to: `/leaderboard`
   - ✅ Should show your user (and others if registered)
   - ✅ Try switching metrics (Φ, Λ, Experiments, etc.)

2. **Activity Feed**
   - Go to: `/feed`
   - ✅ Should load without errors
   - ✅ May be empty if no activity yet

3. **NFT Gallery**
   - Go to: `/nfts`
   - ✅ Should load without errors
   - ✅ May be empty if no NFTs minted yet

**Checkpoint**: [ ] All pages load correctly

---

## ✅ Setup Complete Checklist

When all steps are done:

- [ ] Database migration executed (15 tables)
- [ ] Storage bucket created (user-content)
- [ ] Storage RLS policies configured (4 policies)
- [ ] Google OAuth configured
- [ ] GitHub OAuth configured
- [ ] Discord OAuth configured
- [ ] Environment variables added to Vercel (4 vars)
- [ ] New deployment triggered
- [ ] User registration works
- [ ] Login works (email/password)
- [ ] OAuth login works (Google/GitHub/Discord)
- [ ] Profile editing saves data
- [ ] Avatar upload works
- [ ] Leaderboard displays
- [ ] All pages load without errors

---

## 🎉 Success!

If all checkpoints pass, your multi-user platform is **fully operational**!

### What's Now Available

✅ **User authentication** (email + 3 OAuth providers)
✅ **User profiles** with customization
✅ **Social features** (follow, leaderboards, activity feed)
✅ **Image uploads** (avatars, banners)
✅ **NFT gallery** infrastructure
✅ **Quantum stats tracking** (ready for job integration)
✅ **Achievement system** (auto-awards badges)
✅ **Secure RLS** (users isolated, data protected)

### Next Steps

Now that the backend is live, you can:

1. **Integrate QNRE Phase 2** (from original request)
   - Add QNRE metrics to quantum stats
   - Create QNRE visualization components
   - Connect to quantum job execution

2. **Add Real-Time Features**
   - WebSocket connections for live updates
   - Real-time notifications
   - Live leaderboard updates

3. **Production Hardening**
   - Enable email verification
   - Add rate limiting
   - Set up monitoring
   - Configure backups

---

## 📚 Additional Resources

- **Detailed Guide**: `BACKEND_SETUP_GUIDE.md` (step-by-step with troubleshooting)
- **Quick Checklist**: `QUICK_SETUP_CHECKLIST.md` (printable checklist)
- **Deployment Success**: `DEPLOYMENT_SUCCESS.md` (deployment details)
- **Implementation Status**: `MULTI_USER_IMPLEMENTATION_STATUS.md` (complete feature list)
- **API Documentation**: `lib/api/*.ts` (JSDoc comments in code)

---

## 🆘 Troubleshooting

### Issue: OAuth gives "redirect_uri_mismatch"
**Fix**: Verify callback URL in OAuth app matches exactly:
```
https://<YOUR-SUPABASE-REF>.supabase.co/auth/v1/callback
```

### Issue: Image upload fails
**Fix**: Check Storage RLS policies are configured (Step 2)

### Issue: "NEXT_PUBLIC_SUPABASE_URL is undefined" in browser console
**Fix**:
1. Verify environment variables in Vercel dashboard
2. Trigger new deployment (Step 5)

### Issue: Login redirects to error page
**Fix**:
1. Check browser console for errors
2. Verify Supabase environment variables are correct
3. Check Supabase project is not paused

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Total Setup Time**: ~60 minutes
**Difficulty**: Medium

**Support**: See BACKEND_SETUP_GUIDE.md for detailed troubleshooting
