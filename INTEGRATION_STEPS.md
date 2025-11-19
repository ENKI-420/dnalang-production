# Domain Integration - Exact Steps

**Date**: November 19, 2025
**Current Status**: quantumlm-vercel is live with all new features, but has NO custom domains
**Target**: Make www.dnalang.dev and chat.dnalang.dev serve quantumlm-vercel content

---

## Current Deployment Status ✅

**quantumlm-vercel project**:
- ✅ Latest deployment: Working (36 minutes ago)
- ✅ Production URL: https://quantumlm-vercel-7c3njc9qg-devinphillipdavis-7227s-projects.vercel.app
- ✅ Features verified:
  - Homepage with dna::}{::lang branding
  - `/chat` - Quantum chatbot
  - `/workloads` - IBM Quantum analytics
  - `/benchmarks` - Interactive validation dashboard (NEW)
  - `/orchestrator` - Multi-agent system
- ❌ Custom domains: None configured yet

**quantumlm-frontend project** (separate):
- Owns production domains: www.dnalang.dev, chat.dnalang.dev
- Needs to transfer these domains to quantumlm-vercel

---

## Integration Method: Option 1 (Recommended)

**Time Required**: 5-15 minutes
**Difficulty**: Easy
**Approach**: Add domains to quantumlm-vercel, remove from quantumlm-frontend

---

## Step-by-Step Instructions

### Step 1: Remove Domains from quantumlm-frontend

**Why**: Vercel allows a domain to be assigned to only ONE project at a time

1. Go to: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-frontend/settings/domains

2. For each domain (www.dnalang.dev, chat.dnalang.dev, dnalang.dev):
   - Click the **3-dot menu** (⋯) next to the domain
   - Click **"Remove Domain"**
   - Confirm removal

3. Verify all 3 domains are removed before proceeding

---

### Step 2: Add Domains to quantumlm-vercel

1. Go to: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/domains

2. Click **"Add Domain"** button

3. Enter: `www.dnalang.dev`
   - Click **"Add"**
   - Vercel will show domain configuration

4. Repeat for:
   - `chat.dnalang.dev`
   - `dnalang.dev` (root domain, will redirect to www)

---

### Step 3: Copy DNS Records

Vercel will provide DNS records for each domain. **Expected values**:

#### For www.dnalang.dev:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### For chat.dnalang.dev:
```
Type: CNAME
Name: chat
Value: cname.vercel-dns.com
TTL: 3600
```

#### For dnalang.dev (apex/root):
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600
```

**Note**: Exact IP address will be shown in Vercel dashboard. Copy the values Vercel provides.

---

### Step 4: Update DNS Provider

**If domains are registered with Namecheap**:
1. Log in to Namecheap
2. Go to Domain List → Manage → Advanced DNS
3. Delete existing A/CNAME records for www, chat, @ (root)
4. Add new records from Step 3
5. Save changes

**If domains are registered with GoDaddy**:
1. Log in to GoDaddy
2. Go to My Products → Domains → DNS
3. Delete existing records
4. Add new records from Step 3
5. Save changes

**If domains are managed with Cloudflare**:
1. Log in to Cloudflare
2. Select dnalang.dev domain
3. Go to DNS → Records
4. Delete existing records for www, chat, @ (root)
5. Add new records from Step 3
6. **Important**: Disable orange cloud (proxy) - set to "DNS only" (gray cloud)
7. Save changes

---

### Step 5: Wait for DNS Propagation

**Expected Time**: 5-30 minutes (usually < 10 minutes)

**Check Propagation Status**:
```bash
# Check www.dnalang.dev
curl -I https://www.dnalang.dev

# Or use online tool:
# https://www.whatsmydns.net/#CNAME/www.dnalang.dev
# https://www.whatsmydns.net/#CNAME/chat.dnalang.dev
```

---

### Step 6: Verify SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

1. Go back to: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/domains

2. Check domain status:
   - ✅ **Valid** - Certificate provisioned, domain is live
   - ⏳ **Provisioning** - Wait a few more minutes
   - ❌ **Error** - Check DNS records are correct

---

### Step 7: Test All Routes

Once DNS propagates and SSL is provisioned:

```bash
# Test homepage
curl https://www.dnalang.dev/

# Test chat
curl https://www.dnalang.dev/chat

# Test workloads
curl https://www.dnalang.dev/workloads

# Test benchmarks (NEW)
curl https://www.dnalang.dev/benchmarks

# Test orchestrator
curl https://www.dnalang.dev/orchestrator

# Test chat subdomain
curl https://chat.dnalang.dev/
```

**Or visit in browser**:
- https://www.dnalang.dev/ → Should show homepage with benchmarks link
- https://chat.dnalang.dev/ → Should show quantum chat interface
- https://dnalang.dev → Should redirect to www.dnalang.dev

---

## Expected Results

### ✅ Success Indicators

After integration completes:

1. **www.dnalang.dev** serves quantumlm-vercel content:
   - Professional homepage with dna::}{::lang branding
   - Live metrics: 154 jobs, 18 organisms, 99.4% uptime
   - Navigation includes: Chat, Orchestrator, Workloads, **Benchmarks**, Technology, Investors, Developers

2. **chat.dnalang.dev** shows:
   - Full quantum chatbot interface
   - IBM Quantum backend selection
   - Consciousness metrics (Φ, Λ, Γ, W₂)

3. **All routes work**:
   - `/` - Homepage
   - `/chat` - Quantum chatbot
   - `/workloads` - IBM Quantum analytics (96+ real jobs)
   - `/benchmarks` - **NEW** Interactive validation dashboard
   - `/orchestrator` - Multi-agent orchestration

4. **SSL Certificate**: Valid (green padlock in browser)

5. **Auto-deployment**: Git push to main → Live in ~5 minutes

---

## Troubleshooting

### Issue: "Domain is already in use"

**Problem**: Domain still assigned to quantumlm-frontend
**Solution**: Complete Step 1 - Remove domains from quantumlm-frontend first

---

### Issue: "DNS Change Recommended"

**Problem**: DNS records don't point to Vercel
**Solution**:
1. Verify DNS records match exactly (CNAME for www/chat, A for apex)
2. If using Cloudflare, disable proxy (orange cloud → gray cloud)
3. Wait 5-10 more minutes for propagation

**Check DNS**:
```bash
dig www.dnalang.dev CNAME
dig chat.dnalang.dev CNAME
dig dnalang.dev A
```

Expected results:
- `www.dnalang.dev` → CNAME → `cname.vercel-dns.com`
- `chat.dnalang.dev` → CNAME → `cname.vercel-dns.com`
- `dnalang.dev` → A → `76.76.21.21` (or IP Vercel provides)

---

### Issue: "Certificate provisioning failed"

**Problem**: Vercel can't verify domain ownership
**Solution**:
1. Ensure DNS records are correct and propagated
2. Wait for full DNS propagation (check https://www.whatsmydns.net)
3. Try removing and re-adding domain in Vercel
4. Contact Vercel support if issue persists after 24 hours

---

## Alternative: CLI Method (Advanced)

**If you prefer command-line**:

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Add www.dnalang.dev
npx vercel domains add www.dnalang.dev

# Add chat.dnalang.dev
npx vercel domains add chat.dnalang.dev

# Add dnalang.dev (root)
npx vercel domains add dnalang.dev

# Check status
npx vercel domains ls
```

Then proceed to Step 4 to update DNS records.

---

## Post-Integration Checklist

Once integration is complete:

- [ ] www.dnalang.dev loads correctly
- [ ] chat.dnalang.dev loads correctly
- [ ] dnalang.dev redirects to www.dnalang.dev
- [ ] All routes work (/, /chat, /workloads, /benchmarks, /orchestrator)
- [ ] SSL certificate is valid (green padlock)
- [ ] Navigation includes "Benchmarks" link
- [ ] Benchmarks page shows:
  - [ ] Consciousness evolution chart (Gen 0-17)
  - [ ] Framework comparison (DNA-Lang vs competitors)
  - [ ] Hardware validation scatter plot
  - [ ] Capabilities radar chart
- [ ] Update documentation to reference www.dnalang.dev instead of vercel.app URL
- [ ] Test git push auto-deployment
- [ ] Announce new URLs to stakeholders

---

## Summary

**What You're Doing**: Moving production domains from quantumlm-frontend to quantumlm-vercel

**Why**: quantumlm-vercel has all the new features:
- Reproducibility protocol (52 pages)
- Interactive benchmark dashboard
- Technical validation documentation
- Updated homepage with professional branding

**Time Required**: 5-15 minutes

**Next Steps After Integration**:
1. Patent filing preparation
2. Nature manuscript submission
3. Investor outreach
4. IBM partnership discussions

---

**Last Updated**: November 19, 2025
**Status**: Ready to Execute
**Project**: quantumlm-vercel (prj_f2VYYq6SCwuDR8yQpMdVWJNuQS1U)

---

**Questions?** See DOMAIN_INTEGRATION_GUIDE.md for full details and alternatives.
