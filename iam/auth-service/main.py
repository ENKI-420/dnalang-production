"""
DNALang IAM Authentication Service
FastAPI microservice for authentication, authorization, and multi-tenant session management
"""

from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import jwt
import httpx
import redis.asyncio as redis
import uuid
import hashlib
import secrets
from contextlib import asynccontextmanager

# ============================================================================
# Configuration
# ============================================================================

KEYCLOAK_URL = "http://keycloak:8080"
KEYCLOAK_REALM = "dnalang"
KEYCLOAK_CLIENT_ID = "dnalang-api"
KEYCLOAK_CLIENT_SECRET = "**KEYCLOAK_CLIENT_SECRET**"

JWT_SECRET = "**JWT_SECRET_KEY**"  # Rotate regularly
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

REDIS_URL = "redis://redis:6379/0"

# ============================================================================
# Models
# ============================================================================

class UserRole(str, Enum):
    SYSTEM_ADMIN = "system_admin"
    ORG_ADMIN = "org_admin"
    ONCOLOGIST = "oncologist"
    PATHOLOGIST = "pathologist"
    GENETIC_COUNSELOR = "genetic_counselor"
    CLINICAL_RESEARCHER = "clinical_researcher"
    LAB_ANALYST = "lab_analyst"
    BIOINFORMATICIAN = "bioinformatician"
    DEVELOPER = "developer"
    BILLING_ADMIN = "billing_admin"
    COMPLIANCE_AUDITOR = "compliance_auditor"
    PATIENT = "patient"
    VENDOR = "vendor"


class TenantType(str, Enum):
    HEALTH_SYSTEM = "health_system"
    RESEARCH_ORG = "research_org"
    PHARMA = "pharma"
    INDIVIDUAL = "individual"


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


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_id: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
    user: Dict[str, Any]
    tenant: Dict[str, Any]


class RefreshRequest(BaseModel):
    refresh_token: str


class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    roles: List[UserRole]
    tenant_id: str
    enabled: bool = True
    email_verified: bool = False
    created_at: datetime
    last_login: Optional[datetime] = None


class Tenant(BaseModel):
    id: str
    name: str
    type: TenantType
    subscription_plan: SubscriptionPlan
    subscription_status: SubscriptionStatus
    hipaa_enabled: bool = False
    baa_signed: bool = False
    hitrust_certified: bool = False
    created_at: datetime
    trial_ends_at: Optional[datetime] = None


class Session(BaseModel):
    session_id: str
    user_id: str
    tenant_id: str
    access_token: str
    refresh_token: str
    created_at: datetime
    expires_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class TokenPayload(BaseModel):
    sub: str  # user_id
    email: str
    roles: List[str]
    tenant_id: str
    session_id: str
    exp: int
    iat: int
    type: str  # "access" or "refresh"


# ============================================================================
# Application Lifecycle
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.redis = await redis.from_url(REDIS_URL, decode_responses=True)
    app.state.http_client = httpx.AsyncClient()
    yield
    # Shutdown
    await app.state.redis.close()
    await app.state.http_client.aclose()


app = FastAPI(
    title="DNALang IAM Service",
    description="Authentication and authorization microservice for DNALang Quantum Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://www.dnalang.dev",
        "https://chat.dnalang.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ============================================================================
# Utilities
# ============================================================================

def create_token(data: Dict[str, Any], expires_delta: timedelta, token_type: str) -> str:
    """Create JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({
        "exp": int(expire.timestamp()),
        "iat": int(datetime.utcnow().timestamp()),
        "type": token_type
    })
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> TokenPayload:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


async def verify_keycloak_token(token: str) -> Dict[str, Any]:
    """Verify token against Keycloak"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token/introspect",
            data={
                "token": token,
                "client_id": KEYCLOAK_CLIENT_ID,
                "client_secret": KEYCLOAK_CLIENT_SECRET
            }
        )
        data = response.json()
        if not data.get("active"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        return data


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenPayload:
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    payload = decode_token(token)

    if payload.type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )

    # Verify session is active in Redis
    redis_client = app.state.redis
    session_key = f"session:{payload.session_id}"
    session_exists = await redis_client.exists(session_key)

    if not session_exists:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been terminated"
        )

    return payload


async def require_role(required_roles: List[UserRole]):
    """Dependency to check user has required role"""
    def role_checker(current_user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        user_roles = [UserRole(role) for role in current_user.roles]
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of: {[r.value for r in required_roles]}"
            )
        return current_user
    return role_checker


async def get_tenant(tenant_id: str) -> Optional[Tenant]:
    """Retrieve tenant from Redis cache or database"""
    redis_client = app.state.redis
    tenant_key = f"tenant:{tenant_id}"

    # Try cache first
    tenant_data = await redis_client.get(tenant_key)
    if tenant_data:
        return Tenant.parse_raw(tenant_data)

    # TODO: Fetch from database
    # For now, return mock data
    return Tenant(
        id=tenant_id,
        name="Example Healthcare System",
        type=TenantType.HEALTH_SYSTEM,
        subscription_plan=SubscriptionPlan.ENTERPRISE,
        subscription_status=SubscriptionStatus.ACTIVE,
        hipaa_enabled=True,
        baa_signed=True,
        hitrust_certified=False,
        created_at=datetime.utcnow()
    )


# ============================================================================
# Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Health check"""
    return {
        "service": "DNALang IAM",
        "version": "1.0.0",
        "status": "operational"
    }


@app.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Authenticate user with email/password
    Returns JWT access and refresh tokens
    """
    # Authenticate with Keycloak
    async with app.state.http_client as client:
        response = await client.post(
            f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token",
            data={
                "grant_type": "password",
                "client_id": KEYCLOAK_CLIENT_ID,
                "client_secret": KEYCLOAK_CLIENT_SECRET,
                "username": request.email,
                "password": request.password,
                "scope": "openid profile email"
            }
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        keycloak_data = response.json()

    # Decode Keycloak token to get user info
    kc_payload = jwt.decode(
        keycloak_data["access_token"],
        options={"verify_signature": False}
    )

    user_id = kc_payload["sub"]
    email = kc_payload.get("email", request.email)
    roles = kc_payload.get("realm_access", {}).get("roles", [])

    # Determine tenant (from request or user's default)
    tenant_id = request.tenant_id or kc_payload.get("tenant_id", str(uuid.uuid4()))

    # Create session
    session_id = str(uuid.uuid4())

    # Create access token
    access_token = create_token(
        data={
            "sub": user_id,
            "email": email,
            "roles": roles,
            "tenant_id": tenant_id,
            "session_id": session_id
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access"
    )

    # Create refresh token
    refresh_token = create_token(
        data={
            "sub": user_id,
            "session_id": session_id
        },
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        token_type="refresh"
    )

    # Store session in Redis
    redis_client = app.state.redis
    session = Session(
        session_id=session_id,
        user_id=user_id,
        tenant_id=tenant_id,
        access_token=access_token,
        refresh_token=refresh_token,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )

    session_key = f"session:{session_id}"
    await redis_client.setex(
        session_key,
        int(timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()),
        session.json()
    )

    # Get tenant info
    tenant = await get_tenant(tenant_id)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user_id,
            "email": email,
            "roles": roles
        },
        tenant=tenant.dict() if tenant else {}
    )


@app.post("/auth/refresh", response_model=LoginResponse)
async def refresh_token(request: RefreshRequest):
    """
    Refresh access token using refresh token
    """
    payload = decode_token(request.refresh_token)

    if payload.type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )

    # Verify session exists
    redis_client = app.state.redis
    session_key = f"session:{payload.session_id}"
    session_data = await redis_client.get(session_key)

    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalidated"
        )

    session = Session.parse_raw(session_data)

    # Create new access token
    access_token = create_token(
        data={
            "sub": session.user_id,
            "email": payload.email,
            "roles": payload.roles,
            "tenant_id": session.tenant_id,
            "session_id": session.session_id
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access"
    )

    # Update session
    session.access_token = access_token
    await redis_client.setex(
        session_key,
        int((session.expires_at - datetime.utcnow()).total_seconds()),
        session.json()
    )

    # Get tenant info
    tenant = await get_tenant(session.tenant_id)

    return LoginResponse(
        access_token=access_token,
        refresh_token=request.refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": session.user_id,
            "email": payload.email,
            "roles": payload.roles
        },
        tenant=tenant.dict() if tenant else {}
    )


@app.post("/auth/logout")
async def logout(current_user: TokenPayload = Depends(get_current_user)):
    """
    Logout user and invalidate session
    """
    redis_client = app.state.redis
    session_key = f"session:{current_user.session_id}"
    await redis_client.delete(session_key)

    return {"message": "Logged out successfully"}


@app.get("/auth/verify")
async def verify_token(current_user: TokenPayload = Depends(get_current_user)):
    """
    Verify token is valid and return user info
    """
    tenant = await get_tenant(current_user.tenant_id)

    return {
        "valid": True,
        "user": {
            "id": current_user.sub,
            "email": current_user.email,
            "roles": current_user.roles,
            "tenant_id": current_user.tenant_id
        },
        "tenant": tenant.dict() if tenant else None
    }


@app.get("/users/me")
async def get_current_user_info(current_user: TokenPayload = Depends(get_current_user)):
    """
    Get current authenticated user details
    """
    tenant = await get_tenant(current_user.tenant_id)

    return {
        "id": current_user.sub,
        "email": current_user.email,
        "roles": current_user.roles,
        "tenant": tenant.dict() if tenant else None
    }


@app.get("/rbac/check")
async def check_permission(
    resource: str,
    action: str,
    current_user: TokenPayload = Depends(get_current_user)
):
    """
    Check if user has permission for resource/action

    Examples:
    - resource: "organism:123", action: "execute"
    - resource: "patient:456", action: "read"
    - resource: "billing", action: "manage"
    """
    user_roles = [UserRole(role) for role in current_user.roles]

    # Permission matrix (simplified)
    permissions = {
        UserRole.SYSTEM_ADMIN: ["*:*"],
        UserRole.ORG_ADMIN: ["organism:*", "user:*", "billing:*"],
        UserRole.ONCOLOGIST: ["patient:read", "patient:write", "organism:read", "organism:execute"],
        UserRole.DEVELOPER: ["organism:*", "quantum:*"],
        UserRole.BILLING_ADMIN: ["billing:*"],
        UserRole.PATIENT: ["patient:read_self"]
    }

    # Check permissions
    for role in user_roles:
        role_perms = permissions.get(role, [])
        for perm in role_perms:
            perm_resource, perm_action = perm.split(":")
            if perm_resource == "*" or perm_resource == resource.split(":")[0]:
                if perm_action == "*" or perm_action == action:
                    return {"allowed": True, "reason": f"Role {role.value} grants {perm}"}

    return {"allowed": False, "reason": "No matching permissions"}


@app.get("/admin/sessions", dependencies=[Depends(require_role([UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN]))])
async def list_sessions(tenant_id: Optional[str] = None):
    """
    List active sessions (admin only)
    """
    redis_client = app.state.redis

    # Get all session keys
    pattern = "session:*"
    keys = []
    async for key in redis_client.scan_iter(match=pattern):
        keys.append(key)

    sessions = []
    for key in keys:
        session_data = await redis_client.get(key)
        if session_data:
            session = Session.parse_raw(session_data)
            if not tenant_id or session.tenant_id == tenant_id:
                sessions.append(session.dict())

    return {
        "total": len(sessions),
        "sessions": sessions
    }


@app.delete("/admin/sessions/{session_id}", dependencies=[Depends(require_role([UserRole.SYSTEM_ADMIN, UserRole.ORG_ADMIN]))])
async def terminate_session(session_id: str):
    """
    Terminate a user session (admin only)
    """
    redis_client = app.state.redis
    session_key = f"session:{session_id}"
    deleted = await redis_client.delete(session_key)

    if deleted:
        return {"message": f"Session {session_id} terminated"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
