---
name: fastapi
description: Build and review the async FastAPI backend for E-mrg, including typed routes, Pydantic models, services, dependency injection, structured errors, logging, and integrations. Use for API endpoints, webhooks, conversation workflow, backend tests, or server-side integrations.
---

# FastAPI Backend

Read  first. Keep routers as transport adapters and place workflow logic in feature services.

## Implement

- Use  for I/O-bound routes and clients. Do not block the event loop; offload blocking SDK work explicitly.
- Define request, response, and error models with Pydantic. Make JSON responses explicit and versionable.
- Inject configuration, database access, and external clients through FastAPI dependencies or application lifespan setup.
- Translate expected integration failures into structured HTTP errors; log the exception with correlation IDs without exposing internals to callers.
- Validate Twilio signatures before accepting voice webhooks and authenticate dispatcher-facing endpoints.

## Conversation workflow

Represent each transition as a service operation over a persisted call record. Persist the raw observation, normalized fields, missing required fields, and next question. Require deterministic guardrails for location, emergency category, and dispatcher escalation; do not depend on an LLM response alone.

## Example requests

- “Build the inbound Twilio voice webhook.”
- “Implement the caller conversation state machine.”
- “Add a typed endpoint that returns an emergency call summary.”
