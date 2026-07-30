---
name: project-architecture
description: Define and apply repository-wide architecture, conventions, configuration, and boundaries for the E-mrg AI emergency-call assistant. Use when planning features, creating files or folders, reviewing cross-cutting code, defining contracts, or changing project structure.
---

# Project Architecture

Apply these conventions before implementing any E-mrg feature.

## Repository layout

- Keep  as a Next.js 15 TypeScript application and  as a FastAPI application.
- Organize both applications by feature. Keep route handlers/controllers thin and put business rules in services.
- Share API contracts deliberately: use documented JSON schemas or generated types; do not duplicate unstated shapes.
- Keep configuration in environment variables. Commit only an  with names and safe placeholders.

## Engineering rules

- Use TypeScript strict mode and Python type hints everywhere practical.
- Prefer composition, small cohesive modules, and dependency injection at boundaries.
- Validate external input at the edge. Return structured errors with stable machine-readable codes.
- Log request/call identifiers and safe operational context; never log secrets, full caller audio, or unnecessary personal data.
- Treat emergency data as sensitive. Minimize retention, restrict dashboard access, and make downstream failures visible to operators.

## Emergency contract

Model the call flow as explicit states: greeting, incident collection, location collection, clarification, triage, dispatch handoff, and completion. Preserve a transcript and structured incident record separately. Require a human-dispatcher review path; never claim the model independently contacted emergency services.

## Example requests

- “Plan the folder structure for the caller conversation feature.”
- “Define environment variables for Twilio, MongoDB, and Ollama.”
- “Review this endpoint and dashboard event for contract and privacy issues.”
