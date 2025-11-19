-- ΛΦ Quantum Swarm Orchestrator Schema
-- IBM Watsonx × IBM Quantum Integration
-- ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

-- ========================================
-- 1. User Profiles Table
-- ========================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{
    "taskPriority": "balanced",
    "quantumBackend": "ibm_fez",
    "autoOptimize": true,
    "learningRate": 0.8
  }'::jsonb,
  insights JSONB NOT NULL DEFAULT '{
    "workPatterns": [],
    "commonTasks": [],
    "efficiencyGains": 0
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- ========================================
-- 2. Watsonx Agents Table
-- ========================================
CREATE TABLE IF NOT EXISTS watsonx_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('optimizer', 'executor', 'learner', 'analyst')),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'learning', 'optimizing', 'error')),
  capabilities TEXT[] DEFAULT '{}',
  trust FLOAT DEFAULT 0.5 CHECK (trust >= 0 AND trust <= 1),
  permissions TEXT[] DEFAULT '{}',
  performance JSONB NOT NULL DEFAULT '{
    "tasksCompleted": 0,
    "successRate": 0,
    "avgExecutionTime": 0
  }'::jsonb,
  watsonx_model TEXT,
  quantum_backend TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_watsonx_agents_user_id ON watsonx_agents(user_id);
CREATE INDEX idx_watsonx_agents_agent_id ON watsonx_agents(agent_id);
CREATE INDEX idx_watsonx_agents_status ON watsonx_agents(status);
CREATE INDEX idx_watsonx_agents_type ON watsonx_agents(type);

-- ========================================
-- 3. Permission Requests Table
-- ========================================
CREATE TABLE IF NOT EXISTS permission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES watsonx_agents(agent_id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_permission_requests_user_id ON permission_requests(user_id);
CREATE INDEX idx_permission_requests_agent_id ON permission_requests(agent_id);
CREATE INDEX idx_permission_requests_status ON permission_requests(status);
CREATE INDEX idx_permission_requests_created_at ON permission_requests(created_at DESC);

-- ========================================
-- 4. Activity Logs Table
-- ========================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES watsonx_agents(agent_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('success', 'failure', 'pending')),
  details TEXT,
  impact_score FLOAT DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 10),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_agent_id ON activity_logs(agent_id);
CREATE INDEX idx_activity_logs_result ON activity_logs(result);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_impact_score ON activity_logs(impact_score DESC);

-- ========================================
-- 5. Agent Tasks Table
-- ========================================
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES watsonx_agents(agent_id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_tasks_user_id ON agent_tasks(user_id);
CREATE INDEX idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_priority ON agent_tasks(priority DESC);
CREATE INDEX idx_agent_tasks_created_at ON agent_tasks(created_at DESC);

-- ========================================
-- 6. Learning Insights Table
-- ========================================
CREATE TABLE IF NOT EXISTS learning_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES watsonx_agents(agent_id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  insight_data JSONB NOT NULL,
  confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_learning_insights_user_id ON learning_insights(user_id);
CREATE INDEX idx_learning_insights_agent_id ON learning_insights(agent_id);
CREATE INDEX idx_learning_insights_confidence ON learning_insights(confidence DESC);
CREATE INDEX idx_learning_insights_applied ON learning_insights(applied);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watsonx_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Watsonx Agents Policies
CREATE POLICY "Users can view own agents"
  ON watsonx_agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agents"
  ON watsonx_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON watsonx_agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON watsonx_agents FOR DELETE
  USING (auth.uid() = user_id);

-- Permission Requests Policies
CREATE POLICY "Users can view own permission requests"
  ON permission_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Agents can create permission requests"
  ON permission_requests FOR INSERT
  WITH CHECK (true); -- Agents can request, but user must approve

CREATE POLICY "Users can update own permission requests"
  ON permission_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Activity Logs Policies
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true); -- Any authenticated action can log

-- Agent Tasks Policies
CREATE POLICY "Users can view own tasks"
  ON agent_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks"
  ON agent_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update tasks"
  ON agent_tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Learning Insights Policies
CREATE POLICY "Users can view own insights"
  ON learning_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create insights"
  ON learning_insights FOR INSERT
  WITH CHECK (true);

-- ========================================
-- Helper Functions
-- ========================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER update_user_profiles_timestamp
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_watsonx_agents_timestamp
  BEFORE UPDATE ON watsonx_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_permission_requests_timestamp
  BEFORE UPDATE ON permission_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

-- Calculate agent efficiency score
CREATE OR REPLACE FUNCTION calculate_agent_efficiency(
  agent_id_param TEXT
)
RETURNS FLOAT AS $$
DECLARE
  agent_record RECORD;
  success_weight FLOAT := 0.4;
  trust_weight FLOAT := 0.3;
  speed_weight FLOAT := 0.3;
  efficiency FLOAT;
BEGIN
  SELECT
    trust,
    (performance->>'successRate')::float as success_rate,
    (performance->>'avgExecutionTime')::float as avg_time
  INTO agent_record
  FROM watsonx_agents
  WHERE agent_id = agent_id_param;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Normalize avg_time (assuming 60s is baseline)
  efficiency := (success_weight * agent_record.success_rate) +
                (trust_weight * agent_record.trust) +
                (speed_weight * (1 - LEAST(agent_record.avg_time / 60, 1)));

  RETURN GREATEST(0, LEAST(1, efficiency));
END;
$$ LANGUAGE plpgsql;

-- Get recommended agent for task
CREATE OR REPLACE FUNCTION get_recommended_agent(
  user_id_param UUID,
  task_type_param TEXT
)
RETURNS TEXT AS $$
DECLARE
  recommended_agent_id TEXT;
BEGIN
  SELECT agent_id INTO recommended_agent_id
  FROM watsonx_agents
  WHERE user_id = user_id_param
    AND status IN ('idle', 'active')
    AND task_type_param = ANY(capabilities)
  ORDER BY
    trust DESC,
    (performance->>'successRate')::float DESC,
    (performance->>'avgExecutionTime')::float ASC
  LIMIT 1;

  RETURN COALESCE(recommended_agent_id, NULL);
END;
$$ LANGUAGE plpgsql;

-- Auto-update user insights
CREATE OR REPLACE FUNCTION update_user_insights()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
  recent_logs RECORD[];
  new_patterns TEXT[];
  new_tasks TEXT[];
  efficiency FLOAT;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile
  FROM user_profiles
  WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Analyze recent activity (last 100 logs)
  -- This would call IBM Watsonx AI in production
  -- For now, update efficiency gains based on impact scores

  SELECT AVG(impact_score) INTO efficiency
  FROM activity_logs
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '7 days'
    AND result = 'success';

  -- Update insights
  UPDATE user_profiles
  SET insights = jsonb_set(
    insights,
    '{efficiencyGains}',
    to_jsonb(COALESCE(efficiency * 10, 0))
  )
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_insights_on_activity
  AFTER INSERT ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_user_insights();

-- ========================================
-- Views for Analytics
-- ========================================

-- Agent Performance Leaderboard
CREATE OR REPLACE VIEW agent_performance_leaderboard AS
SELECT
  wa.agent_id,
  wa.name,
  wa.type,
  wa.trust,
  (wa.performance->>'tasksCompleted')::int as tasks_completed,
  (wa.performance->>'successRate')::float as success_rate,
  (wa.performance->>'avgExecutionTime')::float as avg_execution_time,
  calculate_agent_efficiency(wa.agent_id) as efficiency_score,
  wa.user_id,
  wa.created_at
FROM watsonx_agents wa
WHERE wa.status != 'error'
ORDER BY efficiency_score DESC, trust DESC;

-- User Activity Summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
  al.user_id,
  COUNT(*) as total_activities,
  SUM(CASE WHEN result = 'success' THEN 1 ELSE 0 END) as successful_activities,
  AVG(impact_score) as avg_impact_score,
  MAX(created_at) as last_activity_at
FROM activity_logs al
GROUP BY al.user_id;

-- Pending Permissions Summary
CREATE OR REPLACE VIEW pending_permissions_summary AS
SELECT
  pr.user_id,
  COUNT(*) as pending_count,
  array_agg(pr.agent_id) as requesting_agents,
  MIN(pr.created_at) as oldest_request_at
FROM permission_requests pr
WHERE pr.status = 'pending'
GROUP BY pr.user_id;

-- ========================================
-- Sample Data (Development)
-- ========================================

-- Commented out - uncomment for development data
/*
-- Insert sample user profile
INSERT INTO user_profiles (user_id, preferences, insights)
SELECT
  id,
  '{
    "taskPriority": "balanced",
    "quantumBackend": "ibm_fez",
    "autoOptimize": true,
    "learningRate": 0.8
  }'::jsonb,
  '{
    "workPatterns": ["Prefers morning quantum runs"],
    "commonTasks": ["optimization", "execution"],
    "efficiencyGains": 25.5
  }'::jsonb
FROM auth.users
LIMIT 1;
*/

-- ========================================
-- Grants
-- ========================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ========================================
-- End of Migration
-- ========================================

COMMENT ON TABLE user_profiles IS 'Personalized user preferences and AI-learned insights';
COMMENT ON TABLE watsonx_agents IS 'IBM Watsonx-powered quantum agents with trust scores';
COMMENT ON TABLE permission_requests IS 'Agent permission requests requiring user approval';
COMMENT ON TABLE activity_logs IS 'Complete audit log of all agent actions and events';
COMMENT ON TABLE agent_tasks IS 'Task queue for quantum and classical agent operations';
COMMENT ON TABLE learning_insights IS 'AI-discovered patterns and optimization opportunities';

COMMENT ON COLUMN user_profiles.insights IS 'IBM Watsonx AI-learned user behavior patterns';
COMMENT ON COLUMN watsonx_agents.trust IS 'Dynamic trust score (0-1) based on performance';
COMMENT ON COLUMN activity_logs.impact_score IS 'Business impact score (0-10) of the action';
