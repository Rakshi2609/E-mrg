from fastapi import APIRouter, Depends, Request

from app.core.config import Settings
from app.core.dependencies import settings_dependency

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(settings: Settings = Depends(settings_dependency)) -> dict[str, str]:
    return {"status": "healthy", "service": settings.service_name, "version": "0.1.0"}


@router.get("/health/ready", response_model=None)
async def readiness(request: Request, settings: Settings = Depends(settings_dependency)) -> dict[str, str]:
    database = getattr(request.app.state, "database", None)
    connected = bool(database and await database.ping())
    payload = {"status": "ready" if connected else "degraded", "service": settings.service_name, "database": "connected" if connected else "unavailable"}
    return payload
