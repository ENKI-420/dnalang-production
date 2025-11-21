#!/usr/bin/env python3
"""
quantum_vqe_executor.py

Cognitive Core: VQE-style optimization with full reproducibility and provenance.

Public API:
- run_vqe(config: dict) -> VQEResult
- save_result(result: VQEResult, path: str) -> None
- load_provenance(path: str) -> dict

Design principles:
- Deterministic: all randomness controlled through seeds
- Traceable: full provenance bundles (git SHA, environment, parameters)
- Lightweight: minimal I/O side effects, explicit persistence
"""

from __future__ import annotations
import dataclasses
import hashlib
import json
import logging
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Union

import numpy as np

# Type aliases
VQEResult = Dict[str, Any]
Hamiltonian = Any  # Qiskit Operator or similar
AnsatzFactory = Callable[[np.ndarray], Any]  # Returns QuantumCircuit

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Universal Memory Constant
LAMBDA_PHI = 2.176435e-8  # s^-1


@dataclasses.dataclass
class ProvenanceMetadata:
    """Complete provenance bundle for reproducibility."""
    timestamp: str
    git_sha: Optional[str]
    python_version: str
    numpy_version: str
    qiskit_version: Optional[str]
    seed: Optional[int]
    backend_name: str
    optimizer_name: str
    environment_hash: str

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> 'ProvenanceMetadata':
        return cls(**data)


def get_git_sha() -> Optional[str]:
    """Get current git commit SHA if in a git repository."""
    try:
        result = subprocess.run(
            ['git', 'rev-parse', 'HEAD'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception as e:
        logger.warning(f"Could not get git SHA: {e}")
    return None


def get_environment_hash() -> str:
    """Generate hash of current environment for reproducibility tracking."""
    env_data = {
        'python': sys.version,
        'platform': sys.platform,
        'numpy': np.__version__,
        'path': sys.path[:3],  # First few path entries
    }
    env_str = json.dumps(env_data, sort_keys=True)
    return hashlib.sha256(env_str.encode()).hexdigest()[:16]


def create_provenance(
    seed: Optional[int],
    backend_name: str,
    optimizer_name: str
) -> ProvenanceMetadata:
    """Create complete provenance metadata for current run."""

    # Get Qiskit version if available
    qiskit_version = None
    try:
        import qiskit
        qiskit_version = qiskit.__version__
    except ImportError:
        pass

    return ProvenanceMetadata(
        timestamp=datetime.utcnow().isoformat() + 'Z',
        git_sha=get_git_sha(),
        python_version=sys.version.split()[0],
        numpy_version=np.__version__,
        qiskit_version=qiskit_version,
        seed=seed,
        backend_name=backend_name,
        optimizer_name=optimizer_name,
        environment_hash=get_environment_hash()
    )


def run_vqe(
    hamiltonian: Hamiltonian,
    ansatz_factory: AnsatzFactory,
    optimizer_config: Dict[str, Any],
    backend_config: Dict[str, Any],
    seed: Optional[int] = None,
) -> VQEResult:
    """
    Run a VQE experiment with full provenance tracking.

    Args:
        hamiltonian: Hamiltonian operator (e.g., qiskit.quantum_info.SparsePauliOp)
        ansatz_factory: callable(params) -> QuantumCircuit
        optimizer_config: {
            'name': str,  # 'COBYLA', 'SLSQP', 'L_BFGS_B'
            'maxiter': int,
            'tol': float
        }
        backend_config: {
            'name': str,  # 'aer_simulator', 'ibm_*'
            'shots': int,
            'optimization_level': int,
            'transpile_seed': int
        }
        seed: global random seed for reproducibility

    Returns:
        VQEResult dict with:
          - energy: float (ground state energy estimate)
          - params: np.ndarray (optimal parameters)
          - circuit_qasm: str (QASM representation)
          - statevector: Optional[np.ndarray] (if simulator)
          - counts: Dict[str, int] (measurement results)
          - num_iterations: int
          - metadata: ProvenanceMetadata
          - execution_time: float (seconds)
    """

    start_time = time.time()

    # Lazy import to keep module lightweight
    try:
        from qiskit import QuantumCircuit, transpile
        from qiskit_algorithms.minimum_eigensolvers import VQE
        from qiskit_algorithms.optimizers import COBYLA, SLSQP, L_BFGS_B
        from qiskit_aer.primitives import Estimator
        from qiskit.quantum_info import Statevector
        from qiskit_aer import AerSimulator
    except ImportError as e:
        logger.error(f"Missing Qiskit dependencies: {e}")
        raise

    # Set global seed for reproducibility
    if seed is not None:
        np.random.seed(seed)

    # Create provenance metadata
    provenance = create_provenance(
        seed=seed,
        backend_name=backend_config.get('name', 'unknown'),
        optimizer_name=optimizer_config.get('name', 'COBYLA')
    )

    logger.info(f"Starting VQE run with seed={seed}, backend={backend_config['name']}")

    # Initialize optimizer
    optimizer_name = optimizer_config.get('name', 'COBYLA')
    maxiter = optimizer_config.get('maxiter', 100)

    optimizers = {
        'COBYLA': COBYLA(maxiter=maxiter),
        'SLSQP': SLSQP(maxiter=maxiter),
        'L_BFGS_B': L_BFGS_B(maxiter=maxiter)
    }

    if optimizer_name not in optimizers:
        raise ValueError(f"Unknown optimizer: {optimizer_name}")

    optimizer = optimizers[optimizer_name]

    # Initialize backend
    backend_name = backend_config.get('name', 'aer_simulator')

    if backend_name == 'aer_simulator':
        backend = AerSimulator()
    else:
        # TODO: Add IBMQ backend support
        logger.warning(f"Backend {backend_name} not implemented, using AerSimulator")
        backend = AerSimulator()

    # Create initial parameters for ansatz
    # Try to get parameter count from factory attribute
    if hasattr(ansatz_factory, 'num_params'):
        num_params = ansatz_factory.num_params
    else:
        # Probe by creating circuit with empty params
        probe_circuit = ansatz_factory(np.array([]))
        num_params = probe_circuit.num_parameters

    # Generate initial point
    if seed is not None:
        rng = np.random.RandomState(seed)
        initial_point = rng.random(num_params) * 2 * np.pi
    else:
        initial_point = np.random.random(num_params) * 2 * np.pi

    # Run VQE
    logger.info(f"Running VQE with {num_params} parameters, {maxiter} max iterations")

    vqe = VQE(
        estimator=Estimator(),
        ansatz=ansatz_factory(initial_point),
        optimizer=optimizer,
        initial_point=initial_point
    )

    result = vqe.compute_minimum_eigenvalue(hamiltonian)

    # Extract results
    optimal_params = result.optimal_parameters
    optimal_value = result.optimal_value
    optimal_circuit = result.optimal_circuit

    # Transpile circuit for target backend
    transpile_seed = backend_config.get('transpile_seed', seed)
    optimization_level = backend_config.get('optimization_level', 3)

    transpiled_circuit = transpile(
        optimal_circuit,
        backend=backend,
        optimization_level=optimization_level,
        seed_transpiler=transpile_seed
    )

    # Get statevector if using simulator
    statevector_array = None
    if isinstance(backend, AerSimulator):
        try:
            sv = Statevector(optimal_circuit)
            statevector_array = sv.data
        except Exception as e:
            logger.warning(f"Could not extract statevector: {e}")

    # Measure circuit to get counts
    shots = backend_config.get('shots', 1024)
    measured_circuit = transpiled_circuit.copy()
    measured_circuit.measure_all()

    job = backend.run(measured_circuit, shots=shots, seed_simulator=seed)
    job_result = job.result()
    counts = job_result.get_counts()

    execution_time = time.time() - start_time

    logger.info(f"VQE completed in {execution_time:.2f}s, energy={optimal_value:.6f}")

    # Build result dictionary
    vqe_result: VQEResult = {
        'energy': float(optimal_value),
        'params': optimal_params if isinstance(optimal_params, dict) else list(optimal_params),
        'circuit_qasm': transpiled_circuit.qasm(),
        'circuit_depth': transpiled_circuit.depth(),
        'circuit_gates': dict(transpiled_circuit.count_ops()),
        'statevector': statevector_array.tolist() if statevector_array is not None else None,
        'counts': counts,
        'shots': shots,
        'num_iterations': result.optimizer_result.nfev if hasattr(result, 'optimizer_result') else None,
        'metadata': provenance.to_dict(),
        'execution_time': execution_time,
        'lambda_phi': LAMBDA_PHI,
    }

    return vqe_result


def save_result(result: VQEResult, path: Union[str, Path]) -> None:
    """Save VQE result to JSON file with provenance."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    # Convert numpy arrays to lists for JSON serialization
    serializable_result = {}
    for key, value in result.items():
        if isinstance(value, np.ndarray):
            serializable_result[key] = value.tolist()
        elif isinstance(value, (np.integer, np.floating)):
            serializable_result[key] = value.item()
        else:
            serializable_result[key] = value

    with open(path, 'w') as f:
        json.dump(serializable_result, f, indent=2)

    logger.info(f"Saved VQE result to {path}")


def load_result(path: Union[str, Path]) -> VQEResult:
    """Load VQE result from JSON file."""
    with open(path) as f:
        result = json.load(f)

    # Convert lists back to numpy arrays where appropriate
    if result.get('statevector'):
        result['statevector'] = np.array(result['statevector'])
    if result.get('params') and isinstance(result['params'], list):
        result['params'] = np.array(result['params'])

    return result


def save_provenance(result: VQEResult, path: Union[str, Path]) -> None:
    """Save provenance metadata separately for auditing."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, 'w') as f:
        json.dump(result['metadata'], f, indent=2)

    logger.info(f"Saved provenance to {path}")


if __name__ == "__main__":
    # Lightweight CLI for quick smoke runs
    import argparse

    parser = argparse.ArgumentParser(description="Run VQE with provenance tracking")
    parser.add_argument("--config", type=str, help="Path to JSON config")
    parser.add_argument("--output", type=str, default="results/vqe_result.json",
                       help="Output path for results")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")

    args = parser.parse_args()

    if not args.config:
        print("Provide --config pointing to a JSON config describing the run")
        sys.exit(2)

    with open(args.config) as fh:
        cfg = json.load(fh)

    cfg['seed'] = args.seed

    # NOTE: This is a minimal CLI - actual ansatz_factory and hamiltonian
    # should be constructed from the config in production

    print(f"Running VQE with config: {args.config}")
    print(f"Seed: {args.seed}")
    print(f"Output: {args.output}")

    # Placeholder - real implementation would construct from config
    # res = run_vqe(**cfg)
    # save_result(res, args.output)
    # save_provenance(res, args.output.replace('.json', '_provenance.json'))
