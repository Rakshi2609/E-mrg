from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response

from app.ai.fallback import TimeoutFallbackProvider
from app.ai.mistral import MistralCloudProvider
from app.ai.ollama import OllamaProvider
from app.ai.orchestrator import AiOrchestrator
from app.conversation.state_machine import ConversationStateMachine
from app.conversation.models import AiResponse
from app.core.config import Settings
from app.core.dependencies import settings_dependency
from app.realtime.models import EventEnvelope
from app.realtime.runtime import bus
from app.services.call_event_store import CallEventStore
from app.voice.security import validate_twilio_signature
from app.voice.session import VoiceSessionStore
from app.voice.twiml import greeting_twiml, response_with_gather

router = APIRouter(prefix="/api/v1/twilio", tags=["twilio"])
sessions = VoiceSessionStore()


def location_from_speech(speech: str) -> str | None:
    """Keep a caller-provided area or landmark when the model omits it."""
    normalized = " ".join(speech.split())
    for marker in ("near ", "located at ", "at ", "in "):
        start = normalized.lower().rfind(marker)
        if start >= 0:
            location = normalized[start + len(marker):].strip(" .,!?")
            if location:
                return location
    return None


def orchestrator_dependency(request: Request, settings: Settings = Depends(settings_dependency)) -> AiOrchestrator:
    fallback = None
    if settings.mistral_api_key is not None:
        fallback = MistralCloudProvider(settings.mistral_api_key.get_secret_value(), settings.mistral_model)
    provider = TimeoutFallbackProvider(
        OllamaProvider(settings.ollama_url, settings.gemma_model),
        fallback,
        request.app.state.ollama_timeout_seconds,
    )
    return AiOrchestrator(provider)


async def signed_form(request: Request, settings: Settings) -> dict[str, str]:
    form = await request.form()
    params = {str(key): str(value) for key, value in form.items()}
    signature = request.headers.get("X-Twilio-Signature")
    if not validate_twilio_signature(str(request.url), params, signature, settings.twilio_auth_token):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Twilio signature")
    return params


@router.post("/voice", response_class=Response)
async def voice_webhook(
    request: Request,
    settings: Settings = Depends(settings_dependency),
    orchestrator: AiOrchestrator = Depends(orchestrator_dependency),
) -> Response:
    params = await signed_form(request, settings)
    call_sid = params.get("CallSid")
    if not call_sid:
        raise HTTPException(status_code=422, detail="CallSid is required")
    events = CallEventStore(request.app.state.database, bus)
    speech = params.get("SpeechResult", "").strip()
    if not speech:
        # Twilio invokes this first, before the caller has spoken. Persisting it
        # here makes the incoming call visible to the dispatcher immediately.
        await events.publish(EventEnvelope(call_id=call_sid, event="call.started", payload={"caller_number": params.get("From")}))
        await events.publish(EventEnvelope(call_id=call_sid, event="ai.status", payload={"status": "listening"}))
        return Response(greeting_twiml(), media_type="application/xml")
    session = sessions.append(call_sid, f"Caller: {speech}")
    await events.publish(EventEnvelope(call_id=call_sid, event="transcript.updated", payload={"speaker": "caller", "message": speech}))
    await events.publish(EventEnvelope(call_id=call_sid, event="ai.status", payload={"status": "thinking"}))
    try:
        result = await orchestrator.respond(session.transcript, session.state)
    except Exception:
        # Keep the emergency intake moving if a local model returns malformed JSON.
        # The caller must never be abandoned because an optional AI provider failed.
        if len(session.transcript) == 1:
            result = AiResponse(
                reply="Thank you. What is the exact location of the emergency?",
                missing_fields=["location"],
                confidence=0.2,
            )
        else:
            result = AiResponse(
                reply="Thank you. Are anyone injured, and are there any immediate hazards?",
                missing_fields=["victims", "hazards"],
                confidence=0.2,
            )
    existing_location = session.state.known_fields.get("location")
    caller_location = location_from_speech(speech)
    location = result.location or caller_location or (existing_location if isinstance(existing_location, str) else None)
    if location:
        result = result.model_copy(update={"location": location, "missing_fields": [field for field in result.missing_fields if field != "location"]})
    session.state = ConversationStateMachine().advance(session.state, result.missing_fields, result)
    sessions.append(call_sid, f"Assistant: {result.reply}")
    await events.publish(EventEnvelope(call_id=call_sid, event="transcript.updated", payload={"speaker": "assistant", "message": result.reply}))
    await events.publish(EventEnvelope(call_id=call_sid, event="ai.status", payload={"status": "responded", "confidence": result.confidence}))
    await events.publish(EventEnvelope(call_id=call_sid, event="incident.updated", payload=result.model_dump(mode="json")))
    return Response(response_with_gather(result.reply), media_type="application/xml")


@router.post("/status", status_code=status.HTTP_204_NO_CONTENT)
async def status_webhook(request: Request, settings: Settings = Depends(settings_dependency)) -> Response:
    await signed_form(request, settings)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
