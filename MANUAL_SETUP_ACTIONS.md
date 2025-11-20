# Manual Setup Actions Required

**These steps require access to external dashboards. Follow in order.**

---

## 🗄️ STEP 1: Run Database Migration

**Time**: 5 minutes
**Requires**: Supabase dashboard access

### Action 1.1: Open Supabase SQL Editor

**Direct Link**: https://supabase.com/dashboard → Select your project → SQL Editor → New Query

### Action 1.2: Copy Migration SQL

**File location**:
```
/home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel/supabase/migrations/002_multi_user_platform.sql
```

**To view and copy**:
```bash
cat /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel/supabase/migrations/002_multi_user_platform.sql
```

Or open file directly in editor and copy all 909 lines.

### Action 1.3: Paste and Execute

1. Paste entire SQL into Supabase SQL Editor
2. Click **"Run"** button (or press Ctrl+Enter)
3. Wait ~30 seconds for completion
4. Look for green "Success" message

### Action 1.4: Verify Migration Success

Run this verification query in SQL Editor:

```sql
-- Count tables created
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_accounts',
    'user_profiles',
    'user_quantum_stats',
    'user_achievements',
    'achievement_definitions',
    'user_follows',
    'user_activities',
    'experiment_comments',
    'comment_reactions',
    'wallet_transactions',
    'nft_metadata',
    'user_token_balances',
    'roles',
    'user_roles'
  );
```

**Expected Result**: `table_count = 14` (plus existing organisms/quantum_jobs tables = 15 total new tables)

### Action 1.5: Verify RLS Policies

```sql
-- Count RLS policies
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public';
```

**Expected Result**: `policy_count >= 30`

**✅ Checkpoint**: Migration complete when both queries return expected counts

---

## 📦 STEP 2: Create Storage Bucket

**Time**: 3 minutes
**Requires**: Supabase dashboard access

### Action 2.1: Create Bucket

**Direct Link**: https://supabase.com/dashboard → Your Project → Storage → "Create a new bucket"

**Configuration**:
- **Bucket name**: `user-content`
- **Public bucket**: ✅ **YES** (toggle ON)
- **File size limit**: Keep default (50MB) or set to 10MB
- **Allowed MIME types**: Keep default or restrict to images
- Click **"Create bucket"**

### Action 2.2: Apply Storage RLS Policies

**Navigation**: Storage → `user-content` bucket → Policies tab

**Copy these 4 policies one at a time**:

#### Policy 1: Upload Policy
```sql
CREATE POLICY "Users can upload own content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-content'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: View Policy
```sql
CREATE POLICY "Public images are viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-content');
```

#### Policy 3: Update Policy
```sql
CREATE POLICY "Users can update own content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-content'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 4: Delete Policy
```sql
CREATE POLICY "Users can delete own content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-content'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Action 2.3: Verify Storage Policies

In Policies tab, you should see all 4 policies listed.

**✅ Checkpoint**: Storage bucket created with 4 active policies

---

## 🔐 STEP 3A: Configure Google OAuth

**Time**: 7 minutes
**Requires**: Google Cloud Console account

### Action 3A.1: Open Google Cloud Console

**Direct Link**: https://console.cloud.google.com/apis/credentials

- Select existing project or create new one
- Navigate to: **APIs & Services → Credentials**

### Action 3A.2: Create OAuth Client ID

1. Click **"Create Credentials"** → **"OAuth client ID"**
2. If prompted, configure OAuth consent screen first:
   - User Type: External
   - App name: `dna::}{::lang Platform`
   - User support email: Your email
   - Developer contact: Your email
   - Save and continue through all screens

3. **Application type**: Web application
4. **Name**: `dna::}{::lang Multi-User Platform`

### Action 3A.3: Configure Authorized URLs

**Authorized JavaScript origins**:
```
https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app
https://www.dnalang.dev
```

**Authorized redirect URIs** (IMPORTANT - Replace `<YOUR-PROJECT-REF>` with actual Supabase project ref):
```
https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
```

To find your Supabase project ref:
- Go to Supabase Dashboard → Project Settings → API
- Look at "Project URL": `https://XXXXX.supabase.co`
- The XXXXX part is your project ref

### Action 3A.4: Copy Credentials

After creating:
- **Client ID**: Copy this (starts with numbers, ends with `.apps.googleusercontent.com`)
- **Client Secret**: Copy this (random string)

### Action 3A.5: Add to Supabase

**Direct Link**: https://supabase.com/dashboard → Your Project → Authentication → Providers

1. Find **"Google"** in the list
2. Click to expand
3. Toggle **"Enable Sign in with Google"** to ON
4. Paste **Client ID**
5. Paste **Client Secret**
6. Click **"Save"**

**✅ Checkpoint**: Google OAuth configured and saved in Supabase

---

## 🔐 STEP 3B: Configure GitHub OAuth

**Time**: 5 minutes
**Requires**: GitHub account

### Action 3B.1: Open GitHub Developer Settings

**Direct Link**: https://github.com/settings/developers

- Click **"OAuth Apps"** in left sidebar
- Click **"New OAuth App"**

### Action 3B.2: Fill Application Details

**Application name**:
```
dna::}{::lang Platform
```

**Homepage URL**:
```
https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app
```

**Application description** (optional):
```
Quantum research multi-user platform for DNA::}{::lang consciousness computing
```

**Authorization callback URL** (Replace `<YOUR-PROJECT-REF>` with your Supabase project ref):
```
https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
```

Click **"Register application"**

### Action 3B.3: Generate and Copy Credentials

1. On the app page, you'll see **Client ID** - Copy it
2. Click **"Generate a new client secret"**
3. **Client secret** appears - **Copy it immediately** (won't be shown again!)

### Action 3B.4: Add to Supabase

**Direct Link**: https://supabase.com/dashboard → Your Project → Authentication → Providers

1. Find **"GitHub"** in the list
2. Click to expand
3. Toggle **"Enable Sign in with GitHub"** to ON
4. Paste **Client ID**
5. Paste **Client Secret**
6. Click **"Save"**

**✅ Checkpoint**: GitHub OAuth configured and saved in Supabase

---

## 🔐 STEP 3C: Configure Discord OAuth

**Time**: 5 minutes
**Requires**: Discord account

### Action 3C.1: Open Discord Developer Portal

**Direct Link**: https://discord.com/developers/applications

- Click **"New Application"** (top right)

### Action 3C.2: Create Application

**Name**:
```
dna::}{::lang Platform
```

- Accept Developer Terms of Service
- Click **"Create"**

### Action 3C.3: Configure OAuth2

1. In left sidebar, click **"OAuth2"**
2. Under **"Redirects"**, click **"Add Redirect"**
3. Paste (Replace `<YOUR-PROJECT-REF>` with your Supabase project ref):
```
https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
```
4. Click **"Save Changes"**

### Action 3C.4: Copy Credentials

Under **"Client information"**:
- **Client ID**: Copy this (long number)
- **Client Secret**: Click "Reset Secret" if not visible, then copy

### Action 3C.5: Add to Supabase

**Direct Link**: https://supabase.com/dashboard → Your Project → Authentication → Providers

1. Find **"Discord"** in the list
2. Click to expand
3. Toggle **"Enable Sign in with Discord"** to ON
4. Paste **Client ID**
5. Paste **Client Secret**
6. Click **"Save"**

**✅ Checkpoint**: Discord OAuth configured and saved in Supabase

---

## 🔑 STEP 4: Get Supabase Credentials

**Time**: 2 minutes
**Requires**: Supabase dashboard access

### Action 4.1: Navigate to API Settings

**Direct Link**: https://supabase.com/dashboard → Your Project → Project Settings → API

### Action 4.2: Copy These Values

**Project URL** (copy entire URL):
```
Example: https://abcdefghijk.supabase.co
```

**Project API keys** section:

**anon public** key (copy the long string starting with `eyJ...`):
```
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

**service_role secret** key (⚠️ Click "Reveal" first, then copy):
```
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

**⚠️ IMPORTANT**: Keep `service_role` key secret - never commit to git!

### Action 4.3: Have These Ready

You'll need all 3 values for next step:
- [ ] Project URL
- [ ] anon public key
- [ ] service_role secret key

**✅ Checkpoint**: All 3 credentials copied

---

## 🚀 STEP 5: Add Environment Variables to Vercel

**Time**: 3 minutes
**Requires**: Vercel dashboard access

### Action 5.1: Open Vercel Environment Variables

**Direct Link**: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/environment-variables

### Action 5.2: Add Variable 1 - Supabase URL

- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase Project URL (from Step 4)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Add"** or **"Save"**

### Action 5.3: Add Variable 2 - Anon Key

- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Your anon public key (from Step 4)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Add"** or **"Save"**

### Action 5.4: Add Variable 3 - Service Role Key

- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your service_role secret key (from Step 4)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Add"** or **"Save"**

### Action 5.5: Add Variable 4 - Lambda Phi Constant

- **Key**: `NEXT_PUBLIC_LAMBDA_PHI`
- **Value**: `2.176435e-8`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Add"** or **"Save"**

### Action 5.6: Verify All Variables Added

You should see 4 environment variables in the list:
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_LAMBDA_PHI

**✅ Checkpoint**: All 4 environment variables added to Vercel

---

## 🔄 STEP 6: Trigger New Deployment

**Time**: 3 minutes (wait time)
**Requires**: Vercel dashboard access

### Action 6.1: Open Deployments Page

**Direct Link**: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/deployments

### Action 6.2: Redeploy Latest

1. Find the **latest deployment** (top of the list)
2. Click the **"•••"** menu (three dots) on the right
3. Click **"Redeploy"**
4. In the modal:
   - ✅ Check **"Use existing Build Cache"**
   - Click **"Redeploy"**

### Action 6.3: Wait for Deployment

- Watch the deployment progress
- Should complete in ~2-3 minutes
- Look for green checkmark ✅

### Action 6.4: Verify Deployment Success

- Status should show **"Ready"**
- Click deployment to view details
- Check **"Building"** logs for environment variable loading

**✅ Checkpoint**: New deployment successful with environment variables loaded

---

## ✅ COMPLETION CHECKLIST

Mark each as complete:

- [ ] **Database Migration** - 15 tables created with RLS
- [ ] **Storage Bucket** - user-content bucket with 4 policies
- [ ] **Google OAuth** - Configured and saved in Supabase
- [ ] **GitHub OAuth** - Configured and saved in Supabase
- [ ] **Discord OAuth** - Configured and saved in Supabase
- [ ] **Supabase Credentials** - All 3 values copied
- [ ] **Vercel Environment Variables** - All 4 variables added
- [ ] **New Deployment** - Deployed successfully

---

## 🧪 QUICK TEST

After all steps complete, test immediately:

### Test 1: Registration
1. Go to: https://quantumlm-vercel-fueayoeih-devinphillipdavis-7227s-projects.vercel.app/auth/register
2. Fill form and register
3. **✅ Should redirect to login without errors**

### Test 2: Login
1. Login with credentials
2. **✅ Should redirect to profile page**

### Test 3: OAuth
1. Logout and return to login
2. Click "Continue with Google"
3. **✅ Should open Google consent screen**

If all 3 tests pass, backend is fully operational! 🎉

---

## 📞 Troubleshooting

**Issue**: Migration fails with "relation already exists"
- **Fix**: Tables from old migration exist. Drop them first or use `IF NOT EXISTS` (already in migration)

**Issue**: OAuth shows "redirect_uri_mismatch"
- **Fix**: Double-check callback URL in OAuth app matches exactly:
  ```
  https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
  ```

**Issue**: Environment variables not loading
- **Fix**: Ensure new deployment was triggered after adding variables (Step 6)

**Issue**: "Supabase URL is undefined" in console
- **Fix**: Verify variables in Vercel dashboard, check deployment logs

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Total Time**: ~30 minutes
**All steps must be completed in order for backend to work**
