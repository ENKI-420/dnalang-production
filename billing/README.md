# DNALang Billing Service

Complete billing and subscription management system powered by Stripe.

## Features

- **Subscription Management**: Create, update, and cancel subscriptions
- **Usage Metering**: Track quantum jobs, storage, API calls
- **Automated Invoicing**: Generate monthly invoices with usage-based billing
- **Stripe Integration**: Full webhook handling for payment events
- **Multi-tier Plans**: Free, Professional, Enterprise, and Research tiers

## Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │────────>│   Billing    │────────>│    Stripe    │
│  (Next.js)   │         │   Service    │         │     API      │
└──────────────┘         └──────────────┘         └──────────────┘
                                │                         │
                                │                         │
                                v                         v
                         ┌──────────────┐         ┌──────────────┐
                         │  PostgreSQL  │         │   Webhook    │
                         │   Database   │<────────│   Handler    │
                         └──────────────┘         └──────────────┘
```

## Subscription Plans

| Plan | Price/Month | Users | Quantum Jobs | Storage | HIPAA |
|------|-------------|-------|--------------|---------|-------|
| **Free** | $0 | 1 | 10/month | 1 GB | No |
| **Professional** | $299 | 10 | 100/month | 50 GB | No |
| **Enterprise** | $999 | Unlimited | 1,000/month | 500 GB | Yes |
| **Research** | $499 | 50 | 500/month | 250 GB | No |

## Quick Start

### 1. Install Dependencies

```bash
cd billing/
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
cat > .env <<EOF
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://dnalang:password@localhost:5432/dnalang
EOF
```

### 3. Start Services

```bash
# Billing service (port 8001)
python service/main.py

# Webhook handler (port 8002)
python webhooks/stripe_webhook.py
```

### 4. Configure Stripe Webhook

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8002/webhook

# Copy webhook signing secret to .env
# Output: "whsec_..."
```

## API Endpoints

### Subscription Management

#### List Plans
```bash
GET /plans
```

Response:
```json
[
  {
    "id": "professional",
    "name": "Professional",
    "price_monthly": 299.00,
    "price_annual": 2990.00,
    "max_users": 10,
    "max_quantum_jobs_monthly": 100,
    "max_storage_gb": 50
  }
]
```

#### Create Subscription
```bash
POST /subscriptions
Content-Type: application/json

{
  "tenant_id": "tenant-uuid",
  "plan": "professional",
  "billing_cycle": "monthly",
  "payment_method_id": "pm_1234..."
}
```

Response:
```json
{
  "subscription_id": "sub_1234...",
  "status": "active",
  "current_period_start": "2024-11-19T00:00:00Z",
  "current_period_end": "2024-12-19T00:00:00Z"
}
```

#### Get Subscription
```bash
GET /subscriptions/{tenant_id}
```

#### Update Subscription
```bash
PUT /subscriptions/{tenant_id}
Content-Type: application/json

{
  "plan": "enterprise"
}
```

#### Cancel Subscription
```bash
DELETE /subscriptions/{tenant_id}?immediate=false
```

### Usage Tracking

#### Record Usage
```bash
POST /usage/{tenant_id}
Content-Type: application/json

{
  "usage_type": "quantum_job",
  "quantity": 1,
  "unit": "jobs",
  "metadata": {
    "backend": "ibm_torino",
    "shots": 4000
  }
}
```

Usage types:
- `quantum_job`: Quantum organism executions ($0.50 per job)
- `storage`: Data storage ($0.10 per GB)
- `api_call`: API requests ($0.001 per call)

#### Get Current Usage
```bash
GET /usage/{tenant_id}/current
```

Response:
```json
{
  "month": 11,
  "year": 2024,
  "usage": [
    {
      "usage_type": "quantum_job",
      "total_quantity": 47,
      "total_cost": 23.50
    },
    {
      "usage_type": "storage",
      "total_quantity": 12.5,
      "total_cost": 1.25
    }
  ],
  "limits": {
    "quantum_jobs": 100,
    "storage_gb": 50,
    "users": 10
  }
}
```

### Invoicing

#### Generate Invoice
```bash
POST /invoices/{tenant_id}/generate
```

Response:
```json
{
  "id": "invoice-uuid",
  "invoice_number": "INV-2024-11-demo",
  "subtotal": 147.50,
  "tax": 11.80,
  "total": 159.30,
  "status": "pending",
  "due_at": "2024-12-04T00:00:00Z"
}
```

#### List Invoices
```bash
GET /invoices/{tenant_id}?limit=12
```

## Stripe Webhook Events

The webhook handler processes these events:

### Subscription Events
- `customer.subscription.created`: New subscription created
- `customer.subscription.updated`: Subscription plan changed
- `customer.subscription.deleted`: Subscription canceled

### Payment Events
- `invoice.payment_succeeded`: Payment successful
- `invoice.payment_failed`: Payment failed
- `payment_intent.succeeded`: Payment intent succeeded
- `payment_intent.payment_failed`: Payment intent failed

## Integration Example

### Frontend (React/Next.js)

```typescript
// lib/billing.ts
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export async function createSubscription(
  tenantId: string,
  plan: string,
  paymentMethodId: string
) {
  const response = await fetch('http://localhost:8001/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenant_id: tenantId,
      plan,
      billing_cycle: 'monthly',
      payment_method_id: paymentMethodId
    })
  })

  if (!response.ok) {
    throw new Error('Failed to create subscription')
  }

  return response.json()
}

export async function recordUsage(
  tenantId: string,
  usageType: string,
  quantity: number
) {
  const response = await fetch(`http://localhost:8001/usage/${tenantId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usage_type: usageType,
      quantity,
      unit: usageType === 'quantum_job' ? 'jobs' : 'GB'
    })
  })

  return response.json()
}
```

### Backend (Python)

```python
from billing.service.main import record_usage

# After executing quantum organism
await record_usage(
    tenant_id=user['tenant_id'],
    usage=UsageRecord(
        usage_type='quantum_job',
        quantity=1,
        unit='jobs',
        metadata={
            'organism_id': organism['id'],
            'backend': 'ibm_torino',
            'shots': 4000
        }
    )
)
```

## Usage-Based Billing

### Pricing Structure

1. **Base Subscription**: Monthly/annual fee for plan tier
2. **Overage Charges**:
   - Quantum jobs exceeding plan limit: $0.50 per job
   - Storage exceeding plan limit: $0.10 per GB
   - Additional API calls: $0.001 per call

### Example Invoice

**Professional Plan - $299/month**

| Item | Quantity | Unit Price | Total |
|------|----------|-----------|-------|
| Professional Plan | 1 | $299.00 | $299.00 |
| Additional Quantum Jobs | 45 | $0.50 | $22.50 |
| Additional Storage | 12.5 GB | $0.10 | $1.25 |
| Additional API Calls | 1,247 | $0.001 | $1.25 |
| **Subtotal** | | | **$324.00** |
| Tax (8%) | | | $25.92 |
| **Total** | | | **$349.92** |

## Quota Enforcement

```python
from billing.service.main import get_current_usage

# Before executing quantum job
usage = await get_current_usage(tenant_id)
quantum_usage = next(
    (u for u in usage['usage'] if u['usage_type'] == 'quantum_job'),
    {'total_quantity': 0}
)

if quantum_usage['total_quantity'] >= usage['limits']['quantum_jobs']:
    # Allow but charge overage
    logger.warning(f"Tenant {tenant_id} exceeded quantum job limit")
    # Or block execution for Free plan
    if plan == 'free':
        raise HTTPException(status_code=429, detail="Quantum job limit exceeded")
```

## Testing

### Test with Stripe CLI

```bash
# Trigger subscription created event
stripe trigger customer.subscription.created

# Trigger payment succeeded event
stripe trigger invoice.payment_succeeded

# View webhook events
stripe events list --limit 10
```

### Test Cards

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

CVC: Any 3 digits
Expiry: Any future date

## Production Deployment

### Environment Setup

```bash
# Production Stripe keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Set webhook endpoint in Stripe Dashboard
# https://api.dnalang.dev/webhooks/stripe
```

### Webhook Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.dnalang.dev/webhooks/stripe`
3. Select events:
   - `customer.subscription.*`
   - `invoice.*`
   - `payment_intent.*`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### SSL/TLS

Stripe requires HTTPS for webhooks in production. Use reverse proxy (nginx/Traefik) for TLS termination.

## Monitoring

### Stripe Dashboard

Monitor:
- Subscription MRR (Monthly Recurring Revenue)
- Churn rate
- Failed payments
- Upcoming invoices

### Database Queries

```sql
-- Monthly revenue
SELECT
    billing_year,
    billing_month,
    SUM(total_cost) as revenue
FROM usage_records
GROUP BY billing_year, billing_month
ORDER BY billing_year DESC, billing_month DESC;

-- Active subscriptions by plan
SELECT
    subscription_plan,
    COUNT(*) as count,
    SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as active
FROM tenants
WHERE deleted_at IS NULL
GROUP BY subscription_plan;

-- Failed payments
SELECT
    t.name,
    i.invoice_number,
    i.total,
    i.issued_at
FROM invoices i
JOIN tenants t ON i.tenant_id = t.id
WHERE i.status = 'failed'
ORDER BY i.issued_at DESC;
```

## Troubleshooting

### Webhook Not Received

```bash
# Check Stripe webhook logs
stripe events list --limit 10

# Verify webhook signing secret
echo $STRIPE_WEBHOOK_SECRET

# Test locally with Stripe CLI
stripe listen --forward-to localhost:8002/webhook
```

### Payment Failed

Check Stripe Dashboard for:
- Invalid card
- Insufficient funds
- Card declined by issuer

### Invoice Not Generated

```sql
-- Check usage records exist
SELECT * FROM usage_records
WHERE tenant_id = 'tenant-uuid'
  AND billing_year = 2024
  AND billing_month = 11;

-- Manually trigger generation
POST /invoices/{tenant_id}/generate
```

## Security

- **API Keys**: Never commit Stripe keys to version control
- **Webhook Signatures**: Always verify webhook signatures
- **HTTPS**: Use TLS for all API communication
- **Rate Limiting**: Implement rate limiting on endpoints
- **Audit Logging**: Log all subscription changes

## Next Steps

1. **Tax Calculation**: Integrate Stripe Tax for automatic tax calculation
2. **Dunning Management**: Implement retry logic for failed payments
3. **Customer Portal**: Add Stripe Customer Portal for self-service
4. **Reporting**: Build analytics dashboard for revenue metrics
5. **Proration**: Handle mid-cycle plan changes with prorations

## License

Proprietary - DNALang Quantum Platform
