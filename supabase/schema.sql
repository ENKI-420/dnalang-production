-- ============================================================================
-- QuantumLM Multi-User Platform Database Schema
-- Supabase PostgreSQL with Row-Level Security (RLS)
-- Version: 1.0.0
-- Author: DNALang Quantum Research
-- ============================================================================

-- ============================================================================
-- PART 1: EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector embeddings for code search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- PART 2: CORE IDENTITY TABLES
-- ============================================================================

-- Users table (Authentication & Identity)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Web3 integration
    wallet_address VARCHAR(42) UNIQUE,

    -- Security
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Profiles table (Public-facing data)
CREATE TABLE profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,

    -- Identity
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),

    -- Visual
    avatar_url TEXT,
    banner_url TEXT,

    -- About
    bio TEXT,
    affiliation VARCHAR(100),
    location VARCHAR(100),
    website VARCHAR(255),

    -- Research
    research_interests JSONB DEFAULT '[]',
    specializations JSONB DEFAULT '[]',

    -- Privacy settings
    privacy_settings JSONB DEFAULT '{"email_visible": false, "location_visible": true}',

    -- Stats (cached)
    experiments_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for fast lookups
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- ============================================================================
-- PART 3: ROLE-BASED ACCESS CONTROL (RBAC)
-- ============================================================================

-- Roles definition
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'
);

-- Insert default roles
INSERT INTO roles (role_name, description, permissions) VALUES
('admin', 'Full system access', '["*"]'),
('researcher', 'Can run experiments and publish', '["experiments:create", "experiments:read", "projects:create"]'),
('operator', 'Can view Arena and manage jobs', '["arena:view", "jobs:manage"]'),
('viewer', 'Read-only access', '["experiments:read", "projects:read"]'),
('miner', 'Can mine QuantumCoin tokens', '["mining:execute", "tokens:claim"]');

-- User-Role assignments
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(user_id),
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================================
-- PART 4: SOCIAL GRAPH
-- ============================================================================

-- Follow relationships
CREATE TABLE follows (
    follower_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- ============================================================================
-- PART 5: AURA ARENA TABLES
-- ============================================================================

-- Arena sessions (Active Aura Arena instances)
CREATE TABLE arena_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,

    -- Session metadata
    session_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active', -- active, paused, completed

    -- Agents
    active_agents JSONB DEFAULT '[]', -- [{agent_id, type, model, status}]

    -- State
    current_task TEXT,
    progress JSONB DEFAULT '{"stage": "idle", "completion": 0}',

    -- Metrics
    total_mutations INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    coherence_score FLOAT DEFAULT 0.0,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_arena_sessions_user ON arena_sessions(user_id);
CREATE INDEX idx_arena_sessions_status ON arena_sessions(status);

-- Agent events (Live telemetry stream)
CREATE TABLE agent_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES arena_sessions(session_id) ON DELETE CASCADE,

    -- Agent identity
    agent_id VARCHAR(50) NOT NULL,
    agent_type VARCHAR(50), -- architect, coder, quantum, admin

    -- Event data
    event_type VARCHAR(50), -- plan, code, test, deploy, error
    event_data JSONB,

    -- Severity
    level VARCHAR(20) DEFAULT 'info', -- debug, info, warning, error

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_events_session ON agent_events(session_id);
CREATE INDEX idx_agent_events_created ON agent_events(created_at DESC);

-- Commit logs (Version-controlled Arena commits)
CREATE TABLE commit_logs (
    commit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES arena_sessions(session_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id),

    -- Commit metadata
    commit_hash VARCHAR(64) UNIQUE,
    commit_message TEXT,
    author VARCHAR(100),

    -- Changes
    files_changed INTEGER,
    additions INTEGER,
    deletions INTEGER,
    diff TEXT, -- Git-style diff

    -- Timestamps
    committed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commit_logs_session ON commit_logs(session_id);
CREATE INDEX idx_commit_logs_hash ON commit_logs(commit_hash);

-- ============================================================================
-- PART 6: QUANTUM JOBS & EXPERIMENTS
-- ============================================================================

-- Quantum jobs metadata
CREATE TABLE quantum_jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    session_id UUID REFERENCES arena_sessions(session_id),

    -- IBM Quantum integration
    ibm_job_id VARCHAR(100) UNIQUE,
    backend VARCHAR(50), -- ibm_torino, ibm_kyoto, etc.

    -- Circuit metadata
    circuit_qasm TEXT,
    num_qubits INTEGER,
    circuit_depth INTEGER,
    shots INTEGER,

    -- Results
    counts JSONB,
    metrics JSONB, -- {phi, lambda, gamma, concurrence, witness}

    -- Status
    status VARCHAR(20) DEFAULT 'queued', -- queued, running, completed, failed
    error_message TEXT,

    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_quantum_jobs_user ON quantum_jobs(user_id);
CREATE INDEX idx_quantum_jobs_status ON quantum_jobs(status);
CREATE INDEX idx_quantum_jobs_ibm_job ON quantum_jobs(ibm_job_id);

-- ============================================================================
-- PART 7: CODEBASE MEMORY (Vector Search)
-- ============================================================================

-- Codebase embeddings for AI context
CREATE TABLE codebase_memory (
    memory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    session_id UUID REFERENCES arena_sessions(session_id),

    -- Content
    file_path TEXT,
    content TEXT,
    language VARCHAR(50),

    -- Vector embedding (OpenAI ada-002 = 1536 dimensions)
    embedding vector(1536),

    -- Metadata
    chunk_index INTEGER,
    total_chunks INTEGER,

    -- Timestamps
    indexed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vector similarity index (for fast semantic search)
CREATE INDEX idx_codebase_memory_embedding ON codebase_memory
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX idx_codebase_memory_session ON codebase_memory(session_id);

-- ============================================================================
-- PART 8: TASK QUEUE (Python Worker Jobs)
-- ============================================================================

-- Task queue for long-running operations
CREATE TABLE task_queue (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    session_id UUID REFERENCES arena_sessions(session_id),

    -- Task definition
    task_type VARCHAR(50), -- quantum_execute, code_mutate, corpus_ingest
    task_payload JSONB,

    -- Priority
    priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)

    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    result JSONB,
    error TEXT,

    -- Worker tracking
    worker_id VARCHAR(50),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_task_queue_status ON task_queue(status);
CREATE INDEX idx_task_queue_priority ON task_queue(priority DESC);
CREATE INDEX idx_task_queue_created ON task_queue(created_at);

-- ============================================================================
-- PART 9: ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE commit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantum_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE codebase_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_queue ENABLE ROW LEVEL SECURITY;

-- Users: Can only read/update own record
CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY users_update_own ON users
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Profiles: Public read, own update
CREATE POLICY profiles_select_all ON profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE
    USING (user_id = auth.uid());

-- Arena sessions: Only owner can access
CREATE POLICY arena_sessions_select_own ON arena_sessions
    FOR SELECT
    USING (user_id = auth.uid() OR
           EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id = 1)); -- Admin

CREATE POLICY arena_sessions_insert_own ON arena_sessions
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Agent events: Read-only for session owner
CREATE POLICY agent_events_select_own ON agent_events
    FOR SELECT
    USING (session_id IN (SELECT session_id FROM arena_sessions WHERE user_id = auth.uid()));

-- Quantum jobs: Owner can read/update
CREATE POLICY quantum_jobs_select_own ON quantum_jobs
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY quantum_jobs_insert_own ON quantum_jobs
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PART 10: FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET followers_count = followers_count + 1
        WHERE user_id = NEW.following_id;

        UPDATE profiles SET following_count = following_count + 1
        WHERE user_id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0)
        WHERE user_id = OLD.following_id;

        UPDATE profiles SET following_count = GREATEST(following_count - 1, 0)
        WHERE user_id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follow_count_trigger
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- ============================================================================
-- PART 11: UTILITY FUNCTIONS
-- ============================================================================

-- Search codebase via vector similarity
CREATE OR REPLACE FUNCTION search_codebase(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    memory_id UUID,
    file_path TEXT,
    content TEXT,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.memory_id,
        cm.file_path,
        cm.content,
        1 - (cm.embedding <=> query_embedding) AS similarity
    FROM codebase_memory cm
    WHERE 1 - (cm.embedding <=> query_embedding) > match_threshold
    ORDER BY cm.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Get user reputation
CREATE OR REPLACE FUNCTION calculate_reputation(input_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    rep INTEGER := 0;
BEGIN
    -- Base points for experiments
    SELECT COALESCE(COUNT(*) * 10, 0) INTO rep
    FROM quantum_jobs
    WHERE user_id = input_user_id AND status = 'completed';

    -- Bonus for followers
    SELECT rep + COALESCE(COUNT(*) * 5, 0) INTO rep
    FROM follows
    WHERE following_id = input_user_id;

    RETURN rep;
END;
$$ LANGUAGE plpgsql;

-- Increment session commits
CREATE OR REPLACE FUNCTION increment_session_commits(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE arena_sessions
    SET total_commits = total_commits + 1,
        last_activity = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SCHEMA COMPLETE
-- Version: 1.0.0
-- Tables: 11
-- Indexes: 16
-- Triggers: 3
-- Functions: 4
-- ============================================================================
