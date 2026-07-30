from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.auth.models import Principal, Role
from app.auth.security import decode_access_token, ensure_role
from app.core.config import Settings
from app.core.dependencies import settings_dependency


def current_principal(request: Request, settings: Annotated[Settings, Depends(settings_dependency)]) -> Principal:
    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    return decode_access_token(token, settings)


def require_roles(*roles: Role):
    allowed = set(roles)

    def dependency(principal: Annotated[Principal, Depends(current_principal)]) -> Principal:
        return ensure_role(principal, allowed)

    return dependency
