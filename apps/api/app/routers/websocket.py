from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["realtime"])


@router.websocket("/api/v1/twilio/media")
async def media_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_json()
            event = message.get("event")
            if event == "stop":
                break
            if event not in {"connected", "start", "media"}:
                await websocket.send_json({"event": "error", "code": "UNSUPPORTED_MEDIA_EVENT"})
    except WebSocketDisconnect:
        return
    finally:
        await websocket.close()
