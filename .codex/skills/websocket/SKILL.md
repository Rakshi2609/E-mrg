---
name: websocket
description: Build and review real-time WebSocket updates for the E-mrg dispatcher dashboard, including authenticated connections, typed event envelopes, transcript streaming, reconnection, ordering, and backpressure. Use for live dashboard events, socket endpoints, event contracts, or real-time reliability issues.
---

# WebSockets

Read  first. Use WebSockets for real-time notifications, not as the only source of truth: the dashboard must be able to refresh state via authenticated APIs.

## Event contract

- Define versioned JSON envelopes with , , , , and typed .
- Emit focused events such as , , , , and .
- Authenticate on connection, authorize by dispatcher role/queue, and never broadcast one caller’s data to unauthorized clients.
- Preserve ordering per call with sequence numbers. Make client updates idempotent using event IDs.
- Implement ping/heartbeat, bounded queues, reconnect with state refresh, and graceful cleanup on disconnect.

## Example requests

- “Add WebSocket events for live transcript updates.”
- “Create a typed event envelope shared by backend and dashboard.”
- “Handle reconnecting a dispatcher without missing call updates.”
