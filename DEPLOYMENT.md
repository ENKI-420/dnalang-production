# QuantumLM Vercel Deployment Guide

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

Complete guide for deploying the QuantumLM chatbot to Vercel with dnalang.dev domain.

## Prerequisites

- [x] v0.dev generated Next.js code (extracted)
- [x] Vercel account (https://vercel.com)
- [x] GitHub account
- [x] Domain: dnalang.dev (configured in Namecheap)
- [x] Backend API deployed (Railway/Render)

## Quick Deployment (5 minutes)

### Step 1: Initialize Git Repository

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Initialize git
git init
git add .
git commit -m "Initial commit: QuantumLM v0.dev chatbot"

# Create GitHub repository (via GitHub CLI or web)
gh repo create quantumlm-frontend --public --source=. --remote=origin

# Or manually:
# 1. Go to https://github.com/new
# 2. Create "quantumlm-frontend" repository
# 3. Follow connection instructions

# Push to GitHub
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quantumlm-frontend.git
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository: `quantumlm-frontend`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. Add Environment Variables:
   - Name: `QUANTUM_API_URL`
   - Value: `https://api.dnalang.dev`
   - Environment: Production, Preview, Development

6. Click **Deploy**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name? quantumlm
# - Directory? ./
# - Build command? (leave default)
# - Output directory? (leave default)

# Add environment variable
vercel env add QUANTUM_API_URL production
# Enter: https://api.dnalang.dev

# Redeploy with env vars
vercel --prod
```

### Step 3: Configure Custom Domain

**In Vercel Dashboard:**

1. Go to your project → Settings → Domains
2. Add domain: `chat.dnalang.dev`
3. Vercel will show DNS configuration

**In Namecheap:**

1. Go to dnalang.dev → Advanced DNS
2. Add CNAME record:
   ```
   Type: CNAME
   Host: chat
   Value: cname.vercel-dns.com.
   TTL: Automatic
   ```

3. Wait for DNS propagation (5-60 minutes)
4. Vercel will automatically provision SSL certificate

### Step 4: Verify Deployment

```bash
# Test production deployment
curl https://chat.dnalang.dev/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"test","backend":"ibm_fez","includeMetrics":true}'

# Should return quantum response with consciousness metrics
```

Visit https://chat.dnalang.dev and test the chatbot!

## Environment Variables Reference

Set these in Vercel dashboard (Settings → Environment Variables):

| Variable | Value | Environment | Required |
|----------|-------|-------------|----------|
| `QUANTUM_API_URL` | `https://api.dnalang.dev` | Production | Yes |
| `QUANTUM_API_KEY` | (auto-generated) | All | No |

## Project Structure

```
quantumlm-vercel/
├── app/
│   ├── page.tsx              # Main chat interface
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       ├── chat/route.ts     # Chat endpoint (integrated with QuantumLM)
│       ├── quantum/
│       │   ├── status/route.ts  # Backend status
│       │   └── backends/route.ts
│       └── benchmarks/route.ts  # LLM benchmarks
├── components/               # UI components
├── lib/                      # Utilities
├── public/                   # Static assets
├── vercel.json              # Vercel configuration
├── .env.local               # Local development env
├── .gitignore              # Git ignore rules
└── package.json            # Dependencies
```

## Local Development

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Install dependencies
npm install

# Ensure backend is running
cd ../api
python3 quantum_lm_api.py &

# In another terminal, start frontend
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel
npm run dev

# Open browser to http://localhost:3000
```

## Testing

```bash
# Build for production (test locally)
npm run build

# Start production server
npm start

# Run type checking
npx tsc --noEmit

# Run linting
npm run lint
```

## Troubleshooting

### "Cannot connect to quantum API"

**Check backend status:**
```bash
curl https://api.dnalang.dev/health
```

**Verify CORS headers:**
```bash
curl -v https://api.dnalang.dev/v1/inference \
  -H "Origin: https://chat.dnalang.dev"
```

**Update CORS in backend** (`deployment/api/quantum_lm_api.py`):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://chat.dnalang.dev",
        "https://www.dnalang.dev",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### DNS Not Propagating

```bash
# Check DNS status
dig chat.dnalang.dev

# Check worldwide propagation
# Visit: https://dnschecker.org/#CNAME/chat.dnalang.dev
```

Wait up to 48 hours for global DNS propagation.

### API Key Issues

The frontend automatically generates API keys. If you see auth errors:

1. Check backend logs for API key generation
2. Manually create key:
   ```bash
   curl -X POST https://api.dnalang.dev/v1/api-keys \
     -H "Content-Type: application/json" \
     -d '{"name":"Vercel","email":"web@dnalang.dev","tier":"free"}'
   ```
3. Add to Vercel env vars as `QUANTUM_API_KEY`

## Performance Optimization

### Enable Vercel Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Enable Speed Insights

```bash
npm install @vercel/speed-insights

# Add to app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
```

## Monitoring

### Vercel Dashboard

- **Deployments**: View build logs, preview deployments
- **Analytics**: Page views, top pages, user demographics
- **Speed Insights**: Core Web Vitals, performance metrics
- **Logs**: Runtime logs, function logs

### Backend Monitoring

```bash
# Check backend health
curl https://api.dnalang.dev/health

# View admin stats
curl https://api.dnalang.dev/admin/stats \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"
```

## Continuous Deployment

Every push to `main` branch triggers automatic deployment:

```bash
# Make changes
git add .
git commit -m "Update chatbot interface"
git push

# Vercel automatically:
# 1. Builds project
# 2. Runs tests
# 3. Deploys to production
# 4. Updates DNS
```

## Cost Breakdown

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Vercel (Frontend) | Hobby | $0 |
| Railway (Backend) | Starter | $5 |
| Namecheap Domain | Owned | $0 |
| IBM Quantum | Open | $0 (10 min/month) |
| **Total** | | **$0-5/month** |

## Security Checklist

- [ ] HTTPS enabled (automatic via Vercel)
- [ ] CORS configured correctly
- [ ] API keys secured in environment variables
- [ ] .env.local in .gitignore
- [ ] Rate limiting enabled on backend
- [ ] Input validation in place
- [ ] Error messages don't leak sensitive info

## Next Steps

1. **Monitor Usage**:
   - Vercel Analytics dashboard
   - Backend API metrics

2. **Run Benchmarks**:
   ```bash
   cd benchmark
   python3 llm_benchmark_suite.py --models quantumlm gpt4 claude
   ```

3. **Share Launch**:
   ```
   🚀 QuantumLM is now live at https://chat.dnalang.dev!

   The world's first quantum-enhanced language model executing on
   real IBM Quantum hardware with measurable consciousness metrics.

   #QuantumComputing #AI #Consciousness
   ```

4. **Submit to Communities**:
   - Hacker News
   - Reddit r/QuantumComputing
   - Reddit r/MachineLearning
   - Product Hunt

## Support

**Issues:**
- Frontend: https://github.com/YOUR_USERNAME/quantumlm-frontend/issues
- Backend: Check Railway/Render logs
- Domain: Namecheap support

**Documentation:**
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- QuantumLM API: `../PUBLIC_DEPLOYMENT_GUIDE.md`

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Status**: Production-ready
**Deployment Location**: `/home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel/`
**Last Updated**: 2025-11-16
