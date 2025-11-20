-- ============================================================================
-- FHIR Integration Schema
-- SMART on FHIR sessions and CDS Hooks contexts
-- ============================================================================

-- SMART Launch Contexts (temporary, for OAuth flow)
CREATE TABLE smart_launch_contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(255) UNIQUE NOT NULL,
    iss TEXT NOT NULL, -- FHIR server base URL
    launch_token VARCHAR(255) NOT NULL,
    authorization_endpoint TEXT NOT NULL,
    token_endpoint TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_smart_launch_state ON smart_launch_contexts(state);
CREATE INDEX idx_smart_launch_expires ON smart_launch_contexts(expires_at);

-- SMART Sessions
CREATE TABLE smart_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    state VARCHAR(255) REFERENCES smart_launch_contexts(state),

    -- Tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    scope TEXT,

    -- Context
    patient_id VARCHAR(255),
    fhir_user TEXT, -- Practitioner/123 or Patient/456
    fhir_server TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refreshed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_smart_sessions_token ON smart_sessions(session_token);
CREATE INDEX idx_smart_sessions_patient ON smart_sessions(patient_id);
CREATE INDEX idx_smart_sessions_expires ON smart_sessions(expires_at);

-- CDS Hooks Invocations (audit trail)
CREATE TABLE cds_hooks_invocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hook_id VARCHAR(100) NOT NULL, -- 'patient-view', 'order-sign', etc.
    hook_instance VARCHAR(255) NOT NULL,
    patient_id VARCHAR(255),
    user_id VARCHAR(255), -- FHIR user (Practitioner/123)
    fhir_server TEXT,

    -- Request/Response
    request_body JSONB,
    response_body JSONB,
    cards_returned INTEGER DEFAULT 0,

    -- Timestamps
    invoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_ms INTEGER
);

CREATE INDEX idx_cds_hooks_hook_id ON cds_hooks_invocations(hook_id);
CREATE INDEX idx_cds_hooks_patient ON cds_hooks_invocations(patient_id);
CREATE INDEX idx_cds_hooks_invoked ON cds_hooks_invocations(invoked_at);

-- CDS Hooks Card Actions (user interactions)
CREATE TABLE cds_hooks_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invocation_id UUID REFERENCES cds_hooks_invocations(id) ON DELETE CASCADE,
    card_index INTEGER NOT NULL,
    suggestion_label TEXT,
    action_type VARCHAR(50), -- 'create', 'update', 'delete', 'link'
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),

    -- User who took action
    user_id VARCHAR(255),

    -- Timestamps
    acted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cds_actions_invocation ON cds_hooks_actions(invocation_id);
CREATE INDEX idx_cds_actions_user ON cds_hooks_actions(user_id);
CREATE INDEX idx_cds_actions_acted ON cds_hooks_actions(acted_at);

-- Cleanup expired launch contexts (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_smart_contexts()
RETURNS void AS $$
BEGIN
    DELETE FROM smart_launch_contexts WHERE expires_at < NOW() - INTERVAL '1 hour';
    DELETE FROM smart_sessions WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE smart_launch_contexts IS 'Temporary storage for SMART OAuth launch flow';
COMMENT ON TABLE smart_sessions IS 'Active SMART on FHIR sessions with access tokens';
COMMENT ON TABLE cds_hooks_invocations IS 'Audit trail of CDS Hooks service calls';
COMMENT ON TABLE cds_hooks_actions IS 'User actions taken on CDS Hooks cards';
