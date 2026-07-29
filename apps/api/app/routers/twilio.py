from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response

from app.core.config import Settings
from app.core.dependencies import settings_dependency
from app.voice.security import validate_twilio_signature
from app.voice.twiml import greeting_twiml

router = APIRouter(prefix="/api/v1/twilio", tags=["twilio"])


async def signed_form(request: Request, settings: Settings) -> dict[str, str]:
    form = await request.form()
    params = {str(key): str(value) for key, value in form.items()}
    signature = request.headers.get("X-Twilio-Signature")
    if not validate_twilio_signature(str(request.url), params, signature, settings.twilio_auth_token):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Twilio signature")
    return params


@router.post("/voice", response_class=Response)
async def voice_webhook(request: Request, settings: Settings = Depends(settings_dependency)) -> Response:
    await signed_form(request, settings)
    return Response(greeting_twiml(), media_type="application/xml")


@router.post("/status", status_code=status.HTTP_204_NO_CONTENT)
async def status_webhook(request: Request, settings: Settings = Depends(settings_dependency)) -> Response:
    await signed_form(request, settings)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
