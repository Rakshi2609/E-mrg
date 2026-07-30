---
name: twilio-voice
description: Implement and review Twilio Voice capabilities for E-mrg, including inbound webhooks, TwiML, Media Streams, request-signature validation, call lifecycle handling, and safe error behavior. Use for Twilio voice routes, call flows, streaming audio, or webhook security.
---

# Twilio Voice

Read  and  first. Keep Twilio credentials and public callback URLs in environment configuration.

## Call handling

- Verify  against the exact public URL and request body before processing a webhook.
- Make webhook handling idempotent using the Twilio Call SID and event type.
- Return valid TwiML with a short, clear greeting and a safe retry/failure path.
- Persist call state before issuing a follow-up , redirect, or stream operation.
- Authenticate and authorize Media Streams connections; validate stream/call identity and handle disconnects cleanly.
- Never expose dispatcher or internal errors to callers. Provide a human escalation path appropriate to product policy.

## Example requests

- “Build an inbound voice webhook.”
- “Generate TwiML for greeting callers and collecting speech.”
- “Add Twilio Media Streams with signature validation.”
