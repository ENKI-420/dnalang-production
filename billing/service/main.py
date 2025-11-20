"""
DNALang Billing Service
Stripe integration for subscription management, usage metering, and invoicing
"""

from fastapi import FastAPI, Depends, HTTPException, Header, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum
import stripe
import os
import sys

# Add parent directory to path for database imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from database.connection import (
    init_db_pool,
    close_db_pool,
    TenantRepository,
    fetch_one,
    fetch_all,
    execute,
    get_db_connection
)

# ============================================================================
# Configuration
# ============================================================================

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_...")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "pk_test_...")

stripe.api_key = STRIPE_SECRET_KEY

# ============================================================================
# Models
# ============================================================================

class SubscriptionPlan(str, Enum):
    FREE = "free"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    RESEARCH = "research"


class SubscriptionStatus(str, Enum):
    TRIAL = "trial"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELED = "canceled"


class PlanDetails(BaseModel):
    id: str
    name: str
    description: Optional[str]
    price_monthly: Decimal
    price_annual: Decimal
    max_users: Optional[int]
    max_quantum_jobs_monthly: Optional[int]
    max_storage_gb: Optional[int]
    max_organisms: Optional[int]
    hipaa_compliance: bool
    priority_support: bool
    custom_branding: bool
    api_access: bool


class CreateSubscriptionRequest(BaseModel):
    tenant_id: str
    plan: SubscriptionPlan
    billing_cycle: str = "monthly"  # "monthly" or "annual"
    payment_method_id: str


class UpdateSubscriptionRequest(BaseModel):
    plan: Optional[SubscriptionPlan] = None
    billing_cycle: Optional[str] = None


class UsageRecord(BaseModel):
    usage_type: str
    quantity: Decimal
    unit: str
    metadata: Optional[Dict[str, Any]] = None


class InvoiceItem(BaseModel):
    description: str
    quantity: Decimal
    unit_price: Decimal
    amount: Decimal


class Invoice(BaseModel):
    id: str
    invoice_number: str
    tenant_id: str
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    status: str
    billing_period_start: datetime
    billing_period_end: datetime
    issued_at: datetime
    due_at: datetime
    paid_at: Optional[datetime]
    items: List[InvoiceItem]


# ============================================================================
# Application
# ============================================================================

app = FastAPI(
    title="DNALang Billing Service",
    description="Subscription management, usage metering, and invoicing",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Startup/Shutdown
# ============================================================================

@app.on_event("startup")
async def startup():
    await init_db_pool()


@app.on_event("shutdown")
async def shutdown():
    await close_db_pool()


# ============================================================================
# Subscription Management
# ============================================================================

@app.get("/plans", response_model=List[PlanDetails])
async def list_plans():
    """List all available subscription plans"""
    plans = await fetch_all("SELECT * FROM subscription_plans WHERE active = TRUE")
    return plans


@app.get("/plans/{plan_id}", response_model=PlanDetails)
async def get_plan(plan_id: str):
    """Get subscription plan details"""
    plan = await fetch_one("SELECT * FROM subscription_plans WHERE id = $1", plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@app.post("/subscriptions")
async def create_subscription(request: CreateSubscriptionRequest):
    """
    Create new subscription for tenant
    Creates Stripe customer and subscription
    """
    tenant_repo = TenantRepository()
    tenant = await tenant_repo.find_by_id(request.tenant_id)

    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # Get plan details
    plan = await fetch_one(
        "SELECT * FROM subscription_plans WHERE id = $1",
        request.plan.value
    )

    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # Create or get Stripe customer
    if tenant['stripe_customer_id']:
        customer_id = tenant['stripe_customer_id']
    else:
        customer = stripe.Customer.create(
            email=tenant['email'],
            name=tenant['name'],
            metadata={
                'tenant_id': str(tenant['id']),
                'tenant_type': tenant['type']
            }
        )
        customer_id = customer.id

        # Update tenant with Stripe customer ID
        await tenant_repo.update(request.tenant_id, {
            'stripe_customer_id': customer_id
        })

    # Attach payment method
    try:
        stripe.PaymentMethod.attach(
            request.payment_method_id,
            customer=customer_id
        )
        stripe.Customer.modify(
            customer_id,
            invoice_settings={'default_payment_method': request.payment_method_id}
        )
    except stripe.error.CardError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Determine price based on billing cycle
    if request.billing_cycle == "annual":
        price_amount = int(plan['price_annual'] * 100)  # Convert to cents
    else:
        price_amount = int(plan['price_monthly'] * 100)

    # Create Stripe price
    stripe_price = stripe.Price.create(
        currency="usd",
        unit_amount=price_amount,
        recurring={
            "interval": "year" if request.billing_cycle == "annual" else "month"
        },
        product_data={
            "name": f"DNALang {plan['name']} Plan",
            "metadata": {"plan_id": plan['id']}
        }
    )

    # Create subscription
    subscription = stripe.Subscription.create(
        customer=customer_id,
        items=[{"price": stripe_price.id}],
        metadata={
            'tenant_id': str(tenant['id']),
            'plan_id': plan['id']
        },
        trial_period_days=14 if request.plan == SubscriptionPlan.FREE else None
    )

    # Update tenant
    await tenant_repo.update(request.tenant_id, {
        'subscription_plan': request.plan.value,
        'subscription_status': 'trial' if subscription.status == 'trialing' else 'active',
        'subscription_started_at': datetime.fromtimestamp(subscription.current_period_start),
        'subscription_ends_at': datetime.fromtimestamp(subscription.current_period_end),
        'trial_ends_at': datetime.fromtimestamp(subscription.trial_end) if subscription.trial_end else None,
        'stripe_subscription_id': subscription.id
    })

    return {
        "subscription_id": subscription.id,
        "status": subscription.status,
        "current_period_start": datetime.fromtimestamp(subscription.current_period_start),
        "current_period_end": datetime.fromtimestamp(subscription.current_period_end),
        "trial_end": datetime.fromtimestamp(subscription.trial_end) if subscription.trial_end else None
    }


@app.get("/subscriptions/{tenant_id}")
async def get_subscription(tenant_id: str):
    """Get tenant's subscription details"""
    tenant_repo = TenantRepository()
    tenant = await tenant_repo.find_by_id(tenant_id)

    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    if not tenant['stripe_subscription_id']:
        return {
            "plan": tenant['subscription_plan'],
            "status": tenant['subscription_status'],
            "trial_ends_at": tenant['trial_ends_at']
        }

    # Get from Stripe
    subscription = stripe.Subscription.retrieve(tenant['stripe_subscription_id'])

    return {
        "subscription_id": subscription.id,
        "plan": tenant['subscription_plan'],
        "status": subscription.status,
        "current_period_start": datetime.fromtimestamp(subscription.current_period_start),
        "current_period_end": datetime.fromtimestamp(subscription.current_period_end),
        "trial_end": datetime.fromtimestamp(subscription.trial_end) if subscription.trial_end else None,
        "cancel_at_period_end": subscription.cancel_at_period_end
    }


@app.put("/subscriptions/{tenant_id}")
async def update_subscription(tenant_id: str, request: UpdateSubscriptionRequest):
    """Update tenant's subscription"""
    tenant_repo = TenantRepository()
    tenant = await tenant_repo.find_by_id(tenant_id)

    if not tenant or not tenant['stripe_subscription_id']:
        raise HTTPException(status_code=404, detail="Subscription not found")

    subscription = stripe.Subscription.retrieve(tenant['stripe_subscription_id'])

    # Update plan if requested
    if request.plan:
        plan = await fetch_one(
            "SELECT * FROM subscription_plans WHERE id = $1",
            request.plan.value
        )

        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")

        # Create new price
        price_amount = int(plan['price_monthly'] * 100)
        stripe_price = stripe.Price.create(
            currency="usd",
            unit_amount=price_amount,
            recurring={"interval": "month"},
            product_data={
                "name": f"DNALang {plan['name']} Plan",
                "metadata": {"plan_id": plan['id']}
            }
        )

        # Update subscription
        stripe.Subscription.modify(
            subscription.id,
            items=[{
                'id': subscription['items']['data'][0].id,
                'price': stripe_price.id
            }],
            proration_behavior='create_prorations'
        )

        # Update tenant
        await tenant_repo.update(tenant_id, {
            'subscription_plan': request.plan.value
        })

    return {"message": "Subscription updated"}


@app.delete("/subscriptions/{tenant_id}")
async def cancel_subscription(tenant_id: str, immediate: bool = False):
    """Cancel tenant's subscription"""
    tenant_repo = TenantRepository()
    tenant = await tenant_repo.find_by_id(tenant_id)

    if not tenant or not tenant['stripe_subscription_id']:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if immediate:
        # Cancel immediately
        stripe.Subscription.delete(tenant['stripe_subscription_id'])
        await tenant_repo.update(tenant_id, {
            'subscription_status': 'canceled',
            'subscription_ends_at': datetime.utcnow()
        })
    else:
        # Cancel at period end
        subscription = stripe.Subscription.modify(
            tenant['stripe_subscription_id'],
            cancel_at_period_end=True
        )
        await tenant_repo.update(tenant_id, {
            'subscription_status': 'active',  # Still active until period end
            'subscription_ends_at': datetime.fromtimestamp(subscription.current_period_end)
        })

    return {"message": "Subscription canceled"}


# ============================================================================
# Usage Tracking
# ============================================================================

@app.post("/usage/{tenant_id}")
async def record_usage(tenant_id: str, usage: UsageRecord):
    """Record usage for tenant"""
    # Get plan limits
    plan = await fetch_one(
        """
        SELECT sp.* FROM subscription_plans sp
        JOIN tenants t ON t.subscription_plan = sp.id
        WHERE t.id = $1
        """,
        tenant_id
    )

    if not plan:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # Calculate cost
    usage_costs = {
        'quantum_job': Decimal('0.50'),
        'storage': Decimal('0.10'),  # per GB
        'api_call': Decimal('0.001')
    }

    unit_cost = usage_costs.get(usage.usage_type, Decimal('0'))
    total_cost = usage.quantity * unit_cost

    # Record usage
    now = datetime.utcnow()
    await execute(
        """
        INSERT INTO usage_records (
            tenant_id, usage_type, quantity, unit, unit_cost, total_cost,
            billing_month, billing_year, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """,
        tenant_id,
        usage.usage_type,
        usage.quantity,
        usage.unit,
        unit_cost,
        total_cost,
        now.month,
        now.year,
        usage.metadata or {}
    )

    return {
        "usage_type": usage.usage_type,
        "quantity": usage.quantity,
        "cost": total_cost
    }


@app.get("/usage/{tenant_id}/current")
async def get_current_usage(tenant_id: str):
    """Get current month's usage for tenant"""
    now = datetime.utcnow()

    usage = await fetch_all(
        """
        SELECT usage_type, SUM(quantity) as total_quantity, SUM(total_cost) as total_cost
        FROM usage_records
        WHERE tenant_id = $1 AND billing_year = $2 AND billing_month = $3
        GROUP BY usage_type
        """,
        tenant_id,
        now.year,
        now.month
    )

    # Get plan limits
    plan = await fetch_one(
        """
        SELECT sp.* FROM subscription_plans sp
        JOIN tenants t ON t.subscription_plan = sp.id
        WHERE t.id = $1
        """,
        tenant_id
    )

    return {
        "month": now.month,
        "year": now.year,
        "usage": usage,
        "limits": {
            "quantum_jobs": plan['max_quantum_jobs_monthly'],
            "storage_gb": plan['max_storage_gb'],
            "users": plan['max_users'],
            "organisms": plan['max_organisms']
        }
    }


# ============================================================================
# Invoicing
# ============================================================================

@app.post("/invoices/{tenant_id}/generate")
async def generate_invoice(tenant_id: str, background_tasks: BackgroundTasks):
    """Generate invoice for tenant's current usage"""
    tenant_repo = TenantRepository()
    tenant = await tenant_repo.find_by_id(tenant_id)

    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    # Get current usage
    now = datetime.utcnow()
    period_start = datetime(now.year, now.month, 1)
    period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

    usage_records = await fetch_all(
        """
        SELECT * FROM usage_records
        WHERE tenant_id = $1 AND billing_year = $2 AND billing_month = $3
        """,
        tenant_id,
        now.year,
        now.month
    )

    # Calculate totals
    subtotal = sum(Decimal(str(r['total_cost'])) for r in usage_records)
    tax = subtotal * Decimal('0.08')  # 8% tax
    total = subtotal + tax

    # Generate invoice number
    invoice_number = f"INV-{now.year}-{now.month:02d}-{tenant['subdomain']}"

    # Create invoice
    async with get_db_connection() as conn:
        invoice = await conn.fetchrow(
            """
            INSERT INTO invoices (
                tenant_id, invoice_number, subtotal, tax, total, status,
                billing_period_start, billing_period_end, due_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
            """,
            tenant_id,
            invoice_number,
            subtotal,
            tax,
            total,
            'pending',
            period_start,
            period_end,
            now + timedelta(days=15)
        )

        # Add line items
        for record in usage_records:
            await conn.execute(
                """
                INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
                VALUES ($1, $2, $3, $4, $5)
                """,
                invoice['id'],
                f"{record['usage_type']} ({record['unit']})",
                record['quantity'],
                record['unit_cost'],
                record['total_cost']
            )

    # Create Stripe invoice if customer exists
    if tenant['stripe_customer_id']:
        background_tasks.add_task(create_stripe_invoice, tenant['stripe_customer_id'], invoice['id'])

    return dict(invoice)


async def create_stripe_invoice(customer_id: str, invoice_id: str):
    """Background task to create Stripe invoice"""
    try:
        # Get invoice from database
        invoice = await fetch_one("SELECT * FROM invoices WHERE id = $1", invoice_id)
        items = await fetch_all("SELECT * FROM invoice_items WHERE invoice_id = $1", invoice_id)

        # Create Stripe invoice
        stripe_invoice = stripe.Invoice.create(
            customer=customer_id,
            auto_advance=True,
            collection_method='charge_automatically',
            metadata={'dnalang_invoice_id': str(invoice_id)}
        )

        # Add items
        for item in items:
            stripe.InvoiceItem.create(
                customer=customer_id,
                invoice=stripe_invoice.id,
                description=item['description'],
                quantity=int(item['quantity']),
                unit_amount=int(item['unit_price'] * 100)
            )

        # Finalize and pay
        stripe.Invoice.finalize_invoice(stripe_invoice.id)

        # Update database
        await execute(
            "UPDATE invoices SET stripe_invoice_id = $1 WHERE id = $2",
            stripe_invoice.id,
            invoice_id
        )

    except Exception as e:
        print(f"Error creating Stripe invoice: {e}")


@app.get("/invoices/{tenant_id}", response_model=List[Invoice])
async def list_invoices(tenant_id: str, limit: int = 12):
    """List invoices for tenant"""
    invoices = await fetch_all(
        """
        SELECT i.*, COALESCE(
            json_agg(
                json_build_object(
                    'description', ii.description,
                    'quantity', ii.quantity,
                    'unit_price', ii.unit_price,
                    'amount', ii.amount
                )
            ) FILTER (WHERE ii.id IS NOT NULL),
            '[]'
        ) as items
        FROM invoices i
        LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
        WHERE i.tenant_id = $1
        GROUP BY i.id
        ORDER BY i.created_at DESC
        LIMIT $2
        """,
        tenant_id,
        limit
    )

    return invoices


# ============================================================================
# Health Check
# ============================================================================

@app.get("/")
async def root():
    return {
        "service": "DNALang Billing",
        "version": "1.0.0",
        "stripe_mode": "test" if "test" in STRIPE_SECRET_KEY else "live"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
