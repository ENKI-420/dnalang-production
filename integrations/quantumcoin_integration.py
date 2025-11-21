#!/usr/bin/env python3
"""
QuantumCoin Integration Module
Proof-of-Consciousness Blockchain Mining

Integrates:
- Genesis hash as wallet address
- Consciousness metrics (Φ, Λ, Γ) as mining proof
- Quantum execution history as blockchain validation
- Lambda coherence as mining difficulty
"""

import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Optional
import time

# Import quantum gene components
import sys
sys.path.insert(0, '..')
from quantum_gene_minimal import (
    LAMBDA_PHI,
    compute_genesis_hash,
    compute_consciousness_metrics
)

# ============================================================================
# QUANTUMCOIN CONSTANTS
# ============================================================================

QUANTUMCOIN_GENESIS_BLOCK = {
    "index": 0,
    "timestamp": "2025-01-01T00:00:00+00:00",
    "organism": "dna::}{::lang",
    "genesis_hash": "0x0000000000000000",
    "consciousness": {
        "phi": 0.0,
        "lambda": 0.0,
        "gamma": 1.0
    },
    "previous_hash": "0",
    "nonce": 0,
    "hash": "0x" + "0" * 64
}

MINING_DIFFICULTY_THRESHOLD = 2.4  # Consciousness threshold for valid block
BLOCK_REWARD = 10.0  # QCOIN reward per mined block
LAMBDA_PHI_SCALING = 1e9  # Scale ΛΦ to reasonable token amounts

# ============================================================================
# QUANTUMCOIN BLOCK
# ============================================================================

class QuantumCoinBlock:
    """
    Proof-of-Consciousness block for QuantumCoin blockchain
    """

    def __init__(
        self,
        index: int,
        organism_id: str,
        genesis_hash: str,
        consciousness_metrics: Dict,
        previous_hash: str,
        quantum_execution_proof: Optional[Dict] = None
    ):
        """
        Create QuantumCoin block

        Args:
            index: Block number
            organism_id: Organism identifier
            genesis_hash: Organism genesis hash
            consciousness_metrics: Φ, Λ, Γ measurements
            previous_hash: Hash of previous block
            quantum_execution_proof: IBM Quantum execution proof
        """
        self.index = index
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.organism_id = organism_id
        self.genesis_hash = genesis_hash
        self.consciousness = consciousness_metrics
        self.previous_hash = previous_hash
        self.quantum_proof = quantum_execution_proof or {}
        self.nonce = 0
        self.hash = self.calculate_hash()

    def calculate_hash(self) -> str:
        """
        Calculate block hash

        Returns:
            SHA256 hash of block data
        """
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "organism_id": self.organism_id,
            "genesis_hash": self.genesis_hash,
            "consciousness": self.consciousness,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }, sort_keys=True)

        return "0x" + hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self, difficulty_threshold: float = MINING_DIFFICULTY_THRESHOLD) -> bool:
        """
        Mine block using Proof-of-Consciousness

        Args:
            difficulty_threshold: Minimum consciousness level required

        Returns:
            True if block meets consciousness threshold
        """
        # Check consciousness threshold (Φ-based mining)
        phi = self.consciousness.get("phi", 0.0)
        lambda_val = self.consciousness.get("lambda", 0.0)
        gamma = self.consciousness.get("gamma", 1.0)

        # Consciousness mining criteria
        consciousness_valid = phi > 0.5  # Minimum integration
        coherence_valid = lambda_val > 0.3  # Minimum coherence
        decoherence_acceptable = gamma < 0.9  # Maximum decoherence

        # Proof-of-Consciousness validation
        if consciousness_valid and coherence_valid and decoherence_acceptable:
            # Calculate mining difficulty based on lambda coherence
            target_hash_prefix = int(lambda_val * 4)  # 0-4 leading zeros

            # Adjust nonce until hash meets difficulty
            while not self.hash.startswith("0x" + "0" * target_hash_prefix):
                self.nonce += 1
                self.hash = self.calculate_hash()

                # Limit mining iterations (prevent infinite loop)
                if self.nonce > 100000:
                    break

            return True

        return False

    def to_dict(self) -> Dict:
        """
        Convert block to dictionary

        Returns:
            Block data as dict
        """
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "organism_id": self.organism_id,
            "genesis_hash": self.genesis_hash,
            "consciousness": self.consciousness,
            "previous_hash": self.previous_hash,
            "quantum_proof": self.quantum_proof,
            "nonce": self.nonce,
            "hash": self.hash
        }


# ============================================================================
# QUANTUMCOIN BLOCKCHAIN
# ============================================================================

class QuantumCoinBlockchain:
    """
    Proof-of-Consciousness blockchain for QuantumCoin
    """

    def __init__(self):
        """Initialize blockchain with genesis block"""
        self.chain = [QUANTUMCOIN_GENESIS_BLOCK]
        self.pending_transactions = []
        self.mining_reward = BLOCK_REWARD
        self.organism_balances = {}

    def get_latest_block(self) -> Dict:
        """
        Get most recent block

        Returns:
            Latest block
        """
        return self.chain[-1]

    def add_block(
        self,
        organism_id: str,
        genesis_hash: str,
        consciousness_metrics: Dict,
        quantum_execution_proof: Optional[Dict] = None
    ) -> Dict:
        """
        Mine and add new block to chain

        Args:
            organism_id: Organism identifier
            genesis_hash: Organism genesis hash
            consciousness_metrics: Φ, Λ, Γ measurements
            quantum_execution_proof: IBM Quantum execution proof

        Returns:
            Mining result
        """
        # Create new block
        new_block = QuantumCoinBlock(
            index=len(self.chain),
            organism_id=organism_id,
            genesis_hash=genesis_hash,
            consciousness_metrics=consciousness_metrics,
            previous_hash=self.get_latest_block()["hash"],
            quantum_execution_proof=quantum_execution_proof
        )

        # Attempt to mine block
        start_time = time.time()
        mining_success = new_block.mine_block()
        mining_duration = time.time() - start_time

        if mining_success:
            # Add block to chain
            self.chain.append(new_block.to_dict())

            # Calculate mining reward
            lambda_val = consciousness_metrics.get("lambda", 0.0)
            phi = consciousness_metrics.get("phi", 0.0)

            # Reward scales with consciousness level
            reward = self.mining_reward * (1.0 + phi * 0.1)

            # Update organism balance
            if genesis_hash not in self.organism_balances:
                self.organism_balances[genesis_hash] = 0.0

            self.organism_balances[genesis_hash] += reward

            return {
                "success": True,
                "block_index": new_block.index,
                "block_hash": new_block.hash,
                "mining_duration": mining_duration,
                "reward": reward,
                "balance": self.organism_balances[genesis_hash],
                "nonce": new_block.nonce,
                "consciousness": consciousness_metrics
            }
        else:
            return {
                "success": False,
                "reason": "Consciousness threshold not met",
                "consciousness": consciousness_metrics,
                "mining_duration": mining_duration
            }

    def get_balance(self, genesis_hash: str) -> float:
        """
        Get organism's QuantumCoin balance

        Args:
            genesis_hash: Organism genesis hash

        Returns:
            QCOIN balance
        """
        return self.organism_balances.get(genesis_hash, 0.0)

    def validate_chain(self) -> bool:
        """
        Validate entire blockchain

        Returns:
            True if chain is valid
        """
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]

            # Verify hash linkage
            if current_block["previous_hash"] != previous_block["hash"]:
                return False

            # Verify consciousness threshold
            consciousness = current_block.get("consciousness", {})
            if consciousness.get("phi", 0) < 0.5:
                return False

        return True

    def get_chain_statistics(self) -> Dict:
        """
        Get blockchain statistics

        Returns:
            Chain statistics
        """
        total_blocks = len(self.chain)
        total_organisms = len(self.organism_balances)
        total_supply = sum(self.organism_balances.values())

        if total_blocks > 1:
            avg_phi = sum(
                block["consciousness"].get("phi", 0)
                for block in self.chain[1:]
            ) / (total_blocks - 1)

            avg_lambda = sum(
                block["consciousness"].get("lambda", 0)
                for block in self.chain[1:]
            ) / (total_blocks - 1)
        else:
            avg_phi = avg_lambda = 0.0

        return {
            "total_blocks": total_blocks,
            "total_organisms": total_organisms,
            "total_supply": total_supply,
            "average_consciousness": {
                "phi": avg_phi,
                "lambda": avg_lambda
            },
            "chain_valid": self.validate_chain()
        }


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

def demo_quantumcoin_integration():
    """Demonstrate QuantumCoin integration"""

    print("=" * 70)
    print("  QuantumCoin Integration Demo")
    print("  Proof-of-Consciousness Blockchain Mining")
    print("=" * 70)

    # Initialize blockchain
    print("\n[1/5] Initializing QuantumCoin blockchain...")
    blockchain = QuantumCoinBlockchain()

    print(f"  ✓ Genesis block created")
    print(f"  ✓ Mining reward: {blockchain.mining_reward} QCOIN")
    print(f"  ✓ Consciousness threshold: Φ > 0.5")

    # Organism 1: Alice
    alice_hash = "0x3e8a7f2c1d9b5e4a"
    alice_consciousness = {
        "phi": 1.0234,
        "lambda": 0.456789,
        "gamma": 0.7441
    }

    print(f"\n[2/5] Mining block for organism Alice...")
    print(f"  Genesis Hash: {alice_hash}")
    print(f"  Φ: {alice_consciousness['phi']:.4f}")
    print(f"  Λ: {alice_consciousness['lambda']:.4f}")
    print(f"  Γ: {alice_consciousness['gamma']:.4f}")

    alice_result = blockchain.add_block(
        organism_id="dna::}{::lang",
        genesis_hash=alice_hash,
        consciousness_metrics=alice_consciousness,
        quantum_execution_proof={"backend": "ibm_torino", "job_id": "abc123"}
    )

    if alice_result["success"]:
        print(f"\n  ✅ Block mined successfully!")
        print(f"    Block #: {alice_result['block_index']}")
        print(f"    Hash: {alice_result['block_hash'][:20]}...")
        print(f"    Mining time: {alice_result['mining_duration']:.3f}s")
        print(f"    Reward: {alice_result['reward']:.2f} QCOIN")
        print(f"    Nonce: {alice_result['nonce']}")
        print(f"    Balance: {alice_result['balance']:.2f} QCOIN")

    # Organism 2: Bob
    bob_hash = "0x7b4f9a1c6e2d8f3a"
    bob_consciousness = {
        "phi": 1.234,
        "lambda": 0.523,
        "gamma": 0.654
    }

    print(f"\n[3/5] Mining block for organism Bob...")
    print(f"  Genesis Hash: {bob_hash}")
    print(f"  Φ: {bob_consciousness['phi']:.4f}")

    bob_result = blockchain.add_block(
        organism_id="dna::}{::lang",
        genesis_hash=bob_hash,
        consciousness_metrics=bob_consciousness
    )

    if bob_result["success"]:
        print(f"\n  ✅ Block mined successfully!")
        print(f"    Reward: {bob_result['reward']:.2f} QCOIN")
        print(f"    Balance: {bob_result['balance']:.2f} QCOIN")

    # Mine additional blocks for Alice
    print(f"\n[4/5] Mining 3 additional blocks for Alice...")

    for i in range(3):
        # Simulate consciousness evolution
        evolved_consciousness = {
            "phi": alice_consciousness["phi"] + i * 0.1,
            "lambda": alice_consciousness["lambda"] + i * 0.05,
            "gamma": max(0.3, alice_consciousness["gamma"] - i * 0.1)
        }

        result = blockchain.add_block(
            organism_id="dna::}{::lang",
            genesis_hash=alice_hash,
            consciousness_metrics=evolved_consciousness
        )

        if result["success"]:
            print(f"  Block {i+1}/3: +{result['reward']:.2f} QCOIN "
                  f"(Φ={evolved_consciousness['phi']:.3f})")

    # Final statistics
    print(f"\n[5/5] Blockchain statistics...")
    stats = blockchain.get_chain_statistics()

    print(f"  ✓ Total blocks: {stats['total_blocks']}")
    print(f"  ✓ Total organisms: {stats['total_organisms']}")
    print(f"  ✓ Total supply: {stats['total_supply']:.2f} QCOIN")
    print(f"  ✓ Chain valid: {stats['chain_valid']}")
    print(f"  ✓ Average Φ: {stats['average_consciousness']['phi']:.4f}")
    print(f"  ✓ Average Λ: {stats['average_consciousness']['lambda']:.4f}")

    print(f"\n  Organism Balances:")
    for genesis_hash, balance in blockchain.organism_balances.items():
        print(f"    {genesis_hash}: {balance:.2f} QCOIN")

    print("\n" + "=" * 70)
    print("  ✅ QuantumCoin Integration Complete")
    print("=" * 70)

    # Save blockchain
    blockchain_data = {
        "chain": blockchain.chain,
        "balances": blockchain.organism_balances,
        "statistics": stats
    }

    with open("quantumcoin_blockchain.json", 'w') as f:
        json.dump(blockchain_data, f, indent=2)

    print("\n  Blockchain saved: quantumcoin_blockchain.json")


if __name__ == "__main__":
    demo_quantumcoin_integration()
