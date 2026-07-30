from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.auth.security import decode_access_token
from app.core.config import Settings


class AuthenticationMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, settings: Settings) -> None:  # type: ignore[no-untyped-def]
        super().__init__(app)
        self.settings = settings

    async def dispatch(self, request: Request, call_next):  # type: ignore[no-untyped-def]
        request.state.principal = None
        authorization = request.headers.get("Authorization", "")
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() == "bearer" and token:
            try:
                request.state.principal = decode_access_token(token, self.settings)
            except Exception:
                request.state.principal = None
        return await call_next(request)
