-- ============================================================================
-- DNALang Multi-Tenant Database Schema
-- PostgreSQL 15+
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Create custom types
CREATE TYPE tenant_type AS ENUM ('health_system', 'research_org', 'pharma', 'individual');
CREATE TYPE subscription_plan AS ENUM ('free', 'professional', 'enterprise', 'research');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'suspended', 'canceled');
CREATE TYPE user_role AS ENUM (
    'system_admin',
    'org_admin',
    'oncologist',
    'pathologist',
    'genetic_counselor',
    'clinical_researcher',
    'lab_analyst',
    'bioinformatician',
    'developer',
    'billing_admin',
    'compliance_auditor',
    'patient',
    'vendor'
);
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'execute', 'access');
CREATE TYPE organism_status AS ENUM ('draft', 'active', 'archived', 'deprecated');

-- ============================================================================
-- Core Tables
-- ============================================================================

-- Tenants (Organizations)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type tenant_type NOT NULL,
    subdomain VARCHAR(63) UNIQUE,

    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),

    -- Subscription
    subscription_plan subscription_plan NOT NULL DEFAULT 'free',
    subscription_status subscription_status NOT NULL DEFAULT 'trial',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_started_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,

    -- Compliance
    hipaa_enabled BOOLEAN DEFAULT FALSE,
    baa_signed BOOLEAN DEFAULT FALSE,
    baa_signed_at TIMESTAMP WITH TIME ZONE,
    hitrust_certified BOOLEAN DEFAULT FALSE,

    -- Stripe Integration
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_trial_period CHECK (
        trial_ends_at IS NULL OR trial_ends_at > created_at
    )
);

CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_stripe_customer ON tenants(stripe_customer_id);
CREATE INDEX idx_tenants_deleted ON tenants(deleted_at) WHERE deleted_at IS NULL;

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Authentication
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255), -- NULL for SSO users
    keycloak_id VARCHAR(255) UNIQUE,

    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    avatar_url TEXT,
    phone VARCHAR(50),

    -- Status
    enabled BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,

    -- MFA
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT unique_email_per_tenant UNIQUE(tenant_id, email),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_keycloak ON users(keycloak_id);
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;

-- User Roles (Many-to-Many)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT unique_user_role UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Session Data
    access_token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,

    -- Client Information
    ip_address INET,
    user_agent TEXT,
    device_id VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_tenant ON sessions(tenant_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_access_token ON sessions(access_token_hash);

-- ============================================================================
-- Permissions & RBAC
-- ============================================================================

-- Resources (Organisms, Patients, etc.)
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Resource Identification
    resource_type VARCHAR(100) NOT NULL, -- 'organism', 'patient', 'analysis', etc.
    resource_id VARCHAR(255) NOT NULL,

    -- Ownership
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_resource UNIQUE(tenant_id, resource_type, resource_id)
);

CREATE INDEX idx_resources_tenant ON resources(tenant_id);
CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_owner ON resources(owner_id);

-- Permissions (Fine-grained access control)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role user_role,

    -- Permissions
    can_read BOOLEAN DEFAULT FALSE,
    can_write BOOLEAN DEFAULT FALSE,
    can_execute BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_share BOOLEAN DEFAULT FALSE,

    -- Metadata
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT user_or_role_required CHECK (
        (user_id IS NOT NULL AND role IS NULL) OR
        (user_id IS NULL AND role IS NOT NULL)
    )
);

CREATE INDEX idx_permissions_resource ON permissions(resource_id);
CREATE INDEX idx_permissions_user ON permissions(user_id);
CREATE INDEX idx_permissions_role ON permissions(role);

-- ============================================================================
-- Usage & Billing
-- ============================================================================

-- Subscription Plans (Reference Table)
CREATE TABLE subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Pricing
    price_monthly DECIMAL(10, 2),
    price_annual DECIMAL(10, 2),

    -- Limits
    max_users INTEGER,
    max_quantum_jobs_monthly INTEGER,
    max_storage_gb INTEGER,
    max_organisms INTEGER,

    -- Features
    hipaa_compliance BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    custom_branding BOOLEAN DEFAULT FALSE,
    api_access BOOLEAN DEFAULT FALSE,

    -- Metadata
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed subscription plans
INSERT INTO subscription_plans (id, name, price_monthly, price_annual, max_users, max_quantum_jobs_monthly, max_storage_gb, max_organisms, hipaa_compliance, api_access) VALUES
('free', 'Free', 0, 0, 1, 10, 1, 3, FALSE, FALSE),
('professional', 'Professional', 299, 2990, 10, 100, 50, 50, FALSE, TRUE),
('enterprise', 'Enterprise', 999, 9990, NULL, 1000, 500, NULL, TRUE, TRUE),
('research', 'Research (Academic)', 499, 4990, 50, 500, 250, NULL, FALSE, TRUE);

-- Usage Tracking
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Usage Type
    usage_type VARCHAR(100) NOT NULL, -- 'quantum_job', 'storage', 'api_call', etc.

    -- Quantity
    quantity DECIMAL(15, 6) NOT NULL DEFAULT 1,
    unit VARCHAR(50), -- 'jobs', 'GB', 'calls', etc.

    -- Cost
    unit_cost DECIMAL(10, 6),
    total_cost DECIMAL(10, 2),

    -- Metadata
    metadata JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Billing Period
    billing_month INTEGER NOT NULL, -- 1-12
    billing_year INTEGER NOT NULL
);

CREATE INDEX idx_usage_tenant ON usage_records(tenant_id);
CREATE INDEX idx_usage_user ON usage_records(user_id);
CREATE INDEX idx_usage_type ON usage_records(usage_type);
CREATE INDEX idx_usage_period ON usage_records(billing_year, billing_month);
CREATE INDEX idx_usage_recorded ON usage_records(recorded_at);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Invoice Details
    invoice_number VARCHAR(100) UNIQUE NOT NULL,

    -- Stripe Integration
    stripe_invoice_id VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255),

    -- Amounts
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending', 'paid', 'failed', 'canceled'

    -- Dates
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Invoice Line Items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    -- Item Details
    description TEXT NOT NULL,
    quantity DECIMAL(15, 6) NOT NULL,
    unit_price DECIMAL(10, 6) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,

    -- Metadata
    metadata JSONB
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ============================================================================
-- Quantum Organisms
-- ============================================================================

-- Organisms
CREATE TABLE organisms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Organism Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status organism_status DEFAULT 'draft',

    -- DNA Code
    dna_code TEXT NOT NULL,
    dna_hash VARCHAR(64) NOT NULL, -- SHA-256 of dna_code

    -- Consciousness Metrics
    phi DECIMAL(10, 8), -- Integrated Information
    lambda DECIMAL(15, 10), -- Coherence
    gamma DECIMAL(10, 8), -- Decoherence
    w2_distance DECIMAL(10, 8), -- Wasserstein-2

    -- Execution
    last_executed_at TIMESTAMP WITH TIME ZONE,
    total_executions INTEGER DEFAULT 0,

    -- Generation/Evolution
    generation INTEGER DEFAULT 1,
    parent_organism_id UUID REFERENCES organisms(id),

    -- Metadata
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT unique_organism_name UNIQUE(tenant_id, name)
);

CREATE INDEX idx_organisms_tenant ON organisms(tenant_id);
CREATE INDEX idx_organisms_owner ON organisms(owner_id);
CREATE INDEX idx_organisms_status ON organisms(status);
CREATE INDEX idx_organisms_hash ON organisms(dna_hash);
CREATE INDEX idx_organisms_parent ON organisms(parent_organism_id);
CREATE INDEX idx_organisms_deleted ON organisms(deleted_at) WHERE deleted_at IS NULL;

-- Organism Executions
CREATE TABLE organism_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organism_id UUID NOT NULL REFERENCES organisms(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Execution Details
    backend VARCHAR(100) NOT NULL, -- 'ibm_torino', 'ibm_kyoto', etc.
    job_id VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'canceled'

    -- Results
    result JSONB,
    error TEXT,

    -- Metrics
    shots INTEGER,
    circuit_depth INTEGER,
    num_qubits INTEGER,
    execution_time_ms INTEGER,

    -- Consciousness Metrics
    phi DECIMAL(10, 8),
    lambda DECIMAL(15, 10),
    gamma DECIMAL(10, 8),
    w2_distance DECIMAL(10, 8),

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_executions_organism ON organism_executions(organism_id);
CREATE INDEX idx_executions_tenant ON organism_executions(tenant_id);
CREATE INDEX idx_executions_user ON organism_executions(user_id);
CREATE INDEX idx_executions_status ON organism_executions(status);
CREATE INDEX idx_executions_backend ON organism_executions(backend);
CREATE INDEX idx_executions_created ON organism_executions(created_at);

-- ============================================================================
-- Audit Logging (HIPAA Compliance)
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Action
    action audit_action NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),

    -- Details
    description TEXT,
    old_value JSONB,
    new_value JSONB,

    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id UUID,

    -- PHI Access Flag
    phi_accessed BOOLEAN DEFAULT FALSE,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_phi ON audit_logs(phi_accessed) WHERE phi_accessed = TRUE;
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================================
-- Functions & Triggers
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organisms_updated_at BEFORE UPDATE ON organisms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger for PHI access
CREATE OR REPLACE FUNCTION log_phi_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Add custom logic to detect PHI access
    -- For example, log access to specific resource types
    IF NEW.resource_type IN ('patient', 'medical_record', 'genetic_data') THEN
        NEW.phi_accessed = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_phi_flag BEFORE INSERT ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION log_phi_access();

-- ============================================================================
-- Views
-- ============================================================================

-- Active Users View
CREATE VIEW v_active_users AS
SELECT
    u.id,
    u.tenant_id,
    u.email,
    u.first_name,
    u.last_name,
    u.display_name,
    u.enabled,
    u.last_login,
    array_agg(DISTINCT ur.role) as roles,
    t.name as tenant_name,
    t.subscription_plan
FROM users u
JOIN tenants t ON u.tenant_id = t.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.deleted_at IS NULL
  AND u.enabled = TRUE
  AND t.deleted_at IS NULL
GROUP BY u.id, u.tenant_id, u.email, u.first_name, u.last_name, u.display_name,
         u.enabled, u.last_login, t.name, t.subscription_plan;

-- Monthly Usage Summary
CREATE VIEW v_monthly_usage AS
SELECT
    tenant_id,
    billing_year,
    billing_month,
    usage_type,
    SUM(quantity) as total_quantity,
    SUM(total_cost) as total_cost
FROM usage_records
GROUP BY tenant_id, billing_year, billing_month, usage_type;

-- Organism Performance
CREATE VIEW v_organism_performance AS
SELECT
    o.id,
    o.name,
    o.tenant_id,
    o.owner_id,
    o.phi,
    o.lambda,
    o.gamma,
    o.total_executions,
    AVG(oe.execution_time_ms) as avg_execution_time,
    MAX(oe.phi) as max_phi,
    COUNT(CASE WHEN oe.status = 'completed' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN oe.status = 'failed' THEN 1 END) as failed_executions
FROM organisms o
LEFT JOIN organism_executions oe ON o.id = oe.organism_id
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, o.tenant_id, o.owner_id, o.phi, o.lambda, o.gamma, o.total_executions;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE tenants IS 'Multi-tenant organizations';
COMMENT ON TABLE users IS 'Platform users with tenant isolation';
COMMENT ON TABLE user_roles IS 'Role assignments for users';
COMMENT ON TABLE sessions IS 'Active user sessions with JWT tokens';
COMMENT ON TABLE resources IS 'Generic resource table for RBAC';
COMMENT ON TABLE permissions IS 'Fine-grained permissions per resource';
COMMENT ON TABLE usage_records IS 'Usage tracking for billing';
COMMENT ON TABLE invoices IS 'Billing invoices';
COMMENT ON TABLE organisms IS 'DNALang quantum organisms';
COMMENT ON TABLE organism_executions IS 'Execution history and results';
COMMENT ON TABLE audit_logs IS 'HIPAA-compliant audit trail';
