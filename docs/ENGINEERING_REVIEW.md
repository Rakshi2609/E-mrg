# Engineering Review

## 1 Executive Summary

Emergency AI Dispatcher Copilot is a human-in-the-loop emergency call-intake system for the Build with Gemma hackathon. Twilio receives a caller, streams voice through a FastAPI orchestration layer, and delegates speech recognition, conversation state management, Gemma reasoning through Ollama, structured incident extraction, persistence, and text-to-speech to replaceable services. MongoDB stores call, incident, transcript, event, user, settings, and audit data. A Next.js dashboard gives authenticated dispatchers a live transcript, incident summary, severity and confidence indicators, timeline, notes, history, and report views through WebSockets.

The product goal is to reduce repetitive dispatcher intake work while keeping trained humans responsible for escalation and dispatch decisions. The AI collects location, incident type, victims, injuries, hazards, caller safety, and callback information; asks one high-value follow-up question at a time; preserves uncertainty; and transfers or flags the call when confidence is low. The planned deployment is a monorepo with a FastAPI backend, Next.js frontend, MongoDB Atlas, Twilio Voice/Media Streams, configurable STT/TTS providers, and Gemma served locally by Ollama. The roadmap progresses from repository and backend foundations through data, voice, conversation, AI, speech, dashboard, reporting, security, testing, and deployment.

The architecture is appropriately modular for a hackathon prototype, but the documents do not yet define enough operational, safety, identity, data-contract, or failure semantics to support a real emergency service. The next implementation step should be contract clarification and a narrow, rehearsable demo slice not broad autonomous dispatch behavior.

## 2 Architecture Validation

### Strengths

- Clear human-oversight boundary: the AI is explicitly an intake copilot, not an autonomous dispatcher or medical diagnostician.
- Good separation of concerns: thin FastAPI routers, services for domain orchestration, repositories for MongoDB, provider adapters for STT/TTS/LLM, and a separate WebSocket transport.
- Replaceable provider strategy supports changing STT, TTS, model versions, or databases without rewriting domain logic.
- Explicit state-machine concept, structured JSON validation, confidence tracking, and immutable transcript intent are strong foundations for auditability.
- The WebSocket dashboard, structured incident report, timeline, health checks, structured logs, and fallback demo materials align well with the hackathon objective.
- The monorepo ADR, feature-oriented frontend, typed contracts, Pydantic validation, and CI/testing roadmap support coordinated iteration.

### Weaknesses and maintainability concerns

- The documented flow is ambiguous about where synchronous Twilio media handling ends and asynchronous conversation turns begin. A single request path cannot safely perform streaming audio, STT, LLM inference, persistence, and TTS without explicit queues and backpressure.
- The system has no canonical domain model or event envelope shared by backend and frontend. Endpoint prose, MongoDB fields, and WebSocket payloads can drift.
- “In-memory session until persistence recovers” is unsafe across process restarts and horizontal instances. It also risks data loss for emergency records.
- The WebSocket manager is process-local in the design. Multi-instance deployment requires a broker/pub-sub strategy, connection ownership, replay, ordering, and deduplication.
- MongoDB collection boundaries are listed, but transaction/idempotency rules, versioning, ownership, and lifecycle transitions are not defined.
- Severity and confidence are described as model outputs without a deterministic policy, calibration method, or separation between extracted-fact confidence and urgency classification.
- Authentication is named but not designed: token transport, refresh/revocation, password reset, user provisioning, tenant/center scope, and role permissions are unspecified.
- Provider abstraction is recommended but provider interface contracts, timeout budgets, cancellation behavior, retries, circuit breakers, and fallback policy are missing.

### Bottlenecks and scalability concerns

- Ollama/Gemma inference is likely the primary latency and concurrency bottleneck. Local GPU/CPU capacity, model warm-up, queue depth, and per-call token budgets must be measured.
- Streaming STT and TTS can create head-of-line blocking if handled in the API worker. Use bounded queues and explicit per-call workers or a task broker.
- Unbounded transcripts and event histories can exceed document limits or make reads slow. Keep append-only segments in separate documents and paginate/replay by sequence.
- A broadcast-to-all WebSocket design will not scale to multiple centers or many calls. Filter by authorized center, incident, and event type; use pub/sub and replayable event offsets.
- Search and reporting will compete with active-call writes unless indexes, read models, and archival policies are planned.

### Recommended architectural improvements

1. Define a versioned domain/event contract package used by FastAPI and Next.js: call states, incident fields, event types, sequence numbers, timestamps, correlation IDs, and error envelopes.
2. Introduce a per-call orchestration worker with bounded audio/transcript/LLM queues, cancellation, deadlines, and an explicit handoff state.
3. Make persistence the source of truth for recoverable call state; use a durable queue or outbox for WebSocket publication and external notifications.
4. Add idempotency keys for Twilio callbacks, transcript segments, incident updates, and report generation.
5. Specify a single-center MVP tenancy model now, even if multi-center support is future work, so authorization and indexes have an owner boundary.

## 3 Missing Requirements

### Product and workflow

- Exact human handoff behavior is missing: how a dispatcher joins, whether Twilio transfers/bridges the call, who speaks, and what the caller hears during failure.
- No explicit consent/disclosure language tells callers they are interacting with an AI or that calls are recorded/transcribed.
- No handling for silent callers, abusive callers, minors, accessibility needs, language mismatch, emergency-number misdials, duplicate calls, or calls that are not emergencies.
- No termination policy defines when required fields are sufficient, when the AI must stop asking questions, or how a dispatcher closes/reopens an incident.
- No authoritative field dictionary defines formats for addresses, coordinates, phone numbers, victim counts, hazards, injury states, and null/unknown values.
- “AI reasoning summary” and “reasoning indicators” need a safe, user-facing definition; raw chain-of-thought must not be exposed.

### APIs and contracts

- Missing authentication/session endpoints, dispatcher profile endpoints, notes endpoints, event replay/acknowledgement endpoints, and report export format.
- Missing request and response schemas for almost every REST endpoint, pagination cursor format, sorting, filters, optimistic concurrency, and error details.
- Missing Twilio status callback, recording, call transfer, media-stream lifecycle, and retry/idempotency contracts.
- Missing WebSocket handshake schema, authorization scope, subscription model, heartbeat, replay cursor, event version, ordering, and acknowledgement semantics.
- The internal `/ai/respond` endpoint is specified despite the architecture saying internal service calls should not be publicly accessible; its transport boundary needs to be resolved.

### Data and compliance

- Missing complete schemas for all seven database collections, foreign-key/reference rules, unique constraints, indexes with sort order, schema validation, and migration/index rollout.
- Missing retention/deletion/legal-hold behavior for phone numbers, audio, transcripts, exports, and audit logs.
- Missing encryption-at-rest, backup access controls, restore objectives, data residency, and redaction policy.
- Missing audit events for read access, transcript replay, note edits, handoff, severity override, report download, and failed authorization.
- Missing tenancy/center ownership fields and soft-delete/version fields.

### Security and operations

- No threat model details for SSRF to Ollama, WebSocket cross-site hijacking, JWT theft, replayed callbacks, prompt injection through caller speech, malicious dashboard notes, or denial-of-service through media streams.
- No CORS/CSRF policy, secure cookie/token storage decision, password policy, key rotation, dependency scanning, container hardening, or network segmentation.
- No SLO/error-budget definition, alert thresholds, tracing, runbooks, on-call ownership, or incident escalation path.
- No resource limits for audio duration, payloads, transcript size, concurrent calls, model context, report exports, or WebSocket connections.
- No deployment topology for Ollama connectivity from Render, GPU availability, model download/version pinning, or regional latency.

### Testing and AI safety

- Missing golden datasets, annotation guidelines, acceptance thresholds, bias/language evaluation, adversarial prompts, regression versioning, and human review protocol.
- No tests for event ordering, reconnect replay, duplicate Twilio callbacks, process restart, provider timeouts, partial audio, persistence outage, or clock skew.
- No deterministic emergency safety policy that can override an unsafe model response and immediately request dispatcher intervention.

## 4 Inconsistencies

1. **Repository layout:** the blueprint and engineering standards use `backend/` and `frontend/`, while ADR-008 defines `apps/web`, `apps/api`, and shared `packages/`. The requested review structure should resolve this before scaffolding.
2. **Database collections:** the blueprint lists `calls`, `callers`, `incidents`, `transcripts`, `dispatcher_events`, and `audit_logs`; the database design adds `users` and `settings` but omits `callers`; ADR-003 additionally mentions `dispatchers` and `system_metrics`.
3. **Call model:** the calls example references `caller_number` and `incident_id`, while the relationship and collection sections do not define whether caller data is embedded, stored in `callers`, or owned by a separate identity model.
4. **State names:** the blueprint uses “Verify emergency” and “Confirm information,” the AI state machine omits confirmation, and backend state lists “clarification,” “triage,” “dispatch handoff,” and “completion.” There is no canonical enum.
5. **Severity:** UI maps Low/Medium/High/Critical, while the AI document defines Critical/High/Moderate/Low/Unknown. The API and database do not define a single enum.
6. **WebSocket events:** frontend design expects `dispatcher.connected` and `dispatcher.disconnected`; the API specifies `dispatcher.joined` and `dispatcher.left`, while ADR-005 lists notifications and activity without names. Event names and payloads conflict.
7. **Authentication:** the API says JWT Bearer tokens, security says password hashing and session expiration, and the frontend ADR mentions secure token storage, but no implementation contract determines cookies versus browser storage or refresh/revocation.
8. **Speech providers:** the blueprint lists Deepgram/AssemblyAI/OpenAI Whisper, while no default provider, data-processing boundary, or adapter contract is selected.
9. **Deployment:** the overview says Vercel plus Render or similar with Ollama on a local/GPU machine; the security document labels Render as backend production architecture; the PRD requires cloud and offline inference without defining a supported topology.
10. **Background execution:** the backend suggests FastAPI background tasks, while the architecture requires long-running streaming and AI work to avoid blocking request handlers. A durable worker model is needed.
11. **API envelope:** the standards require `{success,data,meta}`, but `/health` uses `{status,version}` and Twilio/TwiML endpoints necessarily use non-JSON responses. Exceptions need to be documented.
12. **Terminology:** documents alternate among dispatcher, operator, call operator, first responder, and supervisor without defining permissions or which roles can perform each action.
13. **PRD copies:** four files share the same PRD name; the canonical file is only Part 1, while the numbered copies repeat and extend it. The source-of-truth rule should identify one canonical PRD and archive or clearly label the continuations.
14. **Roadmap order:** the roadmap puts speech integration after Gemma, while the blueprint and architecture require an operational STT/TTS path to exercise the conversation engine; the dependency should be explicit even if mocked first.

## 5 Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| Unsafe or hallucinated AI response | Critical | Deterministic safety policy, strict schema/allow-lists, fact provenance, low-confidence handoff, red-team golden tests, human-visible uncertainty, and never promise dispatch. |
| Incorrect STT or location extraction | Critical | Show source transcript, retain alternatives/confidence, require confirmation, prioritize location, and escalate contradictions. |
| Prompt injection through caller speech or notes | High | Treat all external text as untrusted data, isolate system policy, constrain tool access, validate output, and test adversarial utterances. |
| LLM latency or Ollama outage | High | Warm model, queue and timeout inference, circuit breaker, deterministic fallback questions, immediate dispatcher takeover, and a rehearsed demo fallback. |
| Twilio callback spoof/replay | High | Signature validation against the exact URL/body, HTTPS, idempotency, timestamp/replay controls, and security alerts. |
| Unauthorized dashboard access | Critical | Short-lived tokens, secure cookies or an explicitly justified alternative, RBAC/center scope, server-side authorization on every resource, MFA-ready design, and audit logs. |
| Transcript/PII exposure | Critical | Data minimization, redaction, encryption, retention enforcement, export controls, least-privilege logs, and access auditing. |
| WebSocket event leakage or desynchronization | High | Authenticate handshake, scope subscriptions, sequence events, replay missed events, use broker-backed fanout, and test reconnects. |
| MongoDB outage or document growth | High | Durable write strategy, bounded documents, indexes, retries with idempotency, archival, backup/restore drills, and explicit degraded mode. |
| Hackathon live-demo failure | High | Freeze a tested demo build, health preflight, scripted call scenarios, prerecorded fallback, mock provider switch, dashboard screenshots, and clear operator runbook. |
| Scope overrun | High | Build one end-to-end vertical slice first, define MVP exit criteria, defer analytics/multilingual/GIS, and freeze interfaces before polish. |

## 6 Recommended Folder Structure

Resolve the `backend/frontend` versus monorepo ADR conflict by adopting the ADR layout and keeping framework-specific boundaries explicit:

```text
emergency-ai/
├── apps/
│   ├── api/                         # FastAPI application
│   │   ├── app/
│   │   │   ├── core/                # settings, security, logging, dependencies
│   │   │   ├── routers/             # HTTP/WebSocket/Twilio adapters
│   │   │   ├── services/            # domain orchestration
│   │   │   ├── repositories/        # MongoDB access only
│   │   │   ├── domain/              # entities, state machine, policies
│   │   │   ├── schemas/              # API and provider DTOs
│   │   │   ├── providers/            # Twilio, STT, TTS, Ollama adapters
│   │   │   ├── workers/              # per-call/background jobs
│   │   │   └── main.py
│   │   └── tests/
│   └── web/                         # Next.js App Router dashboard
│       ├── app/
│       ├── features/
│       ├── components/
│       ├── services/
│       ├── hooks/
│       ├── lib/
│       └── tests/
├── packages/
│   ├── contracts/                   # versioned REST/WebSocket schemas
│   ├── config/                      # shared non-secret configuration
│   └── ui/                          # reusable dashboard primitives if needed
├── docs/
├── scripts/                         # setup, seed, validation, demo preflight
├── tests/
│   ├── e2e/
│   ├── contract/
│   ├── performance/
│   └── fixtures/
├── docker/
│   ├── api/
│   ├── web/
│   └── compose/
├── .github/
│   └── workflows/
├── .env.example
├── compose.yaml
├── README.md
└── package/workspace configuration
```

If the team chooses the simpler `backend/` and `frontend/` layout for the hackathon, update ADR-008 and all references before creating files; do not maintain both layouts.

## 7 Development Plan

### Phase 0   Contract and safety baseline

Dependencies: none. Resolve layout, canonical PRD, state/severity/event enums, field dictionary, authentication model, handoff semantics, and demo scope. Define contracts, threat model, golden AI fixtures, and data-retention decisions before implementation.

### Phase 1   Repository and backend foundation

Dependencies: Phase 0. Create workspace, FastAPI app, configuration, structured logging, error envelope, health/readiness checks, dependency injection, CI, and local Docker Compose. Keep a working `/health` vertical slice.

### Phase 2   Database and durable call state

Dependencies: Phase 1. Implement Pydantic/domain models, MongoDB repositories, indexes, validation, migrations/index bootstrap, call lifecycle, idempotency, bounded transcript segments, audit events, and outage tests.

### Phase 3   Voice ingress and provider adapters

Dependencies: Phases 1–2. Implement signed Twilio webhook, call status callbacks, media-stream lifecycle, STT/TTS interfaces, timeouts, interruption handling, and a deterministic mock provider. Prove a call can connect and persist partial state.

### Phase 4   Conversation engine and Gemma

Dependencies: Phases 2–3. Implement explicit state machine, required-field policy, prompt builder, structured-output validator, confidence policy, safety guardrails, low-confidence handoff, Ollama health/model pinning, and golden conversation evaluation.

### Phase 5   Realtime eventing

Dependencies: Phases 2–4. Implement versioned event envelope, authenticated subscriptions, sequence/replay, WebSocket reconnect, outbox/publication, and single-instance then broker-backed integration tests.

### Phase 6   Dispatcher dashboard

Dependencies: Phases 0, 2, and 5. Implement authentication, active-call queue, live call view, transcript, incident fields, AI status, severity/confidence labels, notes, loading/error/empty/offline states, accessibility, and contract validation.

### Phase 7   Reports, audit, and operational readiness

Dependencies: Phases 2, 5, and 6. Add report generation/export authorization, audit trail, search/filter/history, metrics, traces, alerts, retention jobs, backup/restore procedure, and runbooks.

### Phase 8   Verification and demo deployment

Dependencies: all prior phases. Run unit, contract, integration, E2E, adversarial AI, load, reconnect, security, accessibility, and failure-recovery tests. Deploy pinned builds, pre-warm Ollama, run end-to-end rehearsal, and verify fallback assets.

## 8 Code Quality Recommendations

- Keep domain state transitions and safety policy framework-independent; adapters should translate transport/provider data into domain commands.
- Use explicit `CallId`, `IncidentId`, `EventId`, and `CorrelationId` types or validated wrappers where practical.
- Name modules by capability (`call_service`, `handoff_policy`, `transcript_repository`) and avoid generic “utils” growth.
- Use dependency injection for database, clock, ID generation, provider clients, and event publisher so tests are deterministic.
- Validate at boundaries with Pydantic/Zod and revalidate provider output before domain mutation.
- Centralize exception-to-error mapping, timeouts, retries, circuit breakers, and redaction.
- Use structured logs and traces with stable identifiers; never include raw audio, full sensitive transcripts, tokens, or prompts by default.
- Test state transitions, policies, repositories, provider adapters, API contracts, WebSocket replay, and complete scenarios not only line coverage.
- Keep configuration typed, environment-driven, validated at startup, and separated into public versus secret values.
- Require focused commits, reproducible local setup, pinned provider/model versions, and documentation updates for contract changes.

## 9 Security Review

### Authentication and authorization

Define dispatcher login, short-lived access tokens, refresh/revocation, password hashing, session expiry, and secure browser storage. Authorize every call, incident, transcript, note, report, settings, and WebSocket subscription by role and center scope. Audit both successful and denied reads/writes.

### Secret management

Use environment or a managed secret store, never source control. Rotate Twilio, MongoDB, JWT, and deployment credentials; avoid exposing them to the browser; provide startup validation without printing values.

### API and Twilio security

Validate JSON size/types/enums, enforce request timeouts and rate limits, use HTTPS, configure strict CORS/CSRF protections, and return safe errors. Validate Twilio signatures using the canonical request URL and body, reject replayed/duplicate callbacks through idempotency, and isolate media-stream endpoints.

### WebSocket security

Authenticate during handshake, authorize subscriptions, use WSS, enforce origin policy, heartbeat and idle limits, cap message sizes, and prevent event leakage across calls or centers. Add sequence numbers and replay authorization.

### MongoDB security

Use TLS, least-privilege service accounts, private networking/IP controls, encrypted backups, schema validation, separate databases/credentials by environment, and indexes that support scoped queries. Never build queries from unchecked field names or operators.

### Ollama security

Bind Ollama to a private interface, allow access only from the API service, restrict model management endpoints, pin model versions, enforce request/token/time limits, and monitor resource exhaustion. Do not send raw prompts to third-party telemetry.

### Prompt injection and sensitive data

Treat caller transcript and dispatcher notes as untrusted content. Keep policy instructions outside user content, prohibit tool/action authority in model output, validate only allow-listed fields, and make the model incapable of claiming dispatch. Redact PII from logs, minimize transcript access, define consent/retention, and provide deletion/export controls appropriate to the deployment context.

## 10 Performance Review

### Likely bottlenecks

- STT streaming and endpointing delay.
- Ollama model load and token generation.
- Serial state persistence before each spoken response.
- TTS generation and Twilio round trips.
- WebSocket fanout and frontend rendering of transcript/event streams.
- MongoDB unbounded transcript/report reads.

### Initial targets and measurement

The documented targets (<5 s AI response, <500 ms dashboard update, <1 s non-AI API p95, <200 ms health endpoint) should be split into measured budgets: audio endpointing, STT partial/final, queue wait, prompt construction, model first token/complete response, validation/persistence, event publication, and TTS. Measure p50/p95/p99 under realistic concurrent calls; do not report only averages.

### Optimization opportunities

- Warm and pin the model; cap context using summarized history plus structured state.
- Stream partial STT and model-safe status events while only committing validated final fields.
- Keep prompts concise and use deterministic schemas/temperature settings.
- Use async clients, bounded queues, connection pooling, and cancellation on hangup.
- Add compound scoped indexes such as `(center_id, status, updated_at)` and `(incident_id, sequence)` after confirming query shapes.
- Paginate transcript/history, archive old segments, and maintain a compact active-call read model.
- Batch or coalesce noncritical dashboard events while preserving critical event order.
- Use broker-backed fanout and horizontally scale stateless API workers once single-instance behavior is proven.
- Lazy-load dashboard history and virtualize long transcripts; update query caches from events rather than refetching everything.

## 11 Final Recommendations

### Immediate improvements

- Resolve repository layout and canonical PRD duplication.
- Freeze canonical enums, schemas, event envelopes, state transitions, and handoff behavior.
- Define authentication/authorization, consent, retention, redaction, and tenancy before building the dashboard.
- Build a narrow mock-provider vertical slice with durable state, deterministic safety rules, and a complete test scenario.
- Replace process-local recovery assumptions with idempotent persistence and explicit degraded mode.

### Hackathon improvements

- Demonstrate one polished fire, medical, or road-accident scenario with scripted inputs and a safe handoff.
- Show Gemma doing adaptive extraction, not merely summarization; display source transcript, structured fields, confidence, and human override.
- Pre-warm Ollama, pin the model, add a preflight checklist, and maintain prerecorded transcript/screenshots/provider mocks.
- Instrument the demo with latency and event-timing indicators so judges can see the technical value.

### Future improvements

- Add multilingual support only after language-specific safety evaluation.
- Add supervisor analytics, GIS/CAD integrations, richer collaboration, and evaluation dashboards behind stable contracts.
- Introduce Redis/pub-sub or a durable event broker, background workers, multi-center tenancy, and dedicated read models as scale requires.

### Production improvements

- Complete formal threat modeling, privacy/legal review, accessibility testing, disaster recovery, penetration testing, model governance, bias evaluation, and operational SLOs.
- Require trained dispatcher acceptance, audited human override, immutable evidence trails, controlled model updates, regional data governance, and continuous incident-response exercises.
- Treat the system as decision support only until independent safety validation demonstrates that every deployment context is appropriate.
