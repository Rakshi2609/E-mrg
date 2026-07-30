from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.auth.middleware import AuthenticationMiddleware
from app.core.logging import RequestContextMiddleware, configure_logging
from app.routers.auth import router as auth_router
from app.routers.ai_settings import router as ai_settings_router
from app.routers.twilio import router as twilio_router
from app.routers.websocket import router as websocket_router
from app.routers.dispatcher_ws import router as dispatcher_ws_router
from app.routers.dashboard import router as dashboard_router
from app.routers.dispatch import router as dispatch_router
from app.routers.demo import router as demo_router
from app.routers.health import router as health_router
from app.routers.cctv import router as cctv_router
from app.database.mongodb import MongoDatabase

database = MongoDatabase(settings.mongodb_uri)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await database.connect()
    yield
    await database.close()

configure_logging(settings.log_level)
app = FastAPI(title="Emergency AI Dispatcher API", version="0.1.0", lifespan=lifespan)
app.state.database = database
app.state.ollama_timeout_seconds = settings.ollama_timeout_seconds
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Twilio-Signature"],
)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(AuthenticationMiddleware, settings=settings)
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(ai_settings_router)
app.include_router(twilio_router)
app.include_router(websocket_router)
app.include_router(dispatcher_ws_router)
app.include_router(demo_router)
app.include_router(dashboard_router)
app.include_router(dispatch_router)
app.include_router(cctv_router)


@app.get("/health/live", tags=["health"])
async def liveness() -> dict[str, str]:
    return {"status": "alive", "service": settings.service_name}
