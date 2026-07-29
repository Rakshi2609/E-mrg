from fastapi import FastAPI

from app.core.config import settings
from app.core.logging import RequestContextMiddleware, configure_logging
from app.routers.health import router as health_router

configure_logging(settings.log_level)
app = FastAPI(title="Emergency AI Dispatcher API", version="0.1.0")
app.add_middleware(RequestContextMiddleware)
app.include_router(health_router)


@app.get("/health/live", tags=["health"])
async def liveness() -> dict[str, str]:
    return {"status": "alive", "service": settings.service_name}
