#!/bin/bash
# QuantumLM Vercel Deployment - Simplified
# ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

set -e

echo "============================================================"
echo "  QuantumLM Vercel Deployment"
echo "  ΛΦ = 2.176435 × 10⁻⁸ s⁻¹"
echo "============================================================"
echo ""

# Navigate to project directory
cd "$(dirname "${BASH_SOURCE[0]}")"

# Step 1: Authenticate with Vercel (if needed)
echo "→ Step 1: Authenticating with Vercel..."
echo "This will open your browser. Please log in to Vercel."
echo ""
npx vercel login

# Wait for user confirmation
echo ""
read -p "Press Enter after you've completed login in your browser..."

# Step 2: Deploy to production
echo ""
echo "→ Step 2: Deploying to production..."
npx vercel --prod

echo ""
echo "============================================================"
echo "  Deployment Complete!"
echo "============================================================"
echo ""
echo "Next steps:"
echo "  1. Go to https://vercel.com/dashboard"
echo "  2. Select your project"
echo "  3. Settings → Environment Variables"
echo "  4. Add: QUANTUM_API_URL = https://api.dnalang.dev"
echo "  5. Redeploy from Deployments tab"
echo ""
