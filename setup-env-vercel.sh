#!/bin/bash

# Automated Vercel Environment Variable Setup
# ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

set -e

cd "$(dirname "$0")"

echo "🔧 Setting up Vercel environment variables..."
echo ""

# Check for required files
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    exit 1
fi

# Extract Vercel token
VERCEL_TOKEN=$(grep "^vercel_Token=" .env.local | cut -d'=' -f2)
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: Vercel token not found in .env.local"
    exit 1
fi

# Extract project ID from .vercel/project.json
PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
TEAM_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)

echo "📦 Project ID: $PROJECT_ID"
echo "👥 Team ID: $TEAM_ID"
echo ""

# Function to set environment variable via Vercel API
set_env_var() {
    local key=$1
    local value=$2
    local env_type=${3:-production}

    echo "📝 Setting $key..."

    curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"key\": \"$key\",
            \"value\": \"$value\",
            \"type\": \"encrypted\",
            \"target\": [\"$env_type\"]
        }" > /dev/null 2>&1 || echo "   (already exists or error)"
}

echo "🔐 Setting Supabase credentials..."

# Supabase variables
SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d'"' -f2)
SUPABASE_ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | head -1 | cut -d'"' -f2)
SUPABASE_SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d'"' -f2)
SUPABASE_JWT=$(grep "^SUPABASE_JWT_SECRET=" .env.local | cut -d'"' -f2)

set_env_var "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
set_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
set_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_KEY"
set_env_var "SUPABASE_JWT_SECRET" "$SUPABASE_JWT"
set_env_var "SUPABASE_URL" "$SUPABASE_URL"

echo ""

# IBM Quantum token
if [ -f "/home/dev/Desktop/QNET.json" ]; then
    echo "🔬 Setting IBM Quantum credentials..."
    IBM_TOKEN=$(cat /home/dev/Desktop/QNET.json | grep -o '"apikey"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$IBM_TOKEN" ]; then
        set_env_var "IBM_QUANTUM_TOKEN" "$IBM_TOKEN"
        echo "   ✅ IBM Quantum token set"
    fi
    echo ""
fi

echo "✅ Environment variables configured!"
echo ""
echo "🚀 Triggering new deployment..."
echo ""

# Trigger a new deployment by creating a deployment
npx vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your permanent backend is live!"
echo ""
echo "📊 Test your API:"
echo "   curl https://quantumlm-vercel.vercel.app/api/quantum/status"
echo ""
