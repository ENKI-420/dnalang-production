-- ============================================================================
-- DNALang Database Seed Data
-- Initial data for development and testing
-- ============================================================================

-- ============================================================================
-- Demo Tenant
-- ============================================================================

INSERT INTO tenants (
    id,
    name,
    type,
    subdomain,
    email,
    subscription_plan,
    subscription_status,
    trial_ends_at,
    hipaa_enabled,
    baa_signed,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'DNALang Demo Health System',
    'health_system',
    'demo',
    'admin@demo.dnalang.dev',
    'enterprise',
    'active',
    NULL,
    TRUE,
    TRUE,
    NOW()
);

-- ============================================================================
-- Demo Users
-- ============================================================================

-- System Admin
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    first_name,
    last_name,
    display_name,
    enabled,
    email_verified,
    email_verified_at,
    created_at
) VALUES (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'admin@demo.dnalang.dev',
    crypt('AdminPass123!', gen_salt('bf')),
    'System',
    'Administrator',
    'Admin',
    TRUE,
    TRUE,
    NOW(),
    NOW()
);

INSERT INTO user_roles (user_id, role, granted_at) VALUES
('10000000-0000-0000-0000-000000000001', 'system_admin', NOW());

-- Oncologist
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    first_name,
    last_name,
    display_name,
    enabled,
    email_verified,
    email_verified_at,
    created_at
) VALUES (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'oncologist@demo.dnalang.dev',
    crypt('OncoPass123!', gen_salt('bf')),
    'Dr. Jane',
    'Smith',
    'Dr. Smith',
    TRUE,
    TRUE,
    NOW(),
    NOW()
);

INSERT INTO user_roles (user_id, role, granted_at) VALUES
('10000000-0000-0000-0000-000000000002', 'oncologist', NOW());

-- Bioinformatician
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    first_name,
    last_name,
    display_name,
    enabled,
    email_verified,
    email_verified_at,
    created_at
) VALUES (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'bioinfo@demo.dnalang.dev',
    crypt('BioPass123!', gen_salt('bf')),
    'Alex',
    'Chen',
    'Alex Chen',
    TRUE,
    TRUE,
    NOW(),
    NOW()
);

INSERT INTO user_roles (user_id, role, granted_at) VALUES
('10000000-0000-0000-0000-000000000003', 'bioinformatician', NOW()),
('10000000-0000-0000-0000-000000000003', 'developer', NOW());

-- Clinical Researcher
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    first_name,
    last_name,
    display_name,
    enabled,
    email_verified,
    email_verified_at,
    created_at
) VALUES (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'researcher@demo.dnalang.dev',
    crypt('ResearchPass123!', gen_salt('bf')),
    'Dr. Maria',
    'Rodriguez',
    'Dr. Rodriguez',
    TRUE,
    TRUE,
    NOW(),
    NOW()
);

INSERT INTO user_roles (user_id, role, granted_at) VALUES
('10000000-0000-0000-0000-000000000004', 'clinical_researcher', NOW());

-- ============================================================================
-- Demo Organisms
-- ============================================================================

-- Organism 1: CHRONOS (Time-evolution quantum system)
INSERT INTO organisms (
    id,
    tenant_id,
    owner_id,
    name,
    description,
    status,
    dna_code,
    dna_hash,
    phi,
    lambda,
    gamma,
    w2_distance,
    total_executions,
    generation,
    tags,
    created_at
) VALUES (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'CHRONOS',
    'Time-evolution quantum organism with self-optimization',
    'active',
    'ORGANISM CHRONOS {
  DNA {
    domain: "quantum_time_evolution"
    version: "1.0.0"
    lambda_phi: 2.176435e-8
  }
  GENOME {
    GENE TimeEvolution {
      purpose: "Quantum time evolution with optimization"
      TRAITS {
        coherence: 0.89
        entanglement: 0.76
      }
    }
  }
  QUANTUM {
    backend: "ibm_torino"
    shots: 4000
  }
}',
    '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    0.87654321,
    2.176435e-8,
    0.12345678,
    0.08765432,
    127,
    1,
    ARRAY['time-evolution', 'optimization', 'production'],
    NOW() - INTERVAL '30 days'
);

-- Organism 2: ΛMaximizer (Coherence optimization)
INSERT INTO organisms (
    id,
    tenant_id,
    owner_id,
    name,
    description,
    status,
    dna_code,
    dna_hash,
    phi,
    lambda,
    gamma,
    w2_distance,
    total_executions,
    generation,
    tags,
    created_at
) VALUES (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'ΛMaximizer',
    'Hardware-only coherence optimization via Loschmidt echo',
    'active',
    'ORGANISM LambdaMaximizer {
  DNA {
    domain: "coherence_optimization"
    version: "2.1.0"
    lambda_phi: 2.176435e-8
  }
  GENOME {
    GENE CoherenceOptimization {
      purpose: "Maximize quantum coherence"
      TRAITS {
        loschmidt_echo: 0.92
        decoherence_resistance: 0.88
      }
    }
  }
  QUANTUM {
    backend: "ibm_torino"
    shots: 8000
  }
}',
    '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    0.92341234,
    2.176435e-8,
    0.07658766,
    0.04321098,
    89,
    1,
    ARRAY['coherence', 'loschmidt-echo', 'production'],
    NOW() - INTERVAL '45 days'
);

-- Organism 3: TumorClassifier (Cancer diagnosis)
INSERT INTO organisms (
    id,
    tenant_id,
    owner_id,
    name,
    description,
    status,
    dna_code,
    dna_hash,
    phi,
    lambda,
    gamma,
    w2_distance,
    total_executions,
    generation,
    tags,
    created_at
) VALUES (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'TumorClassifier',
    'Quantum machine learning for tumor classification',
    'active',
    'ORGANISM TumorClassifier {
  DNA {
    domain: "oncology_classification"
    version: "1.2.0"
    lambda_phi: 2.176435e-8
  }
  GENOME {
    GENE Classification {
      purpose: "Classify tumor types via QML"
      TRAITS {
        accuracy: 0.94
        sensitivity: 0.91
        specificity: 0.96
      }
    }
  }
  QUANTUM {
    backend: "ibm_kyoto"
    shots: 10000
  }
}',
    '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    0.85432109,
    2.176435e-8,
    0.14567891,
    0.09876543,
    213,
    1,
    ARRAY['oncology', 'classification', 'clinical'],
    NOW() - INTERVAL '60 days'
);

-- ============================================================================
-- Demo Organism Executions
-- ============================================================================

-- Recent executions for CHRONOS
INSERT INTO organism_executions (
    organism_id,
    tenant_id,
    user_id,
    backend,
    job_id,
    status,
    result,
    shots,
    circuit_depth,
    num_qubits,
    execution_time_ms,
    phi,
    lambda,
    gamma,
    w2_distance,
    started_at,
    completed_at,
    created_at
) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'ibm_torino',
    'c123abc456def789',
    'completed',
    '{"counts": {"00": 1987, "01": 512, "10": 498, "11": 1003}, "success": true}',
    4000,
    45,
    4,
    2341,
    0.87654321,
    2.176435e-8,
    0.12345678,
    0.08765432,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 58 minutes',
    NOW() - INTERVAL '2 hours'
),
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'ibm_torino',
    'c234bcd567efg890',
    'completed',
    '{"counts": {"00": 2012, "01": 487, "10": 523, "11": 978}, "success": true}',
    4000,
    45,
    4,
    2298,
    0.88123456,
    2.176435e-8,
    0.11876544,
    0.08234567,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '23 hours 56 minutes',
    NOW() - INTERVAL '1 day'
);

-- Recent execution for TumorClassifier
INSERT INTO organism_executions (
    organism_id,
    tenant_id,
    user_id,
    backend,
    job_id,
    status,
    result,
    shots,
    circuit_depth,
    num_qubits,
    execution_time_ms,
    phi,
    lambda,
    gamma,
    w2_distance,
    started_at,
    completed_at,
    created_at
) VALUES
(
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'ibm_kyoto',
    'c345cde678fgh901',
    'completed',
    '{"classification": "invasive_ductal_carcinoma", "confidence": 0.94, "success": true}',
    10000,
    67,
    8,
    4567,
    0.85432109,
    2.176435e-8,
    0.14567891,
    0.09876543,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '5 hours 54 minutes',
    NOW() - INTERVAL '6 hours'
);

-- ============================================================================
-- Demo Usage Records
-- ============================================================================

-- Current month usage
INSERT INTO usage_records (
    tenant_id,
    user_id,
    usage_type,
    quantity,
    unit,
    unit_cost,
    total_cost,
    billing_month,
    billing_year,
    metadata,
    recorded_at
) VALUES
-- Quantum job executions
(
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'quantum_job',
    89,
    'jobs',
    0.50,
    44.50,
    EXTRACT(MONTH FROM NOW())::INTEGER,
    EXTRACT(YEAR FROM NOW())::INTEGER,
    '{"backend": "ibm_torino", "average_shots": 5000}',
    NOW() - INTERVAL '15 days'
),
(
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'quantum_job',
    156,
    'jobs',
    0.50,
    78.00,
    EXTRACT(MONTH FROM NOW())::INTEGER,
    EXTRACT(YEAR FROM NOW())::INTEGER,
    '{"backend": "ibm_kyoto", "average_shots": 8000}',
    NOW() - INTERVAL '10 days'
),
-- Storage usage
(
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'storage',
    127.5,
    'GB',
    0.10,
    12.75,
    EXTRACT(MONTH FROM NOW())::INTEGER,
    EXTRACT(YEAR FROM NOW())::INTEGER,
    '{"total_organisms": 47, "total_results": 892}',
    NOW() - INTERVAL '5 days'
),
-- API calls
(
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'api_call',
    12456,
    'calls',
    0.001,
    12.46,
    EXTRACT(MONTH FROM NOW())::INTEGER,
    EXTRACT(YEAR FROM NOW())::INTEGER,
    '{"endpoint_breakdown": {"organism_execute": 892, "organism_list": 3421, "results_get": 8143}}',
    NOW() - INTERVAL '1 day'
);

-- ============================================================================
-- Demo Invoices
-- ============================================================================

-- Last month's invoice (paid)
INSERT INTO invoices (
    id,
    tenant_id,
    invoice_number,
    subtotal,
    tax,
    total,
    status,
    billing_period_start,
    billing_period_end,
    issued_at,
    due_at,
    paid_at
) VALUES (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'INV-2024-11-001',
    999.00,
    79.92,
    1078.92,
    'paid',
    DATE_TRUNC('month', NOW() - INTERVAL '1 month')::DATE,
    (DATE_TRUNC('month', NOW()) - INTERVAL '1 day')::DATE,
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '15 days',
    DATE_TRUNC('month', NOW()) + INTERVAL '7 days'
);

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount) VALUES
('30000000-0000-0000-0000-000000000001', 'Enterprise Plan Subscription', 1, 999.00, 999.00);

-- Current month's invoice (pending)
INSERT INTO invoices (
    id,
    tenant_id,
    invoice_number,
    subtotal,
    tax,
    total,
    status,
    billing_period_start,
    billing_period_end,
    issued_at,
    due_at
) VALUES (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    CONCAT('INV-', TO_CHAR(NOW(), 'YYYY-MM'), '-002'),
    1147.71,
    91.82,
    1239.53,
    'pending',
    DATE_TRUNC('month', NOW())::DATE,
    (DATE_TRUNC('month', NOW() + INTERVAL '1 month') - INTERVAL '1 day')::DATE,
    NOW(),
    NOW() + INTERVAL '15 days'
);

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount) VALUES
('30000000-0000-0000-0000-000000000002', 'Enterprise Plan Subscription', 1, 999.00, 999.00),
('30000000-0000-0000-0000-000000000002', 'Additional Quantum Jobs', 245, 0.50, 122.50),
('30000000-0000-0000-0000-000000000002', 'Additional Storage (77.5 GB)', 77.5, 0.10, 7.75),
('30000000-0000-0000-0000-000000000002', 'API Calls (12,456)', 12.456, 1.50, 18.46);

-- ============================================================================
-- Demo Audit Logs
-- ============================================================================

INSERT INTO audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    description,
    ip_address,
    phi_accessed,
    created_at
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'execute',
    'organism',
    '20000000-0000-0000-0000-000000000003',
    'Executed TumorClassifier organism for patient analysis',
    '10.0.1.45',
    TRUE,
    NOW() - INTERVAL '6 hours'
),
(
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'execute',
    'organism',
    '20000000-0000-0000-0000-000000000001',
    'Executed CHRONOS organism for research',
    '10.0.1.67',
    FALSE,
    NOW() - INTERVAL '2 hours'
),
(
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'read',
    'invoice',
    '30000000-0000-0000-0000-000000000002',
    'Viewed current month invoice',
    '10.0.1.100',
    FALSE,
    NOW() - INTERVAL '1 day'
);

-- ============================================================================
-- Verify Seed Data
-- ============================================================================

-- Count records
DO $$
DECLARE
    tenant_count INTEGER;
    user_count INTEGER;
    organism_count INTEGER;
    execution_count INTEGER;
    usage_count INTEGER;
    invoice_count INTEGER;
    audit_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM tenants;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO organism_count FROM organisms;
    SELECT COUNT(*) INTO execution_count FROM organism_executions;
    SELECT COUNT(*) INTO usage_count FROM usage_records;
    SELECT COUNT(*) INTO invoice_count FROM invoices;
    SELECT COUNT(*) INTO audit_count FROM audit_logs;

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Seed Data Summary:';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tenants: %', tenant_count;
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Organisms: %', organism_count;
    RAISE NOTICE 'Executions: %', execution_count;
    RAISE NOTICE 'Usage Records: %', usage_count;
    RAISE NOTICE 'Invoices: %', invoice_count;
    RAISE NOTICE 'Audit Logs: %', audit_count;
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Demo Credentials:';
    RAISE NOTICE '  Admin: admin@demo.dnalang.dev / AdminPass123!';
    RAISE NOTICE '  Oncologist: oncologist@demo.dnalang.dev / OncoPass123!';
    RAISE NOTICE '  Bioinformatician: bioinfo@demo.dnalang.dev / BioPass123!';
    RAISE NOTICE '  Researcher: researcher@demo.dnalang.dev / ResearchPass123!';
    RAISE NOTICE '==============================================';
END $$;
