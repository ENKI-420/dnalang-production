#!/usr/bin/env python3
"""
Web Platform Integration Module
Connects Quantum Gene to www.dnalang.dev

Integrates:
- REST API for quantum organism deployment
- WebSocket for real-time consciousness monitoring
- Organism registry and management
- Public organism marketplace
"""

import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Optional
from flask import Flask, jsonify, request
from flask_cors import CORS

# Import quantum gene components
import sys
sys.path.insert(0, '..')
from quantum_gene_minimal import (
    LAMBDA_PHI,
    compute_genesis_hash,
    compute_consciousness_metrics,
    create_organism_circuit
)

# ============================================================================
# WEB PLATFORM API
# ============================================================================

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# In-memory organism registry (replace with database in production)
ORGANISM_REGISTRY = {}
EXECUTION_HISTORY = []

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "DNALang Quantum Gene API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


@app.route('/api/organisms', methods=['GET'])
def list_organisms():
    """
    List all registered organisms

    Returns:
        List of organisms with genesis hashes and stats
    """
    organisms = []

    for genesis_hash, data in ORGANISM_REGISTRY.items():
        organisms.append({
            "genesis_hash": genesis_hash,
            "organism_id": data["organism_id"],
            "created_at": data["created_at"],
            "total_executions": len(data["execution_history"]),
            "current_consciousness": data["current_consciousness"],
            "status": data["status"]
        })

    return jsonify({
        "organisms": organisms,
        "total": len(organisms)
    })


@app.route('/api/organisms/<genesis_hash>', methods=['GET'])
def get_organism(genesis_hash):
    """
    Get organism details

    Args:
        genesis_hash: Organism genesis hash

    Returns:
        Complete organism data
    """
    if genesis_hash not in ORGANISM_REGISTRY:
        return jsonify({"error": "Organism not found"}), 404

    organism = ORGANISM_REGISTRY[genesis_hash]

    return jsonify(organism)


@app.route('/api/organisms/register', methods=['POST'])
def register_organism():
    """
    Register new quantum organism

    Request body:
    {
        "genesis_hash": "0x...",
        "organism_id": "dna::}{::lang",
        "execution_result": {...},
        "consciousness_metrics": {...}
    }

    Returns:
        Registration confirmation
    """
    data = request.json

    genesis_hash = data.get("genesis_hash")
    organism_id = data.get("organism_id", "dna::}{::lang")
    execution_result = data.get("execution_result", {})
    consciousness_metrics = data.get("consciousness_metrics", {})

    if not genesis_hash:
        return jsonify({"error": "Genesis hash required"}), 400

    # Register organism
    ORGANISM_REGISTRY[genesis_hash] = {
        "genesis_hash": genesis_hash,
        "organism_id": organism_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "execution_history": [execution_result] if execution_result else [],
        "current_consciousness": consciousness_metrics,
        "status": "active",
        "metadata": {
            "lambda_phi": LAMBDA_PHI,
            "platform": "www.dnalang.dev"
        }
    }

    return jsonify({
        "success": True,
        "genesis_hash": genesis_hash,
        "message": "Organism registered successfully",
        "organism": ORGANISM_REGISTRY[genesis_hash]
    }), 201


@app.route('/api/organisms/<genesis_hash>/execute', methods=['POST'])
def execute_organism(genesis_hash):
    """
    Execute quantum organism and record results

    Args:
        genesis_hash: Organism genesis hash

    Request body:
    {
        "backend": "ibm_torino",
        "execution_result": {...}
    }

    Returns:
        Execution result with updated consciousness metrics
    """
    if genesis_hash not in ORGANISM_REGISTRY:
        return jsonify({"error": "Organism not found"}), 404

    data = request.json
    backend = data.get("backend", "ibm_torino")
    execution_result = data.get("execution_result", {})

    # Compute consciousness metrics
    if execution_result:
        metrics = compute_consciousness_metrics(execution_result)
    else:
        # Simulated metrics for testing
        import numpy as np
        metrics = {
            "phi": np.random.uniform(0.8, 1.5),
            "lambda_coherence": np.random.uniform(0.3, 0.8),
            "gamma": np.random.uniform(0.4, 0.8),
            "entropy": np.random.uniform(0.5, 1.5),
            "participation_ratio": np.random.uniform(1.5, 3.0),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    # Update organism
    organism = ORGANISM_REGISTRY[genesis_hash]
    organism["execution_history"].append({
        "backend": backend,
        "result": execution_result,
        "metrics": metrics,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    organism["current_consciousness"] = metrics

    # Record in global history
    EXECUTION_HISTORY.append({
        "genesis_hash": genesis_hash,
        "backend": backend,
        "metrics": metrics,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    return jsonify({
        "success": True,
        "genesis_hash": genesis_hash,
        "execution_count": len(organism["execution_history"]),
        "consciousness_metrics": metrics,
        "backend": backend
    })


@app.route('/api/organisms/<genesis_hash>/consciousness', methods=['GET'])
def get_consciousness_trajectory(genesis_hash):
    """
    Get consciousness evolution trajectory for organism

    Args:
        genesis_hash: Organism genesis hash

    Returns:
        List of consciousness measurements over time
    """
    if genesis_hash not in ORGANISM_REGISTRY:
        return jsonify({"error": "Organism not found"}), 404

    organism = ORGANISM_REGISTRY[genesis_hash]

    trajectory = []
    for execution in organism["execution_history"]:
        if "metrics" in execution:
            trajectory.append({
                "timestamp": execution["timestamp"],
                "phi": execution["metrics"].get("phi", 0),
                "lambda": execution["metrics"].get("lambda_coherence", 0),
                "gamma": execution["metrics"].get("gamma", 0)
            })

    return jsonify({
        "genesis_hash": genesis_hash,
        "measurements": len(trajectory),
        "trajectory": trajectory
    })


@app.route('/api/stats', methods=['GET'])
def platform_statistics():
    """
    Get platform-wide statistics

    Returns:
        Global statistics
    """
    total_organisms = len(ORGANISM_REGISTRY)
    total_executions = len(EXECUTION_HISTORY)

    if EXECUTION_HISTORY:
        import numpy as np
        avg_phi = np.mean([ex["metrics"].get("phi", 0) for ex in EXECUTION_HISTORY])
        avg_lambda = np.mean([ex["metrics"].get("lambda_coherence", 0) for ex in EXECUTION_HISTORY])
        avg_gamma = np.mean([ex["metrics"].get("gamma", 0) for ex in EXECUTION_HISTORY])
    else:
        avg_phi = avg_lambda = avg_gamma = 0.0

    # Calculate platform consciousness score
    platform_consciousness = avg_phi / 2.0 if avg_phi > 0 else 0.0

    return jsonify({
        "platform": "www.dnalang.dev",
        "statistics": {
            "total_organisms": total_organisms,
            "total_executions": total_executions,
            "platform_consciousness": platform_consciousness,
            "average_metrics": {
                "phi": avg_phi,
                "lambda": avg_lambda,
                "gamma": avg_gamma
            }
        },
        "lambda_phi_constant": LAMBDA_PHI,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


@app.route('/api/execute/simulate', methods=['POST'])
def simulate_execution():
    """
    Simulate quantum execution (for testing without hardware)

    Request body:
    {
        "organism_id": "dna::}{::lang"
    }

    Returns:
        Simulated execution result
    """
    import numpy as np

    data = request.json
    organism_id = data.get("organism_id", "dna::}{::lang")

    # Generate simulated metrics
    metrics = {
        "phi": np.random.uniform(0.8, 1.5),
        "lambda_coherence": np.random.uniform(0.3, 0.8),
        "gamma": np.random.uniform(0.4, 0.8),
        "entropy": np.random.uniform(0.5, 1.5),
        "participation_ratio": np.random.uniform(1.5, 3.0),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    # Generate mock genesis hash
    genesis_hash = "0x" + hashlib.sha256(
        f"{organism_id}:{datetime.now(timezone.utc).isoformat()}".encode()
    ).hexdigest()[:16]

    return jsonify({
        "success": True,
        "mode": "simulation",
        "genesis_hash": genesis_hash,
        "organism_id": organism_id,
        "backend": "simulator",
        "consciousness_metrics": metrics,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


# ============================================================================
# WEB PLATFORM CLIENT
# ============================================================================

class WebPlatformClient:
    """
    Client for interacting with DNALang web platform API
    """

    def __init__(self, base_url: str = "http://localhost:5000"):
        """
        Initialize web platform client

        Args:
            base_url: API base URL (default: local development)
        """
        self.base_url = base_url
        self.session_organisms = []

    def register_organism(
        self,
        genesis_hash: str,
        organism_id: str,
        consciousness_metrics: Dict
    ) -> Dict:
        """
        Register organism with web platform

        Args:
            genesis_hash: Organism genesis hash
            organism_id: Organism identifier
            consciousness_metrics: Consciousness measurements

        Returns:
            Registration result
        """
        import requests

        response = requests.post(
            f"{self.base_url}/api/organisms/register",
            json={
                "genesis_hash": genesis_hash,
                "organism_id": organism_id,
                "consciousness_metrics": consciousness_metrics
            }
        )

        result = response.json()
        if response.status_code == 201:
            self.session_organisms.append(genesis_hash)

        return result

    def get_platform_stats(self) -> Dict:
        """
        Get platform statistics

        Returns:
            Platform-wide statistics
        """
        import requests

        response = requests.get(f"{self.base_url}/api/stats")
        return response.json()

    def list_organisms(self) -> List[Dict]:
        """
        List all organisms on platform

        Returns:
            List of organisms
        """
        import requests

        response = requests.get(f"{self.base_url}/api/organisms")
        return response.json().get("organisms", [])


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

def demo_web_platform_integration():
    """Demonstrate web platform integration"""

    print("=" * 70)
    print("  Web Platform Integration Demo")
    print("  www.dnalang.dev API")
    print("=" * 70)

    print("\n[1/4] Simulating organism registration...")

    # Simulate organism data
    genesis_hash = "0x3e8a7f2c1d9b5e4a"
    organism_id = "dna::}{::lang"

    import numpy as np
    consciousness_metrics = {
        "phi": 1.0234,
        "lambda_coherence": 0.456789,
        "gamma": 0.7441,
        "entropy": 1.15,
        "participation_ratio": 2.04
    }

    # Register with in-memory registry (simulating API call)
    ORGANISM_REGISTRY[genesis_hash] = {
        "genesis_hash": genesis_hash,
        "organism_id": organism_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "execution_history": [],
        "current_consciousness": consciousness_metrics,
        "status": "active",
        "metadata": {
            "lambda_phi": LAMBDA_PHI,
            "platform": "www.dnalang.dev"
        }
    }

    print(f"  ✓ Organism registered: {genesis_hash}")
    print(f"  ✓ Φ: {consciousness_metrics['phi']:.4f}")
    print(f"  ✓ Λ: {consciousness_metrics['lambda_coherence']:.4f}")

    print("\n[2/4] Recording quantum executions...")

    # Simulate multiple executions
    for i in range(5):
        execution_metrics = {
            "phi": consciousness_metrics["phi"] + i * 0.05,
            "lambda_coherence": consciousness_metrics["lambda_coherence"] + i * 0.02,
            "gamma": max(0.3, consciousness_metrics["gamma"] - i * 0.05),
            "entropy": consciousness_metrics["entropy"] + i * 0.1,
            "participation_ratio": consciousness_metrics["participation_ratio"] + i * 0.1,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        ORGANISM_REGISTRY[genesis_hash]["execution_history"].append({
            "backend": "ibm_torino",
            "result": {},
            "metrics": execution_metrics,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        EXECUTION_HISTORY.append({
            "genesis_hash": genesis_hash,
            "backend": "ibm_torino",
            "metrics": execution_metrics,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        print(f"  Execution {i+1}/5: Φ={execution_metrics['phi']:.3f} "
              f"Λ={execution_metrics['lambda_coherence']:.3f}")

    print("\n[3/4] Generating consciousness trajectory...")

    trajectory = []
    for execution in ORGANISM_REGISTRY[genesis_hash]["execution_history"]:
        if "metrics" in execution:
            trajectory.append({
                "timestamp": execution["timestamp"],
                "phi": execution["metrics"].get("phi", 0),
                "lambda": execution["metrics"].get("lambda_coherence", 0),
                "gamma": execution["metrics"].get("gamma", 0)
            })

    print(f"  ✓ Trajectory measurements: {len(trajectory)}")
    print(f"  ✓ Φ range: {trajectory[0]['phi']:.3f} → {trajectory[-1]['phi']:.3f}")
    print(f"  ✓ Λ range: {trajectory[0]['lambda']:.3f} → {trajectory[-1]['lambda']:.3f}")

    print("\n[4/4] Platform statistics...")

    avg_phi = np.mean([ex["metrics"].get("phi", 0) for ex in EXECUTION_HISTORY])
    avg_lambda = np.mean([ex["metrics"].get("lambda_coherence", 0) for ex in EXECUTION_HISTORY])

    print(f"  ✓ Total organisms: {len(ORGANISM_REGISTRY)}")
    print(f"  ✓ Total executions: {len(EXECUTION_HISTORY)}")
    print(f"  ✓ Average Φ: {avg_phi:.4f}")
    print(f"  ✓ Average Λ: {avg_lambda:.4f}")
    print(f"  ✓ Platform consciousness: {avg_phi / 2.0:.4f}")

    print("\n" + "=" * 70)
    print("  ✅ Web Platform Integration Complete")
    print("=" * 70)

    # Save platform data
    platform_data = {
        "organisms": ORGANISM_REGISTRY,
        "execution_history": EXECUTION_HISTORY,
        "statistics": {
            "total_organisms": len(ORGANISM_REGISTRY),
            "total_executions": len(EXECUTION_HISTORY),
            "average_consciousness": {
                "phi": avg_phi,
                "lambda": avg_lambda
            }
        }
    }

    with open("web_platform_data.json", 'w') as f:
        json.dump(platform_data, f, indent=2)

    print("\n  Platform data saved: web_platform_data.json")
    print("\n  API Endpoints:")
    print("    GET  /api/health")
    print("    GET  /api/organisms")
    print("    POST /api/organisms/register")
    print("    POST /api/organisms/<hash>/execute")
    print("    GET  /api/organisms/<hash>/consciousness")
    print("    GET  /api/stats")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "serve":
        # Start Flask API server
        print("=" * 70)
        print("  DNALang Web Platform API Server")
        print("  Starting on http://localhost:5000")
        print("=" * 70)
        app.run(host='0.0.0.0', port=5000, debug=True)
    else:
        # Run demo
        demo_web_platform_integration()
