---
name: nextjs
description: Build and review the Next.js 15 TypeScript dispatcher dashboard for E-mrg using feature-based components, Tailwind CSS, shadcn/ui, accessible states, typed API clients, and live updates. Use for dashboard screens, React components, frontend data flow, styling, or dispatcher UX.
---

# Next.js Dashboard

Read  and  first. Build a clear, responsive dispatcher interface; prioritize legibility, status clarity, and accessible interaction over decorative visuals.

## Frontend rules

- Organize features by domain: active calls, call detail, transcript, dispatcher actions, and real-time connection state.
- Use TypeScript types derived from explicit API/event contracts. Do not infer critical call state from untyped JSON.
- Use server components by default; isolate browser-only WebSocket and interactive behavior in client components.
- Represent loading, empty, stale, disconnected, and error states explicitly.
- Use Tailwind and shadcn/ui consistently. Ensure keyboard operation, semantic labels, visible focus, and contrast for severity cues.
- Never expose secrets or privileged backend credentials to the browser.

## Example requests

- “Build the active emergency-call queue.”
- “Create a dispatcher call-detail panel with transcript updates.”
- “Add a WebSocket connection-status indicator.”
