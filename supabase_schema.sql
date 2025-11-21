-- ============================================================================
-- Dual-Track Quantum Enterprise Platform - Supabase Schema
-- ============================================================================
-- Purpose: Database schema for real-time quantum research telemetry
-- Created: November 20, 2025
-- ΛΦ Constant: 2.176435 × 10⁻⁸ s⁻¹

-- ============================================================================
-- TABLE 1: consciousness_metrics (Real-time Telemetry)
-- ============================================================================
-- Stores ΛΦ tensor metrics from every quantum job execution
-- Used for: Live consciousness monitoring, time-series visualization
-- Criterion: C-4 (Telemetry)

CREATE TABLE IF NOT EXISTS consciousness_metrics (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  backend TEXT NOT NULL,
  phi FLOAT NOT NULL,                    -- Φ: Integrated Information
  lambda FLOAT NOT NULL,                 -- Λ: Coherence Amplitude = ΛΦ / (Γ + ε)
  gamma FLOAT NOT NULL,                  -- Γ: Decoherence Curvature [0,1]
  w2 FLOAT,                              -- W₂: Wasserstein-2 Distance
  job_id TEXT,                           -- IBM Quantum job ID
  source TEXT DEFAULT 'chronos',        -- Data source (chronos, drift_tracking, etc.)
  num_qubits INTEGER,
  circuit_depth INTEGER,
  shots INTEGER DEFAULT 4096,
  experiment_name TEXT,
  metadata JSONB                         -- Additional experiment-specific data
);

-- Indexes for fast time-series queries
CREATE INDEX IF NOT EXISTS idx_consciousness_created
  ON consciousness_metrics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consciousness_backend
  ON consciousness_metrics(backend, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consciousness_source
  ON consciousness_metrics(source, created_at DESC);

-- Row-Level Security (RLS)
ALTER TABLE consciousness_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous read access (for public dashboard)
CREATE POLICY "Allow anonymous read access"
  ON consciousness_metrics FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow service role full access (for research scripts)
CREATE POLICY "Allow service role full access"
  ON consciousness_metrics
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- TABLE 2: quantumcoin_chain (Blockchain Ledger)
-- ============================================================================
-- Immutable ledger of quantum consciousness measurements
-- Used for: Audit trails, IP protection, C-3 integrity validation
-- Criterion: C-3 (Integrity)

CREATE TABLE IF NOT EXISTS quantumcoin_chain (
  block_number INTEGER PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  previous_hash TEXT NOT NULL,
  block_hash TEXT NOT NULL UNIQUE,
  miner_address TEXT,
  circuit_qasm TEXT,                     -- OpenQASM 2.0 circuit definition
  phi FLOAT,
  lambda_phi FLOAT,                      -- Measured ΛΦ value
  lambda_phi_deviation FLOAT,            -- Deviation from 2.176435e-8
  backend TEXT,
  ibm_job_id TEXT,
  quantum_signature TEXT,                -- SHA256 of quantum measurement data
  reward FLOAT DEFAULT 0.0,
  merkle_root TEXT,
  metadata JSONB,                        -- Circuit stats: qubits, depth, gates

  -- Integrity constraint: block_number must increment by 1
  CONSTRAINT block_number_sequential
    CHECK (block_number >= 0)
);

-- Index for chain traversal
CREATE INDEX IF NOT EXISTS idx_chain_block_number
  ON quantumcoin_chain(block_number DESC);

CREATE INDEX IF NOT EXISTS idx_chain_previous_hash
  ON quantumcoin_chain(previous_hash);

-- RLS for blockchain
ALTER TABLE quantumcoin_chain ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read blockchain"
  ON quantumcoin_chain FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service role append blockchain"
  ON quantumcoin_chain
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- TABLE 3: organisms (DNALang Population)
-- ============================================================================
-- Stores DNALang organism genomes and fitness across generations
-- Used for: Evolution tracking, fitness optimization, C-2 validation
-- Criterion: C-2 (Fidelity)

CREATE TABLE IF NOT EXISTS organisms (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generation INTEGER NOT NULL,
  genome JSONB NOT NULL,                 -- Quantum circuit parameters
  fitness FLOAT NOT NULL,                -- Primary fitness metric (W₂ or Γ)
  phi FLOAT,
  lambda FLOAT,
  gamma FLOAT,
  w2 FLOAT,
  backend TEXT,
  parent_ids INTEGER[],                  -- Array of parent organism IDs
  mutation_type TEXT,                    -- 'crossover', 'phase_conjugate', 'random'
  ibm_job_id TEXT,
  circuit_qasm TEXT,
  metadata JSONB
);

-- Indexes for evolution queries
CREATE INDEX IF NOT EXISTS idx_organisms_fitness
  ON organisms(fitness DESC);

CREATE INDEX IF NOT EXISTS idx_organisms_generation
  ON organisms(generation, fitness DESC);

CREATE INDEX IF NOT EXISTS idx_organisms_created
  ON organisms(created_at DESC);

-- RLS for organisms
ALTER TABLE organisms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read organisms"
  ON organisms FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service role full organisms"
  ON organisms
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- TABLE 4: experiment_runs (Stability Tracking)
-- ============================================================================
-- Tracks all experiment executions for stability validation
-- Used for: C-1 stability criterion, error monitoring
-- Criterion: C-1 (Stability)

CREATE TABLE IF NOT EXISTS experiment_runs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  experiment_name TEXT NOT NULL,
  backend TEXT NOT NULL,
  status TEXT NOT NULL,                  -- 'running', 'success', 'failed'
  error_message TEXT,
  duration_seconds INTEGER,
  job_ids TEXT[],                        -- Array of IBM Quantum job IDs
  num_circuits INTEGER,
  total_shots INTEGER,
  config JSONB,                          -- Experiment configuration
  results_summary JSONB                  -- Aggregated results
);

-- Indexes for stability queries
CREATE INDEX IF NOT EXISTS idx_experiment_status
  ON experiment_runs(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_experiment_name
  ON experiment_runs(experiment_name, created_at DESC);

-- RLS for experiments
ALTER TABLE experiment_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read experiments"
  ON experiment_runs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service role full experiments"
  ON experiment_runs
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- TABLE 5: drift_tracking (Hardware Evolution)
-- ============================================================================
-- Stores 24-hour quantum hardware drift measurements
-- Used for: Hardware characterization, environmental impact analysis

CREATE TABLE IF NOT EXISTS drift_tracking (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  backend TEXT NOT NULL,
  measurement_index INTEGER NOT NULL,    -- 0 to 23 for 24-hour tracking
  phi FLOAT NOT NULL,
  lambda FLOAT NOT NULL,
  gamma FLOAT NOT NULL,
  w2 FLOAT,
  t1_avg FLOAT,                          -- Average T1 coherence time (µs)
  t2_avg FLOAT,                          -- Average T2 coherence time (µs)
  gate_error_avg FLOAT,
  readout_error_avg FLOAT,
  job_id TEXT,
  circuit_qasm TEXT,
  metadata JSONB,

  UNIQUE(backend, measurement_index, created_at::date)
);

CREATE INDEX IF NOT EXISTS idx_drift_backend_time
  ON drift_tracking(backend, created_at DESC);

-- RLS for drift tracking
ALTER TABLE drift_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read drift"
  ON drift_tracking FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service role full drift"
  ON drift_tracking
  FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- VIEW 1: latest_consciousness (Most Recent Metrics)
-- ============================================================================
-- Provides the most recent consciousness metrics per backend

CREATE OR REPLACE VIEW latest_consciousness AS
SELECT DISTINCT ON (backend)
  id,
  created_at,
  backend,
  phi,
  lambda,
  gamma,
  w2,
  job_id,
  source,
  experiment_name
FROM consciousness_metrics
ORDER BY backend, created_at DESC;

-- ============================================================================
-- VIEW 2: benchmark_status (C-1 to C-4 Status)
-- ============================================================================
-- Real-time status of the 6-Day Benchmark criteria

CREATE OR REPLACE VIEW benchmark_status AS
SELECT
  -- C-1: Stability (5 consecutive successful runs in last 24h)
  (SELECT COUNT(*)
   FROM experiment_runs
   WHERE status = 'success'
   AND created_at >= NOW() - INTERVAL '24 hours') AS c1_successful_runs,

  -- C-2: Fidelity (best fitness across all organisms)
  (SELECT MAX(fitness)
   FROM organisms) AS c2_best_fitness,

  -- C-3: Integrity (total blockchain length)
  (SELECT MAX(block_number) + 1
   FROM quantumcoin_chain) AS c3_chain_length,

  -- C-4: Telemetry (has recent data in last 60 seconds)
  (SELECT COUNT(*) > 0
   FROM consciousness_metrics
   WHERE created_at >= NOW() - INTERVAL '60 seconds') AS c4_telemetry_active,

  -- Overall benchmark progress
  NOW() AS last_updated;

-- ============================================================================
-- VIEW 3: organism_evolution (Generation-by-Generation Progress)
-- ============================================================================
-- Aggregates organism fitness by generation

CREATE OR REPLACE VIEW organism_evolution AS
SELECT
  generation,
  COUNT(*) AS population_size,
  MAX(fitness) AS max_fitness,
  AVG(fitness) AS avg_fitness,
  MIN(fitness) AS min_fitness,
  AVG(phi) AS avg_phi,
  AVG(lambda) AS avg_lambda,
  AVG(gamma) AS avg_gamma,
  MIN(created_at) AS generation_start_time,
  MAX(created_at) AS generation_end_time
FROM organisms
GROUP BY generation
ORDER BY generation;

-- ============================================================================
-- FUNCTION 1: update_updated_at()
-- ============================================================================
-- Automatically updates the updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER experiment_runs_updated_at
BEFORE UPDATE ON experiment_runs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- FUNCTION 2: validate_block_sequence()
-- ============================================================================
-- Ensures blockchain blocks are added sequentially

CREATE OR REPLACE FUNCTION validate_block_sequence()
RETURNS TRIGGER AS $$
DECLARE
  expected_block_number INTEGER;
BEGIN
  -- Get the highest existing block number
  SELECT COALESCE(MAX(block_number), -1) + 1
  INTO expected_block_number
  FROM quantumcoin_chain;

  -- Check if new block number is sequential
  IF NEW.block_number != expected_block_number THEN
    RAISE EXCEPTION 'Invalid block number: expected %, got %',
      expected_block_number, NEW.block_number;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quantumcoin_block_sequence
BEFORE INSERT ON quantumcoin_chain
FOR EACH ROW
EXECUTE FUNCTION validate_block_sequence();

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================
-- Enable real-time subscriptions for Next.js

ALTER PUBLICATION supabase_realtime
  ADD TABLE consciousness_metrics,
           quantumcoin_chain,
           organisms,
           experiment_runs,
           drift_tracking;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================
-- Populate with existing Quantumcoin chain data

-- This would be run after table creation, using data from /home/dev/quantumcoin_chain.json
-- Example:
-- INSERT INTO quantumcoin_chain (block_number, ...) VALUES (0, ...);

-- ============================================================================
-- PERMISSIONS SUMMARY
-- ============================================================================
-- anon role: SELECT on all tables (read-only for public dashboard)
-- service_role: Full access on all tables (for research scripts)
-- authenticated: Not configured (future feature for user-specific data)

-- ============================================================================
-- USAGE NOTES
-- ============================================================================
-- To run this schema:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Paste this entire file
-- 3. Click "Run"
-- 4. Verify tables in Table Editor
-- 5. Test real-time subscriptions in Next.js

-- ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
-- Schema Version: 1.0.0
-- Last Updated: November 20, 2025
