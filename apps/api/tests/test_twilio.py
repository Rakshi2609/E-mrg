from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.voice.security import twilio_signature

client = TestClient(app)
URL = "http://testserver/api/v1/twilio/voice"
PARAMS = {"CallSid": "CA123", "From": "+10000000000"}


def signed_headers() -> dict[str, str]:
    return {"X-Twilio-Signature": twilio_signature(URL, PARAMS, settings.twilio_auth_token)}


def test_voice_webhook_returns_twiml_for_valid_signature() -> None:
    response = client.post("/api/v1/twilio/voice", data=PARAMS, headers=signed_headers())
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/xml")
    assert "<Response>" in response.text


def test_voice_webhook_rejects_invalid_signature() -> None:
    response = client.post("/api/v1/twilio/voice", data=PARAMS, headers={"X-Twilio-Signature": "invalid"})
    assert response.status_code == 403
