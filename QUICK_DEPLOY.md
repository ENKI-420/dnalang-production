# QuantumLM - Quick Vercel Deployment

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

## Status: Ready to Deploy

The project is built and ready. Follow these simple steps to deploy to Vercel.

## One-Command Deployment

Since dependencies are already installed and the project is built, you can deploy directly:

```bash
npx vercel --prod
```

This will:
1. Prompt for Vercel login (opens browser - follow authentication flow)
2. Ask deployment questions (use suggested answers below)
3. Deploy to production
4. Provide deployment URL

## Deployment Prompts & Answers

When `npx vercel` asks:

**Set up and deploy?**
→ **yes**

**Which scope?**
→ Select your Vercel account

**Link to existing project?**
→ **N** (No, create new project)

**What's your project's name?**
→ **quantumlm** (or **quantumlm-frontend**)

**In which directory is your code located?**
→ **./** (press Enter for default)

**Want to modify settings?**
→ **N** (No, use defaults)

## After Deployment

Once deployed, you'll get a URL like:
- `https://quantumlm.vercel.app` or
- `https://quantumlm-frontend.vercel.app`

### Add Environment Variable

1. Go to https://vercel.com/dashboard
2. Select your project: `quantumlm`
3. Click **Settings** → **Environment Variables**
4. Add:
   - **Key**: `QUANTUM_API_URL`
   - **Value**: `https://api.dnalang.dev`
   - **Environments**: Production, Preview, Development (check all)
5. Click **Save**
6. Go to **Deployments** tab
7. Click **Redeploy** on latest deployment

### Configure Custom Domain (Optional)

To use `chat.dnalang.dev`:

**In Vercel:**
1. Go to your project → **Settings** → **Domains**
2. Click **Add**
3. Enter: `chat.dnalang.dev`
4. Click **Add**

**In Namecheap:**
1. Log in to Namecheap
2. Go to **Domain List** → **dnalang.dev** → **Advanced DNS**
3. Add CNAME Record:
   - **Type**: CNAME
   - **Host**: chat
   - **Value**: cname.vercel-dns.com.
   - **TTL**: Automatic
4. Click **Save**

Wait 5-60 minutes for DNS propagation. SSL will be auto-configured by Vercel.

## Test Your Deployment

```bash
# Test the API endpoint
curl https://your-deployment-url.vercel.app/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is quantum consciousness?",
    "backend": "ibm_fez",
    "includeMetrics": true
  }'
```

## Troubleshooting

### "The specified token is not valid"

This happens when using `npx vercel` for the first time. Solution:

```bash
npx vercel login
# Follow browser authentication prompts
# Then retry deployment:
npx vercel --prod
```

### Build Errors

If the build fails, ensure dependencies are installed with React 19 compatibility:

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
npx vercel --prod
```

### "Cannot connect to quantum API"

1. Verify environment variable `QUANTUM_API_URL` is set in Vercel dashboard
2. Ensure backend API is deployed and accessible at `https://api.dnalang.dev`
3. Check CORS configuration in backend allows `https://your-deployment.vercel.app`

### DNS Issues

Check DNS propagation:
```bash
dig chat.dnalang.dev
```

Or visit: https://dnschecker.org/#CNAME/chat.dnalang.dev

## Alternative: GitHub + Vercel Dashboard

If you prefer the dashboard approach:

```bash
# 1. Create GitHub repository
gh auth login
gh repo create quantumlm-frontend --public --source=. --remote=origin --push

# 2. Import to Vercel
# Go to: https://vercel.com/new
# Select: quantumlm-frontend repository
# Click: Deploy
```

## Project Info

**Location**: `/home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel/`

**Git Status**:
- Branch: `main`
- Commit: "QuantumLM v0.dev Frontend Integration"
- Files: 97 files ready

**Build Status**:
- ✅ Dependencies installed (with --legacy-peer-deps)
- ✅ Production build successful
- ✅ Next.js 16 + React 19
- ✅ 7 routes compiled

**Cost**:
- Vercel Hobby plan: **$0/month**
- Includes: Unlimited deployments, SSL, 100 GB bandwidth

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Ready to deploy!**
