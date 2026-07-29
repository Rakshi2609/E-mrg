from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.config import Settings
from app.core.dependencies import settings_dependency
from app.realtime.models import EventEnvelope
from app.realtime.runtime import bus
from app.services.call_event_store import CallEventStore

router = APIRouter(prefix="/api/v1/demo", tags=["demo"])

SAMPLE_INCIDENTS = (
    ("DEMO-CALL-001", {"caller_number": "+1 555 010 1010"}, {"incident_type": "Medical", "severity": "high", "location": "42 Market Street", "victims": 1, "hazards": [], "ai_confidence": 0.94, "summary": "Caller reports chest pain; ambulance requested."}),
    ("DEMO-CALL-002", {"caller_number": "+1 555 010 2020"}, {"incident_type": "Fire", "severity": "critical", "location": "8 River Road", "victims": 2, "hazards": ["smoke"], "ai_confidence": 0.97, "summary": "Kitchen fire with two people outside the building."}),
    ("DEMO-CALL-003", {"caller_number": "+1 555 010 3030"}, {"incident_type": "Road traffic collision", "severity": "moderate", "location": "North Avenue and 3rd", "victims": 2, "hazards": ["traffic"], "ai_confidence": 0.89, "summary": "Two-car collision; occupants conscious and awaiting help."}),
)


@router.post("/seed")
async def seed_dashboard_samples(
    request: Request,
    current_settings: Annotated[Settings, Depends(settings_dependency)],
) -> dict[str, int]:
    if current_settings.environment != "development":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    events = CallEventStore(request.app.state.database, bus)
    for call_id, caller, incident in SAMPLE_INCIDENTS:
        await events.publish(EventEnvelope(call_id=call_id, event="call.started", payload=caller))
        await events.publish(EventEnvelope(call_id=call_id, event="incident.updated", payload=incident))
    return {"seeded_calls": len(SAMPLE_INCIDENTS)}
