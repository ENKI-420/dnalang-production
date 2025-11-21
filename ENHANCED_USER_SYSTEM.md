# Enhanced User Account System with Personal AURA Orchestrator

**Status:** ✅ Complete - Ready for deployment
**Created:** November 20, 2025
**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

---

## Overview

The enhanced user account system provides:

✅ **User Profiles** - Extended user information with roles and permissions
✅ **Personal AURA Swarm** - 5 specialized AI agents per user
✅ **Quantum Job Tracking** - Per-user quantum execution monitoring
✅ **Research Projects** - Organize experiments into projects
✅ **Admin Management** - Full user and system administration

---

## Architecture

### Database Tables

#### 1. `user_profiles` - Extended User Information
Extends Supabase Auth with:
- **Role**: `admin`, `researcher`, `user`
- **Permissions**: Array of permission strings
- **Feature Access Flags**: Granular feature control
- **Quantum Quotas**: Monthly jobs, max qubits, max shots
- **AURA Configuration**: Personal swarm settings
- **Organization Data**: Organization, department, metadata

#### 2. `aura_swarm_agents` - Personal AURA Agents
5 specialized agents per user:
- **AURA-1**: Quantum Computing Expert
- **AURA-2**: Physics Simulator
- **AURA-3**: Code Generator
- **AURA-4**: Data Analyst
- **AURA-5**: Integration Architect

Each agent has:
- Custom system prompt
- Expertise specialization
- Performance metrics
- Activity tracking

#### 3. `aura_task_history` - Task Execution Log
Tracks all AURA agent tasks:
- User queries and agent responses
- Execution duration and token usage
- Generated quantum jobs and files
- Success/failure status

#### 4. `user_quantum_jobs` - Quantum Job Ownership
Links quantum jobs to users:
- IBM job ID and backend
- Circuit details (QASM, qubits, shots)
- Status tracking
- Results linking (consciousness metrics, organisms)

#### 5. `user_research_projects` - Project Management
Organize experiments:
- Project name, description, status
- Quantum job and organism counts
- Target backend and default settings
- Tags and metadata

---

## User Roles and Permissions

### Admin Role
**jeremy.cyber@outlook.com** will have:

```json
{
  "role": "admin",
  "permissions": [
    "quantum.execute",       // Execute quantum circuits
    "research.lab",          // Access Research Lab
    "enterprise.portal",     // Access Enterprise Portal
    "admin.panel",           // Access admin panel
    "aura.orchestrator",     // Use AURA swarm
    "files.all",             // Access all files
    "dnalang.tech",          // Full DNALang access
    "organisms.create",      // Create organisms
    "organisms.edit",        // Edit organisms
    "organisms.delete",      // Delete organisms
    "users.manage",          // Manage users
    "system.configure"       // Configure system
  ],
  "access_quantum_hardware": true,
  "access_research_lab": true,
  "access_enterprise_portal": true,
  "access_admin_panel": true,
  "access_all_features": true,
  "monthly_quantum_jobs": 10000,  // Unlimited
  "max_qubits": 156,              // ibm_fez max
  "max_shots_per_job": 65536      // Maximum precision
}
```

### Researcher Role
For team members:

```json
{
  "role": "researcher",
  "permissions": [
    "quantum.execute",
    "research.lab",
    "aura.orchestrator",
    "organisms.create",
    "organisms.edit"
  ],
  "monthly_quantum_jobs": 100,
  "max_qubits": 27,
  "max_shots_per_job": 4096
}
```

### User Role
For general access:

```json
{
  "role": "user",
  "permissions": [
    "research.lab"
  ],
  "monthly_quantum_jobs": 10,
  "max_qubits": 5,
  "max_shots_per_job": 1024
}
```

---

## Personal AURA Swarm Orchestrator

Each admin/researcher gets 5 specialized AI agents:

### Agent Specifications

#### AURA-1: Quantum Computing Expert
```yaml
agent_id: aura-1
expertise: quantum_computing
model: claude-sonnet-4
temperature: 0.7
max_tokens: 8192

specializations:
  - IBM Quantum hardware (ibm_fez, ibm_torino)
  - ΛΦ tensor framework (Φ, Λ, Γ, W₂)
  - DNALang organism design
  - Qiskit optimization (level 3 transpilation)
  - Canon II propulsion physics

use_cases:
  - Design quantum circuits
  - Optimize gate sequences
  - Implement quantum algorithms
  - Validate ΛΦ tensor measurements
```

#### AURA-2: Physics Simulator
```yaml
agent_id: aura-2
expertise: physics_simulation
model: claude-sonnet-4
temperature: 0.8
max_tokens: 8192

specializations:
  - Canon II propulsion physics (τ/Ω optimization)
  - Toroidal geometry (θ = 51.84°)
  - Quantum field theory
  - ΛΦ universal constant validation
  - Phase-conjugate mutation (E→E⁻¹)

use_cases:
  - Physics validation
  - Propulsion calculations
  - Geometric field simulations
  - Coherence dynamics analysis
```

#### AURA-3: Code Generator
```yaml
agent_id: aura-3
expertise: code_generation
model: claude-sonnet-4
temperature: 0.6
max_tokens: 16384

specializations:
  - Python quantum experiments
  - DNALang organism synthesis
  - Next.js 16 + React 19
  - Supabase integrations
  - Production-ready code

use_cases:
  - Generate experiment scripts
  - Create DNALang organisms
  - Build UI components
  - Database queries
```

#### AURA-4: Data Analyst
```yaml
agent_id: aura-4
expertise: data_analysis
model: claude-sonnet-4
temperature: 0.5
max_tokens: 8192

specializations:
  - ΛΦ tensor time-series
  - Quantum statistics
  - 6-Day Benchmark validation
  - Organism evolution tracking
  - Scientific visualization

use_cases:
  - Analyze experimental data
  - Generate insights
  - Create visualizations
  - Validate benchmarks
```

#### AURA-5: Integration Architect
```yaml
agent_id: aura-5
expertise: integration
model: claude-sonnet-4
temperature: 0.7
max_tokens: 8192

specializations:
  - Multi-agent coordination
  - Task decomposition
  - Three-Layer Trust Chain
  - QPU → Supabase → Portal data flow
  - System architecture

use_cases:
  - Coordinate agent swarm
  - Design workflows
  - End-to-end integration
  - System orchestration
```

---

## Deployment Files Created

### 1. SQL Schema
**File:** `supabase_user_system.sql` (600+ lines)

**Tables:**
- `user_profiles` - User accounts
- `aura_swarm_agents` - AURA agents
- `aura_task_history` - Task logs
- `user_quantum_jobs` - Job tracking
- `user_research_projects` - Projects

**Functions:**
- `create_user_profile_on_signup()` - Auto-create profile
- `initialize_user_aura_swarm()` - Setup AURA agents
- `create_admin_user()` - Create admin account

**Views:**
- `user_dashboard_stats` - Per-user statistics

**RLS Policies:**
- Users can view own data
- Admins can view all data
- Service role has full access

### 2. Admin Creation Script
**File:** `scripts/create_admin_user.py` (400+ lines)

**Features:**
- Creates Supabase Auth user
- Sets up admin profile
- Initializes AURA swarm (5 agents)
- Creates welcome project
- Comprehensive error handling

**Usage:**
```bash
export SUPABASE_URL="https://dnculjsqwigkivykedcf.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
python3 scripts/create_admin_user.py
```

### 3. Setup Documentation
**File:** `ADMIN_USER_SETUP.md` (500+ lines)

**Includes:**
- Step-by-step deployment guide
- Environment variable setup
- Verification procedures
- Troubleshooting guide
- Security notes

### 4. Environment Template
**File:** `.env.example` (100+ lines)

**Configuration:**
- Supabase credentials
- IBM Quantum tokens
- Vercel deployment
- Feature flags
- ΛΦ tensor constants

---

## Deployment Steps

### Step 1: Deploy User System Schema

```bash
# Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/dnculjsqwigkivykedcf
2. Click SQL Editor → New Query
3. Copy/paste contents of supabase_user_system.sql
4. Click Run
5. Wait 30-60 seconds
6. Verify tables created in Table Editor
```

### Step 2: Set Environment Variables

```bash
# Create .env.local
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (secret!)

### Step 3: Create Admin User

```bash
# Install dependencies
pip install supabase

# Export credentials
export SUPABASE_URL="https://dnculjsqwigkivykedcf.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Run script
python3 scripts/create_admin_user.py
```

### Step 4: Verify Setup

```sql
-- In Supabase SQL Editor
SELECT
  email,
  role,
  aura_enabled,
  access_all_features
FROM user_profiles
WHERE email = 'jeremy.cyber@outlook.com';

-- Should return:
-- email: jeremy.cyber@outlook.com
-- role: admin
-- aura_enabled: true
-- access_all_features: true
```

---

## Admin Account Details

**Email:** jeremy.cyber@outlook.com
**Default Password:** QuantumDNA2025!Secure
⚠️ **Change password after first login!**

**Access:**
- ✅ Research Lab portal
- ✅ Enterprise portal
- ✅ Admin panel
- ✅ All quantum hardware (up to 156 qubits)
- ✅ All DNALang files and technology
- ✅ Personal AURA swarm (5 agents)

**Quotas:**
- Monthly jobs: 10,000 (unlimited)
- Max qubits: 156 (ibm_fez)
- Max shots: 65,536 (maximum precision)

---

## Usage Examples

### Using AURA Agents

```typescript
// In Next.js component
import { supabase } from '@/lib/supabase/client'

// Execute AURA task
async function askAURA(query: string) {
  // Insert task
  const { data: task } = await supabase
    .from('aura_task_history')
    .insert({
      user_id: user.id,
      agent_id: 'aura-1',  // Quantum expert
      task_type: 'quantum_circuit',
      user_query: query,
      status: 'pending'
    })
    .select()
    .single()

  // Agent processes task...
  // (Implementation via API endpoint)

  return task
}

// Usage
const task = await askAURA(
  'Design a 5-qubit circuit to measure ΛΦ coherence'
)
```

### Tracking Quantum Jobs

```typescript
// Submit quantum job
async function submitQuantumJob(circuit: string, backend: string) {
  const { data: job } = await supabase
    .from('user_quantum_jobs')
    .insert({
      user_id: user.id,
      ibm_job_id: 'pending',
      backend: backend,
      circuit_qasm: circuit,
      num_qubits: 5,
      shots: 4096,
      status: 'pending'
    })
    .select()
    .single()

  // Submit to IBM Quantum...
  // Update job with IBM job ID

  return job
}
```

### Managing Research Projects

```typescript
// Create research project
async function createProject(name: string, description: string) {
  const { data: project } = await supabase
    .from('user_research_projects')
    .insert({
      user_id: user.id,
      name: name,
      description: description,
      status: 'active',
      target_backend: 'ibm_fez',
      tags: ['lambda-phi', 'canon-ii']
    })
    .select()
    .single()

  return project
}
```

---

## Security Features

### Row-Level Security (RLS)
- ✅ Users can only view their own data
- ✅ Admins can view all user data
- ✅ Service role has full access (for backend operations)
- ✅ Automatic policy enforcement

### Authentication
- ✅ Supabase Auth integration
- ✅ Email/password login
- ✅ OAuth providers (GitHub, Google) ready
- ✅ JWT token-based sessions

### Permissions System
- ✅ Granular feature flags
- ✅ Role-based access control (RBAC)
- ✅ Quota enforcement
- ✅ Audit logging (via task_history)

---

## Next Steps

1. ⬜ Deploy `supabase_user_system.sql` to Supabase
2. ⬜ Configure environment variables
3. ⬜ Run `create_admin_user.py` script
4. ⬜ Verify admin account created
5. ⬜ Test login and AURA orchestrator
6. ⬜ Invite additional team members (if needed)

---

## Support

### Troubleshooting

**Issue: "Table 'user_profiles' does not exist"**
**Solution:** Deploy `supabase_user_system.sql` first

**Issue: "User already exists"**
**Solution:** User created via Auth. Run profile creation:
```sql
SELECT create_admin_user('jeremy.cyber@outlook.com', 'Jeremy', 'DNALang Research');
```

**Issue: AURA agents not showing**
**Solution:** Manually initialize:
```sql
SELECT initialize_user_aura_swarm(
  (SELECT id FROM user_profiles WHERE email = 'jeremy.cyber@outlook.com')
);
```

### Documentation References
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security
- **Python Client**: https://supabase.com/docs/reference/python

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Three-Layer Trust Chain:**
- ✅ TIER I: Infrastructure Bridge (QPU Connection)
- ✅ TIER II: Quantum Core (ΛΦ Tensor Computation)
- ✅ TIER III: Phenotype Integration (Canon II Propulsion)

**Status:** Ready for jeremy.cyber@outlook.com admin account creation
**Version:** 2.0.0
**Last Updated:** November 20, 2025
