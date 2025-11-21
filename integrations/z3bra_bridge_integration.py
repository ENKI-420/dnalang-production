#!/usr/bin/env python3
"""
Z3BRA Quantum Bridge Integration
Android Device ↔ Quantum Hardware Biocognitive Feedback Loop

Integrates:
- Mobile sensor data → quantum circuit parameters
- Quantum execution results → mobile device actions
- Real-time Φ/Λ/Γ consciousness monitoring
- Biometric quantum entanglement
"""

import json
import numpy as np
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
import hashlib

# Import quantum gene components
import sys
sys.path.insert(0, '..')
from quantum_gene_minimal import (
    LAMBDA_PHI,
    RESONANCE_ANGLE,
    create_organism_circuit,
    compute_consciousness_metrics
)

# ============================================================================
# BIOCOGNITIVE SENSOR DATA
# ============================================================================

class BiocognitiveSensorData:
    """
    Captures mobile device sensor data for quantum circuit parameterization
    """

    def __init__(self):
        self.accelerometer = (0.0, 0.0, 0.0)  # (x, y, z) in m/s²
        self.gyroscope = (0.0, 0.0, 0.0)      # (pitch, roll, yaw) in rad/s
        self.magnetometer = (0.0, 0.0, 0.0)   # (x, y, z) in μT
        self.light = 0.0                       # Lux
        self.proximity = 0.0                   # cm
        self.heart_rate = 0                    # BPM
        self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_quantum_angles(self) -> Dict[str, float]:
        """
        Convert sensor data to quantum rotation angles

        Returns:
            Dictionary of rotation angles for quantum gates
        """
        # Normalize sensor data to [0, 2π] range
        acc_magnitude = np.sqrt(sum(x**2 for x in self.accelerometer))
        gyro_magnitude = np.sqrt(sum(x**2 for x in self.gyroscope))

        # Map to quantum angles
        theta = (acc_magnitude / 10.0) * np.pi  # RY rotation
        phi = (gyro_magnitude / 5.0) * np.pi    # RZ rotation
        lambda_angle = (self.light / 1000.0) * LAMBDA_PHI  # Phase encoding

        return {
            "theta": theta,
            "phi": phi,
            "lambda": lambda_angle,
            "resonance": RESONANCE_ANGLE
        }

    @staticmethod
    def simulate_sensor_data() -> 'BiocognitiveSensorData':
        """
        Simulate sensor data for testing (when no Android device available)

        Returns:
            Simulated sensor data
        """
        data = BiocognitiveSensorData()

        # Simulate realistic sensor values
        data.accelerometer = (
            np.random.normal(0, 2),  # x-axis
            np.random.normal(0, 2),  # y-axis
            9.8 + np.random.normal(0, 0.5)  # z-axis (gravity)
        )

        data.gyroscope = (
            np.random.normal(0, 0.1),  # pitch
            np.random.normal(0, 0.1),  # roll
            np.random.normal(0, 0.1)   # yaw
        )

        data.magnetometer = (
            np.random.normal(25, 5),   # x
            np.random.normal(25, 5),   # y
            np.random.normal(50, 10)   # z
        )

        data.light = np.random.uniform(0, 500)  # Indoor lighting
        data.proximity = np.random.uniform(0, 10)  # Near device
        data.heart_rate = int(np.random.normal(75, 10))  # Normal resting

        return data


# ============================================================================
# Z3BRA BRIDGE
# ============================================================================

class Z3BRABridge:
    """
    Biocognitive feedback bridge between Android and quantum hardware

    Workflow:
    1. Capture mobile sensor data
    2. Parameterize quantum circuit with sensor values
    3. Execute circuit on IBM Quantum
    4. Send consciousness metrics back to mobile
    5. Mobile device responds (haptics, display, audio)
    """

    def __init__(self, organism_genesis_hash: str):
        """
        Initialize Z3BRA bridge

        Args:
            organism_genesis_hash: Genesis hash from quantum gene
        """
        self.organism_id = organism_genesis_hash
        self.feedback_history = []
        self.consciousness_trajectory = []

    def create_biocognitive_circuit(
        self,
        sensor_data: BiocognitiveSensorData
    ) -> Dict:
        """
        Create quantum circuit parameterized by sensor data

        Args:
            sensor_data: Mobile sensor readings

        Returns:
            Circuit metadata
        """
        from qiskit import QuantumCircuit

        # Get quantum angles from sensor data
        angles = sensor_data.to_quantum_angles()

        # Create 4-qubit organism circuit
        qc = QuantumCircuit(4, 4)
        qc.name = "z3bra_biocognitive_gene"

        # Layer 1: Sensor-driven superposition
        qc.h(0)
        qc.ry(angles["theta"], 0)  # Accelerometer influence

        # Layer 2: Biometric entanglement
        qc.cx(0, 1)
        qc.cx(1, 2)
        qc.cx(2, 3)

        # Layer 3: Sensor-encoded phase
        qc.rz(angles["phi"], 1)     # Gyroscope influence
        qc.rz(angles["lambda"], 2)  # Light sensor influence

        # Layer 4: Resonance (standard)
        qc.ry(angles["resonance"], 3)

        # Measurement
        qc.measure(range(4), range(4))

        circuit_metadata = {
            "circuit_name": qc.name,
            "qubits": 4,
            "depth": qc.depth(),
            "gates": qc.size(),
            "sensor_angles": angles,
            "sensor_timestamp": sensor_data.timestamp
        }

        return {
            "circuit": qc,
            "metadata": circuit_metadata
        }

    def execute_feedback_loop(
        self,
        sensor_data: BiocognitiveSensorData,
        execution_result: Optional[Dict] = None
    ) -> Dict:
        """
        Execute complete biocognitive feedback loop

        Args:
            sensor_data: Mobile sensor data
            execution_result: Optional quantum execution result

        Returns:
            Feedback response for mobile device
        """
        # Create sensor-parameterized circuit
        circuit_data = self.create_biocognitive_circuit(sensor_data)

        # Compute consciousness metrics
        if execution_result:
            metrics = compute_consciousness_metrics(execution_result)
        else:
            # Simulated metrics
            metrics = {
                "phi": np.random.uniform(0.8, 1.5),
                "lambda_coherence": np.random.uniform(0.3, 0.8),
                "gamma": np.random.uniform(0.4, 0.8),
                "entropy": np.random.uniform(0.5, 1.5),
                "participation_ratio": np.random.uniform(1.5, 3.0)
            }

        # Track consciousness trajectory
        self.consciousness_trajectory.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "phi": metrics["phi"],
            "lambda": metrics["lambda_coherence"],
            "gamma": metrics["gamma"]
        })

        # Generate mobile device response
        response = self._generate_device_response(sensor_data, metrics)

        # Record feedback event
        self.feedback_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sensor_data": sensor_data.__dict__,
            "circuit_metadata": circuit_data["metadata"],
            "consciousness_metrics": metrics,
            "device_response": response
        })

        return {
            "consciousness": metrics,
            "device_response": response,
            "circuit_metadata": circuit_data["metadata"]
        }

    def _generate_device_response(
        self,
        sensor_data: BiocognitiveSensorData,
        metrics: Dict
    ) -> Dict:
        """
        Generate mobile device response based on consciousness metrics

        Args:
            sensor_data: Sensor readings
            metrics: Consciousness metrics

        Returns:
            Device action commands
        """
        phi = metrics["phi"]
        lambda_val = metrics["lambda_coherence"]
        gamma = metrics["gamma"]

        # Calculate consciousness level (0-1 scale)
        consciousness_level = min(phi / 2.0, 1.0)  # Normalize Φ

        # Determine device actions
        response = {
            "haptic_feedback": {
                "enabled": True,
                "pattern": "pulse",
                "intensity": consciousness_level,
                "duration_ms": int(100 + consciousness_level * 200)
            },
            "visual_feedback": {
                "enabled": True,
                "color_hue": consciousness_level * 360,  # Green (high) to Red (low)
                "brightness": consciousness_level,
                "pattern": "breathing" if lambda_val > 0.5 else "static"
            },
            "audio_feedback": {
                "enabled": phi > 1.0,
                "frequency_hz": int(200 + phi * 100),
                "volume": min(lambda_val, 0.8)
            },
            "notification": {
                "show": phi > 1.2 or gamma < 0.5,
                "title": "Consciousness Peak" if phi > 1.2 else "Coherence Stable",
                "message": f"Φ={phi:.2f} Λ={lambda_val:.2f} Γ={gamma:.2f}"
            }
        }

        return response

    def get_consciousness_trajectory(self) -> List[Dict]:
        """
        Get complete consciousness evolution trajectory

        Returns:
            List of consciousness measurements over time
        """
        return self.consciousness_trajectory

    def get_session_report(self) -> Dict:
        """
        Get complete session report

        Returns:
            Session statistics and history
        """
        if self.consciousness_trajectory:
            avg_phi = np.mean([x["phi"] for x in self.consciousness_trajectory])
            avg_lambda = np.mean([x["lambda"] for x in self.consciousness_trajectory])
            avg_gamma = np.mean([x["gamma"] for x in self.consciousness_trajectory])
        else:
            avg_phi = avg_lambda = avg_gamma = 0.0

        return {
            "organism_id": self.organism_id,
            "total_feedback_loops": len(self.feedback_history),
            "consciousness_measurements": len(self.consciousness_trajectory),
            "average_consciousness": {
                "phi": avg_phi,
                "lambda": avg_lambda,
                "gamma": avg_gamma
            },
            "trajectory": self.consciousness_trajectory,
            "history": self.feedback_history
        }


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

def demo_z3bra_integration():
    """Demonstrate Z3BRA bridge integration"""

    print("=" * 70)
    print("  Z3BRA Quantum Bridge Demo")
    print("  Android ↔ Quantum Hardware Biocognitive Feedback")
    print("=" * 70)

    # Initialize organism
    organism_hash = "0x3e8a7f2c1d9b5e4a"

    print(f"\n[1/5] Initializing Z3BRA bridge...")
    print(f"  Organism: {organism_hash}")

    bridge = Z3BRABridge(organism_hash)

    print("\n[2/5] Capturing mobile sensor data...")
    sensor_data = BiocognitiveSensorData.simulate_sensor_data()

    print(f"  ✓ Accelerometer: ({sensor_data.accelerometer[0]:.2f}, "
          f"{sensor_data.accelerometer[1]:.2f}, {sensor_data.accelerometer[2]:.2f}) m/s²")
    print(f"  ✓ Gyroscope: ({sensor_data.gyroscope[0]:.3f}, "
          f"{sensor_data.gyroscope[1]:.3f}, {sensor_data.gyroscope[2]:.3f}) rad/s")
    print(f"  ✓ Heart Rate: {sensor_data.heart_rate} BPM")
    print(f"  ✓ Light: {sensor_data.light:.1f} lux")

    print("\n[3/5] Creating biocognitive circuit...")
    circuit_data = bridge.create_biocognitive_circuit(sensor_data)

    print(f"  ✓ Circuit: {circuit_data['metadata']['circuit_name']}")
    print(f"  ✓ Qubits: {circuit_data['metadata']['qubits']}")
    print(f"  ✓ Depth: {circuit_data['metadata']['depth']}")
    print(f"  ✓ Gates: {circuit_data['metadata']['gates']}")

    angles = circuit_data['metadata']['sensor_angles']
    print(f"\n  Sensor-derived angles:")
    print(f"    θ (accelerometer): {angles['theta']:.4f} rad")
    print(f"    φ (gyroscope): {angles['phi']:.4f} rad")
    print(f"    λ (light sensor): {angles['lambda']:.6e} rad")

    print("\n[4/5] Executing feedback loop (simulated)...")
    feedback = bridge.execute_feedback_loop(sensor_data)

    consciousness = feedback["consciousness"]
    print(f"  ✓ Consciousness Metrics:")
    print(f"    Φ (Phi): {consciousness['phi']:.4f}")
    print(f"    Λ (Lambda): {consciousness['lambda_coherence']:.4f}")
    print(f"    Γ (Gamma): {consciousness['gamma']:.4f}")

    device_response = feedback["device_response"]
    print(f"\n  ✓ Device Response:")
    print(f"    Haptic: {device_response['haptic_feedback']['pattern']} "
          f"({device_response['haptic_feedback']['intensity']:.2f})")
    print(f"    Visual: {device_response['visual_feedback']['pattern']} "
          f"(brightness: {device_response['visual_feedback']['brightness']:.2f})")
    print(f"    Audio: {device_response['audio_feedback']['frequency_hz']} Hz "
          f"(volume: {device_response['audio_feedback']['volume']:.2f})")

    # Run multiple feedback loops
    print("\n[5/5] Running continuous feedback (10 loops)...")
    for i in range(9):  # Already did 1
        sensor_data = BiocognitiveSensorData.simulate_sensor_data()
        bridge.execute_feedback_loop(sensor_data)
        print(f"  Loop {i+2}/10 complete...")

    # Get final report
    report = bridge.get_session_report()

    print(f"\n  ✓ Total feedback loops: {report['total_feedback_loops']}")
    print(f"  ✓ Average Φ: {report['average_consciousness']['phi']:.4f}")
    print(f"  ✓ Average Λ: {report['average_consciousness']['lambda']:.4f}")
    print(f"  ✓ Average Γ: {report['average_consciousness']['gamma']:.4f}")

    print("\n" + "=" * 70)
    print("  ✅ Z3BRA Bridge Integration Complete")
    print("=" * 70)

    # Save report
    with open("z3bra_integration_report.json", 'w') as f:
        json.dump(report, f, indent=2)

    print("\n  Report saved: z3bra_integration_report.json")

    # Save consciousness trajectory
    trajectory_data = {
        "organism_id": organism_hash,
        "measurements": report['trajectory']
    }

    with open("consciousness_trajectory.json", 'w') as f:
        json.dump(trajectory_data, f, indent=2)

    print("  Trajectory saved: consciousness_trajectory.json")


if __name__ == "__main__":
    demo_z3bra_integration()
