import type { EventEnvelope } from "@emergency-ai/contracts";

export function connectDispatcherEvents(token: string, onEvent: (event: EventEnvelope) => void): WebSocket {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/api/v1/ws";
  const socket = new WebSocket(`${base}?token=${encodeURIComponent(token)}`);
  socket.addEventListener("message", (message) => {
    try { onEvent(JSON.parse(message.data) as EventEnvelope); } catch { /* ignore malformed transport data */ }
  });
  return socket;
}
