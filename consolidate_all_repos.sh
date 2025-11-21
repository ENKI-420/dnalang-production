#!/bin/bash
set -e

# QS-UED-PALS Complete Repository Consolidation Script
# Consolidates ALL DNALang and quantum technologies into quantumlm-vercel

echo "🌌 QS-UED-PALS Complete Repository Consolidation"
echo "================================================="
echo "Consolidating ALL technologies into unified platform"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Base directories
BASE_DIR="/home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel"
CONSOLIDATION_LOG="$BASE_DIR/consolidation.log"

cd "$BASE_DIR"

echo -e "${BLUE}Starting consolidation at $(date)${NC}" | tee "$CONSOLIDATION_LOG"
echo ""

# Create unified directory structure
echo -e "${BLUE}📁 Creating unified directory structure...${NC}"
mkdir -p {python/{quantum_core,aura_engine,organisms,ibm_integration,api_gateway},android/{quantum-bridge,p2p-comm},blockchain/{contracts,scripts},desktop/src,legal/{norton-case,ai-tools,evidence-vault,brief-templates},research/{experiments,papers,results,corpus},docs/{api,workspaces,organisms,deployment},organisms/{aiden,aura,research,legal,examples},integrations/{ibm-quantum,z3bra,quantumcoin,android-bridge,legal-systems},tests/{quantum,organisms,legal,integration}}

echo -e "${GREEN}✅ Directory structure created${NC}"
echo ""

# Function to copy with logging
copy_with_log() {
    local src=$1
    local dest=$2
    local description=$3

    echo -e "${BLUE}   Copying: $description${NC}"
    if [ -d "$src" ] || [ -f "$src" ]; then
        cp -r "$src" "$dest" 2>&1 | tee -a "$CONSOLIDATION_LOG"
        echo -e "${GREEN}   ✅ Copied: $description${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Not found: $src${NC}"
    fi
}

# Consolidate Python quantum modules from dnalang-ibm-cloud
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🐍 Consolidating Python Quantum Modules${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "/home/dev/dnalang-ibm-cloud" ]; then
    copy_with_log "/home/dev/dnalang-ibm-cloud/*.py" "python/quantum_core/" "Python quantum scripts"
    copy_with_log "/home/dev/dnalang-ibm-cloud/aura*.py" "python/aura_engine/" "AURA engine scripts"
    copy_with_log "/home/dev/dnalang-ibm-cloud/*.dna" "organisms/examples/" "DNA organism files"
    copy_with_log "/home/dev/dnalang-ibm-cloud/quantum_experiments_data" "research/experiments/" "Quantum experiment data"
fi
echo ""

# Consolidate Next.js project components
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚛️  Consolidating Next.js Components${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "/home/dev/project" ]; then
    # Copy lib directory if not already merged
    if [ -d "/home/dev/project/lib" ]; then
        copy_with_log "/home/dev/project/lib/*" "lib/" "Project libraries"
    fi

    # Copy components
    if [ -d "/home/dev/project/components" ]; then
        copy_with_log "/home/dev/project/components/*" "components/" "React components"
    fi

    # Copy app routes
    if [ -d "/home/dev/project/app" ]; then
        copy_with_log "/home/dev/project/app/api/*" "app/api/" "API routes"
    fi

    # Copy Prisma schema
    if [ -f "/home/dev/project/prisma/schema.prisma" ]; then
        copy_with_log "/home/dev/project/prisma/schema.prisma" "prisma/" "Prisma schema"
    fi

    # Copy tests
    if [ -d "/home/dev/project/tests" ] || [ -d "/home/dev/project/__tests__" ]; then
        copy_with_log "/home/dev/project/tests/*" "tests/" "Project tests"
        copy_with_log "/home/dev/project/__tests__/*" "tests/" "Project tests (alt)"
    fi
fi
echo ""

# Consolidate Blockchain (QuantumCoin)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⛓️  Consolidating Blockchain & QuantumCoin${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "/home/dev/dnalang-token" ]; then
    copy_with_log "/home/dev/dnalang-token/contracts/*" "blockchain/contracts/" "Smart contracts"
    copy_with_log "/home/dev/dnalang-token/scripts/*" "blockchain/scripts/" "Blockchain scripts"
    copy_with_log "/home/dev/dnalang-token/hardhat.config.js" "blockchain/" "Hardhat config"
fi
echo ""

# Consolidate Android applications
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📱 Consolidating Android Applications${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "/home/dev/dnalang-quantum-mobile" ]; then
    copy_with_log "/home/dev/dnalang-quantum-mobile/*" "android/quantum-bridge/" "Android quantum bridge"
fi

if [ -d "/home/dev/DNALang-Android-Bridge" ]; then
    copy_with_log "/home/dev/DNALang-Android-Bridge/*" "android/p2p-comm/" "Android P2P communication"
fi
echo ""

# Consolidate Desktop application
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🖥️  Consolidating Desktop Application${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "/home/dev/dnalang-desktop" ]; then
    copy_with_log "/home/dev/dnalang-desktop/src/*" "desktop/src/" "Desktop app source"
    copy_with_log "/home/dev/dnalang-desktop/package.json" "desktop/" "Desktop package.json"
fi
echo ""

# Consolidate Legal platform (Norton)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚖️  Consolidating Legal Platform${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "/home/dev/Music/norton-attorney-portal" ]; then
    copy_with_log "/home/dev/Music/norton-attorney-portal/app/*" "legal/norton-case/" "Norton case files"
    copy_with_log "/home/dev/Music/norton-attorney-portal/components/*" "components/legal/" "Legal components"
fi
echo ""

# Consolidate Agile Defense portals
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🛡️  Consolidating Agile Defense Portals${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "/home/dev/agile-defense-unified" ]; then
    copy_with_log "/home/dev/agile-defense-unified/frontend/app/*" "app/portals/enterprise/" "Enterprise portal"
    copy_with_log "/home/dev/agile-defense-unified/backend/*" "python/api_gateway/" "Backend API"
fi

if [ -d "/home/dev/agile-defense-quantum-portal" ]; then
    copy_with_log "/home/dev/agile-defense-quantum-portal/app/*" "app/portals/" "Additional portals"
fi
echo ""

# Consolidate FastAPI gateway
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔌 Consolidating FastAPI Gateway${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "/home/dev/dnalang-unified-platform" ]; then
    copy_with_log "/home/dev/dnalang-unified-platform/*.py" "python/api_gateway/" "API gateway"
    copy_with_log "/home/dev/dnalang-unified-platform/requirements.txt" "python/" "Python requirements"
fi
echo ""

# Consolidate QSlice integration
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔪 Consolidating QSlice Integration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "/home/dev/dna-lang-qslice-integration" ]; then
    copy_with_log "/home/dev/dna-lang-qslice-integration/*" "lib/qs-ued-pals/" "QSlice integration"
fi
echo ""

# Consolidate Research data
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔬 Consolidating Research Data${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "/home/dev/quantum_experiments_data" ]; then
    copy_with_log "/home/dev/quantum_experiments_data/*" "research/experiments/" "Experiment data"
fi

if [ -d "/home/dev/quantum_deliverables" ]; then
    copy_with_log "/home/dev/quantum_deliverables/*" "research/results/" "Research deliverables"
fi

if [ -d "/home/dev/agile_defense_corpus" ]; then
    copy_with_log "/home/dev/agile_defense_corpus/*" "research/corpus/" "Training corpus"
fi
echo ""

# Create unified requirements.txt
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 Creating Unified Requirements${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cat > python/requirements.txt <<EOF
# QS-UED-PALS Unified Python Requirements
# Generated: $(date)

# Quantum Computing
qiskit>=1.0.0
qiskit-aer>=0.13.0
qiskit-ibm-runtime>=0.18.0

# Web Framework
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
pydantic>=2.5.0
pydantic-settings>=2.1.0

# Scientific Computing
numpy>=1.26.0
scipy>=1.11.0
pandas>=2.1.0
matplotlib>=3.8.0

# HTTP & Async
httpx>=0.26.0
aiofiles>=23.2.1
websockets>=12.0

# Authentication & Security
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
cryptography>=41.0.7

# Database
psycopg2-binary>=2.9.9
sqlalchemy>=2.0.25

# Utilities
python-multipart>=0.0.6
python-dotenv>=1.0.0
pyyaml>=6.0.1

# Testing
pytest>=7.4.4
pytest-asyncio>=0.23.3
pytest-cov>=4.1.0

# Blockchain
web3>=6.14.0
eth-account>=0.10.0

# Android Bridge
adb-shell>=0.4.4
pure-python-adb>=0.3.0

# Legal AI
spacy>=3.7.2
transformers>=4.36.2
sentence-transformers>=2.3.1
EOF

echo -e "${GREEN}✅ Created python/requirements.txt${NC}"
echo ""

# Create unified package.json
echo -e "${BLUE}📦 Merging package.json dependencies${NC}"

# Check if we need to merge package.json files
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json already exists${NC}"
else
    echo -e "${YELLOW}⚠️  Creating new package.json${NC}"
    cat > package.json <<EOF
{
  "name": "qs-ued-pals-unified",
  "version": "1.0.0",
  "description": "QS-UED-PALS Unified Platform - Quantum Sliced User Engagement & Data",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "build:python": "cd python && pip install -r requirements.txt",
    "build:blockchain": "cd blockchain && npx hardhat compile"
  },
  "dependencies": {
    "next": "15.5.6",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "typescript": "^5.0.0",
    "next-auth": "5.0.0-beta.30",
    "@prisma/client": "6.19.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "recharts": "^2.12.0",
    "lucide-react": "^0.303.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.3",
    "bcryptjs": "^2.4.3",
    "ethers": "^6.9.0",
    "web3": "^4.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/bcryptjs": "^2.4.6",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "15.5.6",
    "postcss": "^8.4.33",
    "prisma": "6.19.0",
    "tailwindcss": "^4.0.0",
    "vitest": "^4.0.12"
  }
}
EOF
fi
echo ""

# Update Vercel configuration
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Updating Vercel Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cat > vercel.json <<EOF
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "regions": ["iad1"],
  "env": {
    "QS_UED_PALS_VERSION": "1.0.0",
    "UNIFIED_PLATFORM": "true"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-QS-UED-PALS",
          "value": "dna::}{::lang"
        }
      ]
    }
  ]
}
EOF

echo -e "${GREEN}✅ Updated vercel.json${NC}"
echo ""

# Create master README
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📖 Creating Master README${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cat > README_UNIFIED.md <<EOF
# 🌌 QS-UED-PALS Unified Platform

**Quantum Sliced User Engagement & Data - Persistence Assurance Language Sentinels**

**Version**: 1.0.0
**Framework**: dna::}{::lang
**Architecture**: AIDEN|AURA Duality

---

## 🎯 Overview

This is the **UNIFIED** platform consolidating ALL DNALang quantum computing technologies, blockchain systems, mobile applications, legal AI tools, and research frameworks into a single deployable ecosystem.

### Consolidated Technologies

✅ Next.js 15 + React 19 Web Portal
✅ Python Quantum Computing Core (Qiskit + IBM Quantum)
✅ AIDEN|AURA Duality Framework
✅ QuantumCoin Blockchain & NFT Marketplace
✅ Android Quantum Bridge & P2P Communication
✅ Electron Desktop Application
✅ Legal AI Platform (Norton Healthcare Case)
✅ Research Data & Experimental Results
✅ FastAPI Backend Gateway
✅ QSlice Quantum Computing Integration
✅ Multi-workspace Management (Research, Jeremy, Legal)

---

## 📂 Project Structure

\`\`\`
quantumlm-vercel/         # Unified QS-UED-PALS Platform
├── app/                   # Next.js 15 App Router
├── components/            # React components
├── lib/                   # TypeScript libraries
├── python/                # Python quantum backend
├── android/               # Android applications
├── blockchain/            # Smart contracts
├── desktop/               # Electron app
├── legal/                 # Legal AI platform
├── research/              # Research data
├── organisms/             # DNA-Lang organisms
├── integrations/          # External integrations
├── docs/                  # Documentation
└── tests/                 # All tests
\`\`\`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- IBM Quantum account (for quantum features)

### Installation

\`\`\`bash
# Install Node.js dependencies
npm install --legacy-peer-deps

# Install Python dependencies
pip install -r python/requirements.txt

# Setup database
npx prisma generate
npx prisma migrate deploy

# Build all components
npm run build
npm run build:python
npm run build:blockchain
\`\`\`

### Development

\`\`\`bash
# Start development server
npm run dev

# Run tests
npm test

# Deploy to Vercel
vercel --prod
\`\`\`

---

## 🧬 AIDEN|AURA Framework

**AIDEN**: Defense, Security, Integrity (Negentropic Preservation)
**AURA**: Creation, Evolution, Adaptation (Recursive Improvement)

6 Agents deployed across 3 workspaces.

---

## 📊 Workspaces

1. **Research** - research@dnalang.dev
2. **Jeremy Collaboration** - Jeremy.Quantum@outlook.com
3. **Norton Legal** - David@bluegrass-lawyers.com

---

## 📖 Documentation

See \`docs/\` directory for comprehensive guides.

---

**dna::}{::lang - Σₛ (Self-Designation Constant)**
**U = L[U] - The Universe is the Lagrangian of Itself**
**ΛΦ = 2.176435 × 10⁻⁸ (Universal Memory Constant)**
EOF

echo -e "${GREEN}✅ Created README_UNIFIED.md${NC}"
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 CONSOLIDATION COMPLETE!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✅ Consolidated Technologies:${NC}"
echo "   🐍 Python Quantum Core"
echo "   ⚛️  Next.js 15 Components"
echo "   ⛓️  Blockchain & QuantumCoin"
echo "   📱 Android Applications"
echo "   🖥️  Desktop Application"
echo "   ⚖️  Legal AI Platform"
echo "   🔬 Research Data"
echo "   🔌 FastAPI Gateway"
echo "   🔪 QSlice Integration"
echo ""

echo -e "${GREEN}✅ Created Files:${NC}"
echo "   📦 python/requirements.txt"
echo "   📦 package.json (if missing)"
echo "   🚀 vercel.json"
echo "   📖 README_UNIFIED.md"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "   1. Review consolidation.log for any errors"
echo "   2. Test build locally: npm run build"
echo "   3. Run tests: npm test"
echo "   4. Deploy to Vercel: vercel --prod"
echo ""

echo -e "${BLUE}🌐 Unified Platform Ready!${NC}"
echo "   Location: $BASE_DIR"
echo "   Logs: $CONSOLIDATION_LOG"
echo ""

echo "dna::}{::lang - All technologies unified under QS-UED-PALS!"
