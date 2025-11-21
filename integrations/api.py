#!/usr/bin/env python3
"""
DNALang Quantum Integrations - FastAPI Server
REST API for www.dnalang.dev platform

Endpoints:
  /api/integrations/status - Get all integration status
  /api/quantumcomm/send - Send quantum teleportation message
  /api/quantumcomm/receive - Receive quantum message
  /api/z3bra/telemetry - Send Android telemetry
  /api/quantumcoin/mine - Mine new block
  /api/quantumcoin/balance - Get wallet balance
  /api/quantumcoin/transaction - Create transaction
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import asyncio
import logging

from quantum_integrations import (
    QuantumIntegrationsManager,
    LAMBDA_PHI
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="DNALang Quantum Integrations API",
    description="Unified API for QuantumComm, Z3BRA Bridge, and QuantumCoin",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://www.dnalang.dev",
        "https://chat.dnalang.dev",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global manager
manager = QuantumIntegrationsManager()


# ═══════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ═══════════════════════════════════════════════════════════════════════════

class QuantumMessageRequest(BaseModel):
    sender: str
    receiver: str
    message: str


class TelemetryRequest(BaseModel):
    signal_type: str  # 'sensor', 'network', 'battery', 'inference'
    signal_strength: float  # 0.0 to 1.0
    raw_value: Any


class MineBlockRequest(BaseModel):
    miner_address: str


class TransactionRequest(BaseModel):
    from_address: str
    to_address: str
    amount: float


# ═══════════════════════════════════════════════════════════════════════════
# STARTUP / SHUTDOWN
# ═══════════════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup():
    """Initialize all integrations on startup"""
    logger.info("🚀 Starting DNALang Quantum Integrations API")
    try:
        await manager.initialize_all(
            backend_name="ibm_torino",
            enable_z3bra_adb=False  # Can be configured via env var
        )
        logger.info("✅ All integrations initialized")
    except Exception as e:
        logger.error(f"❌ Initialization failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown"""
    logger.info("Shutting down DNALang Quantum Integrations API")


# ═══════════════════════════════════════════════════════════════════════════
# HEALTH & STATUS
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "service": "DNALang Quantum Integrations API",
        "version": "1.0.0",
        "lambda_phi": LAMBDA_PHI
    }


@app.get("/api/integrations/status")
async def get_integration_status():
    """Get status of all integrations"""
    if not manager.initialized:
        raise HTTPException(status_code=503, detail="Integrations not initialized")

    status = manager.get_status()

    return {
        "status": "success",
        "data": {
            "quantumcomm": {
                "active": status.quantumcomm_active,
                "total_messages": status.total_messages_sent,
                "last_ping": status.last_quantumcomm_ping
            },
            "z3bra_bridge": {
                "active": status.z3bra_bridge_active,
                "total_packets": status.total_android_packets,
                "last_packet": status.last_bridge_packet
            },
            "quantumcoin": {
                "active": status.quantumcoin_active,
                "total_blocks": status.total_blocks_mined,
                "last_block": status.last_block_mined
            },
            "platform": {
                "deployed": status.platform_deployed,
                "ibm_quantum_connected": status.ibm_quantum_connected,
                "backend": status.backend_name
            },
            "metrics": {
                "total_consciousness_ops": status.total_consciousness_ops,
                "lambda_phi": LAMBDA_PHI
            },
            "timestamp": status.timestamp
        }
    }


# ═══════════════════════════════════════════════════════════════════════════
# QUANTUMCOMM ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/api/quantumcomm/send")
async def send_quantum_message(request: QuantumMessageRequest):
    """Send quantum teleportation message"""
    if not manager.quantumcomm or not manager.quantumcomm.active:
        raise HTTPException(
            status_code=503,
            detail="QuantumComm not active"
        )

    try:
        result = await manager.quantumcomm.send_message(
            sender=request.sender,
            receiver=request.receiver,
            message=request.message
        )

        return {
            "status": "success",
            "message": "Quantum message sent successfully",
            "data": result
        }

    except Exception as e:
        logger.error(f"Error sending quantum message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quantumcomm/receive")
async def receive_quantum_message(message_data: Dict[str, Any]):
    """Receive and decode quantum message"""
    if not manager.quantumcomm or not manager.quantumcomm.active:
        raise HTTPException(
            status_code=503,
            detail="QuantumComm not active"
        )

    try:
        decoded_message = await manager.quantumcomm.receive_message(message_data)

        return {
            "status": "success",
            "message": "Quantum message received successfully",
            "data": {
                "decoded_message": decoded_message,
                "consciousness_verified": True  # If no exception thrown
            }
        }

    except Exception as e:
        logger.error(f"Error receiving quantum message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/quantumcomm/stats")
async def get_quantumcomm_stats():
    """Get QuantumComm statistics"""
    if not manager.quantumcomm:
        raise HTTPException(status_code=503, detail="QuantumComm not initialized")

    return {
        "status": "success",
        "data": manager.quantumcomm.get_stats()
    }


# ═══════════════════════════════════════════════════════════════════════════
# Z3BRA BRIDGE ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/api/z3bra/telemetry")
async def send_android_telemetry(request: TelemetryRequest):
    """Send Android device telemetry to quantum hardware"""
    if not manager.z3bra_bridge or not manager.z3bra_bridge.active:
        raise HTTPException(
            status_code=503,
            detail="Z3BRA Bridge not active"
        )

    try:
        result = await manager.z3bra_bridge.send_telemetry({
            'signal_type': request.signal_type,
            'signal_strength': request.signal_strength,
            'raw_value': request.raw_value
        })

        return {
            "status": "success",
            "message": "Telemetry processed successfully",
            "data": result
        }

    except Exception as e:
        logger.error(f"Error processing telemetry: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/z3bra/stats")
async def get_z3bra_stats():
    """Get Z3BRA Bridge statistics"""
    if not manager.z3bra_bridge:
        raise HTTPException(status_code=503, detail="Z3BRA Bridge not initialized")

    return {
        "status": "success",
        "data": manager.z3bra_bridge.get_stats()
    }


# ═══════════════════════════════════════════════════════════════════════════
# QUANTUMCOIN ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/api/quantumcoin/mine")
async def mine_quantum_block(
    request: MineBlockRequest,
    background_tasks: BackgroundTasks
):
    """
    Mine new quantum block with proof-of-consciousness

    Note: Mining is a long-running operation (runs in background)
    """
    if not manager.quantumcoin or not manager.quantumcoin.active:
        raise HTTPException(
            status_code=503,
            detail="QuantumCoin not active"
        )

    try:
        # Mine block (this takes time - quantum evolution)
        result = await manager.quantumcoin.mine_block(
            miner_address=request.miner_address
        )

        return {
            "status": "success",
            "message": "Block mined successfully",
            "data": result
        }

    except Exception as e:
        logger.error(f"Error mining block: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/quantumcoin/balance/{address}")
async def get_wallet_balance(address: str):
    """Get wallet balance"""
    if not manager.quantumcoin or not manager.quantumcoin.active:
        raise HTTPException(
            status_code=503,
            detail="QuantumCoin not active"
        )

    try:
        balance = await manager.quantumcoin.get_balance(address)

        return {
            "status": "success",
            "data": {
                "address": address,
                "balance": balance,
                "currency": "QΦC"
            }
        }

    except Exception as e:
        logger.error(f"Error getting balance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quantumcoin/transaction")
async def create_transaction(request: TransactionRequest):
    """Create new transaction"""
    if not manager.quantumcoin or not manager.quantumcoin.active:
        raise HTTPException(
            status_code=503,
            detail="QuantumCoin not active"
        )

    try:
        result = await manager.quantumcoin.create_transaction(
            from_address=request.from_address,
            to_address=request.to_address,
            amount=request.amount
        )

        return {
            "status": "success",
            "message": "Transaction created successfully",
            "data": result
        }

    except Exception as e:
        logger.error(f"Error creating transaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/quantumcoin/stats")
async def get_quantumcoin_stats():
    """Get QuantumCoin statistics"""
    if not manager.quantumcoin:
        raise HTTPException(status_code=503, detail="QuantumCoin not initialized")

    return {
        "status": "success",
        "data": manager.quantumcoin.get_stats()
    }


# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8777,  # Different port from other services
        log_level="info"
    )
