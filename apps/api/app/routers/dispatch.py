import html
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.auth.dependencies import require_roles
from app.auth.models import Principal
from app.core.config import Settings
from app.core.dependencies import settings_dependency

router = APIRouter(prefix="/api/v1/dispatch", tags=["dispatch"])

class DispatchRequest(BaseModel):
    incident_id: str
    incident_type: str = "Emergency incident"
    severity: str = "unknown"
    location: str = "Unknown location"
    victims: str = "Unknown"
    hazards: list[str] = Field(default_factory=list)
    summary: str = ""
    resource: str = "Emergency Response Unit"

@router.post("/call")
async def call_dispatcher(
    payload: DispatchRequest,
    request: Request,
    _: Annotated[Principal, Depends(require_roles("dispatcher", "supervisor", "admin"))],
    settings: Annotated[Settings, Depends(settings_dependency)],
) -> dict[str, str]:
    if not settings.twilio_account_sid or not settings.twilio_phone_number:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Twilio sender is not configured")
    message = (f"Dispatch resource: {payload.resource}. Emergency incident for {payload.incident_id}. Type: {payload.incident_type}. "
        f"Severity: {payload.severity}. Location: {payload.location}. Victims: {payload.victims}. "
        f"Hazards: {', '.join(payload.hazards) or 'none reported'}. "
        f"Summary: {payload.summary or 'See the dashboard for details.'}. "
        "Please log in to the E-MRG dashboard for the full transcript and dispatch details.")
    twiml = f"<Response><Say>{html.escape(message)}</Say><Hangup/></Response>"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Calls.json"
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(url, data={"To": settings.dispatcher_phone_number, "From": settings.twilio_phone_number, "Twiml": twiml}, auth=(settings.twilio_account_sid, settings.twilio_auth_token))
    if response.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Twilio rejected the dispatcher call")
    call_sid = str(response.json().get("sid", "unknown"))
    await __import__('asyncio').to_thread(request.app.state.database.collection("dispatcher_events").insert_one, {"version": 1, "event_id": call_sid, "sequence": 0, "occurred_at": __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(), "call_id": payload.incident_id, "event": "dispatcher.joined", "payload": {"dispatcher_phone": settings.dispatcher_phone_number, "twilio_call_sid": call_sid}})
    return {"status": "calling_dispatcher", "twilio_call_sid": call_sid}
