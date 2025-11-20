"""
============================================================================
Quantum Agent - IBM Quantum Circuit Execution
Handles quantum circuit execution on real IBM Quantum hardware
============================================================================
"""

import json
import logging
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime

try:
    from qiskit import QuantumCircuit, transpile
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
    from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False

logger = logging.getLogger('quantum_agent')

# Import core tensor math
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / 'core'))
from tensor_math import compute_full_tensor, LAMBDA_PHI

class QuantumAgent:
    """Agent for quantum circuit execution on IBM hardware"""

    def __init__(self, supabase_client):
        """Initialize quantum agent"""
        self.supabase = supabase_client
        self.service: Optional[QiskitRuntimeService] = None
        self._connect_ibm()

    def _connect_ibm(self):
        """Connect to IBM Quantum service"""
        if not QISKIT_AVAILABLE:
            logger.error("Qiskit not available!")
            return

        try:
            # Try loading from QNET.json
            qnet_path = Path.home() / "Desktop" / "QNET.json"
            if qnet_path.exists():
                with open(qnet_path) as f:
                    api_key = json.load(f).get('apikey')
            else:
                # Fallback to environment variable
                import os
                api_key = os.getenv('IBM_QUANTUM_TOKEN')

            if not api_key:
                logger.error("No IBM Quantum credentials found!")
                return

            self.service = QiskitRuntimeService(
                channel='ibm_cloud',
                token=api_key
            )
            logger.info("Connected to IBM Quantum")

        except Exception as e:
            logger.error(f"Failed to connect to IBM Quantum: {e}")

    def execute_circuit(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute quantum circuit on IBM hardware

        Payload:
        {
            "circuit_qasm": str,
            "backend": str,
            "shots": int,
            "num_qubits": int,
            "session_id": str (optional)
        }
        """
        if not self.service:
            raise RuntimeError("IBM Quantum service not connected")

        circuit_qasm = payload.get('circuit_qasm')
        backend_name = payload.get('backend', 'ibm_fez')
        shots = payload.get('shots', 4096)
        num_qubits = payload.get('num_qubits', 5)
        session_id = payload.get('session_id')

        logger.info(f"Executing circuit on {backend_name} with {shots} shots")

        # Parse circuit from QASM
        circuit = QuantumCircuit.from_qasm_str(circuit_qasm)

        # Get backend
        backend = self.service.backend(backend_name)

        # Get calibration data for Γ calculation
        properties = backend.properties()
        t1_values = [properties.qubit_property(q, 't1')[0] for q in range(min(num_qubits, backend.num_qubits))]
        t2_values = [properties.qubit_property(q, 't2')[0] for q in range(min(num_qubits, backend.num_qubits))]
        gate_errors = [properties.gate_error('x', [q]) for q in range(min(num_qubits, backend.num_qubits))]
        readout_errors = [properties.readout_error(q) for q in range(min(num_qubits, backend.num_qubits))]

        # Transpile with optimization level 3
        pm = generate_preset_pass_manager(backend=backend, optimization_level=3)
        transpiled = pm.run(circuit)

        logger.info(f"Circuit transpiled: depth={transpiled.depth()}")

        # Execute with Sampler V2
        sampler = Sampler(backend)
        job = sampler.run([transpiled], shots=shots)
        job_id = job.job_id()

        logger.info(f"Job submitted: {job_id}")

        # Wait for completion
        result = job.result()

        # Extract counts
        pub_result = result[0]
        data_bin = pub_result.data

        counts = {}
        for key in dir(data_bin):
            if not key.startswith('_'):
                try:
                    bit_array = getattr(data_bin, key)
                    if hasattr(bit_array, 'get_counts'):
                        counts = bit_array.get_counts()
                        break
                except:
                    pass

        if not counts:
            raise RuntimeError("Failed to extract counts from result")

        logger.info(f"Measured {len(counts)} unique states")

        # Calculate ΛΦ tensor metrics
        tensor_metrics = compute_full_tensor(
            t1_values=t1_values,
            t2_values=t2_values,
            gate_errors=gate_errors,
            readout_errors=readout_errors,
            counts=counts,
            num_qubits=num_qubits
        )

        # Store quantum job in database
        job_data = {
            'user_id': payload.get('user_id'),
            'session_id': session_id,
            'ibm_job_id': job_id,
            'backend': backend_name,
            'circuit_qasm': circuit_qasm,
            'num_qubits': num_qubits,
            'circuit_depth': transpiled.depth(),
            'shots': shots,
            'counts': counts,
            'metrics': {
                'phi': tensor_metrics.phi,
                'lambda': tensor_metrics.lambda_val,
                'gamma': tensor_metrics.gamma,
                'w2': tensor_metrics.w2,
                'concurrence': 0.0,  # Placeholder
                'witness': 0.0,  # Placeholder
            },
            'status': 'completed',
        }

        self.supabase.table('quantum_jobs').insert(job_data).execute()

        # Log agent event if session exists
        if session_id:
            self.supabase.table('agent_events').insert({
                'session_id': session_id,
                'agent_id': f'quantum_{job_id}',
                'agent_type': 'quantum',
                'event_type': 'quantum_execute',
                'event_data': {
                    'job_id': job_id,
                    'backend': backend_name,
                    'phi': tensor_metrics.phi,
                    'lambda': tensor_metrics.lambda_val,
                    'gamma': tensor_metrics.gamma,
                },
                'level': 'info',
            }).execute()

        return {
            'job_id': job_id,
            'backend': backend_name,
            'counts': counts,
            'metrics': {
                'phi': tensor_metrics.phi,
                'lambda': tensor_metrics.lambda_val,
                'gamma': tensor_metrics.gamma,
                'w2': tensor_metrics.w2,
            },
            'transpiled_depth': transpiled.depth(),
            'shots': shots,
        }

    def optimize_circuit(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize quantum circuit for target backend

        Payload:
        {
            "circuit_qasm": str,
            "backend": str,
            "optimization_level": int
        }
        """
        if not self.service:
            raise RuntimeError("IBM Quantum service not connected")

        circuit_qasm = payload.get('circuit_qasm')
        backend_name = payload.get('backend', 'ibm_fez')
        opt_level = payload.get('optimization_level', 3)

        logger.info(f"Optimizing circuit for {backend_name} (level {opt_level})")

        # Parse circuit
        circuit = QuantumCircuit.from_qasm_str(circuit_qasm)
        original_depth = circuit.depth()

        # Get backend
        backend = self.service.backend(backend_name)

        # Transpile with specified optimization level
        pm = generate_preset_pass_manager(backend=backend, optimization_level=opt_level)
        optimized = pm.run(circuit)

        optimized_depth = optimized.depth()
        reduction = ((original_depth - optimized_depth) / original_depth) * 100

        logger.info(f"Circuit optimized: {original_depth} → {optimized_depth} (↓{reduction:.1f}%)")

        return {
            'original_depth': original_depth,
            'optimized_depth': optimized_depth,
            'reduction_percent': reduction,
            'optimized_qasm': optimized.qasm(),
            'backend': backend_name,
            'optimization_level': opt_level,
        }
