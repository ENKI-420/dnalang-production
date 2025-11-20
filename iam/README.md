# DNALang IAM Microservice

Complete authentication and authorization system for the DNALang Quantum Platform.

## Architecture

- **Keycloak**: Identity provider with OpenID Connect/OAuth2
- **FastAPI**: Custom authentication service for multi-tenant logic
- **Redis**: Session storage and caching
- **PostgreSQL**: Keycloak database

## Features

### Authentication
- Email/password login with Keycloak integration
- JWT access and refresh tokens
- Session management with Redis
- Multi-factor authentication support (via Keycloak)

### Authorization
- Role-based access control (RBAC) with 13 user roles
- Resource-level permissions
- Multi-tenant isolation
- Session revocation

### User Roles
```typescript
enum UserRole {
  SYSTEM_ADMIN = 'system_admin',          // Full system access
  ORG_ADMIN = 'org_admin',                // Organization-wide admin
  ONCOLOGIST = 'oncologist',              // Patient data + quantum execution
  PATHOLOGIST = 'pathologist',            // Diagnostic access
  GENETIC_COUNSELOR = 'genetic_counselor', // Genomics access
  CLINICAL_RESEARCHER = 'clinical_researcher', // De-identified data
  LAB_ANALYST = 'lab_analyst',            // Laboratory workflows
  BIOINFORMATICIAN = 'bioinformatician',  // Analysis tools
  DEVELOPER = 'developer',                // API and organism access
  BILLING_ADMIN = 'billing_admin',        // Subscription management
  COMPLIANCE_AUDITOR = 'compliance_auditor', // Audit logs
  PATIENT = 'patient',                    // Personal data only
  VENDOR = 'vendor'                       // External integrations
}
```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend integration)

### Local Development

1. **Clone the repository**
```bash
cd iam/
```

2. **Create environment file**
```bash
cat > .env <<EOF
KEYCLOAK_CLIENT_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
EOF
```

3. **Start services**
```bash
docker-compose up -d
```

4. **Wait for Keycloak to import realm** (~60 seconds)
```bash
docker-compose logs -f keycloak
# Wait for "Imported realm dnalang"
```

5. **Access services**
- Keycloak Admin: http://localhost:8080 (admin/admin)
- Auth Service API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Configure Keycloak

After startup, generate client secrets:

1. Login to Keycloak admin console
2. Navigate to: Clients → dnalang-api → Credentials
3. Copy the "Client Secret"
4. Update `.env` file with the secret
5. Restart auth service: `docker-compose restart auth-service`

## API Endpoints

### Authentication

**POST /auth/login**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "tenant_id": "optional-tenant-id"
}
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "roles": ["oncologist", "developer"]
  },
  "tenant": {
    "id": "tenant-uuid",
    "name": "Example Healthcare System",
    "subscription_plan": "enterprise"
  }
}
```

**POST /auth/refresh**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**POST /auth/logout**
```
Authorization: Bearer <access_token>
```

**GET /auth/verify**
```
Authorization: Bearer <access_token>
```

### User Management

**GET /users/me**
```
Authorization: Bearer <access_token>
```

**GET /rbac/check?resource=organism:123&action=execute**
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "allowed": true,
  "reason": "Role oncologist grants organism:execute"
}
```

### Admin Endpoints

**GET /admin/sessions**
```
Authorization: Bearer <admin_access_token>
```

**DELETE /admin/sessions/{session_id}**
```
Authorization: Bearer <admin_access_token>
```

## Token Flow

```
┌──────────┐                                   ┌──────────┐
│  Client  │                                   │ Keycloak │
└────┬─────┘                                   └────┬─────┘
     │                                              │
     │  1. POST /auth/login                         │
     ├─────────────────────────────────────────────>│
     │     email + password                         │
     │                                              │
     │  2. Validate credentials                     │
     │<─────────────────────────────────────────────┤
     │     Keycloak token                           │
     │                                              │
     │  3. Create session + JWT                     │
     │     ┌──────────────────┐                     │
     │     │   Auth Service   │                     │
     │     │   - Session ID   │                     │
     │     │   - Store Redis  │                     │
     │     │   - Return JWT   │                     │
     │     └──────────────────┘                     │
     │                                              │
     │  4. Return tokens                            │
     │<─────────────────────────────────────────────┤
     │                                              │
     │  5. API requests with Bearer token           │
     ├─────────────────────────────────────────────>│
     │     Authorization: Bearer eyJhbGc...         │
     │                                              │
```

## Multi-Tenant Isolation

Each tenant has:
- Isolated data access
- Separate subscription/billing
- Independent usage quotas
- Tenant-specific configuration

Tenant context is embedded in JWT:
```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "roles": ["oncologist"],
  "exp": 1234567890
}
```

## Security Features

### Password Policy
- Minimum 12 characters
- Requires: uppercase, lowercase, digit, special character
- No username in password
- Password history (5 passwords)

### Brute Force Protection
- Max 5 failed attempts
- Lockout duration: 15 minutes
- Progressive wait time

### Token Security
- Access tokens: 15 minutes
- Refresh tokens: 7 days
- Tokens stored in Redis with expiration
- Session revocation support

### HIPAA Compliance
- Audit logging for PHI access
- Session tracking with IP/user agent
- Role-based data access
- Encryption in transit (TLS)

## Integration with Next.js Frontend

```typescript
// lib/auth.ts
import { jwtDecode } from 'jwt-decode'

interface TokenPayload {
  sub: string
  email: string
  roles: string[]
  tenant_id: string
  exp: number
}

export async function login(email: string, password: string) {
  const response = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  const data = await response.json()

  // Store tokens (secure httpOnly cookies recommended)
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)

  return data
}

export async function getCurrentUser() {
  const token = localStorage.getItem('access_token')
  if (!token) return null

  const response = await fetch('http://localhost:8000/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    // Try to refresh token
    await refreshToken()
    return getCurrentUser()
  }

  return response.json()
}

export async function refreshToken() {
  const refresh_token = localStorage.getItem('refresh_token')
  if (!refresh_token) throw new Error('No refresh token')

  const response = await fetch('http://localhost:8000/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token })
  })

  if (!response.ok) {
    // Refresh failed, redirect to login
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
    return
  }

  const data = await response.json()
  localStorage.setItem('access_token', data.access_token)
}

export function hasRole(requiredRoles: string[]): boolean {
  const token = localStorage.getItem('access_token')
  if (!token) return false

  const payload = jwtDecode<TokenPayload>(token)
  return requiredRoles.some(role => payload.roles.includes(role))
}
```

## Monitoring

### Health Checks
- Auth Service: `GET /` (HTTP 200)
- Keycloak: `GET /health/ready` (HTTP 200)
- Redis: `redis-cli ping` (PONG)

### Metrics
- Active sessions (Redis key count)
- Login attempts (success/failure)
- Token refresh rate
- Session duration

### Logs
```bash
# Auth service logs
docker-compose logs -f auth-service

# Keycloak logs
docker-compose logs -f keycloak

# All services
docker-compose logs -f
```

## Production Deployment

### Environment Variables
```bash
# Required
KEYCLOAK_URL=https://auth.dnalang.dev
KEYCLOAK_REALM=dnalang
KEYCLOAK_CLIENT_ID=dnalang-api
KEYCLOAK_CLIENT_SECRET=<generate-secure-secret>
JWT_SECRET=<generate-secure-secret>
REDIS_URL=redis://redis:6379/0

# Optional
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### TLS Configuration
- Use reverse proxy (nginx/Traefik) for TLS termination
- Enforce HTTPS in production
- Set `KC_HOSTNAME_STRICT_HTTPS=true` for Keycloak

### Scaling
- Auth service: Stateless, horizontal scaling supported
- Redis: Use Redis Cluster or Sentinel for HA
- Keycloak: Cluster mode with shared database

## Troubleshooting

### Keycloak import fails
```bash
# Check realm file syntax
cat keycloak/dnalang-realm.json | jq .

# Import manually
docker exec -it dnalang-keycloak \
  /opt/keycloak/bin/kc.sh import \
  --file /opt/keycloak/data/import/dnalang-realm.json
```

### Token validation fails
```bash
# Check JWT secret matches
echo $JWT_SECRET

# Verify token
python -c "import jwt; print(jwt.decode('TOKEN', 'SECRET', algorithms=['HS256']))"
```

### Redis connection issues
```bash
# Test Redis connection
docker exec -it dnalang-redis redis-cli ping

# Check sessions
docker exec -it dnalang-redis redis-cli keys "session:*"
```

## Next Steps

1. **Database Integration**: Connect to multi-tenant PostgreSQL database
2. **FHIR Integration**: Add SMART on FHIR authentication
3. **Billing Integration**: Link to Stripe subscription service
4. **Audit Logging**: Comprehensive PHI access logging
5. **MFA**: Enable multi-factor authentication via Keycloak

## License

Proprietary - DNALang Quantum Platform
