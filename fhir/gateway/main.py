"""
DNALang FHIR Gateway
SMART on FHIR and CDS Hooks integration for Epic, Cerner, and other EHRs
"""

from fastapi import FastAPI, Depends, HTTPException, Header, Request, Query
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, timedelta
from enum import Enum
import httpx
import jwt
import secrets
import os
import sys
from urllib.parse import urlencode

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from database.connection import (
    init_db_pool,
    close_db_pool,
    fetch_one,
    fetch_all,
    execute
)

# ============================================================================
# Configuration
# ============================================================================

APP_URL = os.getenv("APP_URL", "https://www.dnalang.dev")
SMART_CLIENT_ID = os.getenv("SMART_CLIENT_ID", "dnalang-smart-app")
SMART_CLIENT_SECRET = os.getenv("SMART_CLIENT_SECRET", "secret")
JWT_SECRET = os.getenv("JWT_SECRET", "jwt-secret")

# ============================================================================
# Models
# ============================================================================

class SMARTLaunchRequest(BaseModel):
    iss: str  # FHIR server base URL
    launch: str  # Launch context token
    aud: Optional[str] = None  # Target audience (deprecated)


class SMARTCallbackRequest(BaseModel):
    code: str
    state: str


class FHIRResource(str, Enum):
    PATIENT = "Patient"
    OBSERVATION = "Observation"
    DIAGNOSTIC_REPORT = "DiagnosticReport"
    MEDICATION = "Medication"
    MEDICATION_REQUEST = "MedicationRequest"
    CONDITION = "Condition"
    PROCEDURE = "Procedure"


class CDSHookRequest(BaseModel):
    """CDS Hooks request format"""
    hook: str
    hookInstance: str
    context: Dict[str, Any]
    prefetch: Optional[Dict[str, Any]] = None
    fhirServer: Optional[str] = None
    fhirAuthorization: Optional[Dict[str, str]] = None


class CDSCard(BaseModel):
    """CDS Hooks card (response)"""
    summary: str
    indicator: Literal["info", "warning", "critical"]
    source: Dict[str, str]
    detail: Optional[str] = None
    suggestions: Optional[List[Dict[str, Any]]] = None
    selectionBehavior: Optional[Literal["at-most-one", "any"]] = None
    links: Optional[List[Dict[str, str]]] = None


class CDSResponse(BaseModel):
    """CDS Hooks response"""
    cards: List[CDSCard]


# ============================================================================
# Application
# ============================================================================

app = FastAPI(
    title="DNALang FHIR Gateway",
    description="SMART on FHIR and CDS Hooks integration for EHR systems",
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
# SMART on FHIR Endpoints
# ============================================================================

@app.get("/smart/launch")
async def smart_launch(
    iss: str = Query(..., description="FHIR server base URL"),
    launch: str = Query(..., description="Launch context token")
):
    """
    SMART on FHIR launch endpoint
    Called by EHR when launching DNALang app

    Example:
    https://www.dnalang.dev/api/smart/launch?iss=https://fhir.epic.com/...&launch=xyz123
    """
    # Discover FHIR server metadata
    async with httpx.AsyncClient() as client:
        try:
            # Get SMART configuration
            metadata_response = await client.get(
                f"{iss}/.well-known/smart-configuration",
                timeout=10.0
            )
            metadata_response.raise_for_status()
            smart_config = metadata_response.json()

        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to fetch SMART configuration: {str(e)}"
            )

    # Extract authorization endpoint
    authorization_endpoint = smart_config.get("authorization_endpoint")
    token_endpoint = smart_config.get("token_endpoint")

    if not authorization_endpoint:
        raise HTTPException(
            status_code=400,
            detail="EHR does not support SMART authorization"
        )

    # Generate state for security
    state = secrets.token_urlsafe(32)

    # Store launch context in database
    await execute(
        """
        INSERT INTO smart_launch_contexts (
            state, iss, launch_token, authorization_endpoint, token_endpoint,
            created_at, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
        state,
        iss,
        launch,
        authorization_endpoint,
        token_endpoint,
        datetime.utcnow(),
        datetime.utcnow() + timedelta(minutes=10)
    )

    # Build authorization URL
    auth_params = {
        "response_type": "code",
        "client_id": SMART_CLIENT_ID,
        "redirect_uri": f"{APP_URL}/api/smart/callback",
        "scope": "launch openid fhirUser patient/*.read observation/*.read",
        "state": state,
        "aud": iss,
        "launch": launch
    }

    authorization_url = f"{authorization_endpoint}?{urlencode(auth_params)}"

    # Redirect to EHR authorization page
    return RedirectResponse(url=authorization_url)


@app.get("/smart/callback")
async def smart_callback(
    code: str = Query(...),
    state: str = Query(...)
):
    """
    SMART on FHIR callback endpoint
    EHR redirects here after user authorization
    """
    # Retrieve launch context
    context = await fetch_one(
        """
        SELECT * FROM smart_launch_contexts
        WHERE state = $1 AND expires_at > NOW()
        """,
        state
    )

    if not context:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired state parameter"
        )

    # Exchange authorization code for access token
    async with httpx.AsyncClient() as client:
        try:
            token_response = await client.post(
                context['token_endpoint'],
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": f"{APP_URL}/api/smart/callback",
                    "client_id": SMART_CLIENT_ID,
                    "client_secret": SMART_CLIENT_SECRET
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=10.0
            )
            token_response.raise_for_status()
            token_data = token_response.json()

        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Token exchange failed: {str(e)}"
            )

    # Extract patient ID from token response
    patient_id = token_data.get("patient")
    user_id = token_data.get("id_token")  # OpenID Connect ID token
    fhir_user = token_data.get("fhirUser")

    # Store access token
    session_token = secrets.token_urlsafe(32)
    await execute(
        """
        INSERT INTO smart_sessions (
            session_token, state, access_token, refresh_token, patient_id,
            fhir_user, scope, fhir_server, expires_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """,
        session_token,
        state,
        token_data['access_token'],
        token_data.get('refresh_token'),
        patient_id,
        fhir_user,
        token_data.get('scope', ''),
        context['iss'],
        datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 3600)),
        datetime.utcnow()
    )

    # Redirect to app with session token
    return RedirectResponse(
        url=f"{APP_URL}/ehr-integration?session={session_token}&patient={patient_id}"
    )


@app.get("/fhir/{resource_type}/{resource_id}")
async def get_fhir_resource(
    resource_type: FHIRResource,
    resource_id: str,
    session_token: str = Header(..., alias="X-Session-Token")
):
    """
    Fetch FHIR resource from EHR using SMART session

    Example:
    GET /fhir/Patient/123
    X-Session-Token: abc...
    """
    # Get session
    session = await fetch_one(
        """
        SELECT * FROM smart_sessions
        WHERE session_token = $1 AND expires_at > NOW()
        """,
        session_token
    )

    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    # Fetch resource from FHIR server
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{session['fhir_server']}/{resource_type.value}/{resource_id}",
                headers={"Authorization": f"Bearer {session['access_token']}"},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()

        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to fetch FHIR resource: {str(e)}"
            )


@app.get("/fhir/{resource_type}")
async def search_fhir_resources(
    resource_type: FHIRResource,
    session_token: str = Header(..., alias="X-Session-Token"),
    patient: Optional[str] = Query(None),
    code: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    _count: int = Query(10, le=100)
):
    """
    Search FHIR resources with query parameters

    Example:
    GET /fhir/Observation?patient=123&code=http://loinc.org|8480-6&_count=10
    X-Session-Token: abc...
    """
    # Get session
    session = await fetch_one(
        """
        SELECT * FROM smart_sessions
        WHERE session_token = $1 AND expires_at > NOW()
        """,
        session_token
    )

    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    # Build query parameters
    params = {"_count": _count}
    if patient:
        params["patient"] = patient
    if code:
        params["code"] = code
    if date:
        params["date"] = date

    # Search FHIR server
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{session['fhir_server']}/{resource_type.value}",
                params=params,
                headers={"Authorization": f"Bearer {session['access_token']}"},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()

        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to search FHIR resources: {str(e)}"
            )


# ============================================================================
# CDS Hooks Endpoints
# ============================================================================

@app.get("/cds-services")
async def cds_services_discovery():
    """
    CDS Hooks service discovery endpoint
    Returns list of available CDS services
    """
    return {
        "services": [
            {
                "hook": "patient-view",
                "title": "DNALang Genomic Insights",
                "description": "Provides genomic analysis and quantum computing insights for patient",
                "id": "dnalang-genomic-insights",
                "prefetch": {
                    "patient": "Patient/{{context.patientId}}",
                    "observations": "Observation?patient={{context.patientId}}&category=laboratory"
                }
            },
            {
                "hook": "order-sign",
                "title": "DNALang Pharmacogenomics Alert",
                "description": "Alerts for pharmacogenomic interactions based on patient genetics",
                "id": "dnalang-pharmacogenomics",
                "prefetch": {
                    "patient": "Patient/{{context.patientId}}",
                    "medications": "MedicationRequest?patient={{context.patientId}}&status=active",
                    "genomics": "Observation?patient={{context.patientId}}&code=http://loinc.org|81247-9"
                }
            },
            {
                "hook": "order-select",
                "title": "DNALang Treatment Recommendation",
                "description": "Quantum-enhanced treatment recommendations based on tumor genomics",
                "id": "dnalang-treatment-recommendation",
                "prefetch": {
                    "patient": "Patient/{{context.patientId}}",
                    "conditions": "Condition?patient={{context.patientId}}&category=problem-list-item",
                    "genomics": "Observation?patient={{context.patientId}}&category=genomics"
                }
            }
        ]
    }


@app.post("/cds-services/dnalang-genomic-insights")
async def genomic_insights_hook(request: CDSHookRequest):
    """
    Patient-view hook: Genomic insights for patient
    Triggered when clinician opens patient chart
    """
    patient_id = request.context.get("patientId")

    if not patient_id:
        return CDSResponse(cards=[])

    # Fetch patient genomic data from prefetch or FHIR server
    patient = request.prefetch.get("patient") if request.prefetch else None
    observations = request.prefetch.get("observations") if request.prefetch else None

    if not observations:
        # Fetch from FHIR server
        if request.fhirServer and request.fhirAuthorization:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{request.fhirServer}/Observation?patient={patient_id}&category=laboratory",
                    headers={"Authorization": request.fhirAuthorization.get("access_token", "")},
                    timeout=10.0
                )
                if response.status_code == 200:
                    observations = response.json()

    # Analyze genomic data (placeholder)
    # In production, this would call DNALang quantum analysis
    cards = []

    # Example card: Genomic variant detected
    cards.append(CDSCard(
        summary="Genomic Variant Detected: BRCA1 Mutation",
        indicator="warning",
        source={"label": "DNALang Genomic Analysis"},
        detail="Patient has pathogenic BRCA1 variant (c.5266dupC). Consider genetic counseling and enhanced screening.",
        suggestions=[
            {
                "label": "Order genetic counseling",
                "actions": [
                    {
                        "type": "create",
                        "description": "Create referral to genetic counselor",
                        "resource": {
                            "resourceType": "ServiceRequest",
                            "status": "draft",
                            "intent": "proposal",
                            "code": {
                                "coding": [{
                                    "system": "http://snomed.info/sct",
                                    "code": "304340003",
                                    "display": "Genetic counseling"
                                }]
                            },
                            "subject": {"reference": f"Patient/{patient_id}"}
                        }
                    }
                ]
            }
        ],
        links=[
            {
                "label": "View full genomic analysis",
                "url": f"{APP_URL}/genomic-analysis?patient={patient_id}",
                "type": "absolute"
            }
        ]
    ))

    return CDSResponse(cards=cards)


@app.post("/cds-services/dnalang-pharmacogenomics")
async def pharmacogenomics_hook(request: CDSHookRequest):
    """
    Order-sign hook: Pharmacogenomic alerts
    Triggered when clinician signs medication order
    """
    patient_id = request.context.get("patientId")
    medication_request = request.context.get("draftOrders", {}).get("entry", [{}])[0].get("resource")

    if not medication_request:
        return CDSResponse(cards=[])

    # Get medication code
    medication_code = None
    if medication_request.get("medicationCodeableConcept"):
        codings = medication_request["medicationCodeableConcept"].get("coding", [])
        if codings:
            medication_code = codings[0].get("code")

    # Fetch patient genomics
    genomics = request.prefetch.get("genomics") if request.prefetch else None

    # Analyze pharmacogenomic interactions (placeholder)
    # In production: query DNALang quantum pharmacogenomics engine
    cards = []

    # Example: CYP2D6 poor metabolizer
    if medication_code in ["161", "849574"]:  # Codeine/tramadol
        cards.append(CDSCard(
            summary="Pharmacogenomic Alert: CYP2D6 Poor Metabolizer",
            indicator="critical",
            source={"label": "DNALang Pharmacogenomics"},
            detail="Patient has CYP2D6 *4/*4 genotype (poor metabolizer). Codeine will have reduced efficacy. Consider alternative analgesic.",
            suggestions=[
                {
                    "label": "Switch to alternative analgesic",
                    "actions": [
                        {
                            "type": "delete",
                            "description": "Remove codeine order"
                        },
                        {
                            "type": "create",
                            "description": "Order acetaminophen instead",
                            "resource": {
                                "resourceType": "MedicationRequest",
                                "status": "draft",
                                "intent": "proposal",
                                "medicationCodeableConcept": {
                                    "coding": [{
                                        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                                        "code": "161",
                                        "display": "Acetaminophen"
                                    }]
                                },
                                "subject": {"reference": f"Patient/{patient_id}"}
                            }
                        }
                    ]
                }
            ]
        ))

    return CDSResponse(cards=cards)


@app.post("/cds-services/dnalang-treatment-recommendation")
async def treatment_recommendation_hook(request: CDSHookRequest):
    """
    Order-select hook: Quantum-enhanced treatment recommendations
    Triggered when clinician selects treatment order
    """
    patient_id = request.context.get("patientId")
    selections = request.context.get("selections", [])

    if not selections:
        return CDSResponse(cards=[])

    # Fetch patient conditions and genomics
    conditions = request.prefetch.get("conditions") if request.prefetch else None
    genomics = request.prefetch.get("genomics") if request.prefetch else None

    # Run quantum treatment optimization (placeholder)
    # In production: execute TumorClassifier organism on IBM Quantum
    cards = []

    # Example: Personalized chemotherapy recommendation
    cards.append(CDSCard(
        summary="Quantum-Enhanced Treatment Recommendation",
        indicator="info",
        source={"label": "DNALang Quantum Treatment Optimizer"},
        detail="Based on tumor genomic profile and quantum simulation, carboplatin + paclitaxel shows 23% higher predicted efficacy vs. standard protocol.",
        suggestions=[
            {
                "label": "Review quantum analysis",
                "actions": [
                    {
                        "type": "link",
                        "description": "Open DNALang treatment analysis",
                        "url": f"{APP_URL}/treatment-analysis?patient={patient_id}"
                    }
                ]
            }
        ],
        links=[
            {
                "label": "View quantum simulation results",
                "url": f"{APP_URL}/quantum-sim?patient={patient_id}",
                "type": "absolute"
            }
        ]
    ))

    return CDSResponse(cards=cards)


# ============================================================================
# Health Check
# ============================================================================

@app.get("/")
async def root():
    return {
        "service": "DNALang FHIR Gateway",
        "version": "1.0.0",
        "smart_launch": "/smart/launch",
        "cds_services": "/cds-services"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
