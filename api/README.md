# Next.js API Routes

Serverless API endpoints for QuantumLM multi-user platform. These routes handle authentication, Arena management, quantum job dispatch, and user profiles.

## Architecture

```
Frontend → Next.js API Route → Supabase Edge Function → Python Worker → IBM Quantum
                              ↓
                        Database (RLS enforced)
```

## Endpoints

### Authentication & Profile

#### `GET /api/auth/profile`
Get current user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "profile": {
    "profile_id": "uuid",
    "user_id": "uuid",
    "username": "quantum_researcher",
    "display_name": "Dr. Quantum",
    "avatar_url": "https://...",
    "bio": "Quantum computing researcher",
    "research_interests": ["quantum algorithms", "consciousness"],
    "experiments_count": 42,
    "reputation_score": 150
  }
}
```

#### `GET /api/auth/profile?username=quantum_researcher`
Get specific user's profile (public data only).

#### `PUT /api/auth/profile`
Update current user's profile.

**Body:**
```json
{
  "display_name": "Dr. Quantum",
  "bio": "Updated bio",
  "research_interests": ["quantum", "consciousness"],
  "privacy_settings": {
    "email_visible": false,
    "location_visible": true
  }
}
```

---

### Arena Sessions

#### `GET /api/arena/session`
List user's Arena sessions.

**Response:**
```json
{
  "sessions": [
    {
      "session_id": "uuid",
      "session_name": "My Quantum Arena",
      "status": "active",
      "active_agents": [
        {
          "agent_id": "architect_1",
          "type": "architect",
          "status": "active"
        }
      ],
      "total_mutations": 15,
      "total_commits": 8,
      "coherence_score": 0.85,
      "started_at": "2025-11-19T12:00:00Z"
    }
  ]
}
```

#### `POST /api/arena/session`
Create new Arena session.

**Body:**
```json
{
  "session_name": "My Quantum Arena",
  "initial_agents": [
    {
      "agent_id": "architect_1",
      "type": "architect",
      "model": "claude-sonnet-3.5",
      "status": "active"
    }
  ]
}
```

**Response:**
```json
{
  "session": {
    "session_id": "uuid",
    "session_name": "My Quantum Arena",
    "status": "active",
    ...
  }
}
```

#### `PUT /api/arena/session`
Update Arena session.

**Body:**
```json
{
  "session_id": "uuid",
  "status": "paused",
  "current_task": "Implementing quantum circuit"
}
```

#### `DELETE /api/arena/session?session_id=<uuid>`
Delete Arena session.

---

### Arena Events

#### `GET /api/arena/events?session_id=<uuid>`
Get agent events for session.

**Query Parameters:**
- `session_id` (required): Session UUID
- `limit` (optional, default=50): Max events to return
- `since` (optional): ISO timestamp, only return events after this time

**Response:**
```json
{
  "session_id": "uuid",
  "events": [
    {
      "event_id": "uuid",
      "agent_id": "quantum_job_123",
      "agent_type": "quantum",
      "event_type": "quantum_execute",
      "event_data": {
        "job_id": "123",
        "backend": "ibm_fez",
        "phi": 0.8234,
        "lambda": 2.176e-8,
        "gamma": 0.1234
      },
      "level": "info",
      "created_at": "2025-11-19T12:05:00Z"
    }
  ],
  "count": 1
}
```

---

### Quantum Jobs

#### `GET /api/quantum/jobs`
List user's quantum jobs.

**Query Parameters:**
- `limit` (optional, default=20): Max jobs to return
- `status` (optional): Filter by status (queued, running, completed, failed)
- `session_id` (optional): Filter by session

**Response:**
```json
{
  "jobs": [
    {
      "job_id": "uuid",
      "ibm_job_id": "c1234567890",
      "backend": "ibm_fez",
      "num_qubits": 5,
      "circuit_depth": 42,
      "shots": 4096,
      "status": "completed",
      "metrics": {
        "phi": 0.8234,
        "lambda": 2.176e-8,
        "gamma": 0.1234,
        "w2": 0.0567
      },
      "submitted_at": "2025-11-19T12:00:00Z",
      "completed_at": "2025-11-19T12:03:45Z"
    }
  ],
  "count": 1
}
```

#### `POST /api/quantum/jobs`
Create and dispatch quantum job.

**Body:**
```json
{
  "circuit_qasm": "OPENQASM 2.0;\ninclude \"qelib1.inc\";\nqreg q[5];\ncreg c[5];\n...",
  "backend": "ibm_fez",
  "shots": 4096,
  "num_qubits": 5,
  "session_id": "uuid"
}
```

**Response (202 Accepted):**
```json
{
  "message": "Quantum job dispatched",
  "task_id": "uuid",
  "backend": "ibm_fez",
  "shots": 4096,
  "num_qubits": 5,
  "estimated_completion": "2-5 minutes"
}
```

**Note:** Job is dispatched asynchronously. Poll `GET /api/quantum/jobs` to check status.

---

## Authentication

All endpoints require JWT authentication via `Authorization` header:

```bash
curl -H "Authorization: Bearer <jwt_token>" \
  https://your-app.vercel.app/api/arena/session
```

Get JWT token from Supabase Auth:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

const token = data.session?.access_token;
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

**Status Codes:**
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: IBM Quantum (if not using worker-side credentials)
IBM_QUANTUM_TOKEN=your_ibm_token
```

---

## CORS Configuration

All API routes support CORS for development:

```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

**Production:** Restrict to specific domains:

```typescript
res.setHeader('Access-Control-Allow-Origin', 'https://www.dnalang.dev');
```

---

## Rate Limiting

Consider adding rate limiting for production:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
```

Or use Vercel Edge Config for serverless rate limiting.

---

## Testing

### Manual Testing with curl

```bash
# Get profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/profile

# Create session
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_name": "Test Arena"}' \
  http://localhost:3000/api/arena/session

# Dispatch quantum job
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "circuit_qasm": "OPENQASM 2.0; ...",
    "backend": "ibm_fez",
    "shots": 1024,
    "num_qubits": 3
  }' \
  http://localhost:3000/api/quantum/jobs
```

### Integration Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('API Routes', () => {
  it('creates Arena session', async () => {
    const response = await fetch('/api/arena/session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_name: 'Test Arena',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.session.session_name).toBe('Test Arena');
  });
});
```

---

## Frontend Integration

### React Example

```typescript
import { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

function ArenaDashboard() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!user) return;

    async function loadSessions() {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch('/api/arena/session', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setSessions(data.sessions);
    }

    loadSessions();
  }, [user]);

  return (
    <div>
      {sessions.map(session => (
        <div key={session.session_id}>
          <h3>{session.session_name}</h3>
          <p>Status: {session.status}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Deployment

API routes deploy automatically with Next.js on Vercel:

```bash
cd quantumlm-vercel
vercel --prod
```

Routes available at: `https://your-app.vercel.app/api/*`

---

## ΛΦ Integration

Quantum jobs calculate ΛΦ tensor metrics:

- **Φ (Phi)**: Consciousness metric (0.0-1.0)
- **Λ (Lambda)**: ΛΦ Universal Memory Constant (2.176435 × 10⁻⁸)
- **Γ (Gamma)**: Decoherence (0.0-1.0)
- **W₂**: Wasserstein-2 distance

All quantum job responses include these metrics.

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

---

**Status:** Production-ready
**Version:** 1.0.0
**Last Updated:** 2025-11-19
