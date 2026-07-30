from fastapi.testclient import TestClient

from app.auth.models import Principal
from app.auth.security import create_access_token
from app.core.config import settings
from app.main import app
from app.voice.security import validate_twilio_signature


def test_invalid_twilio_signature_is_rejected() -> None:
    assert not validate_twilio_signature("https://example.test", {"CallSid": "CA1"}, "bad", settings.twilio_auth_token)


def test_protected_endpoint_does_not_accept_basic_auth() -> None:
    response = TestClient(app).get("/api/v1/auth/me", headers={"Authorization": "Basic abc"})
    assert response.status_code == 401


def test_token_does_not_expose_secret() -> None:
    token = create_access_token(Principal(user_id="u1", role="dispatcher"), settings)
    assert settings.jwt_secret.get_secret_value() not in token
