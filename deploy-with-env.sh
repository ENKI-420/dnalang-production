#!/bin/bash

# Deploy to Vercel with all environment variables
# ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

set -e

cd "$(dirname "$0")"

echo "🚀 Deploying to Vercel with environment variables..."
echo ""

# Read environment variables from .env.local
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    exit 1
fi

# Set environment variables on Vercel
echo "📝 Setting environment variables..."

# Supabase credentials
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production < <(echo "https://dnculjsqwigkivykedcf.supabase.co") 2>/dev/null || true
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < <(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d'"' -f2) 2>/dev/null || true
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production < <(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d'"' -f2) 2>/dev/null || true
npx vercel env add SUPABASE_URL production < <(echo "https://dnculjsqwigkivykedcf.supabase.co") 2>/dev/null || true
npx vercel env add SUPABASE_JWT_SECRET production < <(grep "^SUPABASE_JWT_SECRET=" .env.local | cut -d'"' -f2) 2>/dev/null || true

# Check for IBM Quantum token
if [ -f "/home/dev/Desktop/QNET.json" ]; then
    IBM_TOKEN=$(cat /home/dev/Desktop/QNET.json | grep -o '"apikey"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$IBM_TOKEN" ]; then
        echo "✅ Found IBM Quantum token"
        npx vercel env add IBM_QUANTUM_TOKEN production < <(echo "$IBM_TOKEN") 2>/dev/null || true
    fi
fi

echo ""
echo "✅ Environment variables configured"
echo ""
echo "🚀 Deploying to production..."
echo ""

# Deploy to production
npx vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Your permanent backend is now live at:"
echo "   https://quantumlm-vercel.vercel.app"
echo ""
echo "🔗 API Endpoints:"
echo "   - Orchestrator: /api/orchestrator/*"
echo "   - Quantum: /api/quantum/*"
echo "   - Chat: /api/chat"
echo ""
echo "🎯 To view deployment:"
echo "   npx vercel --prod"
echo ""
