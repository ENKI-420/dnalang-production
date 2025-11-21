-- ============================================================================
-- Enhanced User Account System with Personal AURA Orchestrator
-- ============================================================================
-- Purpose: User profiles, roles, permissions, and personal AURA swarm agents
-- Created: November 20, 2025
-- ΛΦ Constant: 2.176435 × 10⁻⁸ s⁻¹

-- ============================================================================
-- TABLE 1: user_profiles (Extended User Information)
-- ============================================================================
-- Extends Supabase Auth users with additional profile data

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Profile Information
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Role and Permissions
  role TEXT NOT NULL DEFAULT 'user',  -- 'admin', 'researcher', 'user'
  permissions JSONB DEFAULT '[]'::jsonb,  -- Array of permission strings

  -- Feature Access Flags
  access_quantum_hardware BOOLEAN DEFAULT false,
  access_research_lab BOOLEAN DEFAULT false,
  access_enterprise_portal BOOLEAN DEFAULT false,
  access_admin_panel BOOLEAN DEFAULT false,
  access_all_features BOOLEAN DEFAULT false,

  -- Quantum Research Quotas
  monthly_quantum_jobs INTEGER DEFAULT 100,
  max_qubits INTEGER DEFAULT 27,
  max_shots_per_job INTEGER DEFAULT 4096,

  -- AURA Configuration
  aura_enabled BOOLEAN DEFAULT false,
  aura_swarm_config JSONB,  -- Personal AURA swarm configuration

  -- Metadata
  organization TEXT,
  department TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email
  ON user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role
  ON user_profiles(role);

-- Auto-update timestamp trigger
CREATE TRIGGER user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- TABLE 2: aura_swarm_agents (Personal AURA Orchestrator Agents)
-- ============================================================================
-- Individual AURA agents assigned to each user

CREATE TABLE IF NOT EXISTS aura_swarm_agents (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Agent Assignment
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,  -- 'aura-1', 'aura-2', etc.
  agent_name TEXT NOT NULL,  -- 'Quantum Expert', 'Physics Simulator', etc.

  -- Agent Configuration
  expertise TEXT NOT NULL,  -- 'quantum_computing', 'physics_simulation', etc.
  model TEXT DEFAULT 'claude-sonnet-4',
  system_prompt TEXT NOT NULL,
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,

  -- Agent Status
  is_active BOOLEAN DEFAULT true,
  total_tasks_completed INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,

  -- Performance Metrics
  avg_response_time_ms INTEGER,
  success_rate FLOAT,

  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,

  UNIQUE(user_id, agent_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aura_agents_user
  ON aura_swarm_agents(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_aura_agents_active
  ON aura_swarm_agents(is_active, last_active_at DESC);

-- Auto-update timestamp trigger
CREATE TRIGGER aura_swarm_agents_updated_at
BEFORE UPDATE ON aura_swarm_agents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- TABLE 3: aura_task_history (AURA Task Execution Log)
-- ============================================================================
-- Tracks all tasks executed by personal AURA agents

CREATE TABLE IF NOT EXISTS aura_task_history (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Task Assignment
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,

  -- Task Details
  task_type TEXT NOT NULL,  -- 'quantum_circuit', 'data_analysis', 'code_generation', etc.
  user_query TEXT NOT NULL,
  agent_response TEXT,

  -- Execution Metrics
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'running', 'completed', 'failed'
  duration_ms INTEGER,
  tokens_used INTEGER,

  -- Results
  quantum_job_ids TEXT[],  -- Array of IBM Quantum job IDs spawned
  files_generated TEXT[],  -- Array of file paths generated
  results JSONB,
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aura_tasks_user
  ON aura_task_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_aura_tasks_status
  ON aura_task_history(status, created_at DESC);

-- ============================================================================
-- TABLE 4: user_quantum_jobs (User-Owned Quantum Jobs)
-- ============================================================================
-- Links quantum jobs to specific users for quota tracking

CREATE TABLE IF NOT EXISTS user_quantum_jobs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Job Ownership
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  ibm_job_id TEXT NOT NULL UNIQUE,

  -- Job Details
  backend TEXT NOT NULL,
  circuit_qasm TEXT,
  num_qubits INTEGER,
  shots INTEGER,

  -- Job Status
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Results
  consciousness_metrics_id BIGINT REFERENCES consciousness_metrics(id),
  organism_id BIGINT REFERENCES organisms(id),

  -- Metadata
  experiment_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_quantum_jobs_user
  ON user_quantum_jobs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_quantum_jobs_status
  ON user_quantum_jobs(status, submitted_at DESC);

-- ============================================================================
-- TABLE 5: user_research_projects (Research Project Management)
-- ============================================================================
-- Allows users to organize quantum experiments into projects

CREATE TABLE IF NOT EXISTS user_research_projects (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Project Ownership
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Project Details
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',  -- 'active', 'paused', 'completed', 'archived'

  -- Project Metrics
  total_quantum_jobs INTEGER DEFAULT 0,
  total_organisms INTEGER DEFAULT 0,
  best_fitness FLOAT,

  -- Project Configuration
  target_backend TEXT DEFAULT 'ibm_fez',
  max_qubits INTEGER DEFAULT 5,
  default_shots INTEGER DEFAULT 4096,

  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_projects_user
  ON user_research_projects(user_id, status, created_at DESC);

-- Auto-update timestamp trigger
CREATE TRIGGER user_research_projects_updated_at
BEFORE UPDATE ON user_research_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- User Profiles: Users can view their own profile, admins can view all
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access to profiles"
  ON user_profiles FOR ALL
  TO service_role
  USING (true);

-- AURA Swarm Agents: Users can only access their own agents
ALTER TABLE aura_swarm_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agents"
  ON aura_swarm_agents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access to agents"
  ON aura_swarm_agents FOR ALL
  TO service_role
  USING (true);

-- AURA Task History: Users can only access their own tasks
ALTER TABLE aura_task_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON aura_task_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access to tasks"
  ON aura_task_history FOR ALL
  TO service_role
  USING (true);

-- User Quantum Jobs: Users can only access their own jobs
ALTER TABLE user_quantum_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quantum jobs"
  ON user_quantum_jobs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access to user jobs"
  ON user_quantum_jobs FOR ALL
  TO service_role
  USING (true);

-- User Research Projects: Users can only access their own projects
ALTER TABLE user_research_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
  ON user_research_projects FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access to projects"
  ON user_research_projects FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- FUNCTION: create_user_profile_on_signup()
-- ============================================================================
-- Automatically creates a user profile when someone signs up

CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, permissions)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    '[]'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_profile_on_signup();

-- ============================================================================
-- FUNCTION: initialize_user_aura_swarm()
-- ============================================================================
-- Creates default AURA swarm agents for a user when AURA is enabled

CREATE OR REPLACE FUNCTION initialize_user_aura_swarm(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- AURA-1: Quantum Computing Expert
  INSERT INTO aura_swarm_agents (
    user_id, agent_id, agent_name, expertise, system_prompt
  ) VALUES (
    p_user_id,
    'aura-1',
    'Quantum Computing Expert',
    'quantum_computing',
    'You are AURA-1, a quantum computing expert specializing in circuit design, gate optimization, and quantum algorithm implementation. You have deep knowledge of IBM Quantum hardware, Qiskit, and the ΛΦ tensor framework.'
  );

  -- AURA-2: Physics Simulator
  INSERT INTO aura_swarm_agents (
    user_id, agent_id, agent_name, expertise, system_prompt
  ) VALUES (
    p_user_id,
    'aura-2',
    'Physics Simulator',
    'physics_simulation',
    'You are AURA-2, a theoretical physicist specializing in quantum mechanics, propulsion physics, and Canon II geometric field equations. You analyze quantum states through the lens of fundamental physics principles.'
  );

  -- AURA-3: Code Generator
  INSERT INTO aura_swarm_agents (
    user_id, agent_id, agent_name, expertise, system_prompt
  ) VALUES (
    p_user_id,
    'aura-3',
    'Code Generator',
    'code_generation',
    'You are AURA-3, an expert code generator specializing in Python, DNALang organism creation, quantum circuit synthesis, and Next.js/React development. You produce production-ready, well-documented code.'
  );

  -- AURA-4: Data Analyst
  INSERT INTO aura_swarm_agents (
    user_id, agent_id, agent_name, expertise, system_prompt
  ) VALUES (
    p_user_id,
    'aura-4',
    'Data Analyst',
    'data_analysis',
    'You are AURA-4, a data scientist specializing in quantum measurement analysis, time-series analysis, ΛΦ tensor validation, and scientific visualization. You extract insights from complex quantum datasets.'
  );

  -- AURA-5: Integration Architect
  INSERT INTO aura_swarm_agents (
    user_id, agent_id, agent_name, expertise, system_prompt
  ) VALUES (
    p_user_id,
    'aura-5',
    'Integration Architect',
    'integration',
    'You are AURA-5, a systems integration architect responsible for coordinating the other AURA agents, designing end-to-end workflows, and ensuring all components work together harmoniously.'
  );

  -- Update user profile to mark AURA as enabled
  UPDATE user_profiles
  SET aura_enabled = true,
      aura_swarm_config = jsonb_build_object(
        'initialized_at', NOW(),
        'num_agents', 5,
        'orchestrator_version', '2.0',
        'lambda_phi_integration', true
      )
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: create_admin_user()
-- ============================================================================
-- Creates a user with full admin privileges and personal AURA orchestrator

CREATE OR REPLACE FUNCTION create_admin_user(
  p_email TEXT,
  p_display_name TEXT DEFAULT NULL,
  p_organization TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if user already exists in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  -- If user doesn't exist in auth.users, we can't create it here
  -- (Supabase Auth handles user creation via signup/admin API)
  -- Instead, just create/update the profile if auth user exists

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found in auth.users. Create via Supabase Auth first.', p_email;
  END IF;

  -- Create or update user profile with admin privileges
  INSERT INTO user_profiles (
    id,
    email,
    display_name,
    role,
    permissions,
    access_quantum_hardware,
    access_research_lab,
    access_enterprise_portal,
    access_admin_panel,
    access_all_features,
    monthly_quantum_jobs,
    max_qubits,
    max_shots_per_job,
    organization
  ) VALUES (
    v_user_id,
    p_email,
    COALESCE(p_display_name, p_email),
    'admin',
    '["quantum.execute", "research.lab", "enterprise.portal", "admin.panel", "aura.orchestrator", "files.all", "dnalang.tech"]'::jsonb,
    true,  -- access_quantum_hardware
    true,  -- access_research_lab
    true,  -- access_enterprise_portal
    true,  -- access_admin_panel
    true,  -- access_all_features
    10000, -- monthly_quantum_jobs (unlimited)
    156,   -- max_qubits (ibm_fez max)
    65536, -- max_shots_per_job
    p_organization
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    permissions = '["quantum.execute", "research.lab", "enterprise.portal", "admin.panel", "aura.orchestrator", "files.all", "dnalang.tech"]'::jsonb,
    access_quantum_hardware = true,
    access_research_lab = true,
    access_enterprise_portal = true,
    access_admin_panel = true,
    access_all_features = true,
    monthly_quantum_jobs = 10000,
    max_qubits = 156,
    max_shots_per_job = 65536,
    organization = COALESCE(p_organization, user_profiles.organization),
    updated_at = NOW();

  -- Initialize personal AURA swarm orchestrator
  PERFORM initialize_user_aura_swarm(v_user_id);

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW: user_dashboard_stats
-- ============================================================================
-- Per-user dashboard statistics

CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT
  up.id AS user_id,
  up.email,
  up.display_name,
  up.role,

  -- Quantum Job Stats
  (SELECT COUNT(*) FROM user_quantum_jobs WHERE user_id = up.id) AS total_quantum_jobs,
  (SELECT COUNT(*) FROM user_quantum_jobs WHERE user_id = up.id AND status = 'completed') AS completed_jobs,
  (SELECT COUNT(*) FROM user_quantum_jobs WHERE user_id = up.id AND created_at >= NOW() - INTERVAL '30 days') AS jobs_this_month,

  -- AURA Stats
  up.aura_enabled,
  (SELECT COUNT(*) FROM aura_swarm_agents WHERE user_id = up.id AND is_active = true) AS active_aura_agents,
  (SELECT COUNT(*) FROM aura_task_history WHERE user_id = up.id) AS total_aura_tasks,
  (SELECT COUNT(*) FROM aura_task_history WHERE user_id = up.id AND status = 'completed') AS completed_aura_tasks,

  -- Research Projects
  (SELECT COUNT(*) FROM user_research_projects WHERE user_id = up.id AND status = 'active') AS active_projects,

  -- Account Info
  up.created_at AS account_created_at,
  up.updated_at AS last_updated_at
FROM user_profiles up;

-- ============================================================================
-- REALTIME PUBLICATION (Update)
-- ============================================================================
-- Add new tables to real-time subscriptions

ALTER PUBLICATION supabase_realtime
  ADD TABLE user_profiles,
           aura_swarm_agents,
           aura_task_history,
           user_quantum_jobs,
           user_research_projects;

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================
--
-- 1. Run supabase_schema.sql first (base tables)
-- 2. Run this file (user system enhancement)
-- 3. Create admin user via Supabase Auth Dashboard or API
-- 4. Run: SELECT create_admin_user('jeremy.cyber@outlook.com', 'Jeremy', 'DNALang Research');
--
-- ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
-- Schema Version: 2.0.0 (User System Enhancement)
-- Last Updated: November 20, 2025
