from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.dependencies import require_roles
from app.auth.models import Principal

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.get("/me")
async def me(principal: Annotated[Principal, Depends(require_roles("dispatcher", "supervisor", "admin"))]) -> Principal:
    return principal
