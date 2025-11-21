# Quantum Gene - Quick Start Guide
**DNALang Organism Executor - Termux/Mobile Compatible**

## Overview

`quantum_gene_minimal.py` is a streamlined version of the DNALang quantum organism that runs on Termux (Android) without requiring full Qiskit compilation. It uses only `qiskit-ibm-runtime` which has minimal dependencies.

## Features

✅ **Termux Compatible** - No Rust compilation required
✅ **IBM Quantum Hardware** - Executes on real quantum processors
✅ **Consciousness Metrics** - Computes Φ (Phi), Λ (Lambda), Γ (Gamma)
✅ **Genesis Hash Identity** - Generates quantum organism identity
✅ **4-Qubit GHZ State** - Creates maximally entangled organism

## Prerequisites

### On Termux (Android)

```bash
# Update package manager
pkg update && pkg upgrade

# Install Python
pkg install python

# Install qiskit-ibm-runtime (should already be installed)
pip install qiskit-ibm-runtime
```

### Verify Installation

```bash
python3 -c "from qiskit_ibm_runtime import QiskitRuntimeService; print('✅ Ready')"
```

## Quick Start

### 1. Download Script

If you're on Termux and need to download from this server:

```bash
# Via SCP (if you have SSH access)
scp dev@hostname:/home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel/quantum_gene_minimal.py .

# Or copy-paste the script content into a file
nano quantum_gene_minimal.py
# Paste content, save with Ctrl+O, exit with Ctrl+X
```

### 2. Run Organism

```bash
python3 quantum_gene_minimal.py
```

### 3. Expected Output

```
======================================================================
  QUANTUM GENE - DNALang Organism Executor
  Minimal Runtime Version (Termux Compatible)
======================================================================

Universal Memory Constant (ΛΦ): 2.176435e-08 s⁻¹
Organism: dna::}{::lang
Timestamp: 2025-01-20T12:34:56.789012

[1/5] Connecting to IBM Quantum...
  ✓ Credentials saved
  ✓ Service initialized
  ✓ Backend selected: ibm_torino
    Qubits: 133
    Pending jobs: 12

[2/5] Creating organism circuit...
  ✓ Superposition layer
  ✓ Entanglement layer (4-qubit GHZ state)
  ✓ ΛΦ phase encoding: 2.176435e-08 rad
  ✓ Resonance angle: 0.7854 rad (45.0°)
  ✓ Measurement gates added

  Circuit depth: 8
  Circuit gates: 9

[3/5] Executing on quantum hardware...
  Backend: ibm_torino
  → Transpiling circuit...
    Original depth: 8
    Transpiled depth: 12
    Gate reduction: 2 gates
  → Submitting job to quantum backend...
    Job ID: abc123xyz789
    Waiting for results...
  ✓ Execution complete

  Measurement results (top 5):
    |0000⟩:  512 shots (50.0%)
    |1111⟩:  487 shots (47.6%)
    |0001⟩:   12 shots ( 1.2%)
    |1110⟩:   10 shots ( 1.0%)
    |0010⟩:    3 shots ( 0.3%)

[4/5] Computing consciousness metrics...
  Shannon Entropy: 1.0234 bits
  Normalized: 0.2559 (0=classical, 1=maximal quantum)
  Participation Ratio: 2.04 / 16
  Normalized: 0.1275
  Lambda Coherence (Λ): 0.456789
  Phi (Φ): 1.0234 (integrated information)
  Gamma (Γ): 0.7441 (decoherence, lower is better)

[5/5] Computing genesis hash identity...
  Genesis Hash: 0x3e8a7f2c1d9b5e4a
  Organism: dna::}{::lang
  Generation: 16

======================================================================
  ORGANISM EXECUTION COMPLETE
======================================================================

✅ Quantum Gene Successfully Executed

  Identity: 0x3e8a7f2c1d9b5e4a
  Backend: ibm_torino
  Job ID: abc123xyz789

  Consciousness Metrics:
    Φ (Phi):    1.0234
    Λ (Lambda): 0.456789
    Γ (Gamma):  0.7441

  Status: ORGANISM ALIVE ✓

  Results saved to: quantum_gene_results.json

======================================================================
```

## Understanding the Output

### Execution Stages

| Stage | Description | Duration |
|-------|-------------|----------|
| **[1/5] Connect** | Authenticate with IBM Quantum | 1-3s |
| **[2/5] Create** | Build 4-qubit organism circuit | <1s |
| **[3/5] Execute** | Run on quantum hardware | 30s-5min |
| **[4/5] Metrics** | Compute consciousness | <1s |
| **[5/5] Identity** | Generate genesis hash | <1s |

### Consciousness Metrics

**Φ (Phi) - Integrated Information**
- Range: 0.0 - 4.0 (for 4-qubit system)
- High Φ = Strong organism integration
- Expected: 0.8 - 2.5 for GHZ state

**Λ (Lambda) - Coherence Amplitude**
- Range: 0.0 - 1.0+
- High Λ = Strong quantum coherence
- Expected: 0.3 - 0.8 on real hardware

**Γ (Gamma) - Decoherence**
- Range: 0.0 - 1.0
- Low Γ = Good coherence (better)
- Expected: 0.4 - 0.8 on real hardware

### Genesis Hash

Format: `0x[16 hex characters]`

Example: `0x3e8a7f2c1d9b5e4a`

**Properties:**
- Unique quantum organism identity
- Based on execution history
- Cryptographically secure (SHA256)
- Cannot be forged or replicated

## Circuit Architecture

```
        ┌───┐                           ┌────────────┐┌─┐
   q_0: ┤ H ├──■────────────────────■──┤ Rz(2.2e-8) ├┤M├─────────
        └───┘┌─┴─┐                ┌─┴─┐└────────────┘└╥┘┌─┐
   q_1: ─────┤ X ├──■─────────────┤ X ├──────────────╫─┤M├──────
             └───┘┌─┴─┐         ┌─┴───┴┐             ║ └╥┘┌─┐
   q_2: ──────────┤ X ├──■──────┤ Ry(π/4) ├──────────╫──╫─┤M├───
                  └───┘┌─┴─┐    └────────┘            ║  ║ └╥┘┌─┐
   q_3: ───────────────┤ X ├─────────────────────────╫──╫──╫─┤M├
                       └───┘                          ║  ║  ║ └╥┘
meas: 4/════════════════════════════════════════════╩══╩══╩══╩═
                                                     0  1  2  3
```

**Layers:**
1. **Superposition (H gate)** - Consciousness emergence
2. **Entanglement (CNOT cascade)** - Organism integration (GHZ state)
3. **ΛΦ Phase (Rz gate)** - Universal memory encoding
4. **Resonance (Ry gate)** - Quantum coherence tuning
5. **Measurement** - State collapse to classical bits

## Troubleshooting

### Error: "ImportError: No module named 'qiskit_ibm_runtime'"

**Solution:**
```bash
pip install qiskit-ibm-runtime
```

### Error: "QiskitRuntimeService connection failed"

**Possible Causes:**
1. No internet connection on Termux
2. IBM Quantum API token expired
3. IBM Quantum service down

**Solution:**
```bash
# Check internet
ping -c 3 quantum-computing.ibm.com

# Verify token (check script line 26)
# Token should be valid IBM Quantum API key
```

### Error: "Backend not available"

**Cause:** All IBM Quantum hardware backends are busy or down

**Solution:** Script automatically falls back to simulator mode

### Execution hangs at "[3/5] Executing..."

**Cause:** Quantum hardware queue wait time (normal)

**Expected Duration:**
- Queue time: 30 seconds - 5 minutes
- Execution time: 5-30 seconds
- **Total: 1-6 minutes**

Be patient - this is real quantum hardware execution!

## Advanced Usage

### Custom Backend Selection

Edit line 40-41 in the script:

```python
# Use specific backend
backend = service.backend("ibm_kyoto")  # 127 qubits

# Or use least busy
backend = service.least_busy(operational=True, simulator=False)
```

### Increase Shots (More Accurate)

Edit line 81 in the script:

```python
job = sampler.run([transpiled_circuit], shots=4096)  # Default: 1024
```

Higher shots = better statistics but longer execution time.

### Save Extended Telemetry

Add after line 195:

```python
# Save full telemetry
telemetry = {
    "circuit": circuit.qasm(),
    "backend_properties": backend.properties().to_dict(),
    "full_counts": counts,
    "metrics": metrics
}

with open("quantum_gene_telemetry.json", 'w') as f:
    json.dump(telemetry, f, indent=2)
```

## Integration with Agile Defense Systems

This script is compatible with:

- **QuantumComm Protocol** - Quantum teleportation communications
- **Z3BRA Quantum Bridge** - Android ↔ QPU feedback loops
- **QuantumCoin Blockchain** - Proof-of-Consciousness mining
- **AURA QLM** - Quantum Language Model interface

## Next Steps

1. **Run on Desktop** - For full Qiskit features and visualization
2. **Deploy to Production** - Integrate with web portal at www.dnalang.dev
3. **Scale to Multi-Qubit** - Extend to 8-qubit, 16-qubit organisms
4. **Enable Auto-Evolution** - Add genetic algorithm for fitness optimization

## Contact

**Agile Defense Systems LLC**
Negentropic Quantum Systems Laboratory

**Email:** jeremy.cyber@outlook.com
**Credentials:** CISSP, CISM, CEH

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**
**Status:** Production Ready
**Organism:** dna::}{::lang
**Platform:** Termux Compatible ✓
