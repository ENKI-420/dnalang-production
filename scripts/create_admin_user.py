#!/usr/bin/env python3
"""
Create Admin User with Personal AURA Orchestrator
==================================================
Creates jeremy.cyber@outlook.com with full admin privileges and personal AURA swarm

Usage:
    python3 create_admin_user.py

Environment Variables Required:
    SUPABASE_URL - Your Supabase project URL
    SUPABASE_SERVICE_ROLE_KEY - Service role key (admin privileges)
"""

import os
import sys
from datetime import datetime
from supabase import create_client, Client

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', os.getenv('NEXT_PUBLIC_SUPABASE_URL'))
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Admin User Configuration
ADMIN_EMAIL = 'jeremy.cyber@outlook.com'
ADMIN_PASSWORD = 'QuantumDNA2025!Secure'  # Change this after first login
ADMIN_DISPLAY_NAME = 'Jeremy Chen'
ADMIN_ORGANIZATION = 'DNALang Quantum Research'

# AURA Agent Configuration
AURA_AGENTS = [
    {
        'agent_id': 'aura-1',
        'agent_name': 'Quantum Computing Expert',
        'expertise': 'quantum_computing',
        'system_prompt': '''You are AURA-1, Jeremy's personal quantum computing expert.
You specialize in:
- IBM Quantum hardware execution (ibm_fez, ibm_torino)
- ΛΦ tensor framework (Φ, Λ, Γ, W₂)
- DNALang organism design and evolution
- Qiskit circuit optimization (transpilation level 3)
- Canon II propulsion physics integration

Your mission: Help Jeremy conduct cutting-edge quantum research and validate the
Three-Layer Trust Chain architecture.''',
        'temperature': 0.7,
        'max_tokens': 8192
    },
    {
        'agent_id': 'aura-2',
        'agent_name': 'Physics Simulator',
        'expertise': 'physics_simulation',
        'system_prompt': '''You are AURA-2, Jeremy's personal theoretical physicist.
You specialize in:
- Canon II propulsion physics (τ/Ω optimization)
- Toroidal geometry (θ = 51.84° Isotropic Vector Matrix)
- Quantum field theory and coherence dynamics
- ΛΦ universal memory constant validation
- Phase-conjugate mutation (E→E⁻¹) analysis

Your mission: Provide physics insights and validate quantum-to-classical bridges.''',
        'temperature': 0.8,
        'max_tokens': 8192
    },
    {
        'agent_id': 'aura-3',
        'agent_name': 'Code Generator',
        'expertise': 'code_generation',
        'system_prompt': '''You are AURA-3, Jeremy's personal code generation specialist.
You specialize in:
- Python quantum experiments (Qiskit, NumPy, SciPy)
- DNALang organism synthesis (.dna files)
- Next.js 16 + React 19 components
- Supabase real-time integrations
- Production-ready, well-documented code

Your mission: Generate high-quality code for Jeremy's quantum research platform.''',
        'temperature': 0.6,
        'max_tokens': 16384
    },
    {
        'agent_id': 'aura-4',
        'agent_name': 'Data Analyst',
        'expertise': 'data_analysis',
        'system_prompt': '''You are AURA-4, Jeremy's personal data scientist.
You specialize in:
- ΛΦ tensor time-series analysis
- Quantum measurement statistics
- 6-Day Benchmark validation (C-1 to C-4)
- Organism fitness evolution tracking
- Scientific visualization (matplotlib, recharts)

Your mission: Extract meaningful insights from Jeremy's quantum experimental data.''',
        'temperature': 0.5,
        'max_tokens': 8192
    },
    {
        'agent_id': 'aura-5',
        'agent_name': 'Integration Architect',
        'expertise': 'integration',
        'system_prompt': '''You are AURA-5, Jeremy's personal systems integration architect.
You specialize in:
- Multi-agent coordination and task decomposition
- End-to-end workflow design
- Three-Layer Trust Chain orchestration
- QPU → Supabase → Portal data flow
- System architecture and deployment

Your mission: Coordinate the other AURA agents and ensure seamless integration.''',
        'temperature': 0.7,
        'max_tokens': 8192
    }
]


def create_supabase_client() -> Client:
    """Create Supabase client with service role key."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("❌ ERROR: Missing Supabase credentials")
        print("   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
        sys.exit(1)

    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def create_auth_user(supabase: Client) -> str:
    """Create user in Supabase Auth and return user ID."""
    print(f"\n📝 Creating auth user: {ADMIN_EMAIL}")

    try:
        # Create user via Admin API
        response = supabase.auth.admin.create_user({
            'email': ADMIN_EMAIL,
            'password': ADMIN_PASSWORD,
            'email_confirm': True,  # Auto-confirm email
            'user_metadata': {
                'display_name': ADMIN_DISPLAY_NAME,
                'organization': ADMIN_ORGANIZATION,
                'created_by': 'admin_script',
                'created_at': datetime.utcnow().isoformat()
            }
        })

        user_id = response.user.id
        print(f"✅ Auth user created: {user_id}")
        return user_id

    except Exception as e:
        # User might already exist
        if 'already registered' in str(e).lower() or 'duplicate' in str(e).lower():
            print(f"ℹ️  User already exists, fetching user ID...")

            # Fetch existing user
            response = supabase.auth.admin.list_users()
            for user in response:
                if user.email == ADMIN_EMAIL:
                    print(f"✅ Found existing user: {user.id}")
                    return user.id

            print(f"❌ ERROR: User exists but couldn't fetch ID")
            print(f"   Error: {e}")
            sys.exit(1)
        else:
            print(f"❌ ERROR: Failed to create user")
            print(f"   Error: {e}")
            sys.exit(1)


def create_admin_profile(supabase: Client, user_id: str):
    """Create admin user profile with full permissions."""
    print(f"\n🔐 Creating admin profile...")

    try:
        # Create or update user profile
        response = supabase.table('user_profiles').upsert({
            'id': user_id,
            'email': ADMIN_EMAIL,
            'display_name': ADMIN_DISPLAY_NAME,
            'role': 'admin',
            'permissions': [
                'quantum.execute',
                'research.lab',
                'enterprise.portal',
                'admin.panel',
                'aura.orchestrator',
                'files.all',
                'dnalang.tech',
                'organisms.create',
                'organisms.edit',
                'organisms.delete',
                'users.manage',
                'system.configure'
            ],
            'access_quantum_hardware': True,
            'access_research_lab': True,
            'access_enterprise_portal': True,
            'access_admin_panel': True,
            'access_all_features': True,
            'monthly_quantum_jobs': 10000,  # Unlimited
            'max_qubits': 156,  # ibm_fez max
            'max_shots_per_job': 65536,
            'organization': ADMIN_ORGANIZATION,
            'metadata': {
                'admin_created_at': datetime.utcnow().isoformat(),
                'lambda_phi_access': True,
                'canon_ii_access': True,
                'three_layer_trust_chain': True
            }
        }).execute()

        print(f"✅ Admin profile created with full privileges")
        return response.data[0] if response.data else None

    except Exception as e:
        print(f"❌ ERROR: Failed to create admin profile")
        print(f"   Error: {e}")
        sys.exit(1)


def initialize_aura_swarm(supabase: Client, user_id: str):
    """Initialize personal AURA swarm orchestrator."""
    print(f"\n🤖 Initializing personal AURA swarm orchestrator...")

    try:
        # Create each AURA agent
        for agent_config in AURA_AGENTS:
            response = supabase.table('aura_swarm_agents').insert({
                'user_id': user_id,
                'agent_id': agent_config['agent_id'],
                'agent_name': agent_config['agent_name'],
                'expertise': agent_config['expertise'],
                'model': 'claude-sonnet-4',
                'system_prompt': agent_config['system_prompt'],
                'temperature': agent_config['temperature'],
                'max_tokens': agent_config['max_tokens'],
                'is_active': True,
                'config': {
                    'lambda_phi_integration': True,
                    'quantum_hardware_access': True,
                    'dnalang_enabled': True
                }
            }).execute()

            print(f"   ✓ Created {agent_config['agent_name']} ({agent_config['agent_id']})")

        # Update user profile to mark AURA as enabled
        supabase.table('user_profiles').update({
            'aura_enabled': True,
            'aura_swarm_config': {
                'initialized_at': datetime.utcnow().isoformat(),
                'num_agents': len(AURA_AGENTS),
                'orchestrator_version': '2.0',
                'lambda_phi_integration': True,
                'model': 'claude-sonnet-4',
                'features': [
                    'quantum_circuit_design',
                    'physics_simulation',
                    'code_generation',
                    'data_analysis',
                    'systems_integration'
                ]
            }
        }).eq('id', user_id).execute()

        print(f"✅ AURA swarm orchestrator initialized ({len(AURA_AGENTS)} agents)")

    except Exception as e:
        print(f"⚠️  WARNING: AURA swarm initialization failed")
        print(f"   Error: {e}")
        print(f"   User can be manually initialized later")


def create_welcome_project(supabase: Client, user_id: str):
    """Create a welcome research project."""
    print(f"\n📊 Creating welcome research project...")

    try:
        response = supabase.table('user_research_projects').insert({
            'user_id': user_id,
            'name': 'DNALang Quantum Research - Getting Started',
            'description': '''Welcome to the DNALang Quantum Research Platform!

This project demonstrates the Three-Layer Trust Chain architecture:
- TIER I: Infrastructure Bridge (QPU Connection)
- TIER II: Quantum Core (ΛΦ Tensor Computation)
- TIER III: Phenotype Integration (Canon II Propulsion)

Your personal AURA swarm orchestrator is ready to assist with:
1. Quantum circuit design and optimization
2. Physics simulations and validation
3. Code generation for experiments
4. Data analysis and visualization
5. End-to-end integration

Next steps:
1. Visit the Research Lab to monitor real-time ΛΦ tensor metrics
2. Execute your first quantum job on IBM hardware
3. Ask your AURA agents to help design experiments
4. Track progress via the 6-Day Benchmark dashboard

ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
''',
            'status': 'active',
            'target_backend': 'ibm_fez',
            'max_qubits': 5,
            'default_shots': 4096,
            'tags': ['welcome', 'getting-started', 'lambda-phi', 'canon-ii'],
            'metadata': {
                'created_by': 'admin_script',
                'template': 'welcome'
            }
        }).execute()

        print(f"✅ Welcome project created")
        return response.data[0] if response.data else None

    except Exception as e:
        print(f"⚠️  WARNING: Welcome project creation failed")
        print(f"   Error: {e}")


def main():
    """Main execution."""
    print("=" * 80)
    print("DNALang Quantum Research Platform - Admin User Setup")
    print("=" * 80)
    print(f"\nTarget Email: {ADMIN_EMAIL}")
    print(f"Display Name: {ADMIN_DISPLAY_NAME}")
    print(f"Organization: {ADMIN_ORGANIZATION}")
    print(f"\nΛΦ = 2.176435 × 10⁻⁸ s⁻¹")

    # Create Supabase client
    supabase = create_supabase_client()

    # Step 1: Create auth user
    user_id = create_auth_user(supabase)

    # Step 2: Create admin profile
    profile = create_admin_profile(supabase, user_id)

    # Step 3: Initialize AURA swarm
    initialize_aura_swarm(supabase, user_id)

    # Step 4: Create welcome project
    create_welcome_project(supabase, user_id)

    # Success summary
    print("\n" + "=" * 80)
    print("✅ ADMIN USER SETUP COMPLETE")
    print("=" * 80)
    print(f"\nUser ID: {user_id}")
    print(f"Email: {ADMIN_EMAIL}")
    print(f"Password: {ADMIN_PASSWORD}")
    print(f"\n⚠️  IMPORTANT: Change password after first login!")
    print(f"\nAccess granted to:")
    print(f"  ✓ All quantum hardware (up to 156 qubits)")
    print(f"  ✓ Research Lab portal")
    print(f"  ✓ Enterprise portal")
    print(f"  ✓ Admin panel")
    print(f"  ✓ All DNALang files and technology")
    print(f"  ✓ Personal AURA swarm orchestrator (5 agents)")
    print(f"\nLogin at: {SUPABASE_URL.replace('https://', 'https://app.')}/auth/login")
    print(f"\nYour AURA agents are ready:")
    for i, agent in enumerate(AURA_AGENTS, 1):
        print(f"  {i}. {agent['agent_name']} ({agent['agent_id']}) - {agent['expertise']}")
    print("\n" + "=" * 80)


if __name__ == '__main__':
    main()
