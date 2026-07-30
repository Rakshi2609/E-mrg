from datetime import timedelta

from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.auth.models import Principal
from app.auth.security import create_access_token
from app.core.config import Settings, settings
from app.core.dependencies import settings_dependency
from app.main import app
from app.routers import cctv


def _token() -> str:
    return create_access_token(Principal(user_id="dispatcher-1", role="dispatcher"), settings, timedelta(minutes=5))


def test_cctv_analysis_uses_mistral_vision_and_returns_saved_evidence(monkeypatch) -> None:
    published = []

    class FakeProvider:
        def __init__(self, *_args) -> None:
            pass

        async def analyze_image(self, _prompt: str, _image: bytes) -> str:
            return '{"detected_situation":"Visible fire and smoke","urgency":"critical","people_estimate":1,"vehicles_estimate":null,"hazards":["smoke"],"recommended_response":"Send fire response","confidence":0.92,"rationale":"Flames and smoke are visible."}'

        async def close(self) -> None:
            pass

    async def record_event(_self, event):
        published.append(event)
        return event

    monkeypatch.setattr(cctv, "MistralCloudProvider", FakeProvider)
    monkeypatch.setattr(cctv.CallEventStore, "publish", record_event)
    test_settings = Settings(mistral_api_key=SecretStr("test-mistral-key"))
    app.dependency_overrides[settings_dependency] = lambda: test_settings
    client = TestClient(app)

    try:
        response = client.post("/api/v1/incidents/call-123/cctv/analyze", json={"camera_id": "camera_2"}, headers={"Authorization": f"Bearer {_token()}"})
    finally:
        app.dependency_overrides.pop(settings_dependency, None)

    assert response.status_code == 200
    assert response.json()["analysis"]["urgency"] == "critical"
    assert [event.event for event in published] == ["cctv.analysis.requested", "cctv.analysis.completed"]


def test_cctv_analysis_requires_dispatcher_authentication() -> None:
    response = TestClient(app).post("/api/v1/incidents/call-123/cctv/analyze", json={"camera_id": "camera_1"})
    assert response.status_code == 401
