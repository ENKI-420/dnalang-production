#!/bin/bash
# DNALang Quantum Platform - Deployment Verification Script
# Verifies all API endpoints are accessible and responding correctly

DEPLOYMENT_URL="quantumlm-vercel-9cgbbu8se-dnalang-67efe71c.vercel.app"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}DNALang Quantum Platform - Deployment Verification${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Production URL: https://$DEPLOYMENT_URL"
echo ""

test_endpoint() {
  local endpoint=$1
  local method=${2:-GET}
  local expect_code=${3:-200}

  echo -n "  $method $endpoint... "

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X $method "https://$DEPLOYMENT_URL$endpoint")

  if [ "$HTTP_CODE" = "$expect_code" ]; then
    echo -e "${GREEN}✓ $HTTP_CODE${NC}"
    return 0
  elif [ "$HTTP_CODE" = "405" ] && [ "$method" = "GET" ]; then
    echo -e "${GREEN}✓ $HTTP_CODE (Method Not Allowed - POST required)${NC}"
    return 0
  elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "${RED}✗ $HTTP_CODE (Deployment Protection Active)${NC}"
    return 1
  else
    echo -e "${RED}✗ $HTTP_CODE${NC}"
    return 1
  fi
}

# Test all endpoints
echo -e "${BLUE}[1/3] Testing API Endpoints...${NC}"
echo ""

FAILED=0

test_endpoint "/api/quantum-gene/execute" "GET" || ((FAILED++))
test_endpoint "/api/integrations/quantumcomm" "GET" || ((FAILED++))
test_endpoint "/api/integrations/z3bra" "GET" || ((FAILED++))
test_endpoint "/api/integrations/quantumcoin" "GET" || ((FAILED++))
test_endpoint "/api/organisms" "GET" || ((FAILED++))

echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}✗ $FAILED endpoint(s) failed${NC}"
  echo ""
  if curl -s "https://$DEPLOYMENT_URL/api/organisms" | grep -q "Authentication Required"; then
    echo -e "${RED}ERROR: Deployment Protection is ACTIVE${NC}"
    echo ""
    echo "To fix this issue:"
    echo "1. Go to: https://vercel.com/dnalang-67efe71c/quantumlm-vercel/settings/deployment-protection"
    echo "2. Change from 'Vercel Authentication' to 'None'"
    echo "3. Save and wait 30 seconds"
    echo "4. Run this script again"
    echo ""
    echo "See: QUICK_FIX_DEPLOYMENT_PROTECTION.md for detailed instructions"
  fi
  exit 1
fi

echo -e "${GREEN}✓ All endpoints accessible${NC}"
echo ""

# Test organism registry
echo -e "${BLUE}[2/3] Testing Organism Registry...${NC}"
echo ""

RESPONSE=$(curl -s "https://$DEPLOYMENT_URL/api/organisms")

if echo "$RESPONSE" | jq -e '.' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Organism registry responding${NC}"
  echo "$RESPONSE" | jq '{total, timestamp}'
else
  echo -e "${RED}✗ Organism registry failed${NC}"
  echo "$RESPONSE"
  ((FAILED++))
fi

echo ""

# Test quantum organism execution
echo -e "${BLUE}[3/3] Testing Quantum Organism Execution...${NC}"
echo ""

RESPONSE=$(curl -s -X POST "https://$DEPLOYMENT_URL/api/quantum-gene/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "organism_id": "dna::}{::lang",
    "backend": "ibm_torino",
    "simulate": true
  }')

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Quantum execution successful${NC}"
  echo ""
  echo "Response:"
  echo "$RESPONSE" | jq '{
    success,
    genesis_hash,
    organism_id,
    backend,
    consciousness_metrics: {
      phi: .consciousness_metrics.phi,
      lambda_coherence: .consciousness_metrics.lambda_coherence,
      gamma: .consciousness_metrics.gamma
    },
    mode,
    execution_time_ms
  }'
else
  echo -e "${RED}✗ Quantum execution failed${NC}"
  echo "$RESPONSE"
  ((FAILED++))
fi

echo ""
echo -e "${BLUE}================================================${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
  echo -e "${BLUE}================================================${NC}"
  echo ""
  echo "Deployment Status: READY FOR PRODUCTION"
  echo ""
  echo "API Endpoints:"
  echo "  - https://$DEPLOYMENT_URL/api/quantum-gene/execute"
  echo "  - https://$DEPLOYMENT_URL/api/integrations/quantumcomm"
  echo "  - https://$DEPLOYMENT_URL/api/integrations/z3bra"
  echo "  - https://$DEPLOYMENT_URL/api/integrations/quantumcoin"
  echo "  - https://$DEPLOYMENT_URL/api/organisms"
  echo ""
  echo "Next Steps:"
  echo "  1. Configure custom domain (www.dnalang.dev)"
  echo "  2. Set environment variables (IBM_QUANTUM_TOKEN)"
  echo "  3. Enable continuous deployment from GitHub"
  echo ""
  exit 0
else
  echo -e "${RED}✗ TESTS FAILED${NC}"
  echo -e "${BLUE}================================================${NC}"
  echo ""
  echo "Failed Tests: $FAILED"
  echo ""
  echo "See DEPLOYMENT_STATUS_VERCEL.md for troubleshooting"
  echo ""
  exit 1
fi
