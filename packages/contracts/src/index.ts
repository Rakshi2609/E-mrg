export const CALL_STATES = [
  "greeting", "incident_collection", "location_collection", "clarification",
  "triage", "dispatcher_handoff", "completed", "abandoned",
] as const;
export type CallState = (typeof CALL_STATES)[number];

export const SEVERITIES = ["unknown", "low", "moderate", "high", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const EVENT_NAMES = [
  "call.started", "transcript.updated", "incident.updated", "ai.status",
  "cctv.analysis.requested", "cctv.analysis.completed", "cctv.analysis.failed",
  "dispatcher.joined", "dispatcher.left", "call.ended", "system.error",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export interface EventEnvelope<TPayload = unknown> {
  version: 1;
  event_id: string;
  sequence: number;
  occurred_at: string;
  call_id: string;
  event: EventName;
  payload: TPayload;
}

export interface ApiError { code: string; message: string; details?: Record<string, unknown>; }
export interface ApiResponse<T> { success: true; data: T; meta?: Record<string, unknown>; }
export interface ApiErrorResponse { success: false; error: ApiError; }
