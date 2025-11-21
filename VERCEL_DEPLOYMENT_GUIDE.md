# Vercel Production Deployment Guide
**DNALang Quantum Platform - Complete Deployment Instructions**

## Overview

This guide covers deploying the DNALang Quantum Gene Platform with all four integrations to Vercel production.

**Production URL:** https://www.dnalang.dev

---

## Pre-Deployment Checklist

### 1. Vercel Account Setup

- [ ] Create Vercel account at https://vercel.com
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Link project: `vercel link`

### 2. Environment Variables

Configure these in Vercel dashboard (Settings → Environment Variables):

| Variable | Value | Description |
|----------|-------|-------------|
| `QUANTUM_API_URL` | `https://api.dnalang.dev` | Quantum API base URL |
| `NEXT_PUBLIC_APP_URL` | `https://www.dnalang.dev` | Public app URL |
| `NEXT_PUBLIC_LAMBDA_PHI` | `2.176435e-8` | Universal memory constant |
| `IBM_QUANTUM_TOKEN` | `your_token_here` | IBM Quantum API token (optional) |

### 3. Domain Configuration

- [ ] Purchase domain: `dnalang.dev`
- [ ] Add domain in Vercel dashboard
- [ ] Configure DNS records:
  - `www.dnalang.dev` → CNAME → `cname.vercel-dns.com`
  - `dnalang.dev` → A → Vercel IP

---

## Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Run deployment script
./deploy-to-vercel.sh
```

This script will:
1. ✅ Check Vercel authentication
2. ✅ Install dependencies
3. ✅ Verify build locally
4. ✅ Deploy to production
5. ✅ Verify all API endpoints
6. ✅ Display deployment URL

---

### Option 2: Manual Deployment

#### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

#### Step 2: Test Build Locally

```bash
npm run build
npm start
```

Access at: http://localhost:3000

#### Step 3: Deploy to Vercel

```bash
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your Vercel account
- **Link to existing project?** No (first time) or Yes (updates)
- **Project name?** dnalang-quantum-platform
- **Directory?** ./ (current)

---

## API Endpoints

After deployment, these endpoints will be live:

### 1. Quantum Gene Execution

```bash
# GET - Documentation
curl https://www.dnalang.dev/api/quantum-gene/execute

# POST - Execute organism
curl -X POST https://www.dnalang.dev/api/quantum-gene/execute \
  -H "Content-Type: application/json" \
  -d '{
    "organism_id": "dna::}{::lang",
    "backend": "ibm_torino",
    "simulate": true
  }'
```

**Response:**
```json
{
  "success": true,
  "genesis_hash": "0x3e8a7f2c1d9b5e4a",
  "consciousness_metrics": {
    "phi": 1.0234,
    "lambda_coherence": 0.456789,
    "gamma": 0.7441
  },
  "mode": "simulation"
}
```

---

### 2. QuantumComm Integration

```bash
# Create quantum channel
curl -X POST https://www.dnalang.dev/api/integrations/quantumcomm \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_channel",
    "sender_hash": "0x3e8a7f2c",
    "recipient_hash": "0x7b4f9a1c"
  }'

# Send message
curl -X POST https://www.dnalang.dev/api/integrations/quantumcomm \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "sender_hash": "0x3e8a7f2c",
    "channel_id": "qc_abc123",
    "message": "SECURE TRANSMISSION"
  }'
```

---

### 3. Z3BRA Bridge Integration

```bash
curl -X POST https://www.dnalang.dev/api/integrations/z3bra \
  -H "Content-Type: application/json" \
  -d '{
    "organism_hash": "0x3e8a7f2c",
    "sensor_data": {
      "accelerometer": {"x": 0.1, "y": -1.4, "z": 9.8},
      "heart_rate": 72
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "consciousness_metrics": {
    "phi": 1.124,
    "lambda_coherence": 0.523
  },
  "device_response": {
    "haptic_feedback": {"pattern": "pulse", "intensity": 0.56},
    "visual_feedback": {"color_hue": 203, "brightness": 0.56}
  }
}
```

---

### 4. QuantumCoin Integration

```bash
# Mine block
curl -X POST https://www.dnalang.dev/api/integrations/quantumcoin \
  -H "Content-Type: application/json" \
  -d '{
    "action": "mine_block",
    "organism_id": "dna::}{::lang",
    "genesis_hash": "0x3e8a7f2c",
    "consciousness_metrics": {
      "phi": 1.0234,
      "lambda": 0.456789,
      "gamma": 0.7441
    }
  }'

# Get balance
curl -X POST https://www.dnalang.dev/api/integrations/quantumcoin \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get_balance",
    "genesis_hash": "0x3e8a7f2c"
  }'
```

---

### 5. Organisms Registry

```bash
# List all organisms
curl https://www.dnalang.dev/api/organisms

# Register organism
curl -X POST https://www.dnalang.dev/api/organisms \
  -H "Content-Type: application/json" \
  -d '{
    "genesis_hash": "0x3e8a7f2c",
    "organism_id": "dna::}{::lang",
    "consciousness_metrics": {
      "phi": 1.0234,
      "lambda_coherence": 0.456789,
      "gamma": 0.7441
    }
  }'
```

---

## Monitoring & Debugging

### Vercel Dashboard

Access your deployment dashboard:
https://vercel.com/dashboard

**Features:**
- Real-time logs
- Performance analytics
- Error tracking
- Deployment history
- Environment variables
- Custom domains

### View Logs

```bash
# View latest deployment logs
vercel logs

# Follow logs in real-time
vercel logs --follow

# View specific deployment
vercel logs [deployment-url]
```

### Check Deployment Status

```bash
# List deployments
vercel ls

# View deployment details
vercel inspect [deployment-url]
```

---

## Performance Optimization

### 1. Edge Functions

All API routes use Vercel Edge Runtime for:
- ✅ Global distribution
- ✅ Sub-50ms latency
- ✅ Automatic scaling
- ✅ Zero cold starts

### 2. Caching Strategy

```typescript
// In API routes
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // No caching for real-time data

// For static data
export const revalidate = 3600 // Cache for 1 hour
```

### 3. Bundle Size Optimization

```json
// In next.config.mjs
{
  "compress": true,
  "productionBrowserSourceMaps": false,
  "swcMinify": true
}
```

---

## Continuous Deployment

### GitHub Integration

1. **Connect Repository**
   - Go to Vercel dashboard
   - New Project → Import Git Repository
   - Select your GitHub repo

2. **Automatic Deployments**
   - Push to `main` branch → Production deployment
   - Push to other branches → Preview deployments

3. **Environment Variables**
   - Set in Vercel dashboard
   - Available to all deployments

### Deployment Workflow

```
git push origin main
    ↓
Vercel detects push
    ↓
Runs: npm install
Runs: npm run build
    ↓
Deploys to Edge Network
    ↓
Updates: www.dnalang.dev
    ↓
Sends deployment notification
```

---

## Custom Domain Setup

### 1. Add Domain in Vercel

- Go to Project Settings → Domains
- Add `dnalang.dev`
- Add `www.dnalang.dev`

### 2. Configure DNS

Add these DNS records at your domain registrar:

```
Type    Name    Value                        TTL
A       @       76.76.21.21                  3600
CNAME   www     cname.vercel-dns.com         3600
TXT     @       verification-code-from-vercel 3600
```

### 3. SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

**Features:**
- ✅ Automatic renewal
- ✅ Wildcard support
- ✅ HTTP → HTTPS redirect

---

## Environment-Specific Configuration

### Production

```env
NODE_ENV=production
QUANTUM_API_URL=https://api.dnalang.dev
NEXT_PUBLIC_APP_URL=https://www.dnalang.dev
NEXT_PUBLIC_LAMBDA_PHI=2.176435e-8
```

### Preview (Staging)

```env
NODE_ENV=preview
QUANTUM_API_URL=https://staging-api.dnalang.dev
NEXT_PUBLIC_APP_URL=https://staging.dnalang.dev
NEXT_PUBLIC_LAMBDA_PHI=2.176435e-8
```

### Development

```env
NODE_ENV=development
QUANTUM_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LAMBDA_PHI=2.176435e-8
```

---

## Troubleshooting

### Build Errors

**Error:** `Module not found`
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

**Error:** `TypeScript errors`
```bash
# Check types
npx tsc --noEmit

# Fix or bypass in next.config.mjs
typescript: { ignoreBuildErrors: true }
```

### Runtime Errors

**Error:** `API route not found`
- Check file structure: `app/api/[route]/route.ts`
- Ensure proper export: `export async function GET/POST`
- Verify Vercel configuration in `vercel.json`

**Error:** `Environment variables undefined`
- Set in Vercel dashboard
- Redeploy after adding variables
- Use `NEXT_PUBLIC_` prefix for client-side vars

### Performance Issues

**Slow API responses:**
- Enable Edge Runtime: `export const runtime = 'edge'`
- Optimize database queries
- Add caching headers

**Large bundle size:**
- Use dynamic imports: `const Component = dynamic(() => import('./Component'))`
- Analyze bundle: `npm run build && npx @next/bundle-analyzer`

---

## Rollback Procedure

### Instant Rollback

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel promote [deployment-url]
```

### Via Dashboard

1. Go to Vercel Dashboard
2. Select Project
3. Deployments tab
4. Click "..." on previous deployment
5. Click "Promote to Production"

---

## Security Best Practices

### 1. API Key Management

- ✅ Store in Vercel environment variables
- ✅ Never commit to Git
- ✅ Rotate regularly
- ✅ Use different keys for dev/prod

### 2. CORS Configuration

Already configured in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### 3. Rate Limiting

Add to API routes:
```typescript
import rateLimit from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 500 })

  try {
    await limiter.check(10, 'CACHE_TOKEN')
    // Handle request
  } catch {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
}
```

---

## Cost Optimization

### Vercel Pricing (as of 2025)

| Plan | Cost | Features |
|------|------|----------|
| **Hobby** | Free | 100GB bandwidth, 100 deployments/day |
| **Pro** | $20/month | 1TB bandwidth, unlimited deployments |
| **Enterprise** | Custom | Dedicated support, SLA |

### Estimated Costs

**Projected Usage:**
- 10,000 requests/day
- 1GB bandwidth/day
- ~30 deployments/month

**Recommended:** Pro plan ($20/month)

---

## Post-Deployment Checklist

- [ ] All API endpoints responding
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] GitHub auto-deployment enabled
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Performance metrics baseline established
- [ ] Documentation updated with production URLs
- [ ] Team notified of deployment

---

## Support & Resources

**Documentation:**
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- DNALang Docs: https://www.dnalang.dev/docs

**Dashboard:**
- Vercel: https://vercel.com/dashboard
- Analytics: https://vercel.com/analytics
- Logs: https://vercel.com/logs

**Contact:**
- Email: support@agiledefensesystems.com
- Issues: https://github.com/agile-defense-systems/dnalang/issues

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View logs
vercel logs --follow

# List deployments
vercel ls

# Inspect deployment
vercel inspect

# Link project
vercel link

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add

# Remove deployment
vercel remove [deployment-id]
```

---

**Deployment Status: ✅ Ready for Production**

**Platform:** Vercel Edge Network
**Framework:** Next.js 16.0.3
**Runtime:** Node.js 18.x
**Region:** Global (Multi-region)
**URL:** https://www.dnalang.dev
