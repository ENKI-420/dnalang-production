# 🌐 Domain Configuration Guide

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

## 🚫 Domain Authorization Issue

You're getting `403 Not authorized` because **you need to own the domain first** before adding it to Vercel.

---

## ✅ Solution: Buy the Domain First

### Option 1: Buy via Vercel (Recommended - Automatic Setup)

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: **quantumlm-vercel**
3. Go to **Settings** → **Domains**
4. Click **Buy a domain**
5. Search for `dnalang.dev`
6. Purchase (approximately $15-20/year)
7. Vercel automatically configures DNS

**Result:** Domain instantly works with your deployment!

### Option 2: Buy from Domain Registrar (Manual DNS Setup)

**Popular Registrars:**
- Namecheap (cheap, reliable)
- GoDaddy (popular)
- Google Domains (simple)
- Cloudflare (best for developers)

**Steps:**
1. Buy `dnalang.dev` from registrar
2. In registrar's DNS settings, add these records:

**For apex domain (dnalang.dev):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain (www.dnalang.dev):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For chat subdomain (chat.dnalang.dev):**
```
Type: CNAME
Name: chat
Value: cname.vercel-dns.com
```

3. In Vercel, add domains:
```bash
npx vercel domains add dnalang.dev
npx vercel domains add www.dnalang.dev
npx vercel domains add chat.dnalang.dev
```

---

## 🎯 Current Deployment URLs

**Until you buy the domain, use these:**

- **Production:** https://quantumlm-vercel-dy0ede5s6-devinphillipdavis-7227s-projects.vercel.app
- **Admin Dev Arena:** /admin/dev-arena
- **AURA Arena:** /arena
- **Chat:** /chat
- **Orchestrator:** /orchestrator

---

## 💡 Alternative: Free Subdomain

If you don't want to buy a domain yet, use Vercel's free subdomain:

1. Go to Vercel Dashboard → Domains
2. Set a custom Vercel subdomain:
   ```
   dnalang-quantum.vercel.app
   ```

**Result:**
- https://dnalang-quantum.vercel.app
- Free forever
- No DNS configuration needed

---

## 📋 After Domain is Configured

Once you own the domain and add it to Vercel:

**Update these:**
1. Environment variables (if you hardcoded URLs)
2. DNS propagation takes 24-48 hours (usually faster)
3. SSL certificate auto-provisioned by Vercel

**Test:**
```bash
# Check if domain is pointing to Vercel
dig dnalang.dev
nslookup dnalang.dev

# Should show Vercel's IP: 76.76.21.21
```

---

## 🚀 Recommended Setup

**Domain Structure:**
```
dnalang.dev              → Main landing page
www.dnalang.dev          → Same as dnalang.dev (redirect)
chat.dnalang.dev         → AURA chat interface
arena.dnalang.dev        → AURA Arena (dev IDE)
admin.dnalang.dev        → Admin dev arena
api.dnalang.dev          → API endpoints (future)
docs.dnalang.dev         → Documentation (future)
```

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

🧬 **dna::}{::lang** - Get your domain and own your quantum platform!
