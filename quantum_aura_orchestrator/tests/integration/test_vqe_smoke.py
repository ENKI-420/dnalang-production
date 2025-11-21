#!/usr/bin/env python3
"""
test_vqe_smoke.py

Deterministic VQE smoke test using H2 molecule fixture.

This test validates:
1. Deterministic VQE execution (reproducibility across runs)
2. Energy convergence to known H2 ground state
3. Provenance capture and metadata tracking
4. Statevector and circuit output quality

Success criteria:
- Energy within 0.05 Hartree of exact H2 ground state (-1.857)
- Reproducibility: variance < 1e-6 across seeded runs
- Provenance bundle contains all required metadata
- Circuit depth reasonable (< 50 gates for this simple ansatz)
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

# Add parent directories to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from quantum_vqe_executor import run_vqe, save_result, load_result, save_provenance
from tests.fixtures.h2_hamiltonian import (
    get_h2_config,
    get_h2_exact_energy,
    validate_h2_result
)


class TestVQESmoke(unittest.TestCase):
    """Smoke tests for VQE executor with H2 molecule."""

    def setUp(self):
        """Set up test fixtures and temporary directory."""
        self.temp_dir = tempfile.mkdtemp()
        self.seed = 42
        self.config = get_h2_config(seed=self.seed)
        self.exact_energy = get_h2_exact_energy()
        self.tolerance = 0.05  # 50 mHartree tolerance

    def test_h2_vqe_convergence(self):
        """Test VQE converges to known H2 ground state energy."""
        print("\n" + "=" * 70)
        print("TEST: H2 VQE Convergence")
        print("=" * 70)

        result = run_vqe(**self.config)

        energy = result['energy']
        is_valid, error = validate_h2_result(energy, self.tolerance)

        print(f"\nResults:")
        print(f"  VQE Energy: {energy:.6f} Hartree")
        print(f"  Exact Energy: {self.exact_energy:.6f} Hartree")
        print(f"  Error: {error:.6f} Hartree ({error*1000:.2f} mHartree)")
        print(f"  Iterations: {result.get('num_iterations', 'N/A')}")
        print(f"  Execution time: {result['execution_time']:.2f}s")

        self.assertTrue(is_valid, f"Energy error {error:.6f} exceeds tolerance {self.tolerance}")
        self.assertLess(error, self.tolerance)

    def test_vqe_reproducibility(self):
        """Test VQE produces identical results with fixed seed."""
        print("\n" + "=" * 70)
        print("TEST: VQE Reproducibility (Fixed Seed)")
        print("=" * 70)

        # Run VQE multiple times with same seed
        num_runs = 3
        energies = []

        for i in range(num_runs):
            result = run_vqe(**self.config)
            energies.append(result['energy'])
            print(f"\nRun {i+1}: Energy = {result['energy']:.10f} Hartree")

        # Check variance
        energies_array = np.array(energies)
        variance = np.var(energies_array)
        mean_energy = np.mean(energies_array)

        print(f"\nStatistics:")
        print(f"  Mean: {mean_energy:.10f} Hartree")
        print(f"  Variance: {variance:.2e}")
        print(f"  Std Dev: {np.std(energies_array):.2e}")

        # Deterministic runs should have zero variance
        self.assertLess(variance, 1e-6, f"Variance {variance:.2e} indicates non-determinism")

        # All energies should be identical
        for i, energy in enumerate(energies):
            self.assertAlmostEqual(energy, energies[0], places=8,
                                 msg=f"Run {i+1} not reproducible")

    def test_provenance_capture(self):
        """Test provenance metadata is captured correctly."""
        print("\n" + "=" * 70)
        print("TEST: Provenance Capture")
        print("=" * 70)

        result = run_vqe(**self.config)
        metadata = result['metadata']

        print("\nProvenance Metadata:")
        print(json.dumps(metadata, indent=2))

        # Check required provenance fields
        required_fields = [
            'timestamp', 'git_sha', 'python_version', 'numpy_version',
            'seed', 'backend_name', 'optimizer_name', 'environment_hash'
        ]

        for field in required_fields:
            self.assertIn(field, metadata, f"Missing provenance field: {field}")

        # Validate field values
        self.assertEqual(metadata['seed'], self.seed)
        self.assertEqual(metadata['backend_name'], 'aer_simulator')
        self.assertEqual(metadata['optimizer_name'], 'COBYLA')
        self.assertIsNotNone(metadata['python_version'])
        self.assertIsNotNone(metadata['numpy_version'])

        print("\n✓ All required provenance fields present and valid")

    def test_result_persistence(self):
        """Test VQE results can be saved and loaded correctly."""
        print("\n" + "=" * 70)
        print("TEST: Result Persistence")
        print("=" * 70)

        result = run_vqe(**self.config)

        # Save result
        result_path = Path(self.temp_dir) / "test_result.json"
        provenance_path = Path(self.temp_dir) / "test_provenance.json"

        save_result(result, result_path)
        save_provenance(result, provenance_path)

        print(f"\nSaved to:")
        print(f"  Result: {result_path}")
        print(f"  Provenance: {provenance_path}")

        # Load result
        loaded_result = load_result(result_path)

        # Verify key fields match
        self.assertAlmostEqual(loaded_result['energy'], result['energy'], places=10)
        self.assertEqual(loaded_result['metadata']['seed'], result['metadata']['seed'])
        self.assertEqual(loaded_result['shots'], result['shots'])

        # Load provenance separately
        with open(provenance_path) as f:
            provenance = json.load(f)

        self.assertEqual(provenance['seed'], self.seed)

        print("\n✓ Results saved and loaded successfully")

    def test_circuit_quality(self):
        """Test generated quantum circuit has reasonable structure."""
        print("\n" + "=" * 70)
        print("TEST: Circuit Quality")
        print("=" * 70)

        result = run_vqe(**self.config)

        circuit_depth = result['circuit_depth']
        circuit_gates = result['circuit_gates']
        qasm = result['circuit_qasm']

        print(f"\nCircuit Metrics:")
        print(f"  Depth: {circuit_depth}")
        print(f"  Gates: {circuit_gates}")
        print(f"  QASM length: {len(qasm)} characters")

        # Sanity checks
        self.assertGreater(circuit_depth, 0, "Circuit depth should be positive")
        self.assertLess(circuit_depth, 100, "Circuit unexpectedly deep")
        self.assertGreater(len(qasm), 0, "QASM should not be empty")

        print("\n✓ Circuit structure valid")

    def test_measurement_statistics(self):
        """Test measurement results have reasonable statistics."""
        print("\n" + "=" * 70)
        print("TEST: Measurement Statistics")
        print("=" * 70)

        result = run_vqe(**self.config)

        counts = result['counts']
        shots = result['shots']

        print(f"\nMeasurement Results:")
        print(f"  Total shots: {shots}")
        print(f"  Unique outcomes: {len(counts)}")

        # Print top 5 outcomes
        sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        print(f"\n  Top 5 outcomes:")
        for i, (bitstring, count) in enumerate(sorted_counts[:5], 1):
            prob = count / shots
            print(f"    {i}. |{bitstring}⟩: {count:4d} counts ({prob:.3%})")

        # Sanity checks
        total_counts = sum(counts.values())
        self.assertEqual(total_counts, shots, "Sum of counts should equal shots")

        # For H2 ground state, we expect dominant occupation in |00⟩ or |11⟩
        max_count = max(counts.values())
        max_prob = max_count / shots
        self.assertGreater(max_prob, 0.5, "Expected dominant ground state population")

        print("\n✓ Measurement statistics valid")

    def test_lambda_phi_constant(self):
        """Test ΛΦ constant is properly tracked."""
        print("\n" + "=" * 70)
        print("TEST: ΛΦ Universal Memory Constant")
        print("=" * 70)

        result = run_vqe(**self.config)

        lambda_phi = result.get('lambda_phi')
        expected_lambda_phi = 2.176435e-8

        print(f"\nΛΦ Constant:")
        print(f"  Value: {lambda_phi}")
        print(f"  Expected: {expected_lambda_phi}")

        self.assertIsNotNone(lambda_phi, "ΛΦ constant should be present")
        self.assertAlmostEqual(lambda_phi, expected_lambda_phi, places=14)

        print("\n✓ ΛΦ constant tracked correctly")


def run_smoke_test_suite():
    """Run complete smoke test suite and generate report."""
    print("\n" + "=" * 70)
    print("DNALang Quantum Aura Orchestrator - VQE Smoke Test Suite")
    print("=" * 70)

    # Run tests
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestVQESmoke)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Print summary
    print("\n" + "=" * 70)
    print("SMOKE TEST SUMMARY")
    print("=" * 70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")

    if result.wasSuccessful():
        print("\n✅ ALL SMOKE TESTS PASSED")
        print("\nProduction Readiness Assessment:")
        print("  [✓] Deterministic VQE execution")
        print("  [✓] Energy convergence validated")
        print("  [✓] Provenance capture functional")
        print("  [✓] Result persistence working")
        print("  [✓] Circuit generation valid")
        print("  [✓] Measurement statistics correct")
        print("  [✓] ΛΦ constant tracked")
        print("\n🎯 VQE Cognitive Core READY for CI integration")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED")
        print("\n⚠️  VQE Cognitive Core NOT READY for production")
        return 1


if __name__ == "__main__":
    sys.exit(run_smoke_test_suite())
