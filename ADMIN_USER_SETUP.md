# Admin User Setup Guide

**Purpose:** Create jeremy.cyber@outlook.com with full admin privileges and personal AURA swarm orchestrator

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

---

## Prerequisites

1. ✅ Supabase project created: `dnculjsqwigkivykedcf`
2. ✅ Base schema deployed (supabase_schema.sql)
3. ⬜ User system schema deployed (supabase_user_system.sql)
4. ⬜ Admin user created

---

## Step 1: Deploy User System Schema

### Via Supabase Dashboard (Recommended)

1. Open: https://supabase.com/dashboard/project/dnculjsqwigkivykedcf

2. Click **SQL Editor** in left sidebar

3. Click **New Query**

4. Copy contents of `supabase_user_system.sql`

5. Paste into editor

6. Click **Run** (or Ctrl+Enter)

7. Wait for completion (30-60 seconds)

8. Verify tables created:
   - Go to **Table Editor**
   - Should see 5 new tables:
     - `user_profiles`
     - `aura_swarm_agents`
     - `aura_task_history`
     - `user_quantum_jobs`
     - `user_research_projects`

---

## Step 2: Set Environment Variables

Create `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dnculjsqwigkivykedcf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Service Role Key (KEEP SECRET - Server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# IBM Quantum (Optional - for direct hardware access)
IBM_QUANTUM_TOKEN=your_ibm_quantum_token_here
```

### Get Supabase Keys

1. Go to: https://supabase.com/dashboard/project/dnculjsqwigkivykedcf/settings/api

2. Copy:
   - **URL**: `https://dnculjsqwigkivykedcf.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (secret!)

3. Paste into `.env.local`

---

## Step 3: Install Python Dependencies

```bash
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Install Supabase Python client
pip install supabase

# Or if using virtual environment
source .venv/bin/activate
pip install supabase
```

---

## Step 4: Run Admin User Creation Script

```bash
# Export environment variables
export SUPABASE_URL="https://dnculjsqwigkivykedcf.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Run script
python3 scripts/create_admin_user.py
```

Expected output:

```
================================================================================
DNALang Quantum Research Platform - Admin User Setup
================================================================================

Target Email: jeremy.cyber@outlook.com
Display Name: Jeremy Chen
Organization: DNALang Quantum Research

ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

📝 Creating auth user: jeremy.cyber@outlook.com
✅ Auth user created: 8f7e6d5c-4b3a-2c1d-0e9f-8g7h6i5j4k3l

🔐 Creating admin profile...
✅ Admin profile created with full privileges

🤖 Initializing personal AURA swarm orchestrator...
   ✓ Created Quantum Computing Expert (aura-1)
   ✓ Created Physics Simulator (aura-2)
   ✓ Created Code Generator (aura-3)
   ✓ Created Data Analyst (aura-4)
   ✓ Created Integration Architect (aura-5)
✅ AURA swarm orchestrator initialized (5 agents)

📊 Creating welcome research project...
✅ Welcome project created

================================================================================
✅ ADMIN USER SETUP COMPLETE
================================================================================

User ID: 8f7e6d5c-4b3a-2c1d-0e9f-8g7h6i5j4k3l
Email: jeremy.cyber@outlook.com
Password: QuantumDNA2025!Secure

⚠️  IMPORTANT: Change password after first login!

Access granted to:
  ✓ All quantum hardware (up to 156 qubits)
  ✓ Research Lab portal
  ✓ Enterprise portal
  ✓ Admin panel
  ✓ All DNALang files and technology
  ✓ Personal AURA swarm orchestrator (5 agents)

Login at: https://app.dnculjsqwigkivykedcf.supabase.co/auth/login

Your AURA agents are ready:
  1. Quantum Computing Expert (aura-1) - quantum_computing
  2. Physics Simulator (aura-2) - physics_simulation
  3. Code Generator (aura-3) - code_generation
  4. Data Analyst (aura-4) - data_analysis
  5. Integration Architect (aura-5) - integration

================================================================================
```

---

## Step 5: Verify Admin Access

### Method 1: Query Supabase Directly

In Supabase SQL Editor:

```sql
-- Check user profile
SELECT
  email,
  display_name,
  role,
  permissions,
  access_all_features,
  aura_enabled
FROM user_profiles
WHERE email = 'jeremy.cyber@outlook.com';

-- Check AURA agents
SELECT
  agent_id,
  agent_name,
  expertise,
  is_active
FROM aura_swarm_agents
WHERE user_id = (
  SELECT id FROM user_profiles WHERE email = 'jeremy.cyber@outlook.com'
);

-- Check dashboard stats
SELECT * FROM user_dashboard_stats
WHERE email = 'jeremy.cyber@outlook.com';
```

### Method 2: Test Login

1. Go to: https://quantumlm-vercel-d996hiq5a-dnalang-67efe71c.vercel.app/auth/login

2. Enter:
   - Email: `jeremy.cyber@outlook.com`
   - Password: `QuantumDNA2025!Secure`

3. After login, verify access to:
   - ✅ Research Lab (`/portals/enterprise?view=research-lab`)
   - ✅ Enterprise Portal (`/portals/enterprise`)
   - ✅ Admin Panel (`/admin`)
   - ✅ AURA Orchestrator (`/aura-ultimate`)

---

## Personal AURA Swarm Orchestrator

Jeremy's personal AURA agents are specialized for quantum research:

### AURA-1: Quantum Computing Expert
- **Expertise**: IBM Quantum hardware, ΛΦ tensor framework, DNALang
- **Model**: claude-sonnet-4
- **Use for**: Circuit design, quantum algorithm implementation

### AURA-2: Physics Simulator
- **Expertise**: Canon II propulsion physics, quantum field theory
- **Model**: claude-sonnet-4
- **Use for**: Physics validation, τ/Ω optimization

### AURA-3: Code Generator
- **Expertise**: Python, DNALang, Next.js, Supabase
- **Model**: claude-sonnet-4
- **Use for**: Experiment scripts, organism synthesis

### AURA-4: Data Analyst
- **Expertise**: ΛΦ tensor analysis, time-series, visualization
- **Model**: claude-sonnet-4
- **Use for**: Data insights, benchmark validation

### AURA-5: Integration Architect
- **Expertise**: Multi-agent coordination, system design
- **Model**: claude-sonnet-4
- **Use for**: Workflow orchestration, end-to-end integration

---

## Permissions Granted

```json
{
  "permissions": [
    "quantum.execute",       // Execute quantum circuits on IBM hardware
    "research.lab",          // Access Research Lab portal
    "enterprise.portal",     // Access Enterprise portal
    "admin.panel",           // Access admin configuration
    "aura.orchestrator",     // Use personal AURA swarm
    "files.all",             // Access all project files
    "dnalang.tech",          // Full DNALang technology access
    "organisms.create",      // Create quantum organisms
    "organisms.edit",        // Modify organisms
    "organisms.delete",      // Delete organisms
    "users.manage",          // Manage other users (admin)
    "system.configure"       // Configure system settings (admin)
  ],
  "quotas": {
    "monthly_quantum_jobs": 10000,    // Unlimited
    "max_qubits": 156,                // ibm_fez maximum
    "max_shots_per_job": 65536        // Maximum precision
  }
}
```

---

## Next Steps

1. **Change Password**: Update default password after first login

2. **Deploy Supabase Schema**: If not already done:
   ```bash
   # Deploy base schema
   Run supabase_schema.sql in SQL Editor

   # Deploy user system
   Run supabase_user_system.sql in SQL Editor
   ```

3. **Run First Quantum Experiment**:
   ```bash
   cd /home/dev/dnalang-ibm-cloud/experimental_suite/experiments
   python3 drift_tracking.py --quick-test
   ```

4. **Verify Real-Time Data Flow**:
   - Visit Research Lab: `/portals/enterprise?view=research-lab`
   - Monitor live consciousness metrics
   - Check 6-Day Benchmark progress
   - View propulsion metrics

5. **Test AURA Orchestrator**:
   - Visit AURA Portal: `/aura-ultimate`
   - Send test query: "Design a 5-qubit quantum circuit for ΛΦ measurement"
   - Verify swarm coordination

---

## Troubleshooting

### Issue: "User already exists"
**Solution**: User already created via Auth. Skip to Step 3 (profile creation) or manually run SQL:

```sql
SELECT create_admin_user('jeremy.cyber@outlook.com', 'Jeremy Chen', 'DNALang Research');
```

### Issue: "Missing SUPABASE_SERVICE_ROLE_KEY"
**Solution**: Get from Supabase Dashboard → Settings → API → service_role key

### Issue: "Table 'user_profiles' does not exist"
**Solution**: Deploy `supabase_user_system.sql` first (Step 1)

### Issue: AURA agents not showing
**Solution**: Manually initialize:

```sql
SELECT initialize_user_aura_swarm(
  (SELECT id FROM user_profiles WHERE email = 'jeremy.cyber@outlook.com')
);
```

---

## Security Notes

- ⚠️ **NEVER commit** `.env.local` with real credentials
- ⚠️ **Change default password** immediately after first login
- ⚠️ **Service role key** grants admin access - keep secret
- ✅ Use individual user accounts for team members (don't share admin)
- ✅ RLS policies protect user data automatically

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Three-Layer Trust Chain:**
- TIER I: Infrastructure Bridge ✅
- TIER II: Quantum Core ✅
- TIER III: Phenotype Integration ✅

**Status**: Ready for quantum research experimentation
**Created**: November 20, 2025
