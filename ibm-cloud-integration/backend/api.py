"""FastAPI Main Application for DNALang IBM Integration"""

import asyncio
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel
from contextlib import asynccontextmanager

from qiskit import QuantumCircuit

# Import modules
from config import settings, validate_config
from quantum import QiskitClient, QuantumOrchestrator, CircuitLibrary
from organisms import OrganismEvaluator, OrganismRegistry, OrganismIDEBackend
from storage import COSClient
from analytics import CostTracker, MetricsCollector
from collaboration import TeamManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instances
quantum_client = None
orchestrator = None
organism_registry = None
organism_evaluator = None
ide_backend = None
cos_client = None
cost_tracker = None
metrics_collector = None
team_manager = None

# WebSocket connections
websocket_connections: List[WebSocket] = []


# Pydantic models
class OrganismCreate(BaseModel):
    name: str
    dna_code: str
    author: str = "user"
    metadata: Optional[Dict[str, Any]] = None


class CircuitExecute(BaseModel):
    organism_id: str
    circuit_qasm: Optional[str] = None
    shots: int = 1024
    backend: Optional[str] = None


class JobSubmit(BaseModel):
    organism_id: str
    n_qubits: int = 5
    depth: int = 3
    shots: int = 1024
    priority: int = 0


class DNAValidate(BaseModel):
    dna_code: str


class TeamCreate(BaseModel):
    name: str
    owner_email: str
    owner_name: str


class MemberAdd(BaseModel):
    email: str
    name: str
    role: str = "developer"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global quantum_client, orchestrator, organism_registry, organism_evaluator
    global ide_backend, cos_client, cost_tracker, metrics_collector, team_manager

    # Startup
    logger.info("Starting DNALang IBM Integration API...")

    try:
        # Validate configuration
        validate_config()

        # Initialize components
        quantum_client = QiskitClient()
        orchestrator = QuantumOrchestrator()
        await orchestrator.initialize()

        organism_registry = OrganismRegistry()
        organism_evaluator = OrganismEvaluator()
        ide_backend = OrganismIDEBackend()
        cos_client = COSClient()
        cost_tracker = CostTracker()
        metrics_collector = MetricsCollector()
        team_manager = TeamManager()

        # Start orchestrator execution loop
        asyncio.create_task(orchestrator.execute_jobs())

        logger.info("API initialization complete")

    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down API...")
    if orchestrator:
        await orchestrator.shutdown()


# Create FastAPI app
app = FastAPI(
    title="DNALang IBM Quantum Integration",
    description="Quantum organism evolution platform with IBM Cloud integration",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "backend": quantum_client.backend.name if quantum_client and quantum_client.backend else "disconnected",
        "lambda_phi": settings.LAMBDA_PHI
    }


# Organism endpoints
@app.post("/organisms/create", response_model=Dict[str, Any])
async def create_organism(organism: OrganismCreate):
    """Create a new organism"""
    try:
        # Register organism
        organism_id = organism_registry.register_organism(
            name=organism.name,
            dna_code=organism.dna_code,
            author=organism.author,
            metadata=organism.metadata
        )

        # Compile to quantum circuit
        success, result = ide_backend.compile_to_quantum_circuit(organism.dna_code)

        if success:
            # Store circuit
            circuit_qasm = result.qasm()
            organism_registry.update_organism(organism_id, {
                'circuit_qasm': circuit_qasm
            })

            # Upload to COS if available
            if cos_client and cos_client.cos:
                cos_client.upload_organism(
                    organism_id,
                    organism_registry.get_organism(organism_id).to_dict()
                )

        # Track metrics
        metrics_collector.record_api_request('POST', '/organisms/create', 200, 0.1)

        return {
            "organism_id": organism_id,
            "success": True,
            "compiled": success,
            "message": "Organism created successfully"
        }

    except Exception as e:
        logger.error(f"Organism creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/organisms/{organism_id}")
async def get_organism(organism_id: str):
    """Get organism details"""
    organism = organism_registry.get_organism(organism_id)

    if not organism:
        raise HTTPException(status_code=404, detail="Organism not found")

    return organism.to_dict()


@app.get("/organisms")
async def list_organisms(
    limit: int = 10,
    min_fitness: Optional[float] = None
):
    """List organisms"""
    organisms = organism_registry.search_organisms(
        min_fitness=min_fitness
    )

    return {
        "organisms": [o.to_dict() for o in organisms[:limit]],
        "total": len(organisms)
    }


# Quantum execution endpoints
@app.post("/quantum/execute")
async def execute_quantum_circuit(request: CircuitExecute):
    """Execute quantum circuit"""
    try:
        # Get organism
        organism = organism_registry.get_organism(request.organism_id)
        if not organism:
            raise HTTPException(status_code=404, detail="Organism not found")

        # Get or create circuit
        if request.circuit_qasm:
            circuit = QuantumCircuit.from_qasm_str(request.circuit_qasm)
        elif organism.circuit_qasm:
            circuit = QuantumCircuit.from_qasm_str(organism.circuit_qasm)
        else:
            # Create default circuit
            circuit = CircuitLibrary.create_organism_consciousness_circuit(5)

        # Submit job to orchestrator
        job_id = await orchestrator.submit_job(
            organism_id=request.organism_id,
            circuit=circuit,
            shots=request.shots
        )

        # Track cost
        cost_estimate = quantum_client.estimate_cost(circuit, request.shots)
        cost_tracker.track_quantum_execution(
            job_id=job_id,
            organism_id=request.organism_id,
            backend=request.backend or settings.PRIMARY_BACKEND,
            runtime_seconds=cost_estimate.get('runtime_seconds', 0),
            shots=request.shots,
            circuit_depth=circuit.depth()
        )

        return {
            "job_id": job_id,
            "status": "submitted",
            "estimated_cost": cost_estimate.get('estimated_cost_usd', 0),
            "backend": quantum_client.backend.name if quantum_client.backend else "unknown"
        }

    except Exception as e:
        logger.error(f"Execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/quantum/job/{job_id}")
async def get_job_status(job_id: str):
    """Get quantum job status"""
    status = await orchestrator.get_job_status(job_id)

    if not status:
        raise HTTPException(status_code=404, detail="Job not found")

    return status


@app.get("/quantum/backends")
async def get_backends():
    """Get available quantum backends"""
    return quantum_client.get_available_backends()


# Evolution endpoints
@app.post("/evolution/evaluate/{organism_id}")
async def evaluate_organism(organism_id: str):
    """Evaluate organism fitness"""
    try:
        # Get latest quantum results
        evolution_history = await orchestrator.get_organism_evolution(organism_id, 1)

        if not evolution_history:
            return {
                "error": "No quantum execution history found"
            }

        latest = evolution_history[0]

        # Evaluate fitness
        evaluation = organism_evaluator.evaluate_fitness(
            organism_id=organism_id,
            quantum_results={
                'phi': latest.get('phi', 0),
                'lambda': latest.get('lambda', 0),
                'gamma': latest.get('gamma', 1),
                'entropy': 0,  # Would be calculated from results
                'coherence_index': latest.get('coherence_index', 0)
            },
            generation=latest.get('generation', 0)
        )

        # Update organism
        organism_registry.update_organism(organism_id, {
            'fitness': evaluation['total_fitness'],
            'consciousness_level': evaluation['quantum_metrics']['phi']
        })

        # Track metrics
        metrics_collector.record_organism_evolution(
            organism_id=organism_id,
            generation=latest.get('generation', 0),
            fitness=evaluation['total_fitness'],
            improvement=0  # Would track improvement over time
        )

        return evaluation

    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/evolution/evolve/{organism_id}")
async def evolve_organism(organism_id: str):
    """Evolve organism to next generation"""
    try:
        # Define mutations based on fitness
        mutations = {
            'gate_substitution': {'H': 'RY'},
            'parameter_shift': {'factor': 1.1}
        }

        # Create evolved organism
        evolved_id = organism_registry.evolve_organism(
            parent_id=organism_id,
            mutations=mutations,
            author="evolution"
        )

        if not evolved_id:
            raise HTTPException(status_code=400, detail="Evolution failed")

        return {
            "evolved_organism_id": evolved_id,
            "parent_id": organism_id,
            "mutations": mutations
        }

    except Exception as e:
        logger.error(f"Evolution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# IDE endpoints
@app.post("/ide/validate")
async def validate_dna(request: DNAValidate):
    """Validate DNALang syntax"""
    validation = ide_backend.validate_dna_syntax(request.dna_code)
    return validation


@app.get("/ide/autocomplete")
async def get_autocomplete(
    code: str,
    position: int
):
    """Get autocomplete suggestions"""
    suggestions = ide_backend.get_autocomplete_suggestions(code, position)
    return {"suggestions": suggestions}


@app.get("/ide/template/{template_type}")
async def get_template(template_type: str = "basic"):
    """Get DNALang template"""
    template = ide_backend.get_template(template_type)
    return {"template": template}


# Analytics endpoints
@app.get("/analytics/costs")
async def get_cost_analytics():
    """Get cost analytics"""
    return cost_tracker.get_cost_analytics()


@app.get("/analytics/metrics")
async def get_metrics():
    """Get system metrics"""
    return metrics_collector.export_metrics_report()


@app.get("/analytics/health")
async def get_system_health():
    """Get system health"""
    return metrics_collector.get_system_health()


# Team collaboration endpoints
@app.post("/teams/create")
async def create_team(team: TeamCreate):
    """Create a new team"""
    try:
        team_id = team_manager.create_team(
            name=team.name,
            owner_email=team.owner_email,
            owner_name=team.owner_name
        )

        return {
            "team_id": team_id,
            "success": True
        }

    except Exception as e:
        logger.error(f"Team creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/teams/{team_id}/members")
async def add_team_member(team_id: str, member: MemberAdd):
    """Add member to team"""
    try:
        from collaboration.team import Role

        role = Role[member.role.upper()]

        # TODO: Get actual adder ID from auth
        member_id = team_manager.add_member(
            team_id=team_id,
            email=member.email,
            name=member.name,
            role=role,
            added_by="system"  # Would be from auth
        )

        if not member_id:
            raise HTTPException(status_code=400, detail="Failed to add member")

        return {
            "member_id": member_id,
            "success": True
        }

    except Exception as e:
        logger.error(f"Member addition failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/teams/{team_id}/statistics")
async def get_team_statistics(team_id: str):
    """Get team statistics"""
    stats = team_manager.get_team_statistics(team_id)

    if not stats:
        raise HTTPException(status_code=404, detail="Team not found")

    return stats


# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates"""
    await websocket.accept()
    websocket_connections.append(websocket)

    try:
        while True:
            # Keep connection alive and handle messages
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get('type') == 'subscribe':
                # Handle subscription to specific events
                await websocket.send_json({
                    'type': 'subscribed',
                    'channel': message.get('channel')
                })

            elif message.get('type') == 'ping':
                await websocket.send_json({'type': 'pong'})

    except WebSocketDisconnect:
        websocket_connections.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in websocket_connections:
            websocket_connections.remove(websocket)


# Broadcast function for WebSocket updates
async def broadcast_update(update: Dict[str, Any]):
    """Broadcast update to all WebSocket connections"""
    for connection in websocket_connections:
        try:
            await connection.send_json(update)
        except:
            # Remove dead connections
            if connection in websocket_connections:
                websocket_connections.remove(connection)


# Export Prometheus metrics
@app.get("/metrics", response_class=Response)
async def get_prometheus_metrics():
    """Export Prometheus metrics"""
    metrics = metrics_collector.export_prometheus_metrics()
    return Response(content=metrics, media_type="text/plain")


# Main entry point
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=settings.API_HOST,
        port=settings.API_PORT,
        log_level="info"
    )