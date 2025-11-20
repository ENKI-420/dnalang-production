"""
DNALang Database Connection Module
Async PostgreSQL connection with connection pooling
"""

from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
import asyncpg
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# Configuration
# ============================================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://dnalang:dnalang_password@localhost:5432/dnalang"
)

POOL_MIN_SIZE = int(os.getenv("DB_POOL_MIN_SIZE", "10"))
POOL_MAX_SIZE = int(os.getenv("DB_POOL_MAX_SIZE", "50"))

# ============================================================================
# Connection Pool
# ============================================================================

_pool: Optional[asyncpg.Pool] = None


async def init_db_pool():
    """Initialize database connection pool"""
    global _pool

    if _pool is not None:
        logger.warning("Database pool already initialized")
        return _pool

    logger.info(f"Initializing database pool (min={POOL_MIN_SIZE}, max={POOL_MAX_SIZE})")

    _pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=POOL_MIN_SIZE,
        max_size=POOL_MAX_SIZE,
        command_timeout=60,
        server_settings={
            'application_name': 'dnalang_platform',
            'jit': 'off'
        }
    )

    logger.info("Database pool initialized successfully")
    return _pool


async def close_db_pool():
    """Close database connection pool"""
    global _pool

    if _pool is None:
        logger.warning("Database pool not initialized")
        return

    logger.info("Closing database pool")
    await _pool.close()
    _pool = None
    logger.info("Database pool closed")


def get_pool() -> asyncpg.Pool:
    """Get database connection pool"""
    if _pool is None:
        raise RuntimeError("Database pool not initialized. Call init_db_pool() first.")
    return _pool


@asynccontextmanager
async def get_db_connection():
    """Get database connection from pool (context manager)"""
    pool = get_pool()
    async with pool.acquire() as connection:
        yield connection


@asynccontextmanager
async def get_db_transaction():
    """Get database transaction (context manager)"""
    async with get_db_connection() as conn:
        async with conn.transaction():
            yield conn


# ============================================================================
# Query Helpers
# ============================================================================

async def fetch_one(query: str, *args, tenant_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Execute query and return single row"""
    pool = get_pool()
    async with pool.acquire() as conn:
        if tenant_id:
            await conn.execute("SET app.current_tenant = $1", tenant_id)

        row = await conn.fetchrow(query, *args)
        return dict(row) if row else None


async def fetch_all(query: str, *args, tenant_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Execute query and return all rows"""
    pool = get_pool()
    async with pool.acquire() as conn:
        if tenant_id:
            await conn.execute("SET app.current_tenant = $1", tenant_id)

        rows = await conn.fetch(query, *args)
        return [dict(row) for row in rows]


async def execute(query: str, *args, tenant_id: Optional[str] = None) -> str:
    """Execute query and return status"""
    pool = get_pool()
    async with pool.acquire() as conn:
        if tenant_id:
            await conn.execute("SET app.current_tenant = $1", tenant_id)

        return await conn.execute(query, *args)


async def execute_many(query: str, args_list: List[tuple], tenant_id: Optional[str] = None):
    """Execute query multiple times with different parameters"""
    pool = get_pool()
    async with pool.acquire() as conn:
        if tenant_id:
            await conn.execute("SET app.current_tenant = $1", tenant_id)

        return await conn.executemany(query, args_list)


# ============================================================================
# Tenant Context
# ============================================================================

class TenantContext:
    """Context manager for setting tenant context"""

    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.conn = None

    async def __aenter__(self):
        pool = get_pool()
        self.conn = await pool.acquire()
        await self.conn.execute("SET app.current_tenant = $1", self.tenant_id)
        return self.conn

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.conn.close()
        self.conn = None


# ============================================================================
# Repository Base Class
# ============================================================================

class BaseRepository:
    """Base repository with common CRUD operations"""

    def __init__(self, table_name: str, tenant_id: Optional[str] = None):
        self.table_name = table_name
        self.tenant_id = tenant_id

    async def find_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """Find record by ID"""
        query = f"SELECT * FROM {self.table_name} WHERE id = $1 AND deleted_at IS NULL"
        if self.tenant_id:
            query += " AND tenant_id = $2"
            return await fetch_one(query, id, self.tenant_id)
        return await fetch_one(query, id)

    async def find_all(
        self,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "created_at DESC"
    ) -> List[Dict[str, Any]]:
        """Find all records"""
        query = f"""
            SELECT * FROM {self.table_name}
            WHERE deleted_at IS NULL
        """
        if self.tenant_id:
            query += " AND tenant_id = $1"
            query += f" ORDER BY {order_by} LIMIT $2 OFFSET $3"
            return await fetch_all(query, self.tenant_id, limit, offset)
        else:
            query += f" ORDER BY {order_by} LIMIT $1 OFFSET $2"
            return await fetch_all(query, limit, offset)

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new record"""
        if self.tenant_id and 'tenant_id' not in data:
            data['tenant_id'] = self.tenant_id

        columns = list(data.keys())
        placeholders = [f"${i+1}" for i in range(len(columns))]
        values = [data[col] for col in columns]

        query = f"""
            INSERT INTO {self.table_name} ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            RETURNING *
        """

        async with get_db_connection() as conn:
            if self.tenant_id:
                await conn.execute("SET app.current_tenant = $1", self.tenant_id)
            row = await conn.fetchrow(query, *values)
            return dict(row)

    async def update(self, id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update record by ID"""
        set_clauses = [f"{col} = ${i+2}" for i, col in enumerate(data.keys())]
        values = [id] + list(data.values())

        query = f"""
            UPDATE {self.table_name}
            SET {', '.join(set_clauses)}
            WHERE id = $1 AND deleted_at IS NULL
        """

        if self.tenant_id:
            query += f" AND tenant_id = ${len(values) + 1}"
            values.append(self.tenant_id)

        query += " RETURNING *"

        async with get_db_connection() as conn:
            if self.tenant_id:
                await conn.execute("SET app.current_tenant = $1", self.tenant_id)
            row = await conn.fetchrow(query, *values)
            return dict(row) if row else None

    async def delete(self, id: str, soft: bool = True) -> bool:
        """Delete record by ID (soft delete by default)"""
        if soft:
            query = f"""
                UPDATE {self.table_name}
                SET deleted_at = $2
                WHERE id = $1 AND deleted_at IS NULL
            """
            values = [id, datetime.utcnow()]
        else:
            query = f"DELETE FROM {self.table_name} WHERE id = $1"
            values = [id]

        if self.tenant_id:
            query += f" AND tenant_id = ${len(values) + 1}"
            values.append(self.tenant_id)

        async with get_db_connection() as conn:
            if self.tenant_id:
                await conn.execute("SET app.current_tenant = $1", self.tenant_id)
            result = await conn.execute(query, *values)
            return result.endswith(" 1")

    async def count(self) -> int:
        """Count records"""
        query = f"SELECT COUNT(*) FROM {self.table_name} WHERE deleted_at IS NULL"

        if self.tenant_id:
            query += " AND tenant_id = $1"
            result = await fetch_one(query, self.tenant_id)
        else:
            result = await fetch_one(query)

        return result['count'] if result else 0


# ============================================================================
# Domain-Specific Repositories
# ============================================================================

class TenantRepository(BaseRepository):
    """Repository for tenants table"""

    def __init__(self):
        super().__init__("tenants")

    async def find_by_subdomain(self, subdomain: str) -> Optional[Dict[str, Any]]:
        """Find tenant by subdomain"""
        return await fetch_one(
            "SELECT * FROM tenants WHERE subdomain = $1 AND deleted_at IS NULL",
            subdomain
        )

    async def find_by_stripe_customer_id(self, stripe_customer_id: str) -> Optional[Dict[str, Any]]:
        """Find tenant by Stripe customer ID"""
        return await fetch_one(
            "SELECT * FROM tenants WHERE stripe_customer_id = $1 AND deleted_at IS NULL",
            stripe_customer_id
        )


class UserRepository(BaseRepository):
    """Repository for users table"""

    def __init__(self, tenant_id: Optional[str] = None):
        super().__init__("users", tenant_id)

    async def find_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Find user by email"""
        query = "SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL"
        if self.tenant_id:
            query += " AND tenant_id = $2"
            return await fetch_one(query, email, self.tenant_id)
        return await fetch_one(query, email)

    async def find_by_keycloak_id(self, keycloak_id: str) -> Optional[Dict[str, Any]]:
        """Find user by Keycloak ID"""
        return await fetch_one(
            "SELECT * FROM users WHERE keycloak_id = $1 AND deleted_at IS NULL",
            keycloak_id
        )

    async def get_user_roles(self, user_id: str) -> List[str]:
        """Get user's roles"""
        rows = await fetch_all(
            "SELECT role FROM user_roles WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > NOW())",
            user_id
        )
        return [row['role'] for row in rows]


class OrganismRepository(BaseRepository):
    """Repository for organisms table"""

    def __init__(self, tenant_id: str):
        super().__init__("organisms", tenant_id)

    async def find_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Find organism by name"""
        return await fetch_one(
            "SELECT * FROM organisms WHERE name = $1 AND tenant_id = $2 AND deleted_at IS NULL",
            name,
            self.tenant_id
        )

    async def find_by_hash(self, dna_hash: str) -> Optional[Dict[str, Any]]:
        """Find organism by DNA hash"""
        return await fetch_one(
            "SELECT * FROM organisms WHERE dna_hash = $1 AND tenant_id = $2 AND deleted_at IS NULL",
            dna_hash,
            self.tenant_id
        )

    async def increment_executions(self, organism_id: str):
        """Increment total executions count"""
        await execute(
            """
            UPDATE organisms
            SET total_executions = total_executions + 1,
                last_executed_at = NOW()
            WHERE id = $1 AND tenant_id = $2
            """,
            organism_id,
            self.tenant_id
        )


class AuditLogRepository(BaseRepository):
    """Repository for audit_logs table"""

    def __init__(self, tenant_id: str):
        super().__init__("audit_logs", tenant_id)

    async def log_action(
        self,
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        description: Optional[str] = None,
        ip_address: Optional[str] = None,
        phi_accessed: bool = False
    ):
        """Create audit log entry"""
        await self.create({
            'tenant_id': self.tenant_id,
            'user_id': user_id,
            'action': action,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'description': description,
            'ip_address': ip_address,
            'phi_accessed': phi_accessed
        })

    async def find_phi_access_logs(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Find PHI access logs for compliance reporting"""
        return await fetch_all(
            """
            SELECT * FROM audit_logs
            WHERE tenant_id = $1
              AND phi_accessed = TRUE
              AND created_at BETWEEN $2 AND $3
            ORDER BY created_at DESC
            """,
            self.tenant_id,
            start_date,
            end_date
        )


# ============================================================================
# Health Check
# ============================================================================

async def health_check() -> bool:
    """Check database connection health"""
    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


# ============================================================================
# Migration Helper
# ============================================================================

async def run_migration(sql_file_path: str):
    """Run SQL migration file"""
    logger.info(f"Running migration: {sql_file_path}")

    with open(sql_file_path, 'r') as f:
        sql = f.read()

    async with get_db_connection() as conn:
        await conn.execute(sql)

    logger.info(f"Migration completed: {sql_file_path}")


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    import asyncio

    async def main():
        # Initialize pool
        await init_db_pool()

        # Create repositories
        tenant_repo = TenantRepository()
        user_repo = UserRepository(tenant_id="00000000-0000-0000-0000-000000000001")
        organism_repo = OrganismRepository(tenant_id="00000000-0000-0000-0000-000000000001")

        # Find tenant
        tenant = await tenant_repo.find_by_subdomain("demo")
        print(f"Tenant: {tenant}")

        # Find users
        users = await user_repo.find_all(limit=10)
        print(f"Users: {len(users)}")

        # Find organisms
        organisms = await organism_repo.find_all(limit=10)
        print(f"Organisms: {len(organisms)}")

        # Health check
        healthy = await health_check()
        print(f"Database healthy: {healthy}")

        # Close pool
        await close_db_pool()

    asyncio.run(main())
