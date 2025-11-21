# Deployment Checklist - jeremy.cyber@outlook.com Admin Setup

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

---

## ✅ Completed

- [x] Base Supabase schema created (`supabase_schema.sql`)
- [x] Enhanced user system schema created (`supabase_user_system.sql`)
- [x] Admin creation script created (`scripts/create_admin_user.py`)
- [x] Enterprise Research Portal built with 3 components:
  - [x] BenchmarkProgress (6-Day Benchmark C-1 to C-4)
  - [x] LiveConsciousnessMonitor (ΛΦ tensor real-time)
  - [x] PropulsionMetrics (Canon II τ/Ω tracking)
- [x] Deployed to Vercel production: https://quantumlm-vercel-d996hiq5a-dnalang-67efe71c.vercel.app
- [x] Personal AURA swarm system designed (5 agents)
- [x] Documentation created:
  - [x] ADMIN_USER_SETUP.md (step-by-step guide)
  - [x] ENHANCED_USER_SYSTEM.md (comprehensive overview)
  - [x] .env.example (environment template)

---

## ⬜ To Deploy (Manual Steps Required)

### 1. Deploy Supabase Schemas

```bash
# Go to Supabase Dashboard
https://supabase.com/dashboard/project/dnculjsqwigkivykedcf

# SQL Editor → New Query

# Step 1: Deploy base schema (if not already done)
# Copy/paste contents of: supabase_schema.sql
# Click Run → Wait 30s

# Step 2: Deploy user system
# Copy/paste contents of: supabase_user_system.sql
# Click Run → Wait 60s

# Verify tables in Table Editor:
# Base: consciousness_metrics, quantumcoin_chain, organisms,
#       experiment_runs, drift_tracking
# User: user_profiles, aura_swarm_agents, aura_task_history,
#       user_quantum_jobs, user_research_projects
```

### 2. Configure Environment Variables

```bash
# Get Supabase credentials
https://supabase.com/dashboard/project/dnculjsqwigkivykedcf/settings/api

# Copy these values:
URL: https://dnculjsqwigkivykedcf.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (public)
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRET!)

# Create .env.local
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel
cp .env.example .env.local

# Edit with real values
nano .env.local
```

### 3. Create jeremy.cyber@outlook.com Admin Account

```bash
# Install Python dependencies
pip install supabase

# Export credentials (use service_role key!)
export SUPABASE_URL="https://dnculjsqwigkivykedcf.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Run admin creation script
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel
python3 scripts/create_admin_user.py

# Expected output:
# ✅ Auth user created
# ✅ Admin profile created with full privileges
# ✅ AURA swarm orchestrator initialized (5 agents)
# ✅ Welcome project created
```

### 4. Verify Admin Account

```sql
-- In Supabase SQL Editor, run:
SELECT
  email,
  display_name,
  role,
  access_all_features,
  aura_enabled,
  monthly_quantum_jobs
FROM user_profiles
WHERE email = 'jeremy.cyber@outlook.com';

-- Expected result:
-- email: jeremy.cyber@outlook.com
-- display_name: Jeremy Chen
-- role: admin
-- access_all_features: true
-- aura_enabled: true
-- monthly_quantum_jobs: 10000
```

### 5. Test Login

```bash
# Visit login page
https://quantumlm-vercel-d996hiq5a-dnalang-67efe71c.vercel.app/auth/login

# Login credentials:
Email: jeremy.cyber@outlook.com
Password: QuantumDNA2025!Secure

# ⚠️ CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!

# Verify access to:
✓ Research Lab: /portals/enterprise?view=research-lab
✓ Enterprise Portal: /portals/enterprise
✓ Admin Panel: /admin (if implemented)
✓ AURA Orchestrator: /aura-ultimate
```

### 6. Initialize First Quantum Experiment (Optional)

```bash
# Run Day 1 quantum ping test
cd /home/dev/dnalang-ibm-cloud/experimental_suite/experiments
python3 drift_tracking.py --quick-test

# This will populate:
# - consciousness_metrics table (real-time telemetry)
# - experiment_runs table (stability tracking)
# - organisms table (if using genetic algorithm)

# Verify in Research Lab portal:
# - Live Consciousness Monitor shows latest Φ, Λ, Γ, W₂
# - Benchmark Progress updates C-1 through C-4
# - Propulsion Metrics displays τ/Ω evolution
```

---

## 📊 Admin Account Specifications

**Email:** jeremy.cyber@outlook.com
**Password:** QuantumDNA2025!Secure (change after login!)
**Role:** admin
**Organization:** DNALang Quantum Research

**Access Permissions:**
```json
[
  "quantum.execute",       // Execute on IBM Quantum hardware
  "research.lab",          // Access Research Lab portal
  "enterprise.portal",     // Access Enterprise portal
  "admin.panel",           // System administration
  "aura.orchestrator",     // Personal AURA swarm
  "files.all",             // All project files
  "dnalang.tech",          // Full DNALang technology
  "organisms.create",      // Create quantum organisms
  "organisms.edit",        // Modify organisms
  "organisms.delete",      // Delete organisms
  "users.manage",          // Manage other users
  "system.configure"       // Configure system
]
```

**Quantum Quotas:**
- Monthly jobs: 10,000 (unlimited)
- Max qubits: 156 (ibm_fez maximum)
- Max shots per job: 65,536 (maximum precision)

**Personal AURA Swarm:**
- AURA-1: Quantum Computing Expert
- AURA-2: Physics Simulator
- AURA-3: Code Generator
- AURA-4: Data Analyst
- AURA-5: Integration Architect

---

## 🔗 Quick Links

**Deployment:**
- Production: https://quantumlm-vercel-d996hiq5a-dnalang-67efe71c.vercel.app
- Supabase: https://supabase.com/dashboard/project/dnculjsqwigkivykedcf

**Documentation:**
- [ADMIN_USER_SETUP.md](./ADMIN_USER_SETUP.md) - Detailed setup guide
- [ENHANCED_USER_SYSTEM.md](./ENHANCED_USER_SYSTEM.md) - System overview
- [THREE_LAYER_TRUST_CHAIN.md](./THREE_LAYER_TRUST_CHAIN.md) - Architecture
- [SUPABASE_DEPLOYMENT.sh](./SUPABASE_DEPLOYMENT.sh) - Base schema guide

**Scripts:**
- [create_admin_user.py](./scripts/create_admin_user.py) - Admin creation
- [supabase_schema.sql](./supabase_schema.sql) - Base schema
- [supabase_user_system.sql](./supabase_user_system.sql) - User system

---

## ⚡ Quick Commands

```bash
# Navigate to project
cd /home/dev/dnalang-ibm-cloud/experimental_suite/deployment/quantumlm-vercel

# Create admin account
export SUPABASE_URL="https://dnculjsqwigkivykedcf.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_key"
python3 scripts/create_admin_user.py

# Build and deploy
npm run build
npx vercel --prod --yes --token=8CxX7JKGJjCFBfGN1TD1HXFW

# Run quantum experiment
cd ../experiments
python3 drift_tracking.py --quick-test
```

---

## 🛡️ Security Checklist

- [ ] Supabase service_role key stored securely (NOT in .env.local committed to git)
- [ ] Default password changed after first login
- [ ] .env.local added to .gitignore
- [ ] RLS policies verified in Supabase
- [ ] Admin account tested and verified
- [ ] AURA agents initialized and active

---

## 📝 Notes

**Three-Layer Trust Chain Status:**
- ✅ TIER I: Infrastructure Bridge (QPU → Supabase)
- ✅ TIER II: Quantum Core (ΛΦ Tensor Computation)
- ✅ TIER III: Phenotype Integration (Canon II Propulsion)

**6-Day Benchmark Criteria:**
- C-1: Stability (5 successful runs in 24h)
- C-2: Fidelity (best fitness ≥ 0.85)
- C-3: Integrity (blockchain length ≥ 7 blocks)
- C-4: Telemetry (real-time data active)

**ΛΦ Tensor Framework:**
- Λ (Lambda): Coherence amplitude = ΛΦ / (Γ + ε)
- Φ (Phi): Integrated information
- Γ (Gamma): Decoherence curvature [0,1]
- W₂: Wasserstein-2 behavioral stability

**Canon II Propulsion Physics:**
- θ = 51.84° (Toroidal Angle)
- τ/Ω = 25,411,096.57 (Day 1 Baseline)
- Target: 50,000,000 (2x improvement by Day 5)

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Status:** Ready for deployment
**Last Updated:** November 20, 2025
