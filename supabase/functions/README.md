# Supabase Edge Functions

Edge Functions for QuantumLM Aura Arena backend. These serverless functions run on Deno Deploy and handle agent orchestration, commit logging, organism mutations, and role-based access control.

## Functions

### 1. **agent-dispatcher**
Dispatches agent tasks to Python worker queue.

**Endpoint:** `POST /agent-dispatcher`

**Request:**
```json
{
  "agent_type": "architect" | "coder" | "quantum" | "admin",
  "task_type": "plan" | "code" | "test" | "deploy" | "quantum_execute",
  "task_payload": { ... },
  "priority": 5,
  "session_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "task_id": "uuid",
  "message": "Task dispatched to architect agent",
  "task": { ... }
}
```

### 2. **commit-writer**
Writes code commits from Aura Arena agents to database.

**Endpoint:** `POST /commit-writer`

**Request:**
```json
{
  "session_id": "uuid",
  "commit_message": "Add quantum circuit optimization",
  "author": "Aura Agent",
  "files_changed": 3,
  "additions": 42,
  "deletions": 15,
  "diff": "diff --git a/src/quantum.py ..."
}
```

**Response:**
```json
{
  "success": true,
  "commit_id": "uuid",
  "commit_hash": "sha256...",
  "message": "Commit written successfully",
  "session": "My Arena Session"
}
```

### 3. **org-mutate**
Handles DNALang organism mutation requests with quantum backend execution.

**Endpoint:** `POST /org-mutate`

**Request:**
```json
{
  "session_id": "uuid",
  "organism_genome": "ORGANISM MyOrg { DNA { ... } GENOME { ... } }",
  "mutation_type": "evolve" | "crossover" | "quantum_enhance" | "self_heal",
  "mutation_parameters": { ... },
  "backend": "ibm_fez"
}
```

**Response:**
```json
{
  "success": true,
  "task_id": "uuid",
  "mutation_type": "evolve",
  "message": "Organism mutation dispatched to ibm_fez",
  "estimated_completion": "2-5 minutes"
}
```

**Requires:** Researcher role or admin role

### 4. **role-check**
Verifies user roles and permissions for RBAC.

**Endpoint:** `GET /role-check` or `POST /role-check`

**Request (POST):**
```json
{
  "required_permission": "experiments:create",
  "required_role": "researcher"
}
```

**Response:**
```json
{
  "authorized": true,
  "user_id": "uuid",
  "email": "user@example.com",
  "username": "quantum_researcher",
  "reputation": 150,
  "roles": [
    { "role_id": 2, "role_name": "researcher" }
  ],
  "permissions": [
    "experiments:create",
    "experiments:read",
    "projects:create"
  ],
  "has_wildcard": false,
  "checks": {
    "required_permission": "experiments:create",
    "has_permission": true,
    "required_role": "researcher",
    "has_role": true
  }
}
```

## Authentication

All functions require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <supabase_jwt_token>
```

## CORS

All functions support CORS with wildcard origin (`*`) for development. In production, restrict to specific domains.

## Environment Variables

Set these in Supabase Dashboard → Project Settings → Edge Functions:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Deployment

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref <your-project-ref>

# Deploy all functions
supabase functions deploy agent-dispatcher
supabase functions deploy commit-writer
supabase functions deploy org-mutate
supabase functions deploy role-check

# Or deploy all at once
supabase functions deploy
```

## Local Development

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve agent-dispatcher --env-file .env.local
supabase functions serve commit-writer --env-file .env.local
supabase functions serve org-mutate --env-file .env.local
supabase functions serve role-check --env-file .env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/agent-dispatcher' \
  --header 'Authorization: Bearer eyJhbGc...' \
  --header 'Content-Type: application/json' \
  --data '{"agent_type":"coder","task_type":"code","task_payload":{}}'
```

## Dependencies

All functions use Deno-compatible imports from:
- `deno.land/std` - Deno standard library
- `esm.sh/@supabase/supabase-js` - Supabase client

## Architecture

```
User Request → Next.js API Route → Supabase Edge Function → Database
                                                           ↓
                                                    Task Queue → Python Worker
```

## Security

1. **Row-Level Security (RLS)** enforced at database level
2. **JWT verification** on every request
3. **Role-based permissions** checked before mutations
4. **Session ownership** verified for all operations
5. **CORS** configured for production domains only

## Monitoring

View function logs in Supabase Dashboard:
- Project → Edge Functions → [Function Name] → Logs

## ΛΦ Integration

Functions integrate with QuantumLM's ΛΦ tensor framework:
- Mutation tasks reference IBM Quantum backends (ibm_fez, ibm_torino)
- Quantum job metrics stored in `quantum_jobs` table
- Agent events track consciousness metrics (Φ, Λ, Γ)

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

---

**Status:** Ready for deployment
**Version:** 1.0.0
**Last Updated:** 2025-11-19
