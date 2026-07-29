from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response

from app.ai.ollama import OllamaProvider
from app.ai.orchestrator import AiOrchestrator
from app.conversation.state_machine import ConversationStateMachine
from app.conversation.models import AiResponse
from app.core.config import Settings
from app.core.dependencies import settings_dependency
from app.realtime.models import EventEnvelope
from app.realtime.runtime import bus
from app.voice.security import validate_twilio_signature
from app.voice.session import VoiceSessionStore
from app.voice.twiml import greeting_twiml, response_with_gather

router = APIRouter(prefix="/api/v1/twilio", tags=["twilio"])
sessions = VoiceSessionStore()


def orchestrator_dependency(settings: Settings = Depends(settings_dependency)) -> AiOrchestrator:
    return AiOrchestrator(OllamaProvider(settings.ollama_url, settings.gemma_model))


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
    speech = params.get("SpeechResult", "").strip()
    if not speech:
        return Response(greeting_twiml(), media_type="application/xml")
    session = sessions.append(call_sid, speech)
    await bus.publish(EventEnvelope(call_id=call_sid, event="transcript.updated", payload={"speaker": "caller", "message": speech}))
    await bus.publish(EventEnvelope(call_id=call_sid, event="ai.status", payload={"status": "thinking"}))
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
    session.state = ConversationStateMachine().advance(session.state, result.missing_fields)
    await bus.publish(EventEnvelope(call_id=call_sid, event="ai.status", payload={"status": "responded", "confidence": result.confidence}))
    await bus.publish(EventEnvelope(call_id=call_sid, event="incident.updated", payload=result.model_dump(mode="json")))
    return Response(response_with_gather(result.reply), media_type="application/xml")


@router.post("/status", status_code=status.HTTP_204_NO_CONTENT)
async def status_webhook(request: Request, settings: Settings = Depends(settings_dependency)) -> Response:
    await signed_form(request, settings)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
