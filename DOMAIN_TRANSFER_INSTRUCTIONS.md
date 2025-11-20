# Domain Transfer: Exact Steps to Fix 403 Error

**Problem**: `Error: Not authorized to use www.dnalang.dev (403)`

**Cause**: Domains are currently owned by quantumlm-frontend project

**Solution**: Remove from quantumlm-frontend, then add to quantumlm-vercel

---

## Step 1: Remove Domains from quantumlm-frontend

**⚠️ This MUST be done via web dashboard - CLI cannot do this**

### 1.1 Open quantumlm-frontend Domain Settings

**URL**: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-frontend/settings/domains

Or navigate manually:
1. Go to https://vercel.com/dashboard
2. Select team: `devinphillipdavis-7227s-projects`
3. Click on project: `quantumlm-frontend`
4. Click `Settings` (top navigation)
5. Click `Domains` (left sidebar)

---

### 1.2 Remove Each Domain

You should see three domains listed:
- www.dnalang.dev
- chat.dnalang.dev
- dnalang.dev

**For EACH domain**:
1. Find the domain in the list
2. Click the **⋯** (three dots) menu on the right
3. Select **"Remove Domain"**
4. Confirm removal in the popup

**Repeat for all 3 domains.**

---

### 1.3 Verify Removal

After removing all domains, the quantumlm-frontend domains page should show:
```
No domains configured
```

---

## Step 2: Add Domains to quantumlm-vercel

**Now the CLI commands will work!**

### 2.1 Run CLI Commands

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Add all three domains
npx vercel domains add www.dnalang.dev
npx vercel domains add chat.dnalang.dev
npx vercel domains add dnalang.dev
```

**Expected output** (instead of 403):
```
✅ Domain www.dnalang.dev added to quantumlm-vercel
✅ Domain chat.dnalang.dev added to quantumlm-vercel
✅ Domain dnalang.dev added to quantumlm-vercel
```

---

### 2.2 Check Domain Status

```bash
npx vercel domains ls
```

Should show:
```
Domain              Added    Valid   Redirect
www.dnalang.dev     XXs ago  ✅ Yes  -
chat.dnalang.dev    XXs ago  ✅ Yes  -
dnalang.dev         XXs ago  ✅ Yes  www.dnalang.dev
```

Or might show:
```
Domain              Added    Valid   Redirect
www.dnalang.dev     XXs ago  ⚠️ DNS  -
chat.dnalang.dev    XXs ago  ⚠️ DNS  -
dnalang.dev         XXs ago  ⚠️ DNS  www.dnalang.dev
```

If you see ⚠️ DNS warnings, that's **normal** - it means Vercel is waiting for DNS to point to the new project.

---

## Step 3: Check DNS Configuration

### 3.1 Get DNS Records from Vercel

**Option A: Web Dashboard**
1. Go to: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/domains
2. Click on each domain to see required DNS records

**Option B: CLI**
```bash
npx vercel domains inspect www.dnalang.dev
npx vercel domains inspect chat.dnalang.dev
npx vercel domains inspect dnalang.dev
```

---

### 3.2 Expected DNS Records

Vercel will show records like:

**For www.dnalang.dev:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For chat.dnalang.dev:**
```
Type: CNAME
Name: chat
Value: cname.vercel-dns.com
```

**For dnalang.dev (apex):**
```
Type: A
Name: @ (or blank)
Value: 76.76.21.21 (or another IP)
```

---

### 3.3 Check Current DNS

See what DNS records currently exist:

```bash
# Check www subdomain
dig www.dnalang.dev CNAME +short

# Check chat subdomain
dig chat.dnalang.dev CNAME +short

# Check apex domain
dig dnalang.dev A +short
```

**If these already point to vercel-dns.com or Vercel IPs**: You're good! DNS is already correct.

**If these point elsewhere**: You need to update DNS at your registrar.

---

## Step 4: Update DNS (If Needed)

### 4.1 Identify DNS Provider

Where did you register dnalang.dev?
- Namecheap
- GoDaddy
- Cloudflare
- Google Domains
- Other?

---

### 4.2 Update DNS Records

**If Namecheap**:
1. Log in to https://namecheap.com
2. Go to Domain List → Manage
3. Click "Advanced DNS"
4. Update/add CNAME records for www and chat
5. Update/add A record for @ (apex)

**If GoDaddy**:
1. Log in to https://godaddy.com
2. Go to My Products → Domains → DNS
3. Update records

**If Cloudflare**:
1. Log in to https://cloudflare.com
2. Select dnalang.dev domain
3. Go to DNS → Records
4. Update records
5. **Important**: Set to "DNS only" (gray cloud), not proxied (orange cloud)

---

### 4.3 Wait for Propagation

DNS changes take **5-30 minutes** (usually < 10 min).

**Check propagation globally**:
- https://www.whatsmydns.net/#CNAME/www.dnalang.dev
- https://www.whatsmydns.net/#CNAME/chat.dnalang.dev
- https://www.whatsmydns.net/#A/dnalang.dev

When most locations show the new Vercel values, you're ready!

---

## Step 5: Verify SSL Certificates

### 5.1 Check Certificate Status

**Web Dashboard**:
1. Go to: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/domains
2. Check status for each domain:
   - ✅ **Valid** - Certificate provisioned, ready!
   - ⏳ **Provisioning** - Wait a few more minutes
   - ❌ **Error** - Check DNS is correct

**CLI**:
```bash
npx vercel domains ls
```

Look for `Valid: ✅ Yes` for each domain.

---

### 5.2 Test in Browser

Once valid, visit:
- https://www.dnalang.dev
- https://chat.dnalang.dev
- https://dnalang.dev (should redirect to www)

You should see:
- ✅ Green padlock (SSL working)
- ✅ Homepage with dna::}{::lang branding
- ✅ All features accessible (/chat, /benchmarks, /workloads, /orchestrator)

---

## Step 6: Final Verification

### 6.1 Test All Routes

```bash
# Homepage
curl -I https://www.dnalang.dev/

# Chat
curl -I https://www.dnalang.dev/chat

# Workloads
curl -I https://www.dnalang.dev/workloads

# Benchmarks (NEW)
curl -I https://www.dnalang.dev/benchmarks

# Orchestrator
curl -I https://www.dnalang.dev/orchestrator

# Chat subdomain
curl -I https://chat.dnalang.dev/
```

All should return:
```
HTTP/2 200
```

---

### 6.2 Test Auto-Deployment

Make a small change and push:

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Make a trivial change
echo "# Test auto-deploy" >> README.md

# Commit and push
git add README.md
git commit -m "Test auto-deploy to www.dnalang.dev"
git push origin main

# Wait ~2-3 minutes
# Visit www.dnalang.dev to see change
```

---

## Troubleshooting

### Problem: Still getting 403 after Step 1

**Check**:
- Did you remove ALL 3 domains from quantumlm-frontend?
- Refresh the quantumlm-frontend domains page - do you still see them?
- Wait 1-2 minutes after removal, then try adding again

---

### Problem: DNS warning persists

**Check**:
```bash
dig www.dnalang.dev CNAME +short
```

**If it shows old values**:
- DNS hasn't propagated yet (wait 5-30 min)
- Or you didn't update DNS at registrar

**If it shows `cname.vercel-dns.com`**:
- DNS is correct!
- Wait for Vercel to verify (can take up to 1 hour)

---

### Problem: Certificate provisioning fails

**Causes**:
- DNS not pointing to Vercel
- Cloudflare proxy enabled (must be "DNS only")
- CAA records blocking Let's Encrypt

**Fix**:
1. Verify DNS with `dig` commands
2. If using Cloudflare, disable proxy (orange → gray cloud)
3. Check for CAA records: `dig dnalang.dev CAA`
4. Wait 1 hour, then try removing and re-adding domain

---

## Quick Reference: The Commands

**After removing domains from quantumlm-frontend dashboard:**

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Add domains (will work after Step 1 complete)
npx vercel domains add www.dnalang.dev
npx vercel domains add chat.dnalang.dev
npx vercel domains add dnalang.dev

# Check status
npx vercel domains ls

# Inspect specific domain
npx vercel domains inspect www.dnalang.dev

# Test
curl -I https://www.dnalang.dev/
curl -I https://www.dnalang.dev/benchmarks
```

---

## Current Status (Based on Your Output)

✅ **Deployment working**: https://quantumlm-vercel-dy0ede5s6-devinphillipdavis-7227s-projects.vercel.app

✅ **Environment variables set**: Supabase + IBM Quantum configured

✅ **Code deployed**: Latest version with benchmarks, chat, workloads, orchestrator

❌ **Domains blocked**: www.dnalang.dev, chat.dnalang.dev, dnalang.dev still owned by quantumlm-frontend

**Next Step**: Remove domains from quantumlm-frontend via web dashboard (Step 1 above)

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Remove from quantumlm-frontend | 1-2 min | ⏳ **DO THIS NOW** |
| Add to quantumlm-vercel | 30 sec | ⏳ After Step 1 |
| DNS propagation | 5-30 min | ⏳ Automatic |
| SSL provisioning | 2-10 min | ⏳ Automatic |
| **Total** | **10-45 min** | - |

---

**Action Required**: Go to https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-frontend/settings/domains and remove all 3 domains, then re-run the `npx vercel domains add` commands.

---

**Last Updated**: November 19, 2025
**Status**: Deployment working, domains need transfer
