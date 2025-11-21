# Admin Scripts

Scripts for managing the DNALang Quantum Research Platform.

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

---

## create_admin_user.py

Creates an admin user with full privileges and personal AURA swarm orchestrator.

### Features

- ✅ Creates Supabase Auth user
- ✅ Sets up admin profile with all permissions
- ✅ Initializes 5 personal AURA agents
- ✅ Creates welcome research project
- ✅ Grants unlimited quantum hardware access

### Usage

```bash
# Set environment variables
export SUPABASE_URL="https://dnculjsqwigkivykedcf.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Install dependencies
pip install supabase

# Run script
python3 scripts/create_admin_user.py
```

### Configuration

Edit the script to customize:

```python
# Admin User Configuration (line 14)
ADMIN_EMAIL = 'jeremy.cyber@outlook.com'
ADMIN_PASSWORD = 'QuantumDNA2025!Secure'  # Change after first login
ADMIN_DISPLAY_NAME = 'Jeremy Chen'
ADMIN_ORGANIZATION = 'DNALang Quantum Research'
```

### AURA Agent Configuration

The script creates 5 specialized agents (lines 19-95):

1. **AURA-1: Quantum Computing Expert**
   - Expertise: quantum_computing
   - Specializes in: IBM Quantum, ΛΦ tensor, DNALang, Qiskit

2. **AURA-2: Physics Simulator**
   - Expertise: physics_simulation
   - Specializes in: Canon II physics, toroidal geometry, quantum field theory

3. **AURA-3: Code Generator**
   - Expertise: code_generation
   - Specializes in: Python, DNALang, Next.js, Supabase

4. **AURA-4: Data Analyst**
   - Expertise: data_analysis
   - Specializes in: ΛΦ tensor analysis, time-series, visualization

5. **AURA-5: Integration Architect**
   - Expertise: integration
   - Specializes in: Multi-agent coordination, system design, workflows

### Output

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

Your AURA agents are ready:
  1. Quantum Computing Expert (aura-1) - quantum_computing
  2. Physics Simulator (aura-2) - physics_simulation
  3. Code Generator (aura-3) - code_generation
  4. Data Analyst (aura-4) - data_analysis
  5. Integration Architect (aura-5) - integration

================================================================================
```

### Permissions Granted

```json
{
  "permissions": [
    "quantum.execute",
    "research.lab",
    "enterprise.portal",
    "admin.panel",
    "aura.orchestrator",
    "files.all",
    "dnalang.tech",
    "organisms.create",
    "organisms.edit",
    "organisms.delete",
    "users.manage",
    "system.configure"
  ],
  "quotas": {
    "monthly_quantum_jobs": 10000,
    "max_qubits": 156,
    "max_shots_per_job": 65536
  }
}
```

### Error Handling

The script handles:
- ✅ User already exists (updates profile instead)
- ✅ Missing environment variables (exits with error)
- ✅ AURA initialization failures (warns but continues)
- ✅ Database connection errors (exits with error)

### Troubleshooting

**"User already exists"**
```
ℹ️  User already exists, fetching user ID...
✅ Found existing user: 8f7e6d5c-4b3a-2c1d-0e9f-8g7h6i5j4k3l
```
Solution: Script will update existing profile with admin privileges.

**"Missing Supabase credentials"**
```
❌ ERROR: Missing Supabase credentials
   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
```
Solution: Export environment variables first.

**"Table 'user_profiles' does not exist"**
```
❌ ERROR: Failed to create admin profile
   Error: relation "user_profiles" does not exist
```
Solution: Deploy `supabase_user_system.sql` first.

### Security Notes

- ⚠️ **NEVER commit** this script with hardcoded credentials
- ⚠️ **Service role key** grants admin access - keep secret
- ⚠️ **Change default password** immediately after first login
- ✅ User passwords are hashed by Supabase Auth
- ✅ Service role key only used server-side

### Dependencies

```bash
pip install supabase
```

Requires:
- Python 3.8+
- supabase-py >= 2.0.0
- Access to Supabase project
- Service role key (admin privileges)

### See Also

- [ADMIN_USER_SETUP.md](../ADMIN_USER_SETUP.md) - Complete setup guide
- [ENHANCED_USER_SYSTEM.md](../ENHANCED_USER_SYSTEM.md) - System overview
- [supabase_user_system.sql](../supabase_user_system.sql) - Database schema

---

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**
**Last Updated:** November 20, 2025
