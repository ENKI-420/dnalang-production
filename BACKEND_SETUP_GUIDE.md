# Backend Setup Guide - Multi-User Platform

**Estimated Time**: 30-60 minutes
**Status**: Step-by-step instructions for activating backend functionality

---

## Prerequisites

- Supabase account with project created
- Access to Supabase dashboard
- Google Cloud Console account (for Google OAuth)
- GitHub account (for GitHub OAuth)
- Discord Developer account (for Discord OAuth)
- Vercel account connected to project

---

## Step 1: Run Supabase Migration ⚠️ CRITICAL

This creates all 15 database tables with Row-Level Security policies.

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel
supabase link --project-ref <your-project-ref>

# Push migration to database
supabase db push
```

### Option B: Manual Execution via Dashboard

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy Migration File**
   ```bash
   cat supabase/migrations/002_multi_user_platform.sql
   ```
   - Copy the entire output

4. **Execute Migration**
   - Paste into SQL Editor
   - Click "Run" (or Ctrl+Enter)
   - Wait for completion message

5. **Verify Tables Created**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

   **Expected Output (15 tables)**:
   - comment_reactions
   - experiment_comments
   - nft_metadata
   - organism_registry
   - quantum_backend_status
   - quantum_job_results
   - roles
   - user_accounts
   - user_achievements
   - user_activities
   - user_follows
   - user_notifications
   - user_profiles
   - user_quantum_stats
   - user_roles
   - user_sessions
   - wallet_transactions

6. **Verify RLS Policies**
   ```sql
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```

   Expected: 60+ policies across all tables

---

## Step 2: Create Storage Bucket for User Images

### Create Bucket

1. **Navigate to Storage**
   - Supabase Dashboard → Storage → Create Bucket

2. **Configure Bucket**
   ```
   Bucket Name: user-content
   Public: ✅ Enabled
   File Size Limit: 10 MB
   Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
   ```

3. **Create Folder Structure**
   - Click into `user-content` bucket
   - Create folders:
     - `avatars/`
     - `banners/`
     - `nft-images/`

### Set Up RLS Policies for Storage

1. **Navigate to Policies**
   - Storage → user-content → Policies

2. **Add Upload Policy**
   ```sql
   CREATE POLICY "Users can upload own content"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'user-content'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

3. **Add View Policy**
   ```sql
   CREATE POLICY "Public images are viewable"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'user-content');
   ```

4. **Add Update Policy**
   ```sql
   CREATE POLICY "Users can update own content"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'user-content'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

5. **Add Delete Policy**
   ```sql
   CREATE POLICY "Users can delete own content"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'user-content'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

---

## Step 3: Configure OAuth Providers

### 3A. Google OAuth

**1. Create Google OAuth App**
   - Go to: https://console.cloud.google.com/
   - Create new project or select existing
   - Navigate to: APIs & Services → Credentials

**2. Create OAuth 2.0 Client ID**
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Name: `dna::}{::lang Multi-User Platform`

**3. Configure Authorized URLs**
   - Authorized JavaScript origins:
     ```
     https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app
     https://www.dnalang.dev
     ```

   - Authorized redirect URIs:
     ```
     https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
     ```

**4. Get Credentials**
   - Copy Client ID
   - Copy Client Secret

**5. Configure in Supabase**
   - Supabase Dashboard → Authentication → Providers
   - Find "Google" → Toggle enabled
   - Paste Client ID
   - Paste Client Secret
   - Save

### 3B. GitHub OAuth

**1. Create GitHub OAuth App**
   - Go to: https://github.com/settings/developers
   - Click "OAuth Apps" → "New OAuth App"

**2. Configure Application**
   ```
   Application name: dna::}{::lang Platform
   Homepage URL: https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app
   Application description: Quantum research multi-user platform
   Authorization callback URL: https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```

**3. Get Credentials**
   - Click "Register application"
   - Copy Client ID
   - Click "Generate a new client secret"
   - Copy Client Secret immediately (won't be shown again)

**4. Configure in Supabase**
   - Supabase Dashboard → Authentication → Providers
   - Find "GitHub" → Toggle enabled
   - Paste Client ID
   - Paste Client Secret
   - Save

### 3C. Discord OAuth

**1. Create Discord Application**
   - Go to: https://discord.com/developers/applications
   - Click "New Application"
   - Name: `dna::}{::lang Platform`
   - Accept terms, Create

**2. Configure OAuth2**
   - Navigate to: OAuth2 → General
   - Add Redirects:
     ```
     https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
     ```

**3. Get Credentials**
   - Copy Client ID
   - Copy Client Secret (click "Reset Secret" if needed)

**4. Configure in Supabase**
   - Supabase Dashboard → Authentication → Providers
   - Find "Discord" → Toggle enabled
   - Paste Client ID
   - Paste Client Secret
   - Save

---

## Step 4: Configure Vercel Environment Variables

### Get Supabase Credentials

1. **Supabase Dashboard → Project Settings → API**
   - Copy Project URL: `https://<project-ref>.supabase.co`
   - Copy `anon` `public` key
   - Copy `service_role` `secret` key (⚠️ Keep secret!)

### Add to Vercel

**Option A: Via Vercel Dashboard**

1. Go to: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/environment-variables

2. Add each variable:
   ```bash
   # Supabase Public Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>

   # Supabase Server Configuration (mark as SECRET)
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret-key>

   # ΛΦ Constant
   NEXT_PUBLIC_LAMBDA_PHI=2.176435e-8

   # IBM Quantum (if needed)
   IBM_QUANTUM_TOKEN=<your-ibm-token>
   ```

3. For each variable:
   - Name: Enter key name
   - Value: Paste value
   - Environment: Production, Preview, Development (all)
   - Click "Add"

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste value when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste value when prompted

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste value when prompted

vercel env add NEXT_PUBLIC_LAMBDA_PHI production
# Enter: 2.176435e-8
```

---

## Step 5: Deploy to Vercel

### Current Status
The code is already deployed at:
https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app

After adding environment variables, trigger a new deployment:

**Option A: Via Vercel Dashboard**
1. Go to project deployments
2. Click "Redeploy" on latest deployment
3. Check "Use existing build cache"
4. Click "Redeploy"

**Option B: Via Git Push (if GitHub connected)**
```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Make a small change to trigger deployment
echo "# Backend configured $(date)" >> README.md

# Commit and push
git add .
git commit -m "Configure backend environment variables"
git push origin main
```

**Option C: Via Vercel CLI**
```bash
vercel --prod
```

### Verify Deployment
1. Wait for build to complete (2-3 minutes)
2. Check build logs for environment variable loading
3. Visit production URL
4. Check browser console for Supabase connection

---

## Step 6: Test End-to-End

### Test Authentication

**1. Email/Password Registration**
   - Go to: `/auth/register`
   - Fill form:
     - Email: test@example.com
     - Username: testuser
     - Password: TestPass123!
   - Click "Create Account"
   - ✅ Should redirect to login page
   - Check Supabase Dashboard → Authentication → Users
   - ✅ New user should appear

**2. Email/Password Login**
   - Go to: `/auth/login`
   - Enter credentials from registration
   - Click "Login"
   - ✅ Should redirect to profile page
   - ✅ URL should be `/profile/testuser`

**3. OAuth Login (Google)**
   - Logout if logged in
   - Go to: `/auth/login`
   - Click "Continue with Google"
   - ✅ Should redirect to Google consent screen
   - Select Google account
   - ✅ Should redirect back to profile page
   - Check Supabase Dashboard → Authentication → Users
   - ✅ New user with Google provider should appear

**4. OAuth Login (GitHub)**
   - Test same flow with GitHub button
   - ✅ Should redirect to GitHub authorization
   - ✅ Should create new user or link existing

**5. OAuth Login (Discord)**
   - Test same flow with Discord button
   - ✅ Should redirect to Discord authorization
   - ✅ Should create new user or link existing

### Test Profile Features

**1. View Own Profile**
   - While logged in, navigate to your profile
   - ✅ Should show username, stats (all zeros initially)
   - ✅ Should show "Edit Profile" button

**2. Edit Profile**
   - Click "Edit Profile" or go to `/settings/profile`
   - Update fields:
     - Display Name: Test User
     - Bio: Testing the platform
     - Research Interests: Add "Quantum ML"
   - Click "Save Changes"
   - ✅ Should show success message
   - ✅ Profile page should reflect changes

**3. Upload Avatar**
   - In profile settings
   - Click avatar upload
   - Select image file (<5MB, JPEG/PNG)
   - ✅ Upload progress should show
   - ✅ New avatar should display
   - Check Supabase Dashboard → Storage → user-content/avatars/
   - ✅ File should be present

**4. Upload Banner**
   - Same process for banner image
   - ✅ Should upload to user-content/banners/

### Test Social Features

**1. Follow User**
   - Create second test account
   - Navigate to first user's profile
   - Click "Follow" button
   - ✅ Button should change to "Following"
   - ✅ Follower count should increase
   - Check database:
     ```sql
     SELECT * FROM user_follows;
     ```
   - ✅ Row should exist

**2. Unfollow User**
   - Click "Following" button
   - ✅ Should change back to "Follow"
   - ✅ Follower count should decrease

**3. View Activity Feed**
   - Go to `/feed`
   - ✅ Should show activity from followed users
   - Test filters: All, Organisms, Experiments
   - ✅ Filtering should work

**4. View Leaderboard**
   - Go to `/leaderboard`
   - ✅ Should show users ranked by metrics
   - Switch metrics: Φ, Λ, Experiments, Organisms, Tokens
   - ✅ Rankings should update

### Test Quantum Features

**1. View Stats**
   - On profile page, check stats section
   - ✅ Should show:
     - Total Experiments: 0
     - Total Organisms: 0
     - Max Φ: 0.0000
     - Max Λ: 0.0000

**2. View Achievements**
   - On profile page, check achievements section
   - ✅ Should show "First Steps" achievement (auto-awarded)
   - Check database:
     ```sql
     SELECT ua.*, ad.achievement_name
     FROM user_achievements ua
     JOIN achievement_definitions ad ON ua.achievement_id = ad.achievement_id
     WHERE ua.user_id = '<your-user-id>';
     ```
   - ✅ Achievement should be awarded

### Test NFT Features

**1. View NFT Gallery**
   - Go to `/nfts`
   - ✅ Gallery should load (empty initially)
   - Test filters: All, My NFTs, Organisms, Experiments, Achievements
   - ✅ Filters should work

**2. Connect Wallet**
   - Install MetaMask if not installed
   - Click wallet connection button
   - ✅ MetaMask popup should appear
   - Connect wallet
   - ✅ Wallet address should save to user_accounts table
   - Check database:
     ```sql
     SELECT wallet_address FROM user_accounts WHERE user_id = '<your-user-id>';
     ```
   - ✅ Address should be present

### Test Database Security (RLS)

**1. Test User Isolation**
   - Login as User A
   - Get User A's user_id from Supabase Dashboard
   - Login as User B
   - Try to access User A's private data directly:
     ```sql
     SELECT * FROM user_profiles WHERE user_id = '<user-a-id>';
     ```
   - ✅ Should only return data if profile is public
   - ✅ Private profiles should be hidden

**2. Test Edit Restrictions**
   - While logged in as User B
   - Try to update User A's profile via API
   - ✅ Should fail with authorization error
   - ✅ RLS policies should block the update

---

## Verification Checklist

### Database Setup
- [ ] Migration executed successfully (15 tables created)
- [ ] RLS policies active (60+ policies)
- [ ] Default roles inserted (admin, researcher, viewer)
- [ ] Triggers functional (stats updates, achievement awards)
- [ ] Storage bucket created (user-content)
- [ ] Storage RLS policies active

### OAuth Configuration
- [ ] Google OAuth working
- [ ] GitHub OAuth working
- [ ] Discord OAuth working
- [ ] Redirect URLs correct in all OAuth apps
- [ ] Supabase providers enabled and configured

### Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL set in Vercel
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set in Vercel
- [ ] SUPABASE_SERVICE_ROLE_KEY set in Vercel
- [ ] NEXT_PUBLIC_LAMBDA_PHI set in Vercel
- [ ] Variables accessible in production

### Authentication
- [ ] Email/password registration works
- [ ] Email/password login works
- [ ] Google OAuth login works
- [ ] GitHub OAuth login works
- [ ] Discord OAuth login works
- [ ] Session persists across page reloads
- [ ] Logout works

### Profile Features
- [ ] Profile page loads
- [ ] Profile editing works
- [ ] Avatar upload works
- [ ] Banner upload works
- [ ] Bio saves correctly
- [ ] Research interests save
- [ ] Visibility settings work

### Social Features
- [ ] Follow/unfollow works
- [ ] Follower counts update
- [ ] Activity feed populates
- [ ] Leaderboard displays
- [ ] User search works

### Security
- [ ] RLS prevents unauthorized access
- [ ] Users can only edit own profiles
- [ ] Private profiles hidden from non-followers
- [ ] File uploads restricted to own folders
- [ ] Admin routes require admin role

---

## Troubleshooting

### Migration Fails
**Error**: "relation already exists"
- **Cause**: Tables from previous migration
- **Fix**: Drop existing tables first (⚠️ destroys data):
  ```sql
  DROP TABLE IF EXISTS public.user_accounts CASCADE;
  DROP TABLE IF EXISTS public.user_profiles CASCADE;
  -- Repeat for all tables
  ```

### OAuth Redirect Fails
**Error**: "redirect_uri_mismatch"
- **Cause**: Callback URL doesn't match OAuth app config
- **Fix**: Ensure callback URL in OAuth app exactly matches:
  ```
  https://<supabase-project-ref>.supabase.co/auth/v1/callback
  ```

### Image Upload Fails
**Error**: "new row violates row-level security policy"
- **Cause**: Storage RLS policies not configured
- **Fix**: Re-run storage RLS policy SQL from Step 2

### Environment Variables Not Loading
**Error**: "NEXT_PUBLIC_SUPABASE_URL is undefined"
- **Cause**: Variables not set in Vercel or deployment didn't pick them up
- **Fix**:
  1. Verify variables in Vercel dashboard
  2. Trigger new deployment after adding variables

### Database Connection Fails
**Error**: "Failed to fetch" when calling Supabase
- **Cause**: CORS issues or wrong project URL
- **Fix**:
  1. Verify NEXT_PUBLIC_SUPABASE_URL is correct
  2. Check Supabase project is not paused
  3. Verify anon key is correct

---

## Success Criteria

When all tests pass, you should have:

✅ **15 database tables** with full RLS security
✅ **3 OAuth providers** working (Google, GitHub, Discord)
✅ **User registration** via email or OAuth
✅ **Profile management** with image uploads
✅ **Social features** (follow, activity feed, leaderboard)
✅ **NFT gallery** with wallet integration
✅ **Achievement system** auto-awarding badges
✅ **Quantum stats tracking** ready for job integration

---

## Next Steps After Backend Setup

Once backend is live and tested:

1. **QNRE Phase 2 Integration**
   - Add QNRE metrics to user_quantum_stats
   - Create QNRE visualization components
   - Integrate with quantum job execution

2. **Real-Time Features**
   - Set up Supabase Realtime subscriptions
   - Add live notifications
   - Add live leaderboard updates

3. **Production Hardening**
   - Enable email verification
   - Add rate limiting
   - Set up monitoring/alerting
   - Configure backup strategy

4. **Custom Domain**
   - Point DNS to Vercel
   - Update OAuth redirect URLs
   - Test SSL certificates

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Estimated Setup Time**: 30-60 minutes
**Difficulty**: Moderate (requires OAuth app creation)
**Support**: Refer to DEPLOYMENT_SUCCESS.md for additional details
