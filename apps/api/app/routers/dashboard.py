import asyncio
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request

from app.auth.dependencies import require_roles
from app.auth.models import Principal
from app.realtime.models import EventEnvelope

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/events", response_model=list[EventEnvelope])
async def recent_dispatcher_events(
    request: Request,
    _: Annotated[Principal, Depends(require_roles("dispatcher", "supervisor", "admin"))],
    limit: int = Query(default=100, ge=1, le=500),
) -> list[EventEnvelope]:
    collection = request.app.state.database.collection("dispatcher_events")

    def fetch_events() -> list[dict[str, object]]:
        cursor = collection.find({}, {"_id": 0}).sort("occurred_at", -1).limit(limit)
        return list(cursor)

    documents = await asyncio.to_thread(fetch_events)
    return [EventEnvelope.model_validate(document) for document in reversed(documents)]
