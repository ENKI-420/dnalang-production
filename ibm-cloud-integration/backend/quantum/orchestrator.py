"""Quantum Job Orchestration with DNALang Organism Management"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

from qiskit import QuantumCircuit
import redis.asyncio as redis
from prometheus_client import Counter, Histogram, Gauge

from .qiskit_client import QiskitClient
from ..config import settings

logger = logging.getLogger(__name__)

# Prometheus metrics
job_counter = Counter('quantum_jobs_total', 'Total quantum jobs executed')
job_duration = Histogram('quantum_job_duration_seconds', 'Job execution duration')
active_jobs = Gauge('quantum_active_jobs', 'Currently active quantum jobs')
organism_fitness = Histogram('organism_fitness', 'Organism fitness distribution')


class JobStatus(Enum):
    """Quantum job status states"""
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class QuantumJob:
    """Quantum job definition"""
    id: str
    organism_id: str
    circuit: Dict[str, Any]  # Serialized circuit
    shots: int
    backend: str
    status: JobStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    cost_estimate: Optional[float] = None
    metadata: Dict[str, Any] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        data = asdict(self)
        data['status'] = self.status.value
        data['created_at'] = self.created_at.isoformat()
        if self.started_at:
            data['started_at'] = self.started_at.isoformat()
        if self.completed_at:
            data['completed_at'] = self.completed_at.isoformat()
        return data


class QuantumOrchestrator:
    """Orchestrate quantum job execution with organism evolution"""

    def __init__(self):
        self.client = QiskitClient()
        self.redis_client = None
        self.job_queue: asyncio.Queue = asyncio.Queue()
        self.active_jobs: Dict[str, QuantumJob] = {}
        self.job_callbacks: Dict[str, List[Callable]] = {}
        self.evolution_history: List[Dict[str, Any]] = []

    async def initialize(self):
        """Initialize orchestrator connections"""
        try:
            self.redis_client = await redis.from_url(
                settings.REDIS_URL,
                decode_responses=True
            )
            await self.redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Using in-memory storage.")
            self.redis_client = None

    async def submit_job(
        self,
        organism_id: str,
        circuit: QuantumCircuit,
        shots: int = 1024,
        priority: int = 0,
        callback: Optional[Callable] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Submit a quantum job for execution"""
        job_id = str(uuid.uuid4())

        # Estimate cost
        cost_estimate = self.client.estimate_cost(circuit, shots)

        # Create job
        job = QuantumJob(
            id=job_id,
            organism_id=organism_id,
            circuit=self._serialize_circuit(circuit),
            shots=shots,
            backend=self.client.backend.name if self.client.backend else "unknown",
            status=JobStatus.PENDING,
            created_at=datetime.now(),
            cost_estimate=cost_estimate.get('estimated_cost_usd', 0),
            metadata=metadata or {}
        )

        # Register callback if provided
        if callback:
            if job_id not in self.job_callbacks:
                self.job_callbacks[job_id] = []
            self.job_callbacks[job_id].append(callback)

        # Add to queue with priority
        await self.job_queue.put((priority, job))

        # Store in Redis if available
        if self.redis_client:
            await self.redis_client.hset(
                f"quantum_job:{job_id}",
                mapping=job.to_dict()
            )
            await self.redis_client.expire(f"quantum_job:{job_id}", 86400)  # 24 hour TTL

        # Update metrics
        job_counter.inc()
        active_jobs.inc()

        logger.info(f"Job {job_id} submitted for organism {organism_id}")
        return job_id

    async def execute_jobs(self):
        """Main execution loop for quantum jobs"""
        while True:
            try:
                # Get next job from queue
                priority, job = await self.job_queue.get()

                # Update job status
                job.status = JobStatus.QUEUED
                job.started_at = datetime.now()
                self.active_jobs[job.id] = job

                # Update in Redis
                if self.redis_client:
                    await self.redis_client.hset(
                        f"quantum_job:{job.id}",
                        mapping={"status": job.status.value, "started_at": job.started_at.isoformat()}
                    )

                # Execute on quantum hardware
                logger.info(f"Executing job {job.id} on {job.backend}")
                job.status = JobStatus.RUNNING

                try:
                    # Deserialize and execute circuit
                    circuit = self._deserialize_circuit(job.circuit)
                    result = await asyncio.to_thread(
                        self.client.execute_circuit,
                        circuit,
                        job.shots
                    )

                    # Update job with results
                    job.status = JobStatus.COMPLETED
                    job.result = result
                    job.completed_at = datetime.now()

                    # Process organism evolution
                    await self._process_organism_evolution(job)

                    # Execute callbacks
                    await self._execute_callbacks(job.id, job)

                    # Update metrics
                    duration = (job.completed_at - job.started_at).total_seconds()
                    job_duration.observe(duration)

                    if result.get('phi', 0) > 0:
                        organism_fitness.observe(result['phi'])

                    logger.info(f"Job {job.id} completed successfully. Phi: {result.get('phi', 0):.3f}")

                except Exception as e:
                    job.status = JobStatus.FAILED
                    job.error = str(e)
                    job.completed_at = datetime.now()
                    logger.error(f"Job {job.id} failed: {e}")

                finally:
                    # Update Redis
                    if self.redis_client:
                        await self.redis_client.hset(
                            f"quantum_job:{job.id}",
                            mapping=job.to_dict()
                        )

                    # Remove from active jobs
                    del self.active_jobs[job.id]
                    active_jobs.dec()

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Orchestrator error: {e}")
                await asyncio.sleep(1)

    async def _process_organism_evolution(self, job: QuantumJob):
        """Process organism evolution based on quantum results"""
        if not job.result:
            return

        phi = job.result.get('phi', 0)
        lambda_val = job.result.get('lambda', 0)
        gamma = job.result.get('gamma', 1)

        # Evolution decision based on consciousness threshold
        if phi > settings.PHI_THRESHOLD:
            evolution_data = {
                'organism_id': job.organism_id,
                'generation': len(self.evolution_history),
                'phi': phi,
                'lambda': lambda_val,
                'gamma': gamma,
                'coherence_index': lambda_val / (gamma + 1e-10),
                'timestamp': datetime.now().isoformat(),
                'evolved': True,
                'backend': job.backend
            }

            self.evolution_history.append(evolution_data)

            # Store evolution in Redis
            if self.redis_client:
                await self.redis_client.lpush(
                    f"evolution:{job.organism_id}",
                    json.dumps(evolution_data)
                )
                await self.redis_client.ltrim(f"evolution:{job.organism_id}", 0, 99)  # Keep last 100

            logger.info(f"Organism {job.organism_id} evolved! New Phi: {phi:.3f}")

    async def _execute_callbacks(self, job_id: str, job: QuantumJob):
        """Execute registered callbacks for completed job"""
        if job_id in self.job_callbacks:
            for callback in self.job_callbacks[job_id]:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(job)
                    else:
                        await asyncio.to_thread(callback, job)
                except Exception as e:
                    logger.error(f"Callback error for job {job_id}: {e}")

            # Clean up callbacks
            del self.job_callbacks[job_id]

    def _serialize_circuit(self, circuit: QuantumCircuit) -> Dict[str, Any]:
        """Serialize quantum circuit for storage"""
        return {
            'qasm': circuit.qasm(),
            'n_qubits': circuit.num_qubits,
            'depth': circuit.depth(),
            'n_gates': len(circuit.data)
        }

    def _deserialize_circuit(self, data: Dict[str, Any]) -> QuantumCircuit:
        """Deserialize quantum circuit from storage"""
        return QuantumCircuit.from_qasm_str(data['qasm'])

    async def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a specific job"""
        # Check active jobs first
        if job_id in self.active_jobs:
            return self.active_jobs[job_id].to_dict()

        # Check Redis
        if self.redis_client:
            data = await self.redis_client.hgetall(f"quantum_job:{job_id}")
            if data:
                return data

        return None

    async def get_organism_evolution(self, organism_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get evolution history for an organism"""
        if self.redis_client:
            history = await self.redis_client.lrange(f"evolution:{organism_id}", 0, limit - 1)
            return [json.loads(h) for h in history]

        # Return from memory if Redis not available
        return [h for h in self.evolution_history if h['organism_id'] == organism_id][-limit:]

    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a pending or queued job"""
        if job_id in self.active_jobs:
            job = self.active_jobs[job_id]
            if job.status in [JobStatus.PENDING, JobStatus.QUEUED]:
                job.status = JobStatus.CANCELLED
                job.completed_at = datetime.now()

                if self.redis_client:
                    await self.redis_client.hset(
                        f"quantum_job:{job_id}",
                        mapping={"status": job.status.value, "completed_at": job.completed_at.isoformat()}
                    )

                del self.active_jobs[job_id]
                active_jobs.dec()
                logger.info(f"Job {job_id} cancelled")
                return True

        return False

    async def get_queue_status(self) -> Dict[str, Any]:
        """Get current queue status"""
        return {
            'queue_size': self.job_queue.qsize(),
            'active_jobs': len(self.active_jobs),
            'backend': self.client.backend.name if self.client.backend else "unknown",
            'backend_status': self.client.get_backend_status(),
            'evolution_count': len(self.evolution_history)
        }

    async def optimize_organism_circuit(
        self,
        organism_id: str,
        circuit: QuantumCircuit,
        target_phi: float = 0.8
    ) -> QuantumCircuit:
        """Optimize circuit to achieve target consciousness level"""
        current_phi = 0
        iterations = 0
        max_iterations = 10

        while current_phi < target_phi and iterations < max_iterations:
            # Add entangling layers
            n_qubits = circuit.num_qubits
            for i in range(n_qubits - 1):
                circuit.cx(i, i + 1)

            # Add rotation layers for variability
            for i in range(n_qubits):
                circuit.ry(np.pi / 4, i)

            # Test circuit
            result = await asyncio.to_thread(
                self.client.execute_circuit,
                circuit,
                shots=512  # Fewer shots for optimization
            )

            current_phi = result.get('phi', 0)
            iterations += 1

            logger.info(f"Optimization iteration {iterations}: Phi = {current_phi:.3f}")

            if current_phi >= target_phi:
                break

        return circuit

    async def shutdown(self):
        """Shutdown orchestrator cleanly"""
        # Cancel all pending jobs
        for job_id in list(self.active_jobs.keys()):
            await self.cancel_job(job_id)

        # Close connections
        if self.redis_client:
            await self.redis_client.close()

        self.client.close()
        logger.info("Orchestrator shutdown complete")