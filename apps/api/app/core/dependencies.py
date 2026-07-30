from fastapi import Request

from app.core.config import Settings, get_settings


def settings_dependency() -> Settings:
    return get_settings()


def request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "unknown")
