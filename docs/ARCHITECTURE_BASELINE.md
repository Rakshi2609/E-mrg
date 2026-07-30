# Canonical Architecture Baseline

Status: accepted scaffold baseline. This document resolves the layout, terminology, and contract conflicts identified in `ENGINEERING_REVIEW.md`.

## Repository layout

Use the ADR-008 monorepo layout:

- `apps/api`: FastAPI service.
- `apps/web`: Next.js 15 dashboard.
- `packages/contracts`: versioned REST and WebSocket contracts.
- `packages/config`: shared non-secret configuration conventions.
- `docs`, `scripts`, `tests`, `docker`, and `.github` for project assets.

The older `backend/` and `frontend/` paths are historical documentation examples; new code must use `apps/api` and `apps/web`.

## Canonical enums

Call states: `greeting`, `incident_collection`, `location_collection`, `clarification`, `triage`, `dispatcher_handoff`, `completed`, `abandoned`.

Severity values: `unknown`, `low`, `moderate`, `high`, `critical`.

WebSocket event names: `call.started`, `transcript.updated`, `incident.updated`, `ai.status`, `dispatcher.joined`, `dispatcher.left`, `call.ended`, `system.error`.

Every event has `version`, `event_id`, `sequence`, `occurred_at`, `call_id`, and a typed `payload`.

## Canonical data ownership

Use `calls`, `incidents`, `transcripts`, `dispatcher_events`, `audit_logs`, `users`, and `settings`. Caller phone data belongs to the call record for the MVP; a separate callers collection is deferred. `dispatchers` and `system_metrics` are projections, not canonical collections.

## API rules

Version REST routes under `/api/v1`. Dispatcher routes use an authenticated bearer contract; Twilio routes validate signatures; WebSockets authenticate during handshake. JSON APIs use `{success,data,meta}` and `{success:false,error:{code,message,details?}}`; health and TwiML responses are documented exceptions. All mutating external callbacks are idempotent.

## MVP boundaries

Build one vertical slice with a single dispatch center, one configured STT/TTS provider adapter, Gemma via Ollama, durable MongoDB state, authenticated dashboard access, and human handoff. Analytics, multilingual support, GIS/CAD integration, and horizontal scaling remain future work.
