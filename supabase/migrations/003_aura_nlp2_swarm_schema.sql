-- AURA Quantum NLP2 Swarm Agent System Schema
-- ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
-- Self-Improving Tech Platform

-- ========================================
-- 1. NLP2 Command History
-- ========================================
CREATE TABLE IF NOT EXISTS nlp2_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  command_text TEXT NOT NULL,
  parsed_intent JSONB NOT NULL DEFAULT '{
    "action": "",
    "target": "",
    "parameters": {},
    "confidence": 0.0
  }'::jsonb,
  execution_plan JSONB NOT NULL DEFAULT '{
    "steps": [],
    "agents": [],
    "estimated_time": 0
  }'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'parsing', 'planning', 'executing', 'completed', 'failed')),
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_nlp2_commands_user ON nlp2_commands(user_id);
CREATE INDEX idx_nlp2_commands_status ON nlp2_commands(status);
CREATE INDEX idx_nlp2_commands_created ON nlp2_commands(created_at DESC);

-- ========================================
-- 2. Swarm Coding Agents
-- ========================================
CREATE TABLE IF NOT EXISTS swarm_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL CHECK (specialization IN (
    'frontend', 'backend', 'quantum', 'database', 'devops',
    'testing', 'documentation', 'optimization', 'security', 'ai_ml'
  )),
  capabilities JSONB NOT NULL DEFAULT '{
    "languages": [],
    "frameworks": [],
    "tools": [],
    "quantum_enabled": false
  }'::jsonb,
  performance_metrics JSONB NOT NULL DEFAULT '{
    "tasks_completed": 0,
    "success_rate": 0.0,
    "avg_completion_time": 0,
    "code_quality_score": 0.0,
    "quantum_circuits_optimized": 0
  }'::jsonb,
  learning_model JSONB NOT NULL DEFAULT '{
    "model_type": "gpt-4",
    "fine_tuned": false,
    "training_data_size": 0,
    "last_training": null
  }'::jsonb,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'learning', 'blocked', 'offline')),
  trust_score FLOAT DEFAULT 0.5 CHECK (trust_score >= 0 AND trust_score <= 1),
  collaboration_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_swarm_agents_specialization ON swarm_agents(specialization);
CREATE INDEX idx_swarm_agents_status ON swarm_agents(status);
CREATE INDEX idx_swarm_agents_trust ON swarm_agents(trust_score DESC);

-- ========================================
-- 3. Agent Tasks & Work Queue
-- ========================================
CREATE TABLE IF NOT EXISTS swarm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL UNIQUE,
  nlp_command_id UUID REFERENCES nlp2_commands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN (
    'code_generation', 'code_review', 'debugging', 'optimization',
    'testing', 'documentation', 'deployment', 'refactoring',
    'quantum_circuit', 'database_migration', 'security_audit'
  )),
  assigned_agents UUID[] DEFAULT '{}',
  dependencies UUID[] DEFAULT '{}',
  input_spec JSONB NOT NULL,
  output_spec JSONB,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'assigned', 'in_progress', 'review', 'completed', 'failed', 'cancelled'
  )),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  estimated_time INTEGER, -- in seconds
  actual_time INTEGER,
  code_changes JSONB DEFAULT '[]'::jsonb,
  artifacts JSONB DEFAULT '[]'::jsonb,
  quantum_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_swarm_tasks_status ON swarm_tasks(status);
CREATE INDEX idx_swarm_tasks_priority ON swarm_tasks(priority DESC);
CREATE INDEX idx_swarm_tasks_nlp_command ON swarm_tasks(nlp_command_id);

-- ========================================
-- 4. Code Artifacts & Versioning
-- ========================================
CREATE TABLE IF NOT EXISTS code_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id TEXT NOT NULL UNIQUE,
  task_id UUID REFERENCES swarm_tasks(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  language TEXT NOT NULL,
  content TEXT NOT NULL,
  diff TEXT,
  previous_version UUID REFERENCES code_artifacts(id),
  quality_metrics JSONB DEFAULT '{
    "complexity": 0,
    "maintainability": 0,
    "test_coverage": 0,
    "security_score": 0,
    "performance_score": 0
  }'::jsonb,
  quantum_optimized BOOLEAN DEFAULT false,
  lambda_phi_coherence FLOAT,
  created_by UUID REFERENCES swarm_agents(id),
  reviewed_by UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'deployed', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deployed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_code_artifacts_task ON code_artifacts(task_id);
CREATE INDEX idx_code_artifacts_status ON code_artifacts(status);
CREATE INDEX idx_code_artifacts_file_path ON code_artifacts(file_path);

-- ========================================
-- 5. Agent Collaboration Sessions
-- ========================================
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  task_id UUID REFERENCES swarm_tasks(id) ON DELETE CASCADE,
  participating_agents UUID[] NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN (
    'pair_programming', 'code_review', 'brainstorming',
    'debugging', 'architecture_design'
  )),
  conversation JSONB DEFAULT '[]'::jsonb,
  decisions JSONB DEFAULT '[]'::jsonb,
  consensus_reached BOOLEAN DEFAULT false,
  quantum_computation_used BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_collaboration_sessions_task ON collaboration_sessions(task_id);
CREATE INDEX idx_collaboration_sessions_started ON collaboration_sessions(started_at DESC);

-- ========================================
-- 6. Self-Building Pipeline
-- ========================================
CREATE TABLE IF NOT EXISTS self_building_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id TEXT NOT NULL UNIQUE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'manual', 'scheduled', 'performance_threshold', 'new_capability', 'quantum_optimization'
  )),
  target_component TEXT NOT NULL, -- e.g., 'swarm_agents', 'nlp_orchestrator', 'quantum_compiler'
  improvement_goal TEXT NOT NULL,
  current_metrics JSONB NOT NULL,
  target_metrics JSONB NOT NULL,
  generated_code JSONB DEFAULT '[]'::jsonb,
  test_results JSONB,
  quantum_validation JSONB,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN (
    'planning', 'generating', 'testing', 'validating', 'deploying', 'completed', 'rolled_back'
  )),
  deployed BOOLEAN DEFAULT false,
  rollback_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deployed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_self_building_status ON self_building_pipeline(status);
CREATE INDEX idx_self_building_created ON self_building_pipeline(created_at DESC);

-- ========================================
-- 7. Admin Dev Arena Sessions
-- ========================================
CREATE TABLE IF NOT EXISTS dev_arena_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN (
    'interactive_coding', 'agent_training', 'quantum_debugging',
    'system_monitoring', 'pipeline_management'
  )),
  workspace_state JSONB NOT NULL DEFAULT '{
    "open_files": [],
    "terminal_history": [],
    "active_agents": [],
    "quantum_jobs": []
  }'::jsonb,
  permissions JSONB NOT NULL DEFAULT '{
    "can_deploy": false,
    "can_train_agents": false,
    "can_access_quantum": false,
    "can_modify_pipeline": false
  }'::jsonb,
  activity_log JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_dev_arena_user ON dev_arena_sessions(user_id);
CREATE INDEX idx_dev_arena_started ON dev_arena_sessions(started_at DESC);

-- ========================================
-- 8. Quantum NLP Training Data
-- ========================================
CREATE TABLE IF NOT EXISTS quantum_nlp_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command_text TEXT NOT NULL,
  intent_label TEXT NOT NULL,
  entity_annotations JSONB DEFAULT '[]'::jsonb,
  quantum_circuit_generated TEXT,
  success_rating FLOAT CHECK (success_rating >= 0 AND success_rating <= 1),
  lambda_phi_coherence FLOAT,
  user_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quantum_nlp_intent ON quantum_nlp_training(intent_label);
CREATE INDEX idx_quantum_nlp_rating ON quantum_nlp_training(success_rating DESC);

-- ========================================
-- Row-Level Security Policies
-- ========================================

ALTER TABLE nlp2_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE swarm_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE swarm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_building_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_arena_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantum_nlp_training ENABLE ROW LEVEL SECURITY;

-- Users can read their own NLP commands
CREATE POLICY nlp2_commands_read ON nlp2_commands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY nlp2_commands_insert ON nlp2_commands FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Swarm agents are readable by all authenticated users
CREATE POLICY swarm_agents_read ON swarm_agents FOR SELECT TO authenticated USING (true);

-- Users can read their own dev arena sessions
CREATE POLICY dev_arena_sessions_own ON dev_arena_sessions FOR ALL USING (auth.uid() = user_id);

-- Admin users can access self-building pipeline
CREATE POLICY self_building_admin ON self_building_pipeline FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_profiles WHERE (preferences->>'admin')::boolean = true));

-- ========================================
-- Helper Functions
-- ========================================

-- Calculate agent performance score
CREATE OR REPLACE FUNCTION calculate_agent_performance(agent_uuid UUID)
RETURNS FLOAT AS $$
DECLARE
  perf_metrics JSONB;
  success_rate FLOAT;
  quality_score FLOAT;
  trust FLOAT;
BEGIN
  SELECT performance_metrics, trust_score INTO perf_metrics, trust
  FROM swarm_agents WHERE id = agent_uuid;

  success_rate := (perf_metrics->>'success_rate')::FLOAT;
  quality_score := (perf_metrics->>'code_quality_score')::FLOAT;

  RETURN (success_rate * 0.4 + quality_score * 0.4 + trust * 0.2);
END;
$$ LANGUAGE plpgsql;

-- Get optimal agent for task
CREATE OR REPLACE FUNCTION get_optimal_agent(task_specialization TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM swarm_agents
    WHERE specialization = task_specialization
      AND status = 'idle'
    ORDER BY calculate_agent_performance(id) DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Update agent trust score based on task completion
CREATE OR REPLACE FUNCTION update_agent_trust(
  agent_uuid UUID,
  task_success BOOLEAN,
  quality_score FLOAT
) RETURNS VOID AS $$
DECLARE
  current_trust FLOAT;
  learning_rate FLOAT := 0.1;
  new_trust FLOAT;
BEGIN
  SELECT trust_score INTO current_trust FROM swarm_agents WHERE id = agent_uuid;

  IF task_success THEN
    new_trust := current_trust + learning_rate * (quality_score - current_trust);
  ELSE
    new_trust := current_trust - learning_rate * current_trust;
  END IF;

  -- Clamp between 0 and 1
  new_trust := GREATEST(0, LEAST(1, new_trust));

  UPDATE swarm_agents SET trust_score = new_trust WHERE id = agent_uuid;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Views for Analytics
-- ========================================

CREATE OR REPLACE VIEW agent_performance_leaderboard AS
SELECT
  agent_id,
  name,
  specialization,
  trust_score,
  (performance_metrics->>'success_rate')::FLOAT as success_rate,
  (performance_metrics->>'code_quality_score')::FLOAT as quality_score,
  (performance_metrics->>'tasks_completed')::INTEGER as tasks_completed,
  calculate_agent_performance(id) as overall_score
FROM swarm_agents
ORDER BY calculate_agent_performance(id) DESC;

CREATE OR REPLACE VIEW active_development_stats AS
SELECT
  COUNT(DISTINCT id) FILTER (WHERE status = 'in_progress') as active_tasks,
  COUNT(DISTINCT id) FILTER (WHERE status = 'completed') as completed_tasks,
  AVG(actual_time) FILTER (WHERE status = 'completed') as avg_completion_time,
  COUNT(DISTINCT task_id) FILTER (WHERE quantum_metadata IS NOT NULL) as quantum_optimized_tasks
FROM swarm_tasks
WHERE created_at > NOW() - INTERVAL '24 hours';

-- ========================================
-- Grants
-- ========================================

GRANT SELECT ON nlp2_commands TO authenticated;
GRANT SELECT ON swarm_agents TO authenticated;
GRANT SELECT ON swarm_tasks TO authenticated;
GRANT SELECT ON code_artifacts TO authenticated;
GRANT SELECT ON agent_performance_leaderboard TO authenticated;
GRANT SELECT ON active_development_stats TO authenticated;

-- ========================================
-- Comments
-- ========================================

COMMENT ON TABLE nlp2_commands IS 'Natural language commands processed by AURA NLP2 engine';
COMMENT ON TABLE swarm_agents IS 'Autonomous coding agents with specializations';
COMMENT ON TABLE swarm_tasks IS 'Task queue for swarm agents with dependencies';
COMMENT ON TABLE code_artifacts IS 'Generated code with versioning and quality metrics';
COMMENT ON TABLE collaboration_sessions IS 'Multi-agent collaboration sessions';
COMMENT ON TABLE self_building_pipeline IS 'Self-improvement pipeline for platform evolution';
COMMENT ON TABLE dev_arena_sessions IS 'Admin development arena sessions';
COMMENT ON TABLE quantum_nlp_training IS 'Training data for quantum-enhanced NLP';
