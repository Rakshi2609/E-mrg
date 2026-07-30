from datetime import timedelta

from fastapi.testclient import TestClient

from app.auth.models import Principal
from app.auth.security import create_access_token
from app.core.config import settings
from app.main import app

client = TestClient(app)


def token(role: str = "dispatcher") -> str:
    return create_access_token(Principal(user_id="user-1", role=role), settings, timedelta(minutes=5))


def test_me_requires_bearer_token() -> None:
    assert client.get("/api/v1/auth/me").status_code == 401


def test_hackathon_admin_login_returns_admin_token() -> None:
    response = client.post("/api/v1/auth/login", json={"username": "admin123", "password": "123123"})
    assert response.status_code == 200
    assert response.json()["token"]


def test_hackathon_admin_login_rejects_invalid_password() -> None:
    response = client.post("/api/v1/auth/login", json={"username": "admin123", "password": "incorrect"})
    assert response.status_code == 401


def test_me_returns_principal_for_valid_token() -> None:
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token()}"})
    assert response.status_code == 200
    assert response.json() == {"user_id": "user-1", "role": "dispatcher"}


def test_malformed_token_is_rejected() -> None:
    assert client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid"}).status_code == 401


def test_expired_token_is_rejected() -> None:
    expired = create_access_token(Principal(user_id="user-1", role="dispatcher"), settings, timedelta(seconds=-1))
    assert client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired}"}).status_code == 401
