#!/bin/bash
# Deploy DNALang Quantum Platform to Vercel Production
# Automated deployment script

set -e  # Exit on error

echo "======================================================================"
echo "  DNALang Quantum Platform - Vercel Deployment"
echo "  Deploying to: https://www.dnalang.dev"
echo "======================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗ Vercel CLI not found${NC}"
    echo ""
    echo "Installing Vercel CLI globally..."
    npm install -g vercel
    echo -e "${GREEN}✓ Vercel CLI installed${NC}"
fi

# Check Vercel authentication
echo -e "${BLUE}[1/6] Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}  Not logged in to Vercel${NC}"
    echo "  Please log in:"
    vercel login
fi
echo -e "${GREEN}  ✓ Authenticated as: $(vercel whoami)${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}[2/6] Installing dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}  ✓ Dependencies installed${NC}"
echo ""

# Run build locally to verify
echo -e "${BLUE}[3/6] Running local build verification...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ Build successful${NC}"
else
    echo -e "${RED}  ✗ Build failed${NC}"
    echo "  Fix build errors before deploying"
    exit 1
fi
echo ""

# Check environment variables
echo -e "${BLUE}[4/6] Checking environment variables...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}  Warning: .env.local found (will not be deployed)${NC}"
    echo "  Make sure to set environment variables in Vercel dashboard"
fi

# Required environment variables for Vercel
REQUIRED_ENV_VARS=(
    "QUANTUM_API_URL"
    "NEXT_PUBLIC_APP_URL"
    "NEXT_PUBLIC_LAMBDA_PHI"
)

echo "  Required environment variables:"
for var in "${REQUIRED_ENV_VARS[@]}"; do
    echo "    - $var"
done
echo ""

# Deploy to Vercel production
echo -e "${BLUE}[5/6] Deploying to Vercel production...${NC}"
echo ""
echo "  Project: dnalang-quantum-platform"
echo "  Domain: www.dnalang.dev"
echo "  Framework: Next.js 16.0.3"
echo "  Region: iad1 (US East), sfo1 (US West)"
echo ""

read -p "  Deploy to production? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "  Deploying..."

    # Deploy to production
    vercel --prod --yes

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}  ✓ Deployment successful!${NC}"
    else
        echo ""
        echo -e "${RED}  ✗ Deployment failed${NC}"
        exit 1
    fi
else
    echo ""
    echo "  Deployment cancelled"
    exit 0
fi

# Verify deployment
echo ""
echo -e "${BLUE}[6/6] Verifying deployment...${NC}"
echo ""

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls --prod | grep "dnalang-quantum-platform" | awk '{print $2}' | head -1)

if [ -z "$DEPLOYMENT_URL" ]; then
    DEPLOYMENT_URL="www.dnalang.dev"
fi

echo "  Testing endpoints..."

# Test health endpoint
echo -n "    /api/quantum-gene/execute... "
if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL/api/quantum-gene/execute" | grep -q "200\|405"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test QuantumComm
echo -n "    /api/integrations/quantumcomm... "
if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL/api/integrations/quantumcomm" | grep -q "200"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test Z3BRA
echo -n "    /api/integrations/z3bra... "
if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL/api/integrations/z3bra" | grep -q "200"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test QuantumCoin
echo -n "    /api/integrations/quantumcoin... "
if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL/api/integrations/quantumcoin" | grep -q "200"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test Organisms
echo -n "    /api/organisms... "
if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL/api/organisms" | grep -q "200"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
echo "======================================================================"
echo -e "${GREEN}  ✅ DEPLOYMENT COMPLETE${NC}"
echo "======================================================================"
echo ""
echo "  Production URL: https://$DEPLOYMENT_URL"
echo "  Dashboard: https://vercel.com/dashboard"
echo ""
echo "  API Endpoints:"
echo "    - https://$DEPLOYMENT_URL/api/quantum-gene/execute"
echo "    - https://$DEPLOYMENT_URL/api/integrations/quantumcomm"
echo "    - https://$DEPLOYMENT_URL/api/integrations/z3bra"
echo "    - https://$DEPLOYMENT_URL/api/integrations/quantumcoin"
echo "    - https://$DEPLOYMENT_URL/api/organisms"
echo ""
echo "  Next steps:"
echo "    1. Configure custom domain in Vercel dashboard"
echo "    2. Set environment variables (if not already set)"
echo "    3. Monitor deployment logs"
echo "    4. Test all API endpoints"
echo ""
echo "======================================================================"
