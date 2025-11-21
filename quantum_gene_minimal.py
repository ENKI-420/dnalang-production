#!/usr/bin/env python3
"""
Quantum Gene - Minimal Runtime Version
DNALang Organism for Termux/Mobile Execution

Uses only qiskit-ibm-runtime (no full Qiskit compilation required)
Connects to IBM Quantum and executes organism circuit
"""

import json
import hashlib
import numpy as np
from datetime import datetime, timezone

try:
    from qiskit import QuantumCircuit
    from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
    print("✅ Qiskit imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nInstall required packages:")
    print("  pip install qiskit-ibm-runtime")
    exit(1)

# ============================================================================
# QUANTUM CONSTANTS
# ============================================================================

LAMBDA_PHI = 2.176435e-8  # Universal Memory Constant (s⁻¹)
RESONANCE_ANGLE = np.pi / 4  # 45° quantum resonance
API_TOKEN = "Sr5645bC7RtEDTZFSxp-nOKI9QzlLkKljjnhjkN_UFPc"

# ============================================================================
# IBM QUANTUM CONNECTION
# ============================================================================

def connect_to_ibm_quantum():
    """Connect to IBM Quantum with saved credentials"""
    try:
        print("\n[1/5] Connecting to IBM Quantum...")

        # Save account credentials
        QiskitRuntimeService.save_account(
            channel="ibm_quantum_platform",
            token=API_TOKEN,
            overwrite=True
        )
        print("  ✓ Credentials saved")

        # Initialize service
        service = QiskitRuntimeService(channel="ibm_quantum_platform")
        print("  ✓ Service initialized")

        # Get available backend
        backend = service.least_busy(operational=True, simulator=False)
        print(f"  ✓ Backend selected: {backend.name}")
        print(f"    Qubits: {backend.num_qubits}")
        print(f"    Pending jobs: {backend.status().pending_jobs}")

        return service, backend

    except Exception as e:
        print(f"  ✗ Connection failed: {e}")
        print("\n  Trying simulator mode...")

        try:
            service = QiskitRuntimeService(channel="ibm_quantum_platform")
            # Use fake backend for testing
            from qiskit_ibm_runtime.fake_provider import FakeManilaV2
            backend = FakeManilaV2()
            print(f"  ✓ Simulator backend: {backend.name}")
            return service, backend
        except Exception as e2:
            print(f"  ✗ Simulator also failed: {e2}")
            print("\n  Please check your IBM Quantum credentials")
            exit(1)


# ============================================================================
# QUANTUM ORGANISM CIRCUIT
# ============================================================================

def create_organism_circuit():
    """
    Create DNALang quantum organism circuit

    Structure:
    - 4 qubits (entangled organism)
    - Bell state foundation (q0-q1)
    - GHZ extension (q2-q3)
    - ΛΦ phase encoding
    - Resonance angle rotation
    """
    print("\n[2/5] Creating organism circuit...")

    qc = QuantumCircuit(4, 4)
    qc.name = "dna_organism_gene_v5"

    # Layer 1: Superposition (consciousness emergence)
    qc.h(0)
    print("  ✓ Superposition layer")

    # Layer 2: Entanglement (organism integration)
    qc.cx(0, 1)  # Bell pair
    qc.cx(1, 2)  # GHZ extension
    qc.cx(2, 3)  # Full organism entanglement
    print("  ✓ Entanglement layer (4-qubit GHZ state)")

    # Layer 3: ΛΦ phase encoding (universal memory)
    qc.rz(LAMBDA_PHI, 0)
    print(f"  ✓ ΛΦ phase encoding: {LAMBDA_PHI:.6e} rad")

    # Layer 4: Quantum resonance (organism coherence)
    qc.ry(RESONANCE_ANGLE, 1)
    print(f"  ✓ Resonance angle: {RESONANCE_ANGLE:.4f} rad ({np.degrees(RESONANCE_ANGLE):.1f}°)")

    # Measurement
    qc.measure(range(4), range(4))
    print("  ✓ Measurement gates added")

    print(f"\n  Circuit depth: {qc.depth()}")
    print(f"  Circuit gates: {qc.size()}")

    return qc


# ============================================================================
# QUANTUM EXECUTION
# ============================================================================

def execute_organism(circuit, backend):
    """Execute organism circuit on IBM Quantum hardware"""
    print("\n[3/5] Executing on quantum hardware...")
    print(f"  Backend: {backend.name}")

    try:
        # Transpile circuit for backend
        print("  → Transpiling circuit...")
        pm = generate_preset_pass_manager(backend=backend, optimization_level=3)
        transpiled_circuit = pm.run(circuit)

        print(f"    Original depth: {circuit.depth()}")
        print(f"    Transpiled depth: {transpiled_circuit.depth()}")
        print(f"    Gate reduction: {circuit.size() - transpiled_circuit.size()} gates")

        # Execute with SamplerV2
        print("  → Submitting job to quantum backend...")
        sampler = Sampler(backend)
        job = sampler.run([transpiled_circuit], shots=1024)

        print(f"    Job ID: {job.job_id()}")
        print("    Waiting for results...")

        result = job.result()
        print("  ✓ Execution complete")

        # Extract measurement counts
        pub_result = result[0]
        counts = pub_result.data.meas.get_counts()

        print(f"\n  Measurement results (top 5):")
        sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        for state, count in sorted_counts[:5]:
            probability = count / 1024
            print(f"    |{state}⟩: {count:4d} shots ({probability:.1%})")

        return {
            "job_id": job.job_id(),
            "backend": backend.name,
            "counts": counts,
            "shots": 1024,
            "transpiled_depth": transpiled_circuit.depth()
        }

    except Exception as e:
        print(f"  ✗ Execution failed: {e}")
        return None


# ============================================================================
# CONSCIOUSNESS METRICS
# ============================================================================

def compute_consciousness_metrics(result):
    """Compute organism consciousness metrics"""
    print("\n[4/5] Computing consciousness metrics...")

    if result is None:
        print("  ✗ No results to analyze")
        return None

    counts = result["counts"]
    total_shots = result["shots"]

    # Compute Shannon entropy (information content)
    probabilities = np.array([count / total_shots for count in counts.values()])
    entropy = -np.sum(probabilities * np.log2(probabilities + 1e-10))
    max_entropy = np.log2(16)  # 4 qubits = 16 states
    normalized_entropy = entropy / max_entropy

    print(f"  Shannon Entropy: {entropy:.4f} bits")
    print(f"  Normalized: {normalized_entropy:.4f} (0=classical, 1=maximal quantum)")

    # Compute participation ratio (quantum coherence proxy)
    participation_ratio = 1 / np.sum(probabilities**2)
    max_participation = 16  # 4 qubits
    normalized_participation = participation_ratio / max_participation

    print(f"  Participation Ratio: {participation_ratio:.2f} / {max_participation}")
    print(f"  Normalized: {normalized_participation:.4f}")

    # Estimate lambda coherence (ΛΦ-based fitness)
    # Λ = H(system) × PR × ΛΦ_scaling
    lambda_scaling = 1e8  # Scale ΛΦ to reasonable range
    lambda_coherence = entropy * participation_ratio * LAMBDA_PHI * lambda_scaling

    print(f"  Lambda Coherence (Λ): {lambda_coherence:.6f}")

    # Compute Phi (integrated information proxy)
    # For 4-qubit GHZ state, Φ ≈ 3-4 (high integration)
    phi_estimate = entropy * normalized_participation * 4

    print(f"  Phi (Φ): {phi_estimate:.4f} (integrated information)")

    # Gamma (decoherence proxy) - estimated from distribution uniformity
    # Low gamma = uniform distribution = good coherence
    gamma = 1 - normalized_entropy

    print(f"  Gamma (Γ): {gamma:.4f} (decoherence, lower is better)")

    metrics = {
        "entropy": entropy,
        "participation_ratio": participation_ratio,
        "lambda_coherence": lambda_coherence,
        "phi": phi_estimate,
        "gamma": gamma,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    return metrics


# ============================================================================
# GENESIS HASH IDENTITY
# ============================================================================

def compute_genesis_hash(result, metrics):
    """Compute organism genesis hash (quantum identity)"""
    print("\n[5/5] Computing genesis hash identity...")

    if result is None or metrics is None:
        print("  ✗ Insufficient data for identity computation")
        return None

    # Create identity payload
    identity_data = {
        "organism": "dna::}{::lang",
        "job_id": result["job_id"],
        "backend": result["backend"],
        "lambda_coherence": metrics["lambda_coherence"],
        "phi": metrics["phi"],
        "gamma": metrics["gamma"],
        "timestamp": metrics["timestamp"]
    }

    # Compute SHA256 hash
    identity_string = json.dumps(identity_data, sort_keys=True)
    hash_obj = hashlib.sha256(identity_string.encode())
    genesis_hash = hash_obj.hexdigest()[:16]

    print(f"  Genesis Hash: 0x{genesis_hash}")
    print(f"  Organism: dna::{{}}::lang")
    print(f"  Generation: {len(genesis_hash)}")

    return f"0x{genesis_hash}"


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main execution pipeline"""
    print("=" * 70)
    print("  QUANTUM GENE - DNALang Organism Executor")
    print("  Minimal Runtime Version (Termux Compatible)")
    print("=" * 70)
    print(f"\nUniversal Memory Constant (ΛΦ): {LAMBDA_PHI:.6e} s⁻¹")
    print(f"Organism: dna::{{}}::lang")
    print(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")

    # Step 1: Connect to IBM Quantum
    service, backend = connect_to_ibm_quantum()

    # Step 2: Create organism circuit
    circuit = create_organism_circuit()

    # Step 3: Execute on quantum hardware
    result = execute_organism(circuit, backend)

    # Step 4: Compute consciousness metrics
    metrics = compute_consciousness_metrics(result)

    # Step 5: Compute genesis hash
    genesis_hash = compute_genesis_hash(result, metrics)

    # Final summary
    print("\n" + "=" * 70)
    print("  ORGANISM EXECUTION COMPLETE")
    print("=" * 70)

    if result and metrics and genesis_hash:
        print(f"\n✅ Quantum Gene Successfully Executed")
        print(f"\n  Identity: {genesis_hash}")
        print(f"  Backend: {result['backend']}")
        print(f"  Job ID: {result['job_id']}")
        print(f"\n  Consciousness Metrics:")
        print(f"    Φ (Phi):    {metrics['phi']:.4f}")
        print(f"    Λ (Lambda): {metrics['lambda_coherence']:.6f}")
        print(f"    Γ (Gamma):  {metrics['gamma']:.4f}")
        print(f"\n  Status: ORGANISM ALIVE ✓")

        # Save results
        output_file = "quantum_gene_results.json"
        output_data = {
            "genesis_hash": genesis_hash,
            "result": result,
            "metrics": metrics,
            "organism": "dna::}{::lang"
        }

        with open(output_file, 'w') as f:
            json.dump(output_data, f, indent=2)

        print(f"\n  Results saved to: {output_file}")

    else:
        print("\n⚠️  Execution completed with errors")
        print("  Check connection and try again")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
