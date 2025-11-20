"""
Stripe Webhook Handler
Processes Stripe events for subscriptions, payments, and invoices
"""

from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import stripe
import os
import sys
from datetime import datetime
import logging

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from database.connection import (
    init_db_pool,
    close_db_pool,
    TenantRepository,
    execute,
    fetch_one
)

# ============================================================================
# Configuration
# ============================================================================

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_...")

stripe.api_key = STRIPE_SECRET_KEY

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Application
# ============================================================================

app = FastAPI(
    title="DNALang Stripe Webhook Handler",
    description="Process Stripe events for subscriptions and payments",
    version="1.0.0"
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
# Webhook Endpoint
# ============================================================================

@app.post("/webhook")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Handle Stripe webhook events

    Events handled:
    - customer.subscription.created
    - customer.subscription.updated
    - customer.subscription.deleted
    - invoice.payment_succeeded
    - invoice.payment_failed
    - payment_intent.succeeded
    - payment_intent.payment_failed
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Log event
    logger.info(f"Received event: {event['type']} - {event['id']}")

    # Route to appropriate handler
    event_type = event['type']

    if event_type == "customer.subscription.created":
        background_tasks.add_task(handle_subscription_created, event)
    elif event_type == "customer.subscription.updated":
        background_tasks.add_task(handle_subscription_updated, event)
    elif event_type == "customer.subscription.deleted":
        background_tasks.add_task(handle_subscription_deleted, event)
    elif event_type == "invoice.payment_succeeded":
        background_tasks.add_task(handle_invoice_payment_succeeded, event)
    elif event_type == "invoice.payment_failed":
        background_tasks.add_task(handle_invoice_payment_failed, event)
    elif event_type == "payment_intent.succeeded":
        background_tasks.add_task(handle_payment_intent_succeeded, event)
    elif event_type == "payment_intent.payment_failed":
        background_tasks.add_task(handle_payment_intent_failed, event)
    else:
        logger.info(f"Unhandled event type: {event_type}")

    return JSONResponse({"status": "success"})


# ============================================================================
# Event Handlers
# ============================================================================

async def handle_subscription_created(event):
    """Handle subscription.created event"""
    subscription = event['data']['object']
    tenant_id = subscription['metadata'].get('tenant_id')

    if not tenant_id:
        logger.warning(f"Subscription {subscription['id']} has no tenant_id in metadata")
        return

    logger.info(f"Subscription created: {subscription['id']} for tenant {tenant_id}")

    tenant_repo = TenantRepository()
    await tenant_repo.update(tenant_id, {
        'stripe_subscription_id': subscription['id'],
        'subscription_status': 'trial' if subscription['status'] == 'trialing' else 'active',
        'subscription_started_at': datetime.fromtimestamp(subscription['created']),
        'subscription_ends_at': datetime.fromtimestamp(subscription['current_period_end']),
        'trial_ends_at': datetime.fromtimestamp(subscription['trial_end']) if subscription.get('trial_end') else None
    })


async def handle_subscription_updated(event):
    """Handle subscription.updated event"""
    subscription = event['data']['object']
    tenant_id = subscription['metadata'].get('tenant_id')

    if not tenant_id:
        # Try to find by subscription ID
        tenant = await fetch_one(
            "SELECT * FROM tenants WHERE stripe_subscription_id = $1",
            subscription['id']
        )
        if not tenant:
            logger.warning(f"Cannot find tenant for subscription {subscription['id']}")
            return
        tenant_id = tenant['id']

    logger.info(f"Subscription updated: {subscription['id']} for tenant {tenant_id}")

    # Map Stripe status to our status
    status_map = {
        'active': 'active',
        'trialing': 'trial',
        'past_due': 'suspended',
        'canceled': 'canceled',
        'unpaid': 'suspended'
    }

    tenant_repo = TenantRepository()
    await tenant_repo.update(tenant_id, {
        'subscription_status': status_map.get(subscription['status'], 'active'),
        'subscription_ends_at': datetime.fromtimestamp(subscription['current_period_end'])
    })


async def handle_subscription_deleted(event):
    """Handle subscription.deleted event"""
    subscription = event['data']['object']
    tenant_id = subscription['metadata'].get('tenant_id')

    if not tenant_id:
        tenant = await fetch_one(
            "SELECT * FROM tenants WHERE stripe_subscription_id = $1",
            subscription['id']
        )
        if not tenant:
            logger.warning(f"Cannot find tenant for subscription {subscription['id']}")
            return
        tenant_id = tenant['id']

    logger.info(f"Subscription deleted: {subscription['id']} for tenant {tenant_id}")

    tenant_repo = TenantRepository()
    await tenant_repo.update(tenant_id, {
        'subscription_status': 'canceled',
        'subscription_ends_at': datetime.utcnow()
    })


async def handle_invoice_payment_succeeded(event):
    """Handle invoice.payment_succeeded event"""
    invoice = event['data']['object']
    dnalang_invoice_id = invoice['metadata'].get('dnalang_invoice_id')

    logger.info(f"Invoice payment succeeded: {invoice['id']}")

    if dnalang_invoice_id:
        # Update our invoice record
        await execute(
            """
            UPDATE invoices
            SET status = 'paid',
                paid_at = $1,
                stripe_payment_intent_id = $2
            WHERE id = $3
            """,
            datetime.fromtimestamp(invoice['status_transitions']['paid_at']),
            invoice.get('payment_intent'),
            dnalang_invoice_id
        )

    # Get customer and tenant
    customer = stripe.Customer.retrieve(invoice['customer'])
    tenant_id = customer['metadata'].get('tenant_id')

    if tenant_id:
        # Ensure subscription is active
        tenant_repo = TenantRepository()
        await tenant_repo.update(tenant_id, {
            'subscription_status': 'active'
        })


async def handle_invoice_payment_failed(event):
    """Handle invoice.payment_failed event"""
    invoice = event['data']['object']
    dnalang_invoice_id = invoice['metadata'].get('dnalang_invoice_id')

    logger.warning(f"Invoice payment failed: {invoice['id']}")

    if dnalang_invoice_id:
        # Update our invoice record
        await execute(
            """
            UPDATE invoices
            SET status = 'failed'
            WHERE id = $1
            """,
            dnalang_invoice_id
        )

    # Get customer and tenant
    customer = stripe.Customer.retrieve(invoice['customer'])
    tenant_id = customer['metadata'].get('tenant_id')

    if tenant_id:
        # Suspend tenant if payment failed
        tenant_repo = TenantRepository()
        await tenant_repo.update(tenant_id, {
            'subscription_status': 'suspended'
        })

        # TODO: Send notification email to tenant admin


async def handle_payment_intent_succeeded(event):
    """Handle payment_intent.succeeded event"""
    payment_intent = event['data']['object']
    logger.info(f"Payment intent succeeded: {payment_intent['id']}")

    # Update invoice if linked
    if payment_intent.get('invoice'):
        invoice = stripe.Invoice.retrieve(payment_intent['invoice'])
        dnalang_invoice_id = invoice['metadata'].get('dnalang_invoice_id')

        if dnalang_invoice_id:
            await execute(
                """
                UPDATE invoices
                SET stripe_payment_intent_id = $1
                WHERE id = $2
                """,
                payment_intent['id'],
                dnalang_invoice_id
            )


async def handle_payment_intent_failed(event):
    """Handle payment_intent.payment_failed event"""
    payment_intent = event['data']['object']
    logger.warning(f"Payment intent failed: {payment_intent['id']}")

    # Get customer and tenant
    customer_id = payment_intent.get('customer')
    if customer_id:
        customer = stripe.Customer.retrieve(customer_id)
        tenant_id = customer['metadata'].get('tenant_id')

        if tenant_id:
            # Log failed payment attempt
            logger.error(f"Payment failed for tenant {tenant_id}: {payment_intent.get('last_payment_error', {}).get('message')}")

            # TODO: Send notification to tenant admin


# ============================================================================
# Test Endpoint
# ============================================================================

@app.get("/")
async def root():
    return {
        "service": "DNALang Stripe Webhook Handler",
        "version": "1.0.0",
        "endpoint": "/webhook"
    }


@app.post("/test")
async def test_webhook(event_type: str = "customer.subscription.created"):
    """Test webhook processing with sample event"""
    # This would only work in test mode
    if "test" not in STRIPE_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Only available in test mode")

    # Create a test event
    # In production, use Stripe CLI: stripe trigger <event_type>
    return {"message": "Use Stripe CLI to test: stripe trigger " + event_type}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
