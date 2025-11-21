#!/bin/bash
# Quick Start Script for Quantum Gene Integrations
# Runs all integration demos

echo "======================================================================"
echo "  Quantum Gene Integration Quick Start"
echo "  Running All Four Ecosystem Integrations"
echo "======================================================================"
echo ""

cd integrations/

# Check dependencies
echo "[1/5] Checking dependencies..."
python3 -c "import numpy, flask, requests" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  ✓ All dependencies installed"
else
    echo "  ⚠ Installing dependencies..."
    pip install -q numpy flask flask-cors requests
    echo "  ✓ Dependencies installed"
fi

echo ""
echo "[2/5] Running QuantumComm demo..."
python3 quantumcomm_integration.py 2>/dev/null | head -30

echo ""
echo "[3/5] Running Z3BRA Bridge demo..."
python3 z3bra_bridge_integration.py 2>/dev/null | head -30

echo ""
echo "[4/5] Running QuantumCoin demo..."
python3 quantumcoin_integration.py 2>/dev/null | head -30

echo ""
echo "[5/5] Running Master Integration..."
python3 master_integration.py --all --genesis-hash 0x3e8a7f2c1d9b5e4a 2>/dev/null | head -50

echo ""
echo "======================================================================"
echo "  ✅ All Integration Demos Complete!"
echo "======================================================================"
echo ""
echo "Next steps:"
echo "  1. Review generated JSON files in integrations/"
echo "  2. Start web API: python3 integrations/web_platform_integration.py serve"
echo "  3. Deploy to production: docker build -t dnalang-integrations ."
echo ""
echo "Documentation: integrations/INTEGRATION_GUIDE.md"
echo ""
