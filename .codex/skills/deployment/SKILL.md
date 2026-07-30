---
name: deployment
description: Prepare, configure, and review safe deployments for E-mrg services, including environment configuration, secrets, health checks, CORS, HTTPS, observability, rollback, and production readiness. Use for Docker, CI/CD, hosting, deployment configuration, or release troubleshooting.
---

# Deployment

Read  first. Keep deployment configuration reproducible and separate development defaults from production settings.

## Release checklist

- Supply all secrets through the hosting platform; commit  only.
- Require HTTPS public URLs for Twilio callbacks and configure allowed origins narrowly.
- Add liveness and readiness endpoints that do not disclose secrets or call data.
- Log structured, redacted operational events and monitor webhook failures, model latency, database errors, and WebSocket disconnect rates.
- Pin application dependencies and document required external services: MongoDB Atlas, Ollama host/model, and Twilio credentials.
- Plan database-compatible, reversible changes; make idempotent webhook processing resilient during deploys.
- Define a rollback process before release and verify it in a non-production environment.

## Example requests

- “Create production environment-variable documentation.”
- “Containerize the FastAPI service with a health check.”
- “Prepare Twilio webhook URLs and CORS for deployment.”
