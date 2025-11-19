#!/bin/bash
# Complete Deployment Script for dna::}{::lang Production
# Handles GitHub integration and Vercel deployment

set -e

echo "============================================================"
echo "  dna::}{::lang Production Deployment"
echo "  ΛΦ = 2.176435 × 10⁻⁸ s⁻¹"
echo "============================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to project directory
cd "$(dirname "${BASH_SOURCE[0]}")"

echo -e "${BLUE}Current directory:${NC} $(pwd)"
echo ""

# Step 1: Verify Git Repository
echo -e "${BLUE}Step 1: Verifying Git repository...${NC}"
if git remote get-url origin &> /dev/null; then
    REPO_URL=$(git remote get-url origin)
    echo -e "${GREEN}✓ Git remote configured:${NC} $REPO_URL"
else
    echo -e "${RED}✗ No git remote found${NC}"
    exit 1
fi
echo ""

# Step 2: Check Build Status
echo -e "${BLUE}Step 2: Testing local build...${NC}"
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed. Check /tmp/build.log for details${NC}"
    tail -20 /tmp/build.log
    exit 1
fi
echo ""

# Step 3: Verify Vercel Configuration
echo -e "${BLUE}Step 3: Checking Vercel configuration...${NC}"
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Vercel project linked:${NC} $PROJECT_ID"
else
    echo -e "${YELLOW}⚠ Vercel project not linked${NC}"
    echo "  Run: npx vercel link"
fi
echo ""

# Step 4: Check for uncommitted changes
echo -e "${BLUE}Step 4: Checking for uncommitted changes...${NC}"
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✓ No uncommitted changes${NC}"
else
    echo -e "${YELLOW}⚠ You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Commit these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Enter commit message:"
        read COMMIT_MSG
        git add -A
        git commit -m "$COMMIT_MSG"
        echo -e "${GREEN}✓ Changes committed${NC}"
    fi
fi
echo ""

# Step 5: Push to GitHub
echo -e "${BLUE}Step 5: Pushing to GitHub...${NC}"
if git push origin main 2>&1; then
    echo -e "${GREEN}✓ Pushed to GitHub${NC}"
else
    echo -e "${RED}✗ Failed to push to GitHub${NC}"
    exit 1
fi
echo ""

# Step 6: Deployment Options
echo -e "${BLUE}Step 6: Choose deployment method:${NC}"
echo ""
echo "  1) Deploy via Vercel CLI (requires permissions)"
echo "  2) Open Vercel Dashboard (manual deployment)"
echo "  3) View deployment instructions"
echo "  4) Skip deployment (code is pushed to GitHub)"
echo ""
read -p "Select option (1-4): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo -e "${BLUE}Deploying via Vercel CLI...${NC}"
        if npx vercel --prod --yes 2>&1; then
            echo -e "${GREEN}✓ Deployment initiated${NC}"
        else
            echo -e "${YELLOW}⚠ CLI deployment failed - try Option 2 (Dashboard)${NC}"
        fi
        ;;
    2)
        echo -e "${BLUE}Opening Vercel Dashboard...${NC}"
        echo ""
        echo "Manual deployment steps:"
        echo "  1. Dashboard will open in your browser"
        echo "  2. Go to Settings → Git"
        echo "  3. Connect: ENKI-420/dnalang-production"
        echo "  4. Go to Deployments → Deploy from main"
        echo ""
        read -p "Press Enter to open dashboard..."
        xdg-open "https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel" 2>/dev/null || \
        open "https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel" 2>/dev/null || \
        echo "Visit: https://vercel.com/devinphillipdavis-7227s-projects/quantumlm-vercel"
        ;;
    3)
        cat VERCEL_DEPLOYMENT.md
        ;;
    4)
        echo -e "${YELLOW}Skipping deployment${NC}"
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "============================================================"
echo -e "${GREEN}  Deployment Process Complete!${NC}"
echo "============================================================"
echo ""
echo "Summary:"
echo "  ✓ Code committed and pushed to GitHub"
echo "  ✓ Repository: https://github.com/ENKI-420/dnalang-production"
echo "  ✓ Vercel Project: quantumlm-vercel"
echo ""
echo "Next steps:"
echo "  1. Verify deployment at Vercel dashboard"
echo "  2. Configure custom domain (dnalang.dev)"
echo "  3. Set up environment variables"
echo "  4. Test production URL"
echo ""
echo "Resources:"
echo "  • Deployment guide: ./VERCEL_DEPLOYMENT.md"
echo "  • GitHub repo: https://github.com/ENKI-420/dnalang-production"
echo "  • Vercel dashboard: https://vercel.com/dashboard"
echo ""
