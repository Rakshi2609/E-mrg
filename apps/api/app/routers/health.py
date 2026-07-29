from fastapi import APIRouter, Depends

from app.core.config import Settings
from app.core.dependencies import settings_dependency

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(settings: Settings = Depends(settings_dependency)) -> dict[str, str]:
    return {"status": "healthy", "service": settings.service_name, "version": "0.1.0"}


@router.get("/health/ready")
async def readiness(settings: Settings = Depends(settings_dependency)) -> dict[str, str]:
    return {"status": "ready", "service": settings.service_name}
