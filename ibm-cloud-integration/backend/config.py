"""IBM Cloud and Quantum Configuration"""

import os
from typing import Optional
from pydantic import BaseSettings, Field
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """Application settings with IBM Cloud integration"""

    # IBM Quantum Configuration
    IBM_QUANTUM_TOKEN: str = Field(
        default="4u2Up-UXZ6midCxr_Vo5m4rgVYNSJ2LPRAW8qu5hYG6X",
        description="IBM Quantum API Token"
    )
    IBM_QUANTUM_CHANNEL: str = Field(
        default="ibm_quantum",
        description="IBM Quantum channel"
    )
    IBM_QUANTUM_INSTANCE: str = Field(
        default="ibm-q/open/main",
        description="IBM Quantum instance"
    )

    # Default Backends
    PRIMARY_BACKEND: str = "ibm_torino"
    FALLBACK_BACKENDS: list = ["ibm_kyoto", "ibm_osaka", "ibm_brisbane"]

    # IBM Cloud Object Storage
    COS_ENDPOINT: str = Field(
        default="https://s3.us-south.cloud-object-storage.appdomain.cloud",
        description="IBM COS endpoint"
    )
    COS_API_KEY_ID: str = Field(
        default=os.getenv("COS_API_KEY_ID", ""),
        description="IBM COS API key"
    )
    COS_SERVICE_INSTANCE_ID: str = Field(
        default=os.getenv("COS_SERVICE_INSTANCE_ID", ""),
        description="IBM COS service instance ID"
    )
    COS_BUCKET_NAME: str = Field(
        default="dnalang-organisms",
        description="IBM COS bucket for organism storage"
    )

    # OpenShift Configuration
    OPENSHIFT_NAMESPACE: str = Field(
        default="dnalang-quantum",
        description="OpenShift namespace"
    )
    OPENSHIFT_API_URL: str = Field(
        default=os.getenv("OPENSHIFT_API_URL", ""),
        description="OpenShift API URL"
    )
    OPENSHIFT_TOKEN: str = Field(
        default=os.getenv("OPENSHIFT_TOKEN", ""),
        description="OpenShift service account token"
    )

    # DNALang Constants
    LAMBDA_PHI: float = 2.176435e-8
    PHI_THRESHOLD: float = 0.5
    MAX_EVOLUTION_GENERATIONS: int = 100

    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    WEBSOCKET_PORT: int = 8001

    # Redis Configuration
    REDIS_URL: str = Field(
        default="redis://localhost:6379",
        description="Redis connection URL"
    )

    # MongoDB Configuration
    MONGODB_URL: str = Field(
        default="mongodb://localhost:27017",
        description="MongoDB connection URL"
    )
    MONGODB_DATABASE: str = "dnalang"

    # Security
    SECRET_KEY: str = Field(
        default="dnalang-quantum-secret-key-2024",
        description="Secret key for JWT tokens"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Analytics & Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090

    # Transpilation Settings
    OPTIMIZATION_LEVEL: int = 3
    ROUTING_METHOD: str = "sabre"
    LAYOUT_METHOD: str = "dense"
    RESILIENCE_LEVEL: int = 1

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Validate critical settings
def validate_config():
    """Validate that critical configuration is present"""
    if not settings.IBM_QUANTUM_TOKEN:
        raise ValueError("IBM_QUANTUM_TOKEN is required")

    if settings.COS_API_KEY_ID and not settings.COS_SERVICE_INSTANCE_ID:
        raise ValueError("COS_SERVICE_INSTANCE_ID required when using COS")

    return True

# Export settings instance
__all__ = ["settings", "validate_config"]