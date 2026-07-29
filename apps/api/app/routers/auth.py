from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import require_roles
from app.auth.models import Principal
from app.auth.security import create_access_token
from app.core.config import Settings
from app.core.dependencies import settings_dependency

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/dev-session")
async def development_session(current_settings: Annotated[Settings, Depends(settings_dependency)]) -> dict[str, str]:
    """Issue a short-lived local dispatcher session for the development dashboard only."""
    if current_settings.environment != "development":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    principal = Principal(user_id="local-dispatcher", role="dispatcher")
    return {"token": create_access_token(principal, current_settings, expires_in=timedelta(hours=8))}


@router.get("/me")
async def me(principal: Annotated[Principal, Depends(require_roles("dispatcher", "supervisor", "admin"))]) -> Principal:
    return principal
