import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.auth.security import decode_access_token
from app.core.config import settings
from app.realtime.manager import ConnectionManager

router = APIRouter(tags=["realtime"])
from app.realtime.runtime import bus
manager = ConnectionManager(bus)


@router.websocket("/api/v1/ws")
async def dispatcher_events(websocket: WebSocket) -> None:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return
    try:
        decode_access_token(token, settings)
    except Exception:
        await websocket.close(code=1008)
        return
    await manager.connect(websocket, token, settings)
    queue = bus.subscribe()
    try:
        while True:
            event = await queue.get()
            await websocket.send_json(event.model_dump(mode="json"))
    except (WebSocketDisconnect, asyncio.CancelledError):
        manager.disconnect(websocket)
        bus.unsubscribe(queue)
