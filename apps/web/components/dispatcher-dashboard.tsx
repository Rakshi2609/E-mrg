"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EventEnvelope } from "@emergency-ai/contracts";
import { connectDispatcherEvents } from "../lib/websocket";

type EventPayload = Record<string, unknown>;

function payloadOf(event: EventEnvelope | undefined): EventPayload {
  return (event?.payload ?? {}) as EventPayload;
}

export function DispatcherDashboard() {
  const [events, setEvents] = useState<EventEnvelope[]>([]);
  const [connected, setConnected] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [fallbackTimeout, setFallbackTimeout] = useState(10);
  const latest = useMemo(() => events.at(-1), [events]);
  const activeCalls = useMemo(() => [...new Set(events.map((event) => event.call_id))], [events]);
  const selectedEvents = useMemo(() => events.filter((event) => event.call_id === selectedCallId), [events, selectedCallId]);
  const selectedCall = useMemo(() => {
    const latestEvent = selectedEvents.at(-1);
    const started = selectedEvents.find((event) => event.event === "call.started");
    const incident = selectedEvents.filter((event) => event.event === "incident.updated").at(-1);
    const aiStatus = selectedEvents.filter((event) => event.event === "ai.status").at(-1);
    const transcripts = selectedEvents.filter((event) => event.event === "transcript.updated");
    return { latestEvent, started, incident, aiStatus, transcripts };
  }, [selectedEvents]);

  const handleSelectCall = useCallback((callId: string) => setSelectedCallId(callId), []);
  const updateFallbackTimeout = useCallback(async (timeoutSeconds: number): Promise<void> => {
    const value = Math.min(20, Math.max(1, timeoutSeconds || 1));
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/v1/ai/fallback`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timeout_seconds: value }),
    });
    if (response.ok) setFallbackTimeout(value);
  }, []);

  useEffect(() => {
    if (activeCalls.length > 0 && (!selectedCallId || !activeCalls.includes(selectedCallId))) {
      setSelectedCallId(activeCalls.at(-1) ?? null);
    }
  }, [activeCalls, selectedCallId]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let cancelled = false;

    const connect = async (): Promise<void> => {
      let token = window.sessionStorage.getItem("dispatcher_token");
      if (process.env.NODE_ENV === "development") {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/v1/auth/dev-session`, { method: "POST" });
        if (!response.ok) return;
        const session = (await response.json()) as { token: string };
        token = session.token;
        window.sessionStorage.setItem("dispatcher_token", token);
      }
      if (!token || cancelled) return;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const historyResponse = await fetch(`${apiUrl}/api/v1/dashboard/events`, { headers: { Authorization: `Bearer ${token}` } });
      if (historyResponse.ok && !cancelled) {
        setEvents((await historyResponse.json()) as EventEnvelope[]);
      }
      socket = connectDispatcherEvents(token, (event) => setEvents((current) => [...current.slice(-99), event]));
      socket.addEventListener("open", () => setConnected(true));
      socket.addEventListener("close", () => setConnected(false));
    };

    void connect();
    return () => {
      cancelled = true;
      socket?.close();
    };
  }, []);

  const incident = payloadOf(selectedCall.incident);
  const caller = payloadOf(selectedCall.started);
  const ai = payloadOf(selectedCall.aiStatus);

  return <main className="dashboard" aria-labelledby="dashboard-title">
    <header><div><p>Emergency AI Dispatcher Copilot</p><h1 id="dashboard-title">Live operations</h1></div><span aria-live="polite">{connected ? "Connected" : "Offline"}</span></header>
    <section className="grid" aria-label="Dispatcher workspace">
      <article><h2>Active calls</h2><p className="metric">{activeCalls.length}</p><p>Choose a call to inspect its live details.</p><div className="call-list">{activeCalls.map((callId) => <button className={callId === selectedCallId ? "call-button active" : "call-button"} key={callId} onClick={() => handleSelectCall(callId)}>{callId}</button>)}</div></article>
      <article><h2>AI status</h2><p>{latest?.event === "ai.status" ? JSON.stringify(latest.payload) : "Waiting for an active call"}</p></article>
      <article><h2>Incident summary</h2><p>{latest?.event === "incident.updated" ? JSON.stringify(latest.payload) : "No incident selected"}</p></article>
      <article><h2>AI fallback</h2><p>Ollama stays primary. Mistral Cloud starts if it has not replied after the selected time.</p><label className="timeout-control" htmlFor="fallback-timeout">Wait <input id="fallback-timeout" min="1" max="20" type="number" value={fallbackTimeout} onChange={(event) => void updateFallbackTimeout(Number(event.target.value))} /> seconds</label></article>
      <article className="wide call-detail"><h2>Live call detail {selectedCallId ? `· ${selectedCallId}` : ""}</h2>{!selectedCallId ? <p>Waiting for a call.</p> : <><div className="detail-grid"><div><span>Caller</span><strong>{String(caller.caller_number ?? "Unknown")}</strong></div><div><span>Type</span><strong>{String(incident.incident_type ?? "Collecting details")}</strong></div><div><span>Severity</span><strong className={`severity ${String(incident.severity ?? "unknown")}`}>{String(incident.severity ?? "unknown")}</strong></div><div><span>Location</span><strong>{String(incident.location ?? "Not confirmed")}</strong></div><div><span>Victims</span><strong>{String(incident.victims ?? "Unknown")}</strong></div><div><span>Hazards</span><strong>{Array.isArray(incident.hazards) ? incident.hazards.join(", ") || "None reported" : "None reported"}</strong></div><div><span>AI status</span><strong>{String(ai.status ?? "Waiting")}</strong></div><div><span>Confidence</span><strong>{ai.confidence ? `${Math.round(Number(ai.confidence) * 100)}%` : String(incident.ai_confidence ? `${Math.round(Number(incident.ai_confidence) * 100)}%` : " ")}</strong></div></div><p className="call-summary">{String(incident.summary ?? "A structured incident summary will appear as the call progresses.")}</p><div className="detail-columns"><section><h3>Live transcript</h3>{selectedCall.transcripts.length === 0 ? <p>No caller speech captured yet.</p> : <ol>{selectedCall.transcripts.map((event) => <li key={event.event_id}>{String(payloadOf(event).speaker ?? "caller")}: {String(payloadOf(event).message ?? "")}</li>)}</ol>}</section><section><h3>Call timeline</h3><ol>{selectedEvents.slice().reverse().map((event) => <li key={event.event_id}><strong>{event.event}</strong> · {new Date(event.occurred_at).toLocaleTimeString()}</li>)}</ol></section></div></>}</article>
    </section>
  </main>;
}
