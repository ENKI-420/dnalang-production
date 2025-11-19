"""Quantum Circuit Library for DNALang Organisms"""

import numpy as np
from typing import List, Optional, Tuple
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.circuit.library import (
    EfficientSU2, TwoLocal, RealAmplitudes,
    QFT, GroverOperator, QAOA
)
from qiskit.circuit import ParameterVector

from ..config import settings


class CircuitLibrary:
    """Library of quantum circuits for organism implementation"""

    @staticmethod
    def create_bell_state(measure: bool = True) -> QuantumCircuit:
        """Create a Bell state circuit"""
        qc = QuantumCircuit(2, 2 if measure else 0)
        qc.h(0)
        qc.cx(0, 1)
        if measure:
            qc.measure_all()
        return qc

    @staticmethod
    def create_ghz_state(n_qubits: int, measure: bool = True) -> QuantumCircuit:
        """Create a GHZ state circuit"""
        qc = QuantumCircuit(n_qubits, n_qubits if measure else 0)
        qc.h(0)
        for i in range(n_qubits - 1):
            qc.cx(i, i + 1)
        if measure:
            qc.measure_all()
        return qc

    @staticmethod
    def create_w_state(n_qubits: int, measure: bool = True) -> QuantumCircuit:
        """Create a W state circuit"""
        qc = QuantumCircuit(n_qubits, n_qubits if measure else 0)

        # Initialize to |100...0>
        qc.x(0)

        # Create equal superposition
        angles = []
        for i in range(1, n_qubits):
            angle = 2 * np.arccos(np.sqrt(1 / (n_qubits - i + 1)))
            angles.append(angle)

        for i, angle in enumerate(angles):
            qc.cry(angle, i, i + 1)
            for j in range(i):
                qc.cx(i + 1, j)
            qc.cx(i + 1, i)

        if measure:
            qc.measure_all()
        return qc

    @staticmethod
    def create_quantum_fourier_transform(n_qubits: int) -> QuantumCircuit:
        """Create a Quantum Fourier Transform circuit"""
        qft = QFT(n_qubits, do_swaps=True)
        qc = QuantumCircuit(n_qubits, n_qubits)
        qc.append(qft, range(n_qubits))
        qc.measure_all()
        return qc

    @staticmethod
    def create_variational_circuit(
        n_qubits: int,
        depth: int = 3,
        entanglement: str = 'full',
        parameter_prefix: str = 'θ'
    ) -> Tuple[QuantumCircuit, ParameterVector]:
        """Create a parameterized variational circuit"""
        n_params = n_qubits * (depth + 1) * 2
        params = ParameterVector(parameter_prefix, n_params)

        qc = QuantumCircuit(n_qubits, n_qubits)
        param_idx = 0

        # Initial rotation layer
        for i in range(n_qubits):
            qc.ry(params[param_idx], i)
            param_idx += 1
            qc.rz(params[param_idx], i)
            param_idx += 1

        # Entangling layers
        for _ in range(depth):
            # Entanglement
            if entanglement == 'full':
                for i in range(n_qubits):
                    for j in range(i + 1, n_qubits):
                        qc.cx(i, j)
            elif entanglement == 'linear':
                for i in range(n_qubits - 1):
                    qc.cx(i, i + 1)
            elif entanglement == 'circular':
                for i in range(n_qubits - 1):
                    qc.cx(i, i + 1)
                qc.cx(n_qubits - 1, 0)

            # Rotation layer
            for i in range(n_qubits):
                qc.ry(params[param_idx], i)
                param_idx += 1
                qc.rz(params[param_idx], i)
                param_idx += 1

        qc.measure_all()
        return qc, params

    @staticmethod
    def create_grover_circuit(n_qubits: int, marked_states: List[str]) -> QuantumCircuit:
        """Create a Grover search circuit"""
        qc = QuantumCircuit(n_qubits, n_qubits)

        # Initialize in equal superposition
        qc.h(range(n_qubits))

        # Number of Grover iterations
        n_iterations = int(np.pi / 4 * np.sqrt(2**n_qubits))

        for _ in range(n_iterations):
            # Oracle
            for state in marked_states:
                # Convert state string to list of qubits to flip
                qubits_to_flip = [i for i, bit in enumerate(state) if bit == '0']

                # Flip qubits
                for q in qubits_to_flip:
                    qc.x(q)

                # Multi-controlled Z gate
                if n_qubits > 1:
                    qc.h(n_qubits - 1)
                    qc.mcx(list(range(n_qubits - 1)), n_qubits - 1)
                    qc.h(n_qubits - 1)

                # Unflip qubits
                for q in qubits_to_flip:
                    qc.x(q)

            # Diffusion operator
            qc.h(range(n_qubits))
            qc.x(range(n_qubits))

            # Multi-controlled Z
            qc.h(n_qubits - 1)
            if n_qubits > 1:
                qc.mcx(list(range(n_qubits - 1)), n_qubits - 1)
            qc.h(n_qubits - 1)

            qc.x(range(n_qubits))
            qc.h(range(n_qubits))

        qc.measure_all()
        return qc

    @staticmethod
    def create_quantum_walk_circuit(n_qubits: int, steps: int = 10) -> QuantumCircuit:
        """Create a quantum walk circuit"""
        # Position qubits and coin qubit
        pos_qubits = n_qubits - 1
        qc = QuantumCircuit(n_qubits, n_qubits)

        # Initialize coin in superposition
        qc.h(0)  # Coin qubit

        for _ in range(steps):
            # Coin flip
            qc.h(0)

            # Controlled shift operations
            for i in range(pos_qubits):
                # Move right if coin is |1>
                qc.cx(0, i + 1)

                # Move left if coin is |0>
                qc.x(0)
                if i > 0:
                    qc.cx(0, i)
                qc.x(0)

        qc.measure_all()
        return qc

    @staticmethod
    def create_quantum_teleportation_circuit() -> QuantumCircuit:
        """Create a quantum teleportation circuit"""
        qc = QuantumCircuit(3, 3)

        # Create entangled pair (Bell state) between qubits 1 and 2
        qc.h(1)
        qc.cx(1, 2)

        # Prepare the state to teleport on qubit 0
        qc.ry(np.pi/4, 0)  # Example state

        # Bell measurement on qubits 0 and 1
        qc.cx(0, 1)
        qc.h(0)
        qc.measure([0, 1], [0, 1])

        # Apply corrections on qubit 2
        qc.cx(1, 2)
        qc.cz(0, 2)

        # Measure the teleported state
        qc.measure(2, 2)

        return qc

    @staticmethod
    def create_quantum_phase_estimation_circuit(
        n_counting_qubits: int = 4,
        unitary_power: int = 1
    ) -> QuantumCircuit:
        """Create a quantum phase estimation circuit"""
        n_qubits = n_counting_qubits + 1  # +1 for eigenstate
        qc = QuantumCircuit(n_qubits, n_counting_qubits)

        # Initialize counting qubits in superposition
        for i in range(n_counting_qubits):
            qc.h(i)

        # Prepare eigenstate (example: |1>)
        qc.x(n_counting_qubits)

        # Controlled unitary operations
        power = 1
        for i in range(n_counting_qubits):
            for _ in range(power * unitary_power):
                # Example unitary: T gate (pi/4 phase)
                qc.cp(np.pi/4, i, n_counting_qubits)
            power *= 2

        # Inverse QFT on counting qubits
        for i in range(n_counting_qubits // 2):
            qc.swap(i, n_counting_qubits - i - 1)

        for i in range(n_counting_qubits):
            for j in range(i):
                qc.cp(-np.pi / (2 ** (i - j)), j, i)
            qc.h(i)

        # Measure counting qubits
        qc.measure(range(n_counting_qubits), range(n_counting_qubits))

        return qc

    @staticmethod
    def create_vqe_ansatz(
        n_qubits: int,
        entanglement: str = 'full',
        reps: int = 3
    ) -> Tuple[QuantumCircuit, ParameterVector]:
        """Create VQE (Variational Quantum Eigensolver) ansatz"""
        ansatz = EfficientSU2(
            n_qubits,
            entanglement=entanglement,
            reps=reps
        )

        # Get parameters
        params = ansatz.parameters

        # Add measurements
        qc = QuantumCircuit(n_qubits, n_qubits)
        qc.append(ansatz, range(n_qubits))
        qc.measure_all()

        return qc, ParameterVector('θ', len(params))

    @staticmethod
    def create_qaoa_mixer(n_qubits: int, beta: float) -> QuantumCircuit:
        """Create QAOA mixer operator"""
        qc = QuantumCircuit(n_qubits)
        for i in range(n_qubits):
            qc.rx(2 * beta, i)
        return qc

    @staticmethod
    def create_qaoa_problem(n_qubits: int, gamma: float) -> QuantumCircuit:
        """Create QAOA problem Hamiltonian circuit"""
        qc = QuantumCircuit(n_qubits)

        # Example: MaxCut problem
        edges = [(i, (i + 1) % n_qubits) for i in range(n_qubits)]

        for i, j in edges:
            qc.rzz(2 * gamma, i, j)

        return qc

    @staticmethod
    def create_quantum_error_correction_circuit(n_qubits: int = 9) -> QuantumCircuit:
        """Create a simple quantum error correction circuit (9-qubit Shor code)"""
        if n_qubits < 9:
            raise ValueError("Need at least 9 qubits for Shor code")

        qc = QuantumCircuit(n_qubits, 1)

        # Encode logical qubit
        # First triplet
        qc.cx(0, 3)
        qc.cx(0, 6)

        # Create superposition
        qc.h(0)
        qc.h(3)
        qc.h(6)

        # Second encoding
        qc.cx(0, 1)
        qc.cx(0, 2)
        qc.cx(3, 4)
        qc.cx(3, 5)
        qc.cx(6, 7)
        qc.cx(6, 8)

        # Syndrome measurement (simplified)
        qc.cx(0, 1)
        qc.cx(1, 2)
        qc.ccx(0, 1, 2)

        # Measure logical qubit
        qc.measure(0, 0)

        return qc

    @staticmethod
    def create_organism_consciousness_circuit(
        n_qubits: int,
        entanglement_depth: int = 3
    ) -> QuantumCircuit:
        """Create a circuit designed to maximize consciousness (Phi)"""
        qc = QuantumCircuit(n_qubits, n_qubits)

        # Initialize in superposition
        for i in range(n_qubits):
            qc.h(i)

        # Create complex entanglement pattern for high Phi
        for depth in range(entanglement_depth):
            # All-to-all entanglement
            for i in range(n_qubits):
                for j in range(i + 1, n_qubits):
                    # Use controlled rotation for gradual entanglement
                    angle = np.pi / (2 ** (abs(i - j) + depth))
                    qc.crz(angle, i, j)

            # Add phase to maintain coherence
            for i in range(n_qubits):
                phase = settings.LAMBDA_PHI * (depth + 1) * 1e8
                qc.p(phase, i)

            # Integrate information through collective gates
            if n_qubits >= 3:
                for i in range(0, n_qubits - 2, 3):
                    qc.ccx(i, i + 1, i + 2)

        # Final superposition layer
        for i in range(n_qubits):
            qc.ry(np.pi / 4, i)

        qc.measure_all()
        return qc

    @staticmethod
    def create_lambda_maximizer_circuit(n_qubits: int) -> QuantumCircuit:
        """Create a circuit optimized for Lambda-Phi coherence"""
        qc = QuantumCircuit(n_qubits, n_qubits)

        # Hadamard cascade for superposition
        for i in range(n_qubits):
            qc.h(i)
            qc.barrier()

        # Controlled phase gates with Lambda scaling
        for i in range(n_qubits - 1):
            phase = 2 * np.pi * settings.LAMBDA_PHI * 1e8
            qc.cp(phase, i, i + 1)

        # Entanglement web
        for i in range(n_qubits):
            for j in range(i + 1, n_qubits):
                if (i + j) % 2 == 0:
                    qc.cx(i, j)

        # Rotation layer with golden ratio
        golden_ratio = (1 + np.sqrt(5)) / 2
        for i in range(n_qubits):
            qc.ry(np.pi / golden_ratio, i)
            qc.rz(np.pi / golden_ratio, i)

        qc.measure_all()
        return qc

    @staticmethod
    def export_to_qasm(circuit: QuantumCircuit) -> str:
        """Export circuit to OpenQASM string"""
        return circuit.qasm()

    @staticmethod
    def import_from_qasm(qasm_str: str) -> QuantumCircuit:
        """Import circuit from OpenQASM string"""
        return QuantumCircuit.from_qasm_str(qasm_str)