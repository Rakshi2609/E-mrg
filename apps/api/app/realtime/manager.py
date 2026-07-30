from fastapi import WebSocket

from app.auth.security import decode_access_token
from app.core.config import Settings
from app.realtime.bus import EventBus


class ConnectionManager:
    def __init__(self, bus: EventBus) -> None:
        self.bus = bus
        self.connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, token: str, settings: Settings) -> None:
        decode_access_token(token, settings)
        await websocket.accept()
        self.connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.connections.discard(websocket)
