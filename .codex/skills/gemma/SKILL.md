---
name: gemma
description: Integrate Gemma through Ollama for E-mrg with reliable structured extraction, prompts, safety guardrails, timeouts, fallbacks, and evaluation. Use for LLM prompts, Ollama clients, JSON extraction, triage assistance, model configuration, or AI-response debugging.
---

# Gemma and Ollama

Read  first. Treat Gemma as an assistive extraction and question-generation component, never as the final authority for emergency dispatch.

## Integration rules

- Read Ollama base URL, model name, timeouts, and retry policy from configuration.
- Request a narrow JSON schema for incident facts: summary, type, severity rationale, location fields, missing fields, confidence, and safe next question.
- Validate every response with Pydantic. On invalid or timed-out output, retain the transcript, mark extraction incomplete, and use deterministic fallback questions.
- Constrain prompts to avoid invented facts. Keep user-provided facts distinct from model inferences.
- Redact or minimize sensitive content in model logs and evaluation fixtures.

## Evaluation

Build representative medical, fire, crime, ambiguous-location, and low-information scenarios. Measure JSON validity, missing-field detection, and unsafe escalation wording before changing prompts or models.

## Example requests

- “Integrate Gemma through Ollama in FastAPI.”
- “Create a Pydantic schema for structured emergency extraction.”
- “Add a fallback for invalid model JSON.”
