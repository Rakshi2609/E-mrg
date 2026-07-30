import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict, Field, ValidationError
import httpx

from app.ai.mistral import MistralCloudProvider
from app.auth.dependencies import require_roles
from app.auth.models import Principal
from app.core.config import Settings
from app.core.dependencies import settings_dependency
from app.realtime.models import EventEnvelope
from app.realtime.runtime import bus
from app.services.call_event_store import CallEventStore

router = APIRouter(prefix="/api/v1/incidents", tags=["cctv"])

CameraId = Literal["camera_1", "camera_2"]
_CAMERA_IMAGES: dict[CameraId, tuple[str, str]] = {
    "camera_1": ("Camera 1", "fight.png"),
    "camera_2": ("Camera 2", "fire.png"),
}
_IMAGES_DIRECTORY = Path(__file__).resolve().parents[4] / "images"


class CctvAnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    camera_id: CameraId


class CctvAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    detected_situation: str = Field(min_length=1, max_length=300)
    urgency: Literal["low", "medium", "high", "critical"]
    people_estimate: int | None = Field(default=None, ge=0, le=100)
    vehicles_estimate: int | None = Field(default=None, ge=0, le=100)
    hazards: list[str] = Field(default_factory=list, max_length=10)
    recommended_response: str = Field(min_length=1, max_length=400)
    confidence: float = Field(ge=0, le=1)
    rationale: str = Field(min_length=1, max_length=500)


def _camera_path(camera_id: CameraId) -> Path:
    return _IMAGES_DIRECTORY / _CAMERA_IMAGES[camera_id][1]


def _vision_prompt(camera_name: str) -> str:
    return f"""You are reviewing a single emergency CCTV still from {camera_name}. Return only valid JSON with exactly these keys:
detected_situation, urgency, people_estimate, vehicles_estimate, hazards, recommended_response, confidence, rationale.
urgency must be one of low, medium, high, critical. Counts must be non-negative integers or null. hazards must be an array of short strings. confidence is 0 to 1.
Describe only visually supported safety observations. Do not identify people, infer protected traits, make legal conclusions, or claim certainty. This is decision-support evidence for a dispatcher, not an automatic dispatch instruction."""


@router.get("/{call_id}/cctv/{camera_id}/image")
async def cctv_image(
    call_id: str,
    camera_id: CameraId,
    _: Annotated[Principal, Depends(require_roles("dispatcher", "supervisor", "admin"))],
) -> FileResponse:
    image_path = _camera_path(camera_id)
    if not image_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera image is unavailable")
    return FileResponse(image_path, media_type="image/png", filename=f"{camera_id}.png")


@router.post("/{call_id}/cctv/analyze")
async def analyze_cctv(
    call_id: str,
    body: CctvAnalysisRequest,
    request: Request,
    settings: Annotated[Settings, Depends(settings_dependency)],
    _: Annotated[Principal, Depends(require_roles("dispatcher", "supervisor", "admin"))],
) -> dict[str, object]:
    image_path = _camera_path(body.camera_id)
    if not image_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera image is unavailable")
    camera_name = _CAMERA_IMAGES[body.camera_id][0]
    if settings.mistral_api_key is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Mistral Vision is not configured")
    events = CallEventStore(request.app.state.database, bus)
    await events.publish(EventEnvelope(call_id=call_id, event="cctv.analysis.requested", payload={"camera_id": body.camera_id, "camera_name": camera_name}))
    provider = MistralCloudProvider(settings.mistral_api_key.get_secret_value(), settings.mistral_model)
    try:
        raw = await asyncio.wait_for(
            provider.analyze_image(_vision_prompt(camera_name), await asyncio.to_thread(image_path.read_bytes)),
            timeout=30.0,
        )
        analysis = CctvAnalysis.model_validate(json.loads(raw))
    except (TimeoutError, OSError, ValueError, ValidationError, json.JSONDecodeError, httpx.HTTPError):
        await events.publish(EventEnvelope(call_id=call_id, event="cctv.analysis.failed", payload={"camera_id": body.camera_id, "camera_name": camera_name, "message": "Mistral CCTV analysis is unavailable. Please retry."}))
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Mistral CCTV analysis is unavailable. Please retry.") from None
    finally:
        await provider.close()
    payload = {
        "camera_id": body.camera_id,
        "camera_name": camera_name,
        "model": settings.mistral_model,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "analysis": analysis.model_dump(mode="json"),
    }
    await events.publish(EventEnvelope(call_id=call_id, event="cctv.analysis.completed", payload=payload))
    return payload
