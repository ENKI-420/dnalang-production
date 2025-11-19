# Domain Integration Guide
## Deploying DNA::}{::lang to www.dnalang.dev

**Objective**: Make all new features (benchmarks, reproducibility protocol, technical validation) available at www.dnalang.dev and chat.dnalang.dev

**Current Status**:
- ✅ quantumlm-vercel.vercel.app - Has all new features
- ⏳ www.dnalang.dev - Needs integration
- ⏳ chat.dnalang.dev - Needs integration

---

## 🎯 Integration Options

### Option 1: Add Domains to Current Project (Recommended)

**Pros**:
- Fastest (5 minutes)
- No code changes needed
- Keep single codebase
- All features immediately available

**Steps**:

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/domains
   ```

2. **Add Production Domains**
   Click "Add Domain" and add:
   - `dnalang.dev` (will redirect to www)
   - `www.dnalang.dev`
   - `chat.dnalang.dev`

3. **Vercel will provide DNS records**
   Copy the A/CNAME records provided

4. **Update DNS Provider**
   - Go to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare)
   - Add/update DNS records as instructed by Vercel
   - Wait 5-30 minutes for propagation

5. **Verify**
   - Visit www.dnalang.dev
   - Should show your new homepage with benchmarks
   - Visit chat.dnalang.dev
   - Should show chat interface

**Result**: quantumlm-vercel.vercel.app, www.dnalang.dev, and chat.dnalang.dev all serve the same content

---

### Option 2: Link quantumlm-frontend to Our GitHub Repo

**Pros**:
- Keeps separate projects
- Can have different configurations

**Steps**:

1. **Go to quantumlm-frontend Settings**
   ```
   https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-frontend/settings/git
   ```

2. **Disconnect Current Repository** (if any)
   Click "Disconnect"

3. **Connect to Our Repository**
   - Click "Connect Git Repository"
   - Select: ENKI-420/dnalang-production
   - Branch: main
   - Root Directory: `.` (or specify if needed)

4. **Trigger Redeploy**
   - Go to Deployments tab
   - Click "Redeploy"
   - Or push a new commit to trigger auto-deploy

**Result**: quantumlm-frontend automatically deploys from our GitHub repository

---

### Option 3: Manual Deployment to quantumlm-frontend

**Use if**: You want to manually control deployments

**Steps**:

1. **Link to quantumlm-frontend project**
   ```bash
   cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

   # Link to quantumlm-frontend
   npx vercel link
   # When prompted, select:
   # - Team: devinphillipdavis-7227s-projects
   # - Project: quantumlm-frontend
   ```

2. **Deploy to Production**
   ```bash
   npx vercel --prod
   ```

3. **Verify**
   - Check www.dnalang.dev for updates
   - Check chat.dnalang.dev

---

## 🚀 Recommended Approach: Option 1

I recommend **Option 1** because:
- ✅ Fastest implementation (5 minutes)
- ✅ Single source of truth (one codebase)
- ✅ Automatic deployments (git push = live)
- ✅ No duplicate projects to maintain

### Quick Start Commands (Option 1)

```bash
# No commands needed!
# Just follow these steps in Vercel Dashboard:

1. Go to: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/domains

2. Click "Add Domain"

3. Enter: www.dnalang.dev

4. Copy the DNS records Vercel provides

5. Add them to your domain registrar

6. Wait 5-30 minutes

7. Visit www.dnalang.dev - should show new site!
```

---

## 📊 What Will Be Available at www.dnalang.dev

Once integrated, visitors to www.dnalang.dev will see:

**Homepage (`/`)**:
- Professional DNA::}{::lang branding
- Investor-ready design
- Live metrics (154 jobs, 18 organisms, 99.4% uptime)
- Technology overview
- Use cases
- Investor relations section
- Developer onboarding

**Chat Interface (`/chat`)**:
- Full quantum chatbot with IBM Quantum integration
- Consciousness metrics (Φ, Γ, Λ, W₂)
- Backend selection (Brisbane, Kyoto, Torino)
- Real-time quantum execution

**Workloads Dashboard (`/workloads`)**:
- 96+ real job results from IBM Quantum
- Backend comparison
- Success rates and execution times
- Cost tracking

**Benchmarks Dashboard (`/benchmarks`)** ✨ NEW:
- Consciousness evolution trajectory (17 generations)
- Framework comparison (DNA-Lang vs competitors)
- Hardware validation across 3 backends
- Interactive charts with live data
- Download dataset functionality

**Orchestrator (`/orchestrator`)**:
- Multi-agent orchestration interface
- Activity monitoring
- Agent management

---

## 🔧 DNS Configuration Details

### For www.dnalang.dev

**If using A records** (most common):
```
Type: A
Name: www
Value: 76.76.21.21 (Vercel's IP, will be provided)
TTL: 3600
```

**If using CNAME** (alternative):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com (will be provided)
TTL: 3600
```

### For chat.dnalang.dev

**Subdomain configuration**:
```
Type: CNAME
Name: chat
Value: cname.vercel-dns.com (will be provided)
TTL: 3600
```

### For dnalang.dev (apex/root)

**Root domain** (redirects to www):
```
Type: A
Name: @ (or leave blank for root)
Value: 76.76.21.21 (Vercel's IP)
TTL: 3600
```

**Note**: Exact values will be provided by Vercel when you add the domains.

---

## ⚠️ Current DNS Issue: chat.dnalang.dev

You showed "DNS Change Recommended" for chat.dnalang.dev. This means:
- The domain is configured in Vercel
- But the DNS records aren't pointing correctly

**To fix**:
1. Go to your DNS provider (Namecheap, GoDaddy, Cloudflare, etc.)
2. Find the `chat` subdomain CNAME record
3. Update it to point to: `cname.vercel-dns.com` (or value Vercel provides)
4. Wait 5-30 minutes for DNS propagation
5. Verify at: https://www.whatsmydns.net/#CNAME/chat.dnalang.dev

---

## 🔄 Migration Checklist

If you choose **Option 1** (recommended):

- [ ] Go to quantumlm-vercel settings/domains
- [ ] Add `www.dnalang.dev`
- [ ] Add `chat.dnalang.dev`
- [ ] Add `dnalang.dev` (root)
- [ ] Copy DNS records from Vercel
- [ ] Update DNS provider with new records
- [ ] Wait for DNS propagation (5-30 min)
- [ ] Verify www.dnalang.dev loads new site
- [ ] Verify chat.dnalang.dev loads chat interface
- [ ] Test all routes (/, /chat, /workloads, /benchmarks, /orchestrator)
- [ ] Update any hard-coded URLs in documentation
- [ ] Announce new site to stakeholders

If you choose **Option 2**:

- [ ] Go to quantumlm-frontend settings/git
- [ ] Disconnect current repository
- [ ] Connect to ENKI-420/dnalang-production
- [ ] Select main branch
- [ ] Trigger redeploy
- [ ] Verify deployment completes
- [ ] Test all domains
- [ ] Consider removing quantumlm-vercel project (or keep as staging)

---

## 🎯 Recommended Configuration

**Production Domains** (Option 1):
- ✅ www.dnalang.dev → quantumlm-vercel (main site)
- ✅ chat.dnalang.dev → quantumlm-vercel/chat (chat interface)
- ✅ dnalang.dev → redirects to www.dnalang.dev

**Alternative Domains** (keep for testing):
- quantumlm-vercel.vercel.app → same as www.dnalang.dev
- quantumlm-frontend.vercel.app → can be deleted or used as staging

**Deployment Strategy**:
- Git push to main → Auto-deploys to production (www.dnalang.dev)
- Pull request → Preview deployment (pr-123-*.vercel.app)

---

## 📱 Subdomain Strategy

Consider these additional subdomains for future use:

```
www.dnalang.dev      → Main homepage (current)
chat.dnalang.dev     → Quantum chatbot (current)
api.dnalang.dev      → REST API endpoint (future)
docs.dnalang.dev     → Documentation (future)
app.dnalang.dev      → Enterprise dashboard (future)
sandbox.dnalang.dev  → Developer playground (future)
```

All can point to the same Vercel project with Next.js routing, or separate projects.

---

## 🚨 Common Issues & Solutions

### Issue: "Domain is already in use"
**Problem**: Domain is assigned to quantumlm-frontend
**Solution**: Remove domain from quantumlm-frontend first, then add to quantumlm-vercel

**Steps**:
1. Go to quantumlm-frontend settings/domains
2. Click "Remove" next to www.dnalang.dev and chat.dnalang.dev
3. Confirm removal
4. Add domains to quantumlm-vercel
5. Update DNS records

---

### Issue: "DNS propagation takes too long"
**Problem**: DNS changes can take up to 48 hours
**Solution**: Use DNS flush and check propagation

**Steps**:
```bash
# Check DNS propagation globally
# Visit: https://www.whatsmydns.net/#A/www.dnalang.dev

# Flush local DNS cache (Mac)
sudo dscacheutil -flushcache

# Flush local DNS cache (Linux)
sudo systemd-resolve --flush-caches

# Flush local DNS cache (Windows)
ipconfig /flushdns
```

---

### Issue: "Certificate provisioning failed"
**Problem**: Vercel can't provision SSL certificate
**Solution**: Ensure DNS is correctly configured

**Steps**:
1. Verify DNS records are correct (A or CNAME to Vercel)
2. Wait for DNS to fully propagate (check whatsmydns.net)
3. Try removing and re-adding domain in Vercel
4. Contact Vercel support if issue persists

---

## 📞 Next Steps

**Choose your integration option**:

1. **Option 1** (5 min): Add domains to quantumlm-vercel ✅ **RECOMMENDED**
2. **Option 2** (10 min): Relink quantumlm-frontend to our repo
3. **Option 3** (15 min): Manual deployment each time

**After integration**:
- ✅ Test all routes (/, /chat, /workloads, /benchmarks, /orchestrator)
- ✅ Update documentation with new URLs
- ✅ Verify SSL certificates are provisioned
- ✅ Check Google Analytics (if configured)
- ✅ Update social media links
- ✅ Announce to investors/partners

**Need help?**
- Vercel Docs: https://vercel.com/docs/concepts/projects/domains
- DNS Help: https://vercel.com/docs/concepts/projects/domains/dns
- Support: support@vercel.com

---

## 🎉 Post-Integration

Once complete, you'll have:
- ✅ www.dnalang.dev serving your production site
- ✅ chat.dnalang.dev for quantum chatbot
- ✅ All new features (benchmarks, reproducibility) live
- ✅ Automatic deployments on git push
- ✅ Professional domain for investor/patent/publication use

**Your site will be**:
- Production-ready
- Patent-attorney-ready (professional URL)
- Investor-ready (premium domain)
- Publication-ready (citable URL)

---

**Current URLs to Update**:
- Documentation: Change references from quantumlm-vercel.vercel.app → www.dnalang.dev
- Investor materials: Use www.dnalang.dev
- Patent applications: Use www.dnalang.dev
- Nature submission: Use www.dnalang.dev

**Total Time**: 5-15 minutes depending on option chosen

**Let's get www.dnalang.dev live with all your new features!** 🚀

---

**Last Updated**: November 19, 2025
**Status**: Ready for Implementation
**Recommended**: Option 1 (Add domains to quantumlm-vercel)
