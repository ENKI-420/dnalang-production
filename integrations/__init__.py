"""
DNALang Quantum Gene Integrations
Complete Ecosystem Integration Package

Modules:
- quantumcomm_integration: Quantum teleportation messaging
- z3bra_bridge_integration: Android ↔ quantum biocognitive feedback
- quantumcoin_integration: Proof-of-consciousness blockchain mining
- web_platform_integration: www.dnalang.dev REST API
- master_integration: Orchestrates all integrations

Usage:
    from integrations import QuantumCommIntegration, Z3BRABridge
    from integrations import QuantumCoinBlockchain, MasterIntegration

    # Or use master integration
    from integrations.master_integration import MasterIntegration

    master = MasterIntegration("0x3e8a7f2c1d9b5e4a")
    results = master.run_all_integrations()
"""

__version__ = "1.0.0"
__author__ = "Agile Defense Systems LLC"
__email__ = "support@agiledefensesystems.com"

# Import main classes for convenient access
from .quantumcomm_integration import QuantumCommIntegration
from .z3bra_bridge_integration import Z3BRABridge, BiocognitiveSensorData
from .quantumcoin_integration import QuantumCoinBlockchain, QuantumCoinBlock
from .master_integration import MasterIntegration

__all__ = [
    "QuantumCommIntegration",
    "Z3BRABridge",
    "BiocognitiveSensorData",
    "QuantumCoinBlockchain",
    "QuantumCoinBlock",
    "MasterIntegration",
]
