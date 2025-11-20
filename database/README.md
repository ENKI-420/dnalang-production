# DNALang Multi-Tenant Database

PostgreSQL database schema for the DNALang Quantum Platform with multi-tenant isolation, HIPAA compliance, and comprehensive audit logging.

## Architecture

### Multi-Tenancy Strategy
- **Schema-per-tenant**: Each tenant has isolated data
- **Shared infrastructure**: Single database instance with tenant_id columns
- **Row-level security**: Automatic filtering by tenant context

### Key Tables

#### Core Tables
- **tenants**: Organizations/health systems
- **users**: Platform users (email, roles, profile)
- **user_roles**: Role assignments (RBAC)
- **sessions**: Active user sessions

#### Authorization
- **resources**: Generic resource registry
- **permissions**: Fine-grained access control

#### Billing
- **subscription_plans**: Available plans (free, professional, enterprise, research)
- **usage_records**: Usage tracking for billing
- **invoices**: Monthly invoices
- **invoice_items**: Line items per invoice

#### Quantum
- **organisms**: DNALang quantum organisms
- **organism_executions**: Execution history and results

#### Compliance
- **audit_logs**: HIPAA-compliant audit trail with PHI flagging

## Quick Start

### 1. Start PostgreSQL

```bash
docker-compose up -d postgres
```

Wait for PostgreSQL to be ready:
```bash
docker-compose logs -f postgres
```

### 2. Run Migrations

```bash
# Create schema
docker exec -i dnalang-postgres psql -U dnalang -d dnalang < schemas/01_core_schema.sql

# Seed demo data
docker exec -i dnalang-postgres psql -U dnalang -d dnalang < seeds/01_seed_data.sql
```

### 3. Verify Setup

```bash
# Connect to database
docker exec -it dnalang-postgres psql -U dnalang -d dnalang

# Check tables
\dt

# Count records
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM organisms;
```

## Database Schema

### Tenants
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type tenant_type NOT NULL, -- 'health_system', 'research_org', 'pharma', 'individual'
    subdomain VARCHAR(63) UNIQUE,

    -- Subscription
    subscription_plan subscription_plan NOT NULL DEFAULT 'free',
    subscription_status subscription_status NOT NULL DEFAULT 'trial',
    trial_ends_at TIMESTAMP WITH TIME ZONE,

    -- Compliance
    hipaa_enabled BOOLEAN DEFAULT FALSE,
    baa_signed BOOLEAN DEFAULT FALSE,
    hitrust_certified BOOLEAN DEFAULT FALSE,

    -- Stripe Integration
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    keycloak_id VARCHAR(255) UNIQUE,

    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),

    -- Status
    enabled BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,

    -- MFA
    mfa_enabled BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_email_per_tenant UNIQUE(tenant_id, email)
);
```

### User Roles
```sql
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

CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    role user_role NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_user_role UNIQUE(user_id, role)
);
```

### Organisms
```sql
CREATE TABLE organisms (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    owner_id UUID NOT NULL REFERENCES users(id),

    name VARCHAR(255) NOT NULL,
    description TEXT,
    status organism_status DEFAULT 'draft',

    dna_code TEXT NOT NULL,
    dna_hash VARCHAR(64) NOT NULL, -- SHA-256

    -- Consciousness Metrics
    phi DECIMAL(10, 8),
    lambda DECIMAL(15, 10),
    gamma DECIMAL(10, 8),
    w2_distance DECIMAL(10, 8),

    total_executions INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,

    generation INTEGER DEFAULT 1,
    parent_organism_id UUID REFERENCES organisms(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_organism_name UNIQUE(tenant_id, name)
);
```

## Python Connection Module

### Installation
```bash
pip install asyncpg
```

### Usage

```python
from database.connection import (
    init_db_pool,
    close_db_pool,
    TenantRepository,
    UserRepository,
    OrganismRepository,
    AuditLogRepository
)

# Initialize pool
await init_db_pool()

# Create repositories
tenant_repo = TenantRepository()
user_repo = UserRepository(tenant_id="tenant-uuid")
organism_repo = OrganismRepository(tenant_id="tenant-uuid")
audit_repo = AuditLogRepository(tenant_id="tenant-uuid")

# Find tenant
tenant = await tenant_repo.find_by_subdomain("demo")

# Find user by email
user = await user_repo.find_by_email("user@example.com")

# Get user roles
roles = await user_repo.get_user_roles(user['id'])

# Create organism
organism = await organism_repo.create({
    'name': 'MyOrganism',
    'description': 'Test organism',
    'dna_code': 'ORGANISM MyOrganism { ... }',
    'dna_hash': 'abc123...',
    'owner_id': user['id']
})

# Log action (audit trail)
await audit_repo.log_action(
    user_id=user['id'],
    action='execute',
    resource_type='organism',
    resource_id=organism['id'],
    description='Executed organism on IBM hardware',
    phi_accessed=False
)

# Close pool
await close_db_pool()
```

### Repository Methods

All repositories inherit from `BaseRepository`:
- `find_by_id(id)`: Get record by ID
- `find_all(limit, offset, order_by)`: List records
- `create(data)`: Create new record
- `update(id, data)`: Update record
- `delete(id, soft=True)`: Delete record (soft delete by default)
- `count()`: Count records

Domain-specific methods:
```python
# TenantRepository
await tenant_repo.find_by_subdomain("demo")
await tenant_repo.find_by_stripe_customer_id("cus_123")

# UserRepository
await user_repo.find_by_email("user@example.com")
await user_repo.find_by_keycloak_id("keycloak-uuid")
await user_repo.get_user_roles(user_id)

# OrganismRepository
await organism_repo.find_by_name("CHRONOS")
await organism_repo.find_by_hash("abc123...")
await organism_repo.increment_executions(organism_id)

# AuditLogRepository
await audit_repo.log_action(...)
await audit_repo.find_phi_access_logs(start_date, end_date)
```

## Subscription Plans

| Plan | Price/Month | Max Users | Quantum Jobs/Month | Storage | HIPAA |
|------|-------------|-----------|-------------------|---------|-------|
| **Free** | $0 | 1 | 10 | 1 GB | No |
| **Professional** | $299 | 10 | 100 | 50 GB | No |
| **Enterprise** | $999 | Unlimited | 1,000 | 500 GB | Yes |
| **Research** | $499 | 50 | 500 | 250 GB | No |

Plans are defined in `subscription_plans` table.

## Usage Tracking

Track usage for billing:

```python
from database.connection import execute
from datetime import datetime

await execute(
    """
    INSERT INTO usage_records (
        tenant_id, user_id, usage_type, quantity, unit,
        unit_cost, total_cost, billing_month, billing_year
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    """,
    tenant_id,
    user_id,
    'quantum_job',  # Usage type
    1,              # Quantity
    'jobs',         # Unit
    0.50,           # Unit cost
    0.50,           # Total cost
    datetime.now().month,
    datetime.now().year
)
```

Usage types:
- `quantum_job`: Quantum organism executions
- `storage`: Data storage (GB)
- `api_call`: API requests
- `compute_time`: CPU/GPU time

## Audit Logging (HIPAA Compliance)

All PHI access is automatically logged:

```python
await audit_repo.log_action(
    user_id=user_id,
    action='read',           # 'create', 'read', 'update', 'delete', 'execute', 'access'
    resource_type='patient',
    resource_id=patient_id,
    description='Viewed patient genomic data',
    ip_address='10.0.1.45',
    phi_accessed=True        # Triggers PHI flag
)
```

Compliance reports:
```python
# Get PHI access logs for audit
from datetime import datetime, timedelta

start = datetime.now() - timedelta(days=30)
end = datetime.now()

phi_logs = await audit_repo.find_phi_access_logs(start, end)

for log in phi_logs:
    print(f"{log['created_at']} - {log['user_id']} - {log['action']} - {log['resource_type']}:{log['resource_id']}")
```

## Views

Convenient views for common queries:

### Active Users
```sql
SELECT * FROM v_active_users WHERE tenant_id = 'tenant-uuid';
```

### Monthly Usage Summary
```sql
SELECT * FROM v_monthly_usage
WHERE tenant_id = 'tenant-uuid'
  AND billing_year = 2024
  AND billing_month = 11;
```

### Organism Performance
```sql
SELECT * FROM v_organism_performance
WHERE tenant_id = 'tenant-uuid'
ORDER BY max_phi DESC;
```

## Migrations

### Create Migration
```bash
# Create new migration file
cat > migrations/002_add_feature.sql <<EOF
-- Migration: Add new feature
-- Date: 2024-11-19

ALTER TABLE organisms ADD COLUMN new_field TEXT;

CREATE INDEX idx_organisms_new_field ON organisms(new_field);
EOF
```

### Run Migration
```python
from database.connection import run_migration

await run_migration('migrations/002_add_feature.sql')
```

## Backup & Restore

### Backup
```bash
# Full backup
docker exec dnalang-postgres pg_dump -U dnalang -F c dnalang > backup_$(date +%Y%m%d).dump

# Schema only
docker exec dnalang-postgres pg_dump -U dnalang -s dnalang > schema_$(date +%Y%m%d).sql

# Data only
docker exec dnalang-postgres pg_dump -U dnalang -a dnalang > data_$(date +%Y%m%d).sql
```

### Restore
```bash
# From dump file
docker exec -i dnalang-postgres pg_restore -U dnalang -d dnalang < backup_20241119.dump

# From SQL file
docker exec -i dnalang-postgres psql -U dnalang -d dnalang < schema_20241119.sql
```

## Performance Tuning

### Indexes
All foreign keys have indexes:
```sql
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_organisms_owner ON organisms(owner_id);
CREATE INDEX idx_executions_organism ON organism_executions(organism_id);
```

Composite indexes for common queries:
```sql
CREATE INDEX idx_usage_period ON usage_records(billing_year, billing_month);
CREATE INDEX idx_audit_phi ON audit_logs(phi_accessed) WHERE phi_accessed = TRUE;
```

### Connection Pooling
Configure pool size based on load:
```python
# Environment variables
DB_POOL_MIN_SIZE=10
DB_POOL_MAX_SIZE=50

# In production
DB_POOL_MIN_SIZE=20
DB_POOL_MAX_SIZE=100
```

### Query Optimization
Use EXPLAIN ANALYZE for slow queries:
```sql
EXPLAIN ANALYZE
SELECT * FROM organisms
WHERE tenant_id = 'tenant-uuid'
  AND status = 'active'
ORDER BY phi DESC
LIMIT 10;
```

## Security

### SSL/TLS
For production, enforce SSL connections:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Row-Level Security (Future Enhancement)
```sql
-- Enable RLS
ALTER TABLE organisms ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY tenant_isolation ON organisms
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### Secrets Management
Never commit credentials:
```bash
# Use environment variables
export DATABASE_URL="postgresql://..."

# Or use secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
```

## Monitoring

### Active Connections
```sql
SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'dnalang';
```

### Slow Queries
```sql
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Table Sizes
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### Connection Issues
```bash
# Test connection
docker exec -it dnalang-postgres psql -U dnalang -d dnalang -c "SELECT 1"

# Check logs
docker-compose logs postgres
```

### Migration Errors
```bash
# Rollback transaction manually
docker exec -it dnalang-postgres psql -U dnalang -d dnalang

BEGIN;
-- Run migration
COMMIT;  -- or ROLLBACK if errors
```

### Performance Issues
```sql
-- Rebuild indexes
REINDEX DATABASE dnalang;

-- Analyze tables
ANALYZE organisms;
ANALYZE organism_executions;

-- Vacuum
VACUUM ANALYZE;
```

## Demo Credentials

After running seed data:

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@demo.dnalang.dev | AdminPass123! |
| Oncologist | oncologist@demo.dnalang.dev | OncoPass123! |
| Bioinformatician | bioinfo@demo.dnalang.dev | BioPass123! |
| Researcher | researcher@demo.dnalang.dev | ResearchPass123! |

## Next Steps

1. **Row-Level Security**: Implement PostgreSQL RLS for additional tenant isolation
2. **Encryption at Rest**: Enable PostgreSQL encryption
3. **Replication**: Set up streaming replication for high availability
4. **Sharding**: Implement sharding for horizontal scaling
5. **TimescaleDB**: Use TimescaleDB extension for time-series data (executions, usage)

## License

Proprietary - DNALang Quantum Platform
