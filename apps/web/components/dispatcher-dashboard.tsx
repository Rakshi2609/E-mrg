"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventEnvelope } from "@emergency-ai/contracts";
import { connectDispatcherEvents } from "../lib/websocket";

export function DispatcherDashboard() {
  const [events, setEvents] = useState<EventEnvelope[]>([]);
  const [connected, setConnected] = useState(false);
  const latest = useMemo(() => events.at(-1), [events]);

  useEffect(() => {
    const token = window.sessionStorage.getItem("dispatcher_token");
    if (!token) return;
    const socket = connectDispatcherEvents(token, (event) => setEvents((current) => [...current.slice(-99), event]));
    socket.addEventListener("open", () => setConnected(true));
    socket.addEventListener("close", () => setConnected(false));
    return () => socket.close();
  }, []);

  return <main className="dashboard" aria-labelledby="dashboard-title">
    <header><div><p>Emergency AI Dispatcher Copilot</p><h1 id="dashboard-title">Live operations</h1></div><span aria-live="polite">{connected ? "Connected" : "Offline"}</span></header>
    <section className="grid" aria-label="Dispatcher workspace">
      <article><h2>Active calls</h2><p className="metric">{new Set(events.map((event) => event.call_id)).size}</p><p>Calls currently visible to this dispatcher.</p></article>
      <article><h2>AI status</h2><p>{latest?.event === "ai.status" ? JSON.stringify(latest.payload) : "Waiting for an active call"}</p></article>
      <article><h2>Incident summary</h2><p>{latest?.event === "incident.updated" ? JSON.stringify(latest.payload) : "No incident selected"}</p></article>
      <article className="wide"><h2>Timeline</h2>{events.length === 0 ? <p>No realtime events yet.</p> : <ol>{events.slice().reverse().map((event) => <li key={event.event_id}><strong>{event.event}</strong> · {event.call_id} · sequence {event.sequence}</li>)}</ol>}</article>
    </section>
  </main>;
}
