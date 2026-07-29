from fastapi.testclient import TestClient

from app.ai.orchestrator import AiOrchestrator
from app.core.config import settings
from app.main import app
from app.routers.twilio import orchestrator_dependency
from app.voice.security import twilio_signature

client = TestClient(app)
URL = "http://testserver/api/v1/twilio/voice"


class Provider:
    async def respond(self, prompt: str) -> str:
        return '{"reply":"Tell me the exact location.","incident_type":"fire","missing_fields":["location"],"confidence":0.8}'


def test_voice_speech_result_returns_ai_gather() -> None:
    app.dependency_overrides[orchestrator_dependency] = lambda: AiOrchestrator(Provider())
    params = {"CallSid": "CA-CONVERSATION", "SpeechResult": "There is smoke in my building"}
    signature = twilio_signature(URL, params, settings.twilio_auth_token)
    response = client.post("/api/v1/twilio/voice", data=params, headers={"X-Twilio-Signature": signature})
    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert "Tell me the exact location." in response.text
    assert "Gather" in response.text


def test_voice_handoff_request_ends_call() -> None:
    params = {"CallSid": "CA-HANDOFF", "SpeechResult": "Please send ambulance now"}
    signature = twilio_signature(URL, params, settings.twilio_auth_token)
    response = client.post("/api/v1/twilio/voice", data=params, headers={"X-Twilio-Signature": signature})
    assert response.status_code == 200
    assert "Hangup" in response.text
