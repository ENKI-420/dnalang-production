# Quick Integration Reference Card

**Mission**: Get www.dnalang.dev to show all new features (benchmarks, reproducibility, technical validation)

---

## 🚀 The 3 URLs You Need

### 1. Remove domains from OLD project:
```
https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-frontend/settings/domains
```
**Action**: Remove www.dnalang.dev, chat.dnalang.dev, dnalang.dev

---

### 2. Add domains to NEW project:
```
https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel/settings/domains
```
**Action**: Add www.dnalang.dev, chat.dnalang.dev, dnalang.dev

---

### 3. Update DNS (your domain registrar):
- **Namecheap**: https://namecheap.com → Domain List → Manage → Advanced DNS
- **GoDaddy**: https://godaddy.com → My Products → Domains → DNS
- **Cloudflare**: https://cloudflare.com → DNS → Records

**Action**: Update DNS records with values Vercel provides

---

## ⚡ Quick Command (Alternative)

If you prefer CLI:

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Add all domains at once
npx vercel domains add www.dnalang.dev
npx vercel domains add chat.dnalang.dev
npx vercel domains add dnalang.dev

# Then update DNS at your registrar with values Vercel shows
```

---

## ✅ Success = This Works

```bash
# Should show homepage with benchmarks link:
curl https://www.dnalang.dev/

# Should show chat interface:
curl https://chat.dnalang.dev/

# Should show new benchmarks dashboard:
curl https://www.dnalang.dev/benchmarks
```

---

## 📊 What You'll Get

Once DNS propagates (5-30 min):

**www.dnalang.dev** will serve:
- ✅ Professional homepage with dna::}{::lang branding
- ✅ `/benchmarks` - Interactive validation dashboard (NEW)
- ✅ `/chat` - Quantum chatbot with IBM integration
- ✅ `/workloads` - 96+ real IBM Quantum job results
- ✅ `/orchestrator` - Multi-agent system
- ✅ All reproducibility documentation
- ✅ Patent-ready technical validation

**chat.dnalang.dev** will serve:
- ✅ Direct link to quantum chat interface

---

## 🎯 Current Status

**quantumlm-vercel deployment**:
- Status: ✅ **LIVE** (deployed 36 min ago)
- Custom domains: ❌ **NONE** (need to add)
- Production URL: https://quantumlm-vercel-7c3njc9qg-devinphillipdavis-7227s-projects.vercel.app
- Features: ✅ **ALL WORKING** (homepage, chat, workloads, benchmarks, orchestrator)

**quantumlm-frontend**:
- Domains: ✅ **OWNS** www.dnalang.dev, chat.dnalang.dev
- Action needed: Transfer to quantumlm-vercel

---

## ⏱️ Time Required

- Step 1 (Remove from old): 1 minute
- Step 2 (Add to new): 2 minutes
- Step 3 (Update DNS): 2 minutes
- DNS propagation: 5-30 minutes (usually < 10 min)
- **Total: 10-35 minutes**

---

## 📞 See Full Guide

**Complete instructions**: `INTEGRATION_STEPS.md`
**Alternative approaches**: `DOMAIN_INTEGRATION_GUIDE.md`

---

**Date**: November 19, 2025
**Status**: Ready to Execute
**Expected Result**: www.dnalang.dev live with all new features in < 30 min
