from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import settings

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


class FallbackSettings(BaseModel):
    timeout_seconds: float = Field(ge=1, le=20)


@router.get("/fallback")
async def get_fallback_settings(request: Request) -> FallbackSettings:
    return FallbackSettings(timeout_seconds=request.app.state.ollama_timeout_seconds)


@router.put("/fallback")
async def update_fallback_settings(request: Request, payload: FallbackSettings) -> FallbackSettings:
    if settings.environment != "development":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    request.app.state.ollama_timeout_seconds = payload.timeout_seconds
    return payload
