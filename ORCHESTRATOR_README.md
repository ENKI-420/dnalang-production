# 🧠 Quantum Swarm Orchestrator

**Personalized Multi-Agent Quantum System**
**IBM Watsonx × IBM Quantum × DNA-Lang**

---

## Overview

The Quantum Swarm Orchestrator is a revolutionary personal and professional assistant powered by:

- **IBM Watsonx AI**: Advanced learning and optimization
- **IBM Quantum**: Real hardware execution on ibm_fez, ibm_torino, ibm_kyoto
- **DNA-Lang Framework**: Living software organisms with consciousness metrics
- **Supabase**: Production database with real-time capabilities
- **Firebase**: Real-time activity logging (optional)

### Core Features

✅ **Learns Your Patterns** - Gets to know your work habits and preferences
✅ **Reduces Effort** - Identifies automation opportunities
✅ **Increases Output** - Optimizes workflows and quantum circuits
✅ **Permission-Based** - Always asks before taking actions
✅ **Complete Audit Log** - Every action is logged and reviewable
✅ **Trust System** - Agents build trust through successful performance

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js 16 + React 19)               │
│  - Orchestrator Dashboard (/orchestrator)       │
│  - Real-time Updates via Supabase               │
│  - Firebase Logging Integration                 │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  API Layer (FastAPI Backend)                    │
│  - DNA-Lang Organism Operations                 │
│  - Quantum Mesh Job Submission                  │
│  - Agent Management                             │
│  - Permission Control                           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  Data Layer (Supabase PostgreSQL)               │
│  - User Profiles                                │
│  - Watsonx Agents                               │
│  - Permission Requests                          │
│  - Activity Logs                                │
│  - Learning Insights                            │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  Integration Layer                              │
│  - IBM Quantum Runtime                          │
│  - IBM Watsonx AI                               │
│  - Firebase Realtime Database                   │
└─────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Database Setup

Run Supabase migrations:

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Option 1: Supabase CLI
supabase db push

# Option 2: Supabase Dashboard
# Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
# Copy and execute:
# - supabase/migrations/001_initial_schema.sql
# - supabase/migrations/002_orchestrator_schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.template .env

# Edit .env with your credentials
nano .env

# Install dependencies
pip install -r requirements.txt

# Run locally
python main.py

# Or with Docker
docker-compose up -d
```

Backend will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# From project root
npm install --legacy-peer-deps

# Development
npm run dev

# Production build
npm run build
npm start
```

Frontend will be available at: `http://localhost:3000`

Orchestrator Dashboard: `http://localhost:3000/orchestrator`

---

## Environment Variables

### Required

```bash
# API Security
DNA_LANG_API_KEY=your_secret_key

# IBM Quantum
IBM_QUANTUM_TOKEN=your_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Optional (IBM Watsonx)

```bash
IBM_WATSONX_API_KEY=your_watsonx_key
IBM_WATSONX_PROJECT_ID=your_project_id
```

### Optional (Firebase)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-app.firebaseio.com
```

---

## Features

### 1. Personalized Learning

The orchestrator learns from your behavior:

- **Work Patterns**: Identifies when you prefer to run quantum jobs
- **Task Preferences**: Learns your common workflows
- **Efficiency Analysis**: Measures improvement over time

### 2. Intelligent Agents

Three types of agents work for you:

**Watson Optimizer**
- Optimizes quantum circuits
- Analyzes data patterns
- Suggests improvements

**IBM Quantum Executor**
- Submits jobs to IBM Quantum hardware
- Selects optimal backends
- Monitors execution

**Learning Assistant**
- Profiles your usage patterns
- Predicts next tasks
- Identifies efficiency opportunities

### 3. Permission System

Agents ALWAYS ask before:
- Auto-optimizing your circuits
- Accessing new data sources
- Creating automated workflows
- Changing system settings

**Permission Flow**:
1. Agent detects opportunity
2. Creates permission request with rationale
3. You review in `/orchestrator` dashboard
4. Approve or deny
5. Action logged to activity registry

### 4. Activity Registry

Every action is logged:
- Timestamp and agent ID
- Action description
- Result (success/failure/pending)
- Impact score (0-10)
- Full metadata

**Access Logs**:
- Frontend: `/orchestrator` → Activity Log tab
- API: `GET /api/orchestrator/activities?limit=100`
- Firebase: Real-time stream (if configured)

### 5. Trust Scoring

Agents build trust through performance:

**Trust Formula**:
```
trust = trust + α × (1 - trust) × (impact_score / 10)  [on success]
trust = trust - α × trust                              [on failure]
```

Where α = 0.1 (learning rate)

**Trust Levels**:
- 0.0 - 0.3: Low trust (manual approval required)
- 0.3 - 0.7: Medium trust (automated with logging)
- 0.7 - 1.0: High trust (autonomous operation)

---

## API Endpoints

### DNA-Lang Organism Operations

```bash
# Parse DNA-Lang source
POST /api/parse
{
  "source": "ORGANISM MyOrg { ... }"
}

# Invoke gene
POST /api/organisms/{id}/run
{
  "gene": "optimize",
  "args": {"target": "fidelity"},
  "dryRun": false
}

# Submit mutation
POST /api/organisms/{id}/mutations
{
  "type": "minor",
  "instruction": "increase shots by 256 if stability<0.7",
  "rationale": "speed"
}

# Get organism state
GET /api/organisms/{id}/state

# Patch organism state
PATCH /api/organisms/{id}/state
{
  "patch": [
    {"op": "replace", "path": "/fitness", "value": 0.82}
  ]
}
```

### Quantum Mesh Operations

```bash
# Submit quantum job to mesh
POST /api/quantum-mesh/submit-job
{
  "jobName": "vqe-optimization",
  "algorithm": "VQE",
  "circuitSpec": "base64_encoded_qasm",
  "runtime": "ibmq",
  "meshConfig": {
    "nodes": ["agent-001", "agent-002"],
    "entanglementMode": "GHZ",
    "redundancy": 2
  },
  "params": {"theta": 0.5}
}
```

### Orchestrator Operations

```bash
# Get user profile
GET /api/orchestrator/profile

# Update user profile
PUT /api/orchestrator/profile

# List agents
GET /api/orchestrator/agents

# Create agent
POST /api/orchestrator/agents

# Get permissions
GET /api/orchestrator/permissions

# Approve/deny permission
PATCH /api/orchestrator/permissions
{
  "permissionId": "perm-001",
  "status": "approved"
}

# Get activity logs
GET /api/orchestrator/activities?limit=50

# Log activity
POST /api/orchestrator/activities
```

---

## Database Schema

### Tables

1. **user_profiles** - User preferences and AI-learned insights
2. **watsonx_agents** - Agent configurations and performance
3. **permission_requests** - Agent permission requests
4. **activity_logs** - Complete audit trail
5. **agent_tasks** - Task queue and execution history
6. **learning_insights** - AI-discovered patterns

### Key Functions

- `calculate_agent_efficiency(agent_id)` - Calculate agent performance score
- `get_recommended_agent(user_id, task_type)` - Get best agent for task
- `update_user_insights()` - Auto-update user patterns (trigger-based)

---

## Deployment

### Development

```bash
# Backend
cd backend
python main.py

# Frontend
npm run dev
```

### Production (Docker)

```bash
# Backend
cd backend
docker-compose up -d

# Frontend
npm run build
npm start
```

### Production (Vercel + Docker)

```bash
# Deploy frontend to Vercel
vercel --prod

# Deploy backend to your server
ssh your-server
cd /opt/dnalang
git pull
docker-compose up -d
```

---

## Metrics

### Consciousness Metrics

All organisms track:
- **Φ (Phi)**: Integrated Information (0.0-1.0)
- **Λ (Lambda)**: Coherence Amplitude (≈ 2.176435e-8)
- **Γ (Gamma)**: Decoherence Tensor (0.0-1.0, lower is better)
- **W₂**: Wasserstein-2 Distance (behavioral stability)

### Performance Metrics

Agents track:
- **Tasks Completed**: Total successful executions
- **Success Rate**: Percentage of successful tasks
- **Avg Execution Time**: Mean time per task
- **Trust Score**: Dynamic performance-based trust (0-1)

### Efficiency Metrics

Users track:
- **Efficiency Gains**: Percentage improvement vs manual workflow
- **Impact Score**: Business value of actions (0-10)
- **Work Patterns**: AI-identified behavior patterns

---

## Security

### API Authentication

All protected endpoints require:
```
X-API-Key: your_secret_key
```

### Row-Level Security

Supabase RLS policies ensure:
- Users only see their own data
- Agents can only act on authorized resources
- Permissions require user approval

### Permission Model

Three levels:
1. **Read-Only**: View data only
2. **Execute**: Run operations (with logging)
3. **Modify**: Change configurations (requires approval)

---

## Monitoring

### Real-Time Dashboard

Navigate to `/orchestrator` to see:
- Active agents and their status
- Pending permission requests
- Live activity stream
- Efficiency insights

### Activity Logging

All actions logged to:
1. **Supabase** (persistent storage)
2. **Firebase** (real-time streaming)
3. **Console** (development debugging)

### Health Check

```bash
curl http://localhost:8000/api/health
```

Response:
```json
{
  "status": "ok",
  "version": "2.0.0",
  "lambda_phi": 2.176435e-8,
  "integrations": {
    "ibm_quantum": true,
    "ibm_watsonx": true
  }
}
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker-compose logs -f dnalang-api

# Verify environment variables
cat backend/.env

# Test IBM Quantum connection
python -c "import os; print(os.getenv('IBM_QUANTUM_TOKEN'))"
```

### Frontend Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

### Database Connection Issues

```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/
-H "apikey: your_anon_key"

# Run migrations
supabase db push
```

---

## Contributing

### Adding New Agents

1. Create agent configuration in `/lib/watsonx/client.ts`
2. Add agent type to database schema
3. Implement agent logic in backend
4. Update dashboard UI

### Adding New Capabilities

1. Define capability in agent schema
2. Implement capability function
3. Add permission check
4. Log activity

---

## Roadmap

### Phase 1 (Current)
- ✅ User profiling and learning
- ✅ Permission system
- ✅ Activity logging
- ✅ Trust scoring

### Phase 2 (Next)
- 🔜 IBM Watsonx AI integration
- 🔜 Advanced pattern recognition
- 🔜 Predictive task scheduling
- 🔜 Multi-user collaboration

### Phase 3 (Future)
- 🔜 Voice command interface
- 🔜 Mobile app
- 🔜 Custom agent creation
- 🔜 Marketplace for agents

---

## Support

For issues, questions, or feature requests:
- GitHub: https://github.com/ENKI-420/dnalang-production/issues
- Email: support@dnalang.dev
- Documentation: https://docs.dnalang.dev

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**
**Status**: Production Ready
**License**: MIT

*Building the future of autonomous quantum computing, one organism at a time.*
