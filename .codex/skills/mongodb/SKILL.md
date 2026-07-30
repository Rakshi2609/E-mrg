---
name: mongodb
description: Design, implement, and review MongoDB Atlas persistence for E-mrg emergency calls, transcripts, dispatcher actions, indexes, validation, privacy, and async data access. Use for collections, schemas, queries, migrations, retention, or database troubleshooting.
---

# MongoDB

Read  first. Use the async MongoDB driver selected by the backend and centralize database access in repositories or services.

## Data design

- Keep an  record with stable call ID, timestamps, current state, normalized location, emergency type, severity, dispatcher status, and audit references.
- Store transcript turns as ordered embedded data only while bounded; use a dedicated collection if transcript growth or query patterns require it.
- Record dispatcher actions as append-only, attributable audit events.
- Index call ID, state/status, created time, severity, and active dispatcher queue queries. Confirm indexes with actual query patterns.
- Validate document shapes at the application boundary and use MongoDB validation where it meaningfully protects shared access.

## Safety

- Store credentials only in environment variables.
- Minimize personally identifiable information and define retention/cleanup behavior before collecting audio or transcripts.
- Use idempotency keys for inbound webhook writes to prevent duplicate incidents.

## Example requests

- “Create MongoDB schemas for emergency calls and dispatcher actions.”
- “Add indexes for the active dispatcher queue.”
- “Make Twilio webhook persistence idempotent.”
