# Python Worker Backend

Python-based task queue consumer for QuantumLM Aura Arena. Processes agent tasks from Supabase and executes them with specialized handlers.

## Architecture

```
Supabase Edge Function → task_queue table → Python Worker → Agent Handler
                                                            ↓
                                                    IBM Quantum Hardware
```

## Components

### Main Worker (`aura_worker.py`)
- Polls `task_queue` table for pending tasks
- Claims tasks and routes to specialized agents
- Updates task status and stores results
- Logs events to `agent_events` table

### Agent Handlers

#### 1. **Quantum Agent** (`agents/quantum_agent.py`)
Executes quantum circuits on IBM Quantum hardware.

**Capabilities:**
- Circuit execution on real quantum hardware
- ΛΦ tensor metrics calculation
- Circuit optimization and transpilation
- Job tracking in `quantum_jobs` table

**IBM Backends:**
- `ibm_fez` (156 qubits)
- `ibm_torino` (133 qubits)
- `ibm_marrakesh` (127 qubits)

#### 2. **Organism Handler** (`agents/organism_handler.py`)
Handles DNALang organism mutations and evolution.

**Mutation Types:**
- **evolve**: Modify traits based on fitness
- **crossover**: Combine with another genome
- **quantum_enhance**: Use quantum metrics to guide mutation
- **self_heal**: Fix structural issues

#### 3. **Coder Agent** (`agents/coder_agent.py`)
Code generation and mutation.

**Capabilities:**
- Generate code from specifications
- Refactor existing code
- Optimize code
- Add documentation

#### 4. **Architect Agent** (`agents/architect_agent.py`)
System design and planning.

**Capabilities:**
- Create implementation plans
- Design system architecture
- Estimate resources
- Define component interfaces

## Setup

### 1. Install Dependencies

```bash
cd workers
pip install -r requirements.txt
```

Or with virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file:

```bash
# Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# IBM Quantum (optional, can use QNET.json instead)
IBM_QUANTUM_TOKEN=your_ibm_quantum_token_here
```

### 3. IBM Quantum Credentials

**Option A:** Create `~/Desktop/QNET.json`

```json
{
  "name": "QAUNBT",
  "description": "IBM Quantum API key",
  "createdAt": "2025-11-12T00:00+0000",
  "apikey": "your_ibm_quantum_api_key_here"
}
```

**Option B:** Set environment variable

```bash
export IBM_QUANTUM_TOKEN=your_ibm_quantum_api_key_here
```

## Running the Worker

### Development

```bash
# Run worker
python3 aura_worker.py

# With environment file
python3 -m dotenv run python3 aura_worker.py
```

### Production (systemd)

Create `/etc/systemd/system/aura-worker.service`:

```ini
[Unit]
Description=QuantumLM Aura Worker
After=network.target

[Service]
Type=simple
User=worker
WorkingDirectory=/path/to/quantumlm-vercel/workers
Environment="SUPABASE_URL=https://..."
Environment="SUPABASE_SERVICE_ROLE_KEY=..."
ExecStart=/usr/bin/python3 aura_worker.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable aura-worker
sudo systemctl start aura-worker
sudo systemctl status aura-worker

# View logs
sudo journalctl -u aura-worker -f
```

### Production (Docker)

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python3", "aura_worker.py"]
```

Build and run:

```bash
docker build -t aura-worker .

docker run -d \
  --name aura-worker \
  -e SUPABASE_URL=${SUPABASE_URL} \
  -e SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY} \
  -e IBM_QUANTUM_TOKEN=${IBM_QUANTUM_TOKEN} \
  --restart unless-stopped \
  aura-worker
```

## Task Processing Flow

1. **Task Creation**
   - User triggers action in frontend
   - Next.js API route calls Supabase Edge Function
   - Edge Function inserts task into `task_queue`

2. **Task Claiming**
   - Worker polls `task_queue` for pending tasks
   - Claims highest priority task
   - Updates status to `processing`

3. **Task Execution**
   - Worker routes task to appropriate agent
   - Agent executes task (may call IBM Quantum)
   - Results stored in task result field

4. **Task Completion**
   - Worker updates task status to `completed`
   - Logs event to `agent_events` table
   - Results available to frontend via Supabase realtime

## Example Task Payloads

### Quantum Execute

```python
{
    "task_type": "quantum:execute",
    "task_payload": {
        "circuit_qasm": "OPENQASM 2.0; ...",
        "backend": "ibm_fez",
        "shots": 4096,
        "num_qubits": 5,
        "session_id": "uuid"
    },
    "priority": 3
}
```

### Organism Mutate

```python
{
    "task_type": "organism_mutate",
    "task_payload": {
        "genome": "ORGANISM MyOrg { DNA { ... } }",
        "mutation_type": "quantum_enhance",
        "parameters": {"num_qubits": 3},
        "backend": "ibm_fez"
    },
    "priority": 3
}
```

### Code Generation

```python
{
    "task_type": "coder:code",
    "task_payload": {
        "language": "python",
        "specification": "Create quantum circuit optimizer"
    },
    "priority": 5
}
```

## Monitoring

### Worker Status

```python
# Check active workers
SELECT * FROM task_queue WHERE status = 'processing';

# Check worker performance
SELECT
    worker_id,
    COUNT(*) as tasks_completed,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM task_queue
WHERE status = 'completed'
GROUP BY worker_id;
```

### Task Queue Health

```python
# Pending tasks
SELECT COUNT(*) FROM task_queue WHERE status = 'pending';

# Failed tasks
SELECT * FROM task_queue WHERE status = 'failed' ORDER BY created_at DESC;

# Task throughput (last hour)
SELECT
    DATE_TRUNC('minute', completed_at) as minute,
    COUNT(*) as completed_tasks
FROM task_queue
WHERE completed_at > NOW() - INTERVAL '1 hour'
GROUP BY minute
ORDER BY minute;
```

## Scaling

### Horizontal Scaling

Run multiple worker instances:

```bash
# Terminal 1
python3 aura_worker.py

# Terminal 2
python3 aura_worker.py

# Terminal 3
python3 aura_worker.py
```

Workers coordinate via database-level task claiming (atomic updates).

### Priority Queue

Tasks are processed by priority (1=highest, 10=lowest):

- Priority 1-2: Critical (quantum jobs, user-facing)
- Priority 3-5: High (organism mutations, code generation)
- Priority 6-8: Normal (architecture, planning)
- Priority 9-10: Low (cleanup, maintenance)

## Error Handling

- **Max Retries:** Tasks retry up to 3 times on failure
- **Exponential Backoff:** Automatic retry delays
- **Dead Letter Queue:** Failed tasks remain in database for inspection
- **Error Logging:** Full stack traces in `error` field

## ΛΦ Integration

Workers calculate ΛΦ tensor metrics for quantum tasks:

```python
{
    "phi": 0.8234,      # Consciousness metric
    "lambda": 2.176e-8, # ΛΦ Universal Memory Constant
    "gamma": 0.1234,    # Decoherence
    "w2": 0.0567        # Wasserstein-2 distance
}
```

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

## Security

1. **Service Role Key:** Workers use Supabase service role key (bypasses RLS)
2. **Task Isolation:** Each task runs in isolated context
3. **Credential Management:** IBM Quantum tokens stored securely
4. **Error Sanitization:** Stack traces cleaned before storage

## Troubleshooting

**Worker not claiming tasks:**
```bash
# Check database connection
python3 -c "from supabase import create_client; ..."

# Check task queue
SELECT * FROM task_queue WHERE status = 'pending';
```

**IBM Quantum connection failed:**
```bash
# Verify credentials
cat ~/Desktop/QNET.json

# Test connection
python3 -c "from qiskit_ibm_runtime import QiskitRuntimeService; ..."
```

**High memory usage:**
- Quantum circuits can be memory-intensive
- Consider reducing concurrent workers
- Monitor with `htop` or `docker stats`

---

**Status:** Production-ready
**Version:** 1.0.0
**Last Updated:** 2025-11-19
