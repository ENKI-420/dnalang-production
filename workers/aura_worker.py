#!/usr/bin/env python3
"""
============================================================================
Aura Worker - Python Task Queue Consumer
Processes agent tasks from Supabase task_queue table
============================================================================

This worker polls the task_queue table and dispatches tasks to specialized
agent handlers:
- architect: System design and planning
- coder: Code generation and mutation
- quantum: IBM Quantum circuit execution
- admin: Maintenance and monitoring
"""

import os
import sys
import json
import time
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent.parent))

try:
    from supabase import create_client, Client
    import httpx
except ImportError:
    print("ERROR: Missing dependencies. Install with:")
    print("pip install supabase httpx")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('aura_worker')

# Constants
LAMBDA_PHI = 2.176435e-8
WORKER_ID = f"worker_{os.getpid()}"
POLL_INTERVAL = 2  # seconds
MAX_RETRIES = 3

class AuraWorker:
    """Main worker class for processing Aura Arena tasks"""

    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize worker with Supabase connection"""
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.running = False
        logger.info(f"Initialized Aura Worker: {WORKER_ID}")

    def start(self):
        """Start worker main loop"""
        self.running = True
        logger.info("Starting Aura Worker...")

        try:
            while self.running:
                task = self.claim_next_task()

                if task:
                    self.process_task(task)
                else:
                    # No tasks available, sleep
                    time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            logger.info("Received shutdown signal")
            self.stop()
        except Exception as e:
            logger.error(f"Fatal error in worker: {e}", exc_info=True)
            self.stop()

    def stop(self):
        """Stop worker gracefully"""
        self.running = False
        logger.info("Aura Worker stopped")

    def claim_next_task(self) -> Optional[Dict[str, Any]]:
        """Claim next pending task from queue"""
        try:
            # Find highest priority pending task
            response = self.supabase.table('task_queue')\
                .select('*')\
                .eq('status', 'pending')\
                .lte('attempts', 'max_attempts')\
                .order('priority', desc=False)\
                .order('created_at', desc=False)\
                .limit(1)\
                .execute()

            if not response.data or len(response.data) == 0:
                return None

            task = response.data[0]
            task_id = task['task_id']

            # Claim task by updating status
            self.supabase.table('task_queue')\
                .update({
                    'status': 'processing',
                    'worker_id': WORKER_ID,
                    'started_at': datetime.utcnow().isoformat(),
                    'attempts': task['attempts'] + 1
                })\
                .eq('task_id', task_id)\
                .execute()

            logger.info(f"Claimed task {task_id}: {task['task_type']}")
            return task

        except Exception as e:
            logger.error(f"Error claiming task: {e}")
            return None

    def process_task(self, task: Dict[str, Any]):
        """Process a task based on its type"""
        task_id = task['task_id']
        task_type = task['task_type']
        task_payload = task['task_payload']

        logger.info(f"Processing task {task_id}: {task_type}")

        try:
            # Route to appropriate handler
            if task_type.startswith('architect:'):
                result = self.handle_architect_task(task)
            elif task_type.startswith('coder:'):
                result = self.handle_coder_task(task)
            elif task_type.startswith('quantum:'):
                result = self.handle_quantum_task(task)
            elif task_type == 'organism_mutate':
                result = self.handle_organism_mutation(task)
            else:
                raise ValueError(f"Unknown task type: {task_type}")

            # Mark task as completed
            self.supabase.table('task_queue')\
                .update({
                    'status': 'completed',
                    'result': result,
                    'completed_at': datetime.utcnow().isoformat()
                })\
                .eq('task_id', task_id)\
                .execute()

            logger.info(f"Task {task_id} completed successfully")

        except Exception as e:
            logger.error(f"Error processing task {task_id}: {e}", exc_info=True)

            # Mark task as failed
            self.supabase.table('task_queue')\
                .update({
                    'status': 'failed',
                    'error': str(e),
                    'completed_at': datetime.utcnow().isoformat()
                })\
                .eq('task_id', task_id)\
                .execute()

    def handle_architect_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Handle architect agent tasks (planning, design)"""
        task_type = task['task_type'].split(':', 1)[1]
        payload = task['task_payload']

        logger.info(f"Architect: {task_type}")

        # Import architect agent
        from workers.agents.architect_agent import ArchitectAgent
        agent = ArchitectAgent(self.supabase)

        if task_type == 'plan':
            return agent.create_plan(payload)
        elif task_type == 'design':
            return agent.create_design(payload)
        else:
            raise ValueError(f"Unknown architect task: {task_type}")

    def handle_coder_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Handle coder agent tasks (code generation, mutation)"""
        task_type = task['task_type'].split(':', 1)[1]
        payload = task['task_payload']

        logger.info(f"Coder: {task_type}")

        # Import coder agent
        from workers.agents.coder_agent import CoderAgent
        agent = CoderAgent(self.supabase)

        if task_type == 'code':
            return agent.generate_code(payload)
        elif task_type == 'mutate':
            return agent.mutate_code(payload)
        else:
            raise ValueError(f"Unknown coder task: {task_type}")

    def handle_quantum_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Handle quantum agent tasks (circuit execution)"""
        task_type = task['task_type'].split(':', 1)[1]
        payload = task['task_payload']

        logger.info(f"Quantum: {task_type}")

        # Import quantum agent
        from workers.agents.quantum_agent import QuantumAgent
        agent = QuantumAgent(self.supabase)

        if task_type == 'execute':
            return agent.execute_circuit(payload)
        elif task_type == 'optimize':
            return agent.optimize_circuit(payload)
        else:
            raise ValueError(f"Unknown quantum task: {task_type}")

    def handle_organism_mutation(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Handle organism mutation request"""
        payload = task['task_payload']

        logger.info("Processing organism mutation")

        # Import organism handler
        from workers.agents.organism_handler import OrganismHandler
        handler = OrganismHandler(self.supabase)

        return handler.mutate_organism(
            genome=payload['genome'],
            mutation_type=payload['mutation_type'],
            parameters=payload.get('parameters', {}),
            backend=payload.get('backend', 'ibm_fez')
        )


def main():
    """Main entry point"""
    # Get Supabase credentials from environment
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Use service role for worker

    if not supabase_url or not supabase_key:
        logger.error("Missing Supabase credentials!")
        logger.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
        sys.exit(1)

    # Create and start worker
    worker = AuraWorker(supabase_url, supabase_key)
    worker.start()


if __name__ == '__main__':
    main()
