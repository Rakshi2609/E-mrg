from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from app.auth.dependencies import require_roles
from app.auth.models import Principal
from app.auth.security import create_access_token
from app.core.config import Settings
from app.core.dependencies import settings_dependency

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=100)


@router.post("/login")
async def login(credentials: LoginRequest, current_settings: Annotated[Settings, Depends(settings_dependency)]) -> dict[str, str]:
    """Hackathon-only admin login; use an identity provider in production."""
    if credentials.username != current_settings.demo_admin_username or credentials.password != current_settings.demo_admin_password.get_secret_value():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    principal = Principal(user_id=credentials.username, role="admin")
    return {"token": create_access_token(principal, current_settings, expires_in=timedelta(hours=8))}


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
