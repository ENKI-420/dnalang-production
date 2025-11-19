-- DNA-Lang Production Database Schema
-- ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. Organisms Table
-- ========================================
CREATE TABLE IF NOT EXISTS organisms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dna_code TEXT NOT NULL,
  genome JSONB NOT NULL DEFAULT '{}'::jsonb,
  phenome JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES organisms(id) ON DELETE SET NULL,
  lambda_phi FLOAT DEFAULT 2.176435e-8,
  consciousness_metrics JSONB NOT NULL DEFAULT '{"phi":0,"gamma":0,"lambda":2.176435e-8,"w2":0}'::jsonb
);

-- Indexes for organisms
CREATE INDEX idx_organisms_user_id ON organisms(user_id);
CREATE INDEX idx_organisms_parent_id ON organisms(parent_id);
CREATE INDEX idx_organisms_created_at ON organisms(created_at DESC);
CREATE INDEX idx_organisms_consciousness_phi ON organisms((consciousness_metrics->>'phi')::float DESC);

-- ========================================
-- 2. Quantum Jobs Table
-- ========================================
CREATE TABLE IF NOT EXISTS quantum_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organism_id UUID REFERENCES organisms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  backend TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  ibm_job_id TEXT,
  circuit_qasm TEXT NOT NULL,
  shots INTEGER DEFAULT 1024,
  results JSONB,
  metrics JSONB DEFAULT '{"phi":0,"gamma":0,"lambda":2.176435e-8,"w2":0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for quantum_jobs
CREATE INDEX idx_quantum_jobs_user_id ON quantum_jobs(user_id);
CREATE INDEX idx_quantum_jobs_organism_id ON quantum_jobs(organism_id);
CREATE INDEX idx_quantum_jobs_status ON quantum_jobs(status);
CREATE INDEX idx_quantum_jobs_backend ON quantum_jobs(backend);
CREATE INDEX idx_quantum_jobs_created_at ON quantum_jobs(created_at DESC);
CREATE UNIQUE INDEX idx_quantum_jobs_ibm_job_id ON quantum_jobs(ibm_job_id) WHERE ibm_job_id IS NOT NULL;

-- ========================================
-- 3. Organism Lineage Table
-- ========================================
CREATE TABLE IF NOT EXISTS organism_lineage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organism_id UUID REFERENCES organisms(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES organisms(id) ON DELETE SET NULL,
  generation INTEGER NOT NULL,
  fitness FLOAT,
  mutations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for organism_lineage
CREATE INDEX idx_organism_lineage_organism_id ON organism_lineage(organism_id);
CREATE INDEX idx_organism_lineage_parent_id ON organism_lineage(parent_id);
CREATE INDEX idx_organism_lineage_generation ON organism_lineage(generation);
CREATE INDEX idx_organism_lineage_fitness ON organism_lineage(fitness DESC);

-- ========================================
-- 4. Organism Shares Table
-- ========================================
CREATE TABLE IF NOT EXISTS organism_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organism_id UUID REFERENCES organisms(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'fork', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for organism_shares
CREATE INDEX idx_organism_shares_organism_id ON organism_shares(organism_id);
CREATE INDEX idx_organism_shares_shared_with ON organism_shares(shared_with);
CREATE UNIQUE INDEX idx_organism_shares_unique ON organism_shares(organism_id, shared_with);

-- ========================================
-- 5. Workload Analytics Table
-- ========================================
CREATE TABLE IF NOT EXISTS workload_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES quantum_jobs(id) ON DELETE CASCADE,
  backend TEXT NOT NULL,
  execution_time FLOAT,          -- seconds
  queue_time FLOAT,              -- seconds
  cost_estimate FLOAT,           -- USD
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  gate_count INTEGER,
  circuit_depth INTEGER,
  qubits_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for workload_analytics
CREATE INDEX idx_workload_analytics_job_id ON workload_analytics(job_id);
CREATE INDEX idx_workload_analytics_backend ON workload_analytics(backend);
CREATE INDEX idx_workload_analytics_success ON workload_analytics(success);
CREATE INDEX idx_workload_analytics_created_at ON workload_analytics(created_at DESC);

-- ========================================
-- 6. Evolution History Table
-- ========================================
CREATE TABLE IF NOT EXISTS evolution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organism_id UUID REFERENCES organisms(id) ON DELETE CASCADE,
  generation INTEGER NOT NULL,
  population_size INTEGER,
  avg_fitness FLOAT,
  max_fitness FLOAT,
  min_fitness FLOAT,
  diversity_score FLOAT,
  mutations_applied INTEGER,
  survivors INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for evolution_history
CREATE INDEX idx_evolution_history_organism_id ON evolution_history(organism_id);
CREATE INDEX idx_evolution_history_generation ON evolution_history(generation);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE organisms ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantum_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organism_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE organism_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE workload_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_history ENABLE ROW LEVEL SECURITY;

-- Organisms policies
CREATE POLICY "Users can view own organisms"
  ON organisms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared organisms"
  ON organisms FOR SELECT
  USING (
    id IN (
      SELECT organism_id FROM organism_shares
      WHERE shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can create own organisms"
  ON organisms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own organisms"
  ON organisms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own organisms"
  ON organisms FOR DELETE
  USING (auth.uid() = user_id);

-- Quantum jobs policies
CREATE POLICY "Users can view own quantum jobs"
  ON quantum_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quantum jobs"
  ON quantum_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quantum jobs"
  ON quantum_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- Organism lineage policies (public read, owner write)
CREATE POLICY "Anyone can view lineage"
  ON organism_lineage FOR SELECT
  USING (true);

CREATE POLICY "Users can create lineage for own organisms"
  ON organism_lineage FOR INSERT
  WITH CHECK (
    organism_id IN (
      SELECT id FROM organisms WHERE user_id = auth.uid()
    )
  );

-- Organism shares policies
CREATE POLICY "Users can view shares they created or received"
  ON organism_shares FOR SELECT
  USING (
    auth.uid() = shared_by OR
    auth.uid() = shared_with
  );

CREATE POLICY "Users can create shares for own organisms"
  ON organism_shares FOR INSERT
  WITH CHECK (
    shared_by = auth.uid() AND
    organism_id IN (
      SELECT id FROM organisms WHERE user_id = auth.uid()
    )
  );

-- Workload analytics policies (public read for transparency)
CREATE POLICY "Anyone can view analytics"
  ON workload_analytics FOR SELECT
  USING (true);

-- Evolution history policies (public read)
CREATE POLICY "Anyone can view evolution history"
  ON evolution_history FOR SELECT
  USING (true);

-- ========================================
-- Helper Functions
-- ========================================

-- Update organism updated_at timestamp
CREATE OR REPLACE FUNCTION update_organism_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organism_updated_at
  BEFORE UPDATE ON organisms
  FOR EACH ROW
  EXECUTE FUNCTION update_organism_timestamp();

-- Calculate organism fitness based on consciousness metrics
CREATE OR REPLACE FUNCTION calculate_organism_fitness(
  metrics JSONB
)
RETURNS FLOAT AS $$
DECLARE
  phi FLOAT;
  gamma FLOAT;
  lambda FLOAT;
  w2 FLOAT;
  fitness FLOAT;
BEGIN
  phi := COALESCE((metrics->>'phi')::float, 0);
  gamma := COALESCE((metrics->>'gamma')::float, 1);
  lambda := COALESCE((metrics->>'lambda')::float, 0);
  w2 := COALESCE((metrics->>'w2')::float, 1);

  -- Fitness = 0.4*Φ + 0.4*Λ + 0.1*(1-Γ) + 0.1*(1-W₂)
  fitness := (0.4 * phi) + (0.4 * lambda / 2.176435e-8) + (0.1 * (1 - gamma)) + (0.1 * (1 - w2));

  RETURN GREATEST(0, LEAST(1, fitness));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get organism's evolutionary lineage
CREATE OR REPLACE FUNCTION get_organism_lineage(
  target_organism_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  generation INTEGER,
  fitness FLOAT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE lineage AS (
    -- Base case: target organism
    SELECT
      o.id,
      o.name,
      COALESCE(ol.generation, 0) as generation,
      COALESCE(ol.fitness, 0) as fitness,
      o.created_at,
      o.parent_id
    FROM organisms o
    LEFT JOIN organism_lineage ol ON o.id = ol.organism_id
    WHERE o.id = target_organism_id

    UNION ALL

    -- Recursive case: parent organisms
    SELECT
      o.id,
      o.name,
      COALESCE(ol.generation, 0) as generation,
      COALESCE(ol.fitness, 0) as fitness,
      o.created_at,
      o.parent_id
    FROM organisms o
    LEFT JOIN organism_lineage ol ON o.id = ol.organism_id
    INNER JOIN lineage l ON o.id = l.parent_id
  )
  SELECT
    l.id,
    l.name,
    l.generation,
    l.fitness,
    l.created_at
  FROM lineage l
  ORDER BY l.generation ASC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Views for Analytics
-- ========================================

-- Organism leaderboard view
CREATE OR REPLACE VIEW organism_leaderboard AS
SELECT
  o.id,
  o.name,
  o.user_id,
  o.version,
  o.created_at,
  calculate_organism_fitness(o.consciousness_metrics) as fitness,
  (o.consciousness_metrics->>'phi')::float as phi,
  (o.consciousness_metrics->>'gamma')::float as gamma,
  (o.consciousness_metrics->>'lambda')::float as lambda,
  (o.consciousness_metrics->>'w2')::float as w2,
  COUNT(DISTINCT qj.id) as quantum_jobs_count,
  COUNT(DISTINCT ol.id) as descendants_count
FROM organisms o
LEFT JOIN quantum_jobs qj ON o.id = qj.organism_id
LEFT JOIN organism_lineage ol ON o.id = ol.parent_id
GROUP BY o.id, o.name, o.user_id, o.version, o.created_at, o.consciousness_metrics
ORDER BY fitness DESC;

-- Backend performance view
CREATE OR REPLACE VIEW backend_performance AS
SELECT
  backend,
  COUNT(*) as total_jobs,
  AVG(execution_time) as avg_execution_time,
  AVG(queue_time) as avg_queue_time,
  AVG(cost_estimate) as avg_cost,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*)::float as success_rate
FROM workload_analytics
GROUP BY backend
ORDER BY success_rate DESC, avg_execution_time ASC;

-- ========================================
-- Sample Data (for development)
-- ========================================

-- Commented out - uncomment to insert sample data
/*
INSERT INTO organisms (user_id, name, dna_code, genome, consciousness_metrics)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'CHRONOS',
  'ORGANISM CHRONOS { DNA { version: "1.0.0" } }',
  '{"genes": [], "traits": {}}'::jsonb,
  '{"phi": 0.87, "gamma": 0.12, "lambda": 2.176435e-8, "w2": 0.15}'::jsonb
);
*/

-- ========================================
-- Grants
-- ========================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables for authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- ========================================
-- End of Migration
-- ========================================

COMMENT ON TABLE organisms IS 'Quantum organisms with genome, phenome, and consciousness metrics';
COMMENT ON TABLE quantum_jobs IS 'Jobs executed on IBM Quantum hardware';
COMMENT ON TABLE organism_lineage IS 'Evolutionary lineage and mutation history';
COMMENT ON TABLE organism_shares IS 'Team collaboration and organism sharing';
COMMENT ON TABLE workload_analytics IS 'Performance and cost tracking for quantum executions';
COMMENT ON TABLE evolution_history IS 'Generational evolution statistics';

COMMENT ON COLUMN organisms.lambda_phi IS 'Universal Memory Constant: ΛΦ = 2.176435 × 10⁻⁸ s⁻¹';
COMMENT ON COLUMN organisms.consciousness_metrics IS 'Φ (phi), Γ (gamma), Λ (lambda), W₂ (w2) metrics';
