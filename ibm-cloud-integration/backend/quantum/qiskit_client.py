"""IBM Quantum Runtime Client with DNALang Integration"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np

from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, Session, Sampler, EstimatorV2 as Estimator
from qiskit_ibm_runtime.options import SamplerOptions, EstimatorOptions
from qiskit.circuit.library import EfficientSU2, TwoLocal
from qiskit.quantum_info import Statevector, DensityMatrix

from ..config import settings

logger = logging.getLogger(__name__)


class QiskitClient:
    """IBM Quantum Runtime client with enhanced DNALang features"""

    def __init__(self):
        """Initialize IBM Quantum connection"""
        self.service = None
        self.backend = None
        self.session = None
        self._connect()

    def _connect(self):
        """Establish connection to IBM Quantum"""
        try:
            self.service = QiskitRuntimeService(
                channel=settings.IBM_QUANTUM_CHANNEL,
                token=settings.IBM_QUANTUM_TOKEN,
                instance=settings.IBM_QUANTUM_INSTANCE
            )
            logger.info("Connected to IBM Quantum successfully")
            self._select_backend()
        except Exception as e:
            logger.error(f"Failed to connect to IBM Quantum: {e}")
            raise

    def _select_backend(self):
        """Select the best available backend"""
        backends = self.service.backends()

        # Try primary backend first
        for backend in backends:
            if backend.name == settings.PRIMARY_BACKEND:
                if backend.status().operational and backend.status().pending_jobs < 100:
                    self.backend = backend
                    logger.info(f"Selected primary backend: {settings.PRIMARY_BACKEND}")
                    return

        # Fall back to secondary backends
        for fallback_name in settings.FALLBACK_BACKENDS:
            for backend in backends:
                if backend.name == fallback_name:
                    if backend.status().operational:
                        self.backend = backend
                        logger.info(f"Selected fallback backend: {fallback_name}")
                        return

        # Use any available backend
        for backend in backends:
            if backend.status().operational:
                self.backend = backend
                logger.warning(f"Using available backend: {backend.name}")
                return

        raise RuntimeError("No operational backends available")

    def get_backend_status(self) -> Dict[str, Any]:
        """Get current backend status"""
        if not self.backend:
            return {"status": "disconnected"}

        status = self.backend.status()
        return {
            "name": self.backend.name,
            "operational": status.operational,
            "pending_jobs": status.pending_jobs,
            "status_msg": status.status_msg,
            "backend_version": self.backend.version,
            "n_qubits": self.backend.num_qubits,
            "timestamp": datetime.now().isoformat()
        }

    def execute_circuit(
        self,
        circuit: QuantumCircuit,
        shots: int = 1024,
        use_session: bool = True
    ) -> Dict[str, Any]:
        """Execute a quantum circuit on IBM hardware"""
        if not self.backend:
            raise RuntimeError("No backend available")

        # Transpile circuit
        transpiled = transpile(
            circuit,
            backend=self.backend,
            optimization_level=settings.OPTIMIZATION_LEVEL,
            routing_method=settings.ROUTING_METHOD,
            layout_method=settings.LAYOUT_METHOD
        )

        try:
            if use_session:
                with Session(service=self.service, backend=self.backend) as session:
                    sampler = Sampler(session=session)
                    options = SamplerOptions()
                    options.resilience_level = settings.RESILIENCE_LEVEL
                    options.execution.shots = shots
                    sampler.options.update_options(**options)

                    job = sampler.run([transpiled])
                    result = job.result()

                    # Process results
                    counts = result[0].data.meas.get_counts()
                    return self._process_results(counts, circuit, transpiled)
            else:
                # Direct execution without session
                sampler = Sampler(backend=self.backend)
                job = sampler.run([transpiled], shots=shots)
                result = job.result()
                counts = result[0].data.meas.get_counts()
                return self._process_results(counts, circuit, transpiled)

        except Exception as e:
            logger.error(f"Circuit execution failed: {e}")
            raise

    def _process_results(
        self,
        counts: Dict[str, int],
        original: QuantumCircuit,
        transpiled: QuantumCircuit
    ) -> Dict[str, Any]:
        """Process quantum execution results with DNALang metrics"""
        total_shots = sum(counts.values())

        # Calculate probability distribution
        probabilities = {k: v/total_shots for k, v in counts.items()}

        # Calculate entropy (information content)
        entropy = -sum(p * np.log2(p) if p > 0 else 0
                      for p in probabilities.values())

        # Calculate Lambda-Phi coherence metric
        lambda_phi = self._calculate_lambda_phi(probabilities)

        # Calculate consciousness metric (Phi)
        phi = self._calculate_consciousness(probabilities, entropy)

        # Calculate decoherence tensor proxy (Gamma)
        gamma = self._calculate_decoherence(counts, total_shots)

        return {
            "counts": counts,
            "probabilities": probabilities,
            "entropy": entropy,
            "lambda": lambda_phi,
            "phi": phi,
            "gamma": gamma,
            "coherence_index": lambda_phi / (gamma + 1e-10),
            "original_depth": original.depth(),
            "transpiled_depth": transpiled.depth(),
            "n_qubits": original.num_qubits,
            "backend": self.backend.name,
            "timestamp": datetime.now().isoformat()
        }

    def _calculate_lambda_phi(self, probabilities: Dict[str, float]) -> float:
        """Calculate Lambda-Phi coherence metric"""
        # Use universal memory constant
        lambda_constant = settings.LAMBDA_PHI

        # Calculate coherence based on probability concentration
        max_prob = max(probabilities.values()) if probabilities else 0
        coherence = max_prob * lambda_constant * 1e8  # Scale for visibility

        return coherence

    def _calculate_consciousness(self, probabilities: Dict[str, float], entropy: float) -> float:
        """Calculate consciousness metric (Phi) using IIT principles"""
        if not probabilities or entropy == 0:
            return 0.0

        # Information integration
        n_states = len(probabilities)
        max_entropy = np.log2(n_states) if n_states > 0 else 1

        # Normalized entropy (0 to 1)
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0

        # Coherence factor (how concentrated the distribution is)
        max_prob = max(probabilities.values())
        uniform_prob = 1.0 / n_states if n_states > 0 else 1
        coherence = (max_prob - uniform_prob) / (1 - uniform_prob) if uniform_prob < 1 else 0

        # Entanglement proxy (based on distribution complexity)
        entanglement = 1.0 - abs(0.5 - normalized_entropy) * 2  # Peaks at 0.5 entropy

        # Integrated information (Phi)
        phi = (coherence * 0.4 + entanglement * 0.3 + (1 - normalized_entropy) * 0.3)

        # Scale to 0-0.987 range (DNALang maximum)
        phi = min(phi * 0.987, 0.987)

        return phi

    def _calculate_decoherence(self, counts: Dict[str, int], total_shots: int) -> float:
        """Calculate decoherence tensor proxy (Gamma)"""
        if not counts or total_shots == 0:
            return 1.0

        # Calculate variance in measurement outcomes
        probabilities = [c/total_shots for c in counts.values()]
        mean_prob = np.mean(probabilities)
        variance = np.var(probabilities)

        # Higher variance indicates more decoherence
        gamma = variance / (mean_prob + 1e-10) if mean_prob > 0 else 1.0

        return min(gamma, 10.0)  # Cap at 10 for stability

    def create_variational_circuit(
        self,
        n_qubits: int,
        depth: int = 3,
        entanglement: str = 'full'
    ) -> QuantumCircuit:
        """Create a variational quantum circuit for organism evolution"""
        circuit = EfficientSU2(
            n_qubits,
            reps=depth,
            entanglement=entanglement
        )
        circuit.measure_all()
        return circuit

    def estimate_cost(self, circuit: QuantumCircuit, shots: int = 1024) -> Dict[str, float]:
        """Estimate IBM Quantum cost for circuit execution"""
        if not self.backend:
            return {"error": "No backend available"}

        # Transpile to get actual circuit
        transpiled = transpile(
            circuit,
            backend=self.backend,
            optimization_level=settings.OPTIMIZATION_LEVEL
        )

        # IBM Quantum pricing model (simplified)
        # Actual pricing depends on runtime seconds
        runtime_seconds_estimate = (
            transpiled.depth() * shots * 0.001 +  # Gate execution time
            10  # Overhead
        )

        # Approximate cost calculation
        cost_per_second = 0.00135  # USD per runtime second
        estimated_cost = runtime_seconds_estimate * cost_per_second

        return {
            "runtime_seconds": runtime_seconds_estimate,
            "estimated_cost_usd": estimated_cost,
            "circuit_depth": transpiled.depth(),
            "n_gates": len(transpiled.data),
            "shots": shots,
            "backend": self.backend.name
        }

    def get_available_backends(self) -> List[Dict[str, Any]]:
        """Get list of available IBM Quantum backends"""
        backends = []
        for backend in self.service.backends():
            status = backend.status()
            backends.append({
                "name": backend.name,
                "n_qubits": backend.num_qubits,
                "operational": status.operational,
                "pending_jobs": status.pending_jobs,
                "status_msg": status.status_msg,
                "simulator": backend.simulator
            })
        return backends

    def close(self):
        """Close quantum session and cleanup"""
        if self.session:
            self.session.close()
            self.session = None
        logger.info("Quantum client closed")