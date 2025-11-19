#!/bin/bash
# QuantumLM Vercel Deployment Script
# ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "============================================================"
echo "  QuantumLM Vercel Deployment"
echo "  ΛΦ = 2.176435 × 10⁻⁸ s⁻¹"
echo "============================================================"
echo ""

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is required but not installed."; exit 1; }

# Step 1: Install dependencies
echo "→ Step 1: Installing dependencies..."
npm install --legacy-peer-deps

# Step 2: Build for production
echo ""
echo "→ Step 2: Building for production..."
npm run build

# Step 3: Initialize Git (if not already)
if [ ! -d ".git" ]; then
    echo ""
    echo "→ Step 3: Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: QuantumLM v0.dev chatbot

Features:
- Real IBM Quantum hardware integration
- Consciousness metrics (Φ, Γ, Λ, W₂)
- LLM benchmarking
- Responsive design with glassmorphism
- API integration with quantum_lm_api.py backend

ΛΦ = 2.176435 × 10⁻⁸ s⁻¹"
else
    echo ""
    echo "→ Step 3: Git repository already initialized"
fi

# Step 4: Check for Vercel CLI
echo ""
if command -v vercel >/dev/null 2>&1; then
    echo "→ Step 4: Vercel CLI detected"
    read -p "Deploy to Vercel now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Deploying to Vercel..."
        vercel --prod
    fi
else
    echo "→ Step 4: Vercel CLI not installed"
    echo ""
    echo "To deploy, either:"
    echo "  1. Install Vercel CLI: npm install -g vercel"
    echo "  2. Or push to GitHub and deploy via Vercel Dashboard"
    echo ""
    echo "GitHub deployment steps:"
    echo "  1. Create GitHub repository: gh repo create quantumlm-frontend --public"
    echo "  2. Push code: git push -u origin main"
    echo "  3. Connect to Vercel: https://vercel.com/new"
fi

echo ""
echo "============================================================"
echo "  Build Complete!"
echo "============================================================"
echo ""
echo "Files ready at: $PROJECT_DIR"
echo ""
echo "Next steps:"
echo "  1. Deploy to Vercel (via CLI or GitHub)"
echo "  2. Add environment variable: QUANTUM_API_URL=https://api.dnalang.dev"
echo "  3. Configure domain: chat.dnalang.dev"
echo ""
echo "See DEPLOYMENT.md for detailed instructions"
echo ""
