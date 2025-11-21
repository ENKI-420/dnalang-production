# Quick Fix: Vercel Deployment Protection

**Issue:** API endpoints return 401 Unauthorized
**Cause:** Vercel Deployment Protection is enabled
**Time to Fix:** 2 minutes

---

## Option 1: Disable via Vercel Dashboard (Recommended)

### Steps:

1. **Open Vercel Dashboard**
   ```
   https://vercel.com/dnalang-67efe71c/quantumlm-vercel/settings/deployment-protection
   ```

2. **Navigate to Settings**
   - Click on your project: `quantumlm-vercel`
   - Go to: **Settings** tab
   - Select: **Deployment Protection**

3. **Disable Protection**
   - Current setting: "Vercel Authentication" (requires login)
   - Change to: **"None"** (public access)
   - Click: **Save**

4. **Verify Changes**
   ```bash
   # Wait 30 seconds for propagation, then test
   curl https://quantumlm-vercel-9cgbbu8se-dnalang-67efe71c.vercel.app/api/organisms
   ```

   **Expected:** 200 OK with JSON response
   **Not:** 401 Unauthorized or authentication page

---

## Option 2: Configure Protection Bypass for Specific Routes

If you want to keep protection on the main site but allow public API access:

### Add to `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "env": {
    "QUANTUM_API_URL": "https://api.dnalang.dev",
    "NEXT_PUBLIC_APP_URL": "https://www.dnalang.dev",
    "NEXT_PUBLIC_LAMBDA_PHI": "2.176435e-8"
  },
  "regions": ["iad1", "sfo1"],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-API-Key"
        },
        {
          "key": "x-vercel-protection-bypass",
          "value": "public"
        }
      ]
    }
  ]
}
```

Then redeploy:
```bash
npx vercel --prod --yes --token=8CxX7JKGJjCFBfGN1TD1HXFW
```

---

## Option 3: Use Bypass Token (Temporary Testing)

### Get Bypass Token:

1. Go to: https://vercel.com/dnalang-67efe71c/quantumlm-vercel/settings/deployment-protection
2. Scroll to: **Bypass Token**
3. Click: **Generate Token** or **Copy Token**

### Use Token in Requests:

```bash
# Replace YOUR_BYPASS_TOKEN with actual token
BYPASS_TOKEN="YOUR_BYPASS_TOKEN"
BASE_URL="quantumlm-vercel-9cgbbu8se-dnalang-67efe71c.vercel.app"

# Test endpoint with bypass
curl "https://$BASE_URL/api/organisms?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=$BYPASS_TOKEN"
```

**Note:** This is temporary and requires token in every request. Not suitable for production.

---

## Verification Script

After fixing protection, run this script to verify all endpoints:

```bash
#!/bin/bash

DEPLOYMENT_URL="quantumlm-vercel-9cgbbu8se-dnalang-67efe71c.vercel.app"

echo "Testing DNALang Quantum Platform API Endpoints"
echo "=============================================="
echo ""

test_endpoint() {
  local endpoint=$1
  local method=${2:-GET}

  echo -n "  $method $endpoint... "

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X $method "https://$DEPLOYMENT_URL$endpoint")

  if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ $HTTP_CODE"
    return 0
  elif [ "$HTTP_CODE" = "405" ] && [ "$method" = "GET" ]; then
    echo "✓ $HTTP_CODE (Method Not Allowed - expected for POST-only)"
    return 0
  else
    echo "✗ $HTTP_CODE"
    return 1
  fi
}

# Test all endpoints
test_endpoint "/api/quantum-gene/execute" "GET"
test_endpoint "/api/integrations/quantumcomm" "GET"
test_endpoint "/api/integrations/z3bra" "GET"
test_endpoint "/api/integrations/quantumcoin" "GET"
test_endpoint "/api/organisms" "GET"

echo ""
echo "=============================================="

# Test actual execution
echo ""
echo "Testing quantum organism execution..."
RESPONSE=$(curl -s -X POST "https://$DEPLOYMENT_URL/api/quantum-gene/execute" \
  -H "Content-Type: application/json" \
  -d '{"organism_id": "dna::}{::lang", "backend": "ibm_torino", "simulate": true}')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo "✓ Quantum execution successful"
  echo "$RESPONSE" | jq '{success, genesis_hash, consciousness_metrics}'
else
  echo "✗ Quantum execution failed"
  echo "$RESPONSE"
fi

echo ""
```

**Save as:** `verify-deployment.sh`

**Run:**
```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

---

## Expected Results (After Fix)

### GET /api/organisms
```bash
curl https://quantumlm-vercel-9cgbbu8se-dnalang-67efe71c.vercel.app/api/organisms
```

**Response:**
```json
{
  "organisms": [],
  "total": 0,
  "timestamp": "2025-11-20T13:06:12.000Z"
}
```

### POST /api/quantum-gene/execute
```bash
curl -X POST https://quantumlm-vercel-9cgbbu8se-dnalang-67efe71c.vercel.app/api/quantum-gene/execute \
  -H "Content-Type: application/json" \
  -d '{"organism_id": "dna::}{::lang", "backend": "ibm_torino", "simulate": true}'
```

**Response:**
```json
{
  "success": true,
  "genesis_hash": "0x3e8a7f2c1d9b5e4a",
  "organism_id": "dna::}{::lang",
  "backend": "ibm_torino",
  "consciousness_metrics": {
    "phi": 1.0234,
    "lambda_coherence": 0.456789,
    "gamma": 0.7441,
    "entropy": 2.8903,
    "participation_ratio": 0.856,
    "timestamp": "2025-11-20T13:06:12.000Z"
  },
  "mode": "simulation",
  "execution_time_ms": 45
}
```

---

## Troubleshooting

### Still Getting 401 After Disabling Protection

1. **Clear browser cache** (if testing in browser)
2. **Wait 60 seconds** for CDN propagation
3. **Check deployment status:**
   ```bash
   npx vercel ls --token=8CxX7JKGJjCFBfGN1TD1HXFW
   ```
4. **Redeploy if necessary:**
   ```bash
   npx vercel --prod --yes --token=8CxX7JKGJjCFBfGN1TD1HXFW
   ```

### Getting 404 Instead of 401

- Endpoint path might be wrong
- Check that deployment includes API routes
- Verify build completed successfully

### Getting 500 Internal Server Error

- Check Vercel logs:
  ```bash
  npx vercel logs --token=8CxX7JKGJjCFBfGN1TD1HXFW
  ```
- Verify environment variables are set
- Check for TypeScript compilation errors

---

## Quick Reference

**Deployment URL:**
```
https://quantumlm-vercel-9cgbbu8se-dnalang-67efe71c.vercel.app
```

**Vercel Dashboard:**
```
https://vercel.com/dnalang-67efe71c/quantumlm-vercel
```

**Settings → Deployment Protection:**
```
https://vercel.com/dnalang-67efe71c/quantumlm-vercel/settings/deployment-protection
```

**Redeploy Command:**
```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel
npx vercel --prod --yes --token=8CxX7JKGJjCFBfGN1TD1HXFW
```

---

## Summary

1. Go to Vercel dashboard deployment protection settings
2. Change from "Vercel Authentication" to "None"
3. Save and wait 30 seconds
4. Test endpoints with curl
5. Verify 200 OK responses

**Time:** 2 minutes
**Difficulty:** Easy
**Impact:** Enables public API access
