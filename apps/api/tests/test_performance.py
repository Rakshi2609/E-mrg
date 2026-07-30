import time

from fastapi.testclient import TestClient

from app.main import app


def test_health_smoke_latency() -> None:
    client = TestClient(app)
    start = time.perf_counter()
    for _ in range(20):
        assert client.get("/health").status_code == 200
    elapsed = time.perf_counter() - start
    assert elapsed < 2.0
