from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, status

from app.auth.models import Principal, Role
from app.core.config import Settings

ALGORITHM = "HS256"


def create_access_token(principal: Principal, settings: Settings, expires_in: timedelta | None = None) -> str:
    now = datetime.now(timezone.utc)
    expires = now + (expires_in or timedelta(minutes=30))
    payload = {"sub": principal.user_id, "role": principal.role, "iat": now, "exp": expires}
    return jwt.encode(payload, settings.jwt_secret.get_secret_value(), algorithm=ALGORITHM)


def decode_access_token(token: str, settings: Settings) -> Principal:
    credentials_error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    try:
        payload = jwt.decode(token, settings.jwt_secret.get_secret_value(), algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if not isinstance(user_id, str) or role not in {"dispatcher", "supervisor", "admin"}:
            raise credentials_error
        return Principal(user_id=user_id, role=role)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as exc:
        raise credentials_error from exc


def ensure_role(principal: Principal, roles: set[Role]) -> Principal:
    if principal.role not in roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
    return principal
