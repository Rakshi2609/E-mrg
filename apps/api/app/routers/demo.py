from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.config import Settings
from app.core.dependencies import settings_dependency
from app.realtime.models import EventEnvelope
from app.realtime.runtime import bus
from app.services.call_event_store import CallEventStore

router = APIRouter(prefix="/api/v1/demo", tags=["demo"])

SAMPLE_INCIDENTS = (
    ("DEMO-CALL-001", {"caller_number": "+1 555 010 1010"}, {"incident_type": "Medical", "severity": "high", "location": "42 Market Street", "victims": 1, "hazards": [], "ai_confidence": 0.94, "summary": "Caller reports chest pain; ambulance requested.", "latitude": 39.799, "longitude": -89.644}),
    ("DEMO-CALL-002", {"caller_number": "+1 555 010 2020"}, {"incident_type": "Fire", "severity": "critical", "location": "8 River Road", "victims": 2, "hazards": ["smoke"], "ai_confidence": 0.97, "summary": "Kitchen fire with two people outside the building.", "latitude": 39.805, "longitude": -89.650}),
    ("DEMO-CALL-003", {"caller_number": "+1 555 010 3030"}, {"incident_type": "Road traffic collision", "severity": "moderate", "location": "North Avenue and 3rd", "victims": 2, "hazards": ["traffic"], "ai_confidence": 0.89, "summary": "Two-car collision; occupants conscious and awaiting help.", "latitude": 39.790, "longitude": -89.660}),
    ("DEMO-CALL-004", {"caller_number": "+1 555 010 4040"}, {"incident_type": "Water rescue", "severity": "high", "location": "Riverside Park Boat Ramp", "victims": 1, "hazards": ["water"], "ai_confidence": 0.92, "summary": "Person reported in distress near the boat ramp; rescue unit requested.", "latitude": 39.780, "longitude": -89.635}),
    ("DEMO-CALL-005", {"caller_number": "+1 555 010 5050"}, {"incident_type": "Gas leak", "severity": "critical", "location": "500 Oak Street", "victims": 0, "hazards": ["gas"], "ai_confidence": 0.95, "summary": "Strong gas odor reported in an apartment building; evacuation requested.", "latitude": 39.812, "longitude": -89.658}),
)


@router.post("/seed")
async def seed_dashboard_samples(
    request: Request,
    current_settings: Annotated[Settings, Depends(settings_dependency)],
) -> dict[str, int]:
    if current_settings.environment != "development":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    events = CallEventStore(request.app.state.database, bus)
    demo_transcripts = {
        "DEMO-CALL-001": (("caller", "My husband has severe chest pain."), ("assistant", "Is he conscious and breathing normally?")),
        "DEMO-CALL-002": (("caller", "There is smoke coming from the kitchen."), ("assistant", "Are all occupants outside and accounted for?")),
        "DEMO-CALL-003": (("caller", "Two cars have collided at the intersection."), ("assistant", "Are there any visible injuries or immediate hazards?")),
        "DEMO-CALL-004": (("caller", "Someone is in trouble near the boat ramp."), ("assistant", "Can you point responders to your exact location?")),
        "DEMO-CALL-005": (("caller", "There is a strong gas smell in the building."), ("assistant", "Please move outside immediately. Is anyone feeling unwell?")),
    }
    for call_id, caller, incident in SAMPLE_INCIDENTS:
        await events.publish(EventEnvelope(call_id=call_id, event="call.started", payload=caller))
        for speaker, message in demo_transcripts[call_id]:
            await events.publish(EventEnvelope(call_id=call_id, event="transcript.updated", payload={"speaker": speaker, "message": message}))
        await events.publish(EventEnvelope(call_id=call_id, event="incident.updated", payload=incident))
    return {"seeded_calls": len(SAMPLE_INCIDENTS), "seeded_transcripts": len(SAMPLE_INCIDENTS) * 2}
