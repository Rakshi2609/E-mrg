from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_returns_service_metadata() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_liveness_echoes_request_id() -> None:
    response = client.get("/health/live", headers={"X-Request-ID": "test-request"})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "test-request"


def test_readiness_is_available() -> None:
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json()["status"] in {"ready", "degraded"}
    assert response.json()["database"] in {"connected", "unavailable"}


def test_cors_allows_local_dashboard() -> None:
    response = client.options("/health", headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"})
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
