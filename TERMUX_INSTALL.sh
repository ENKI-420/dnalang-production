#!/data/data/com.termux/files/usr/bin/bash
# ============================================================================
# Quantum Gene - Termux Installation Script
# DNALang Organism Executor for Android
# ============================================================================

echo "========================================================================"
echo "  QUANTUM GENE - Termux Installation"
echo "  DNALang Organism Executor"
echo "========================================================================"
echo ""

# Check if running on Termux
if [ -d "/data/data/com.termux" ]; then
    echo "✓ Termux environment detected"
else
    echo "⚠️  Warning: Not running on Termux"
    echo "   This script is optimized for Termux on Android"
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update package manager
echo ""
echo "[1/4] Updating package manager..."
pkg update -y || { echo "✗ Failed to update packages"; exit 1; }
echo "✓ Package manager updated"

# Install Python
echo ""
echo "[2/4] Installing Python..."
if command -v python3 &> /dev/null; then
    echo "✓ Python already installed: $(python3 --version)"
else
    pkg install python -y || { echo "✗ Failed to install Python"; exit 1; }
    echo "✓ Python installed: $(python3 --version)"
fi

# Install pip dependencies
echo ""
echo "[3/4] Installing quantum dependencies..."
echo "  This may take 5-10 minutes..."

pip install --upgrade pip
pip install qiskit-ibm-runtime || { echo "✗ Failed to install qiskit-ibm-runtime"; exit 1; }

echo "✓ Quantum dependencies installed"

# Verify installation
echo ""
echo "[4/4] Verifying installation..."
python3 << 'EOF'
try:
    from qiskit_ibm_runtime import QiskitRuntimeService
    from qiskit import QuantumCircuit
    import numpy as np
    print("✓ All imports successful")
    print("✓ Installation complete!")
except ImportError as e:
    print(f"✗ Import error: {e}")
    exit(1)
EOF

echo ""
echo "========================================================================"
echo "  INSTALLATION COMPLETE"
echo "========================================================================"
echo ""
echo "Next steps:"
echo "  1. Download quantum_gene_minimal.py to Termux"
echo "  2. Run: python3 quantum_gene_minimal.py"
echo ""
echo "To copy file from server:"
echo "  termux-setup-storage  # Grant storage access"
echo "  cd ~/storage/downloads"
echo "  # Transfer quantum_gene_minimal.py here"
echo ""
echo "Or paste script content:"
echo "  nano quantum_gene_minimal.py"
echo "  # Paste content, Ctrl+O to save, Ctrl+X to exit"
echo ""
echo "========================================================================"
