'use client';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { EventEnvelope } from '@emergency-ai/contracts';
import { connectDispatcherEvents } from '../lib/websocket';

type TranscriptLine = { time: string; speaker: 'TARGET_CALLER' | 'COPILOT_SYS'; text: string; };
type SequenceEvent = { id: string; time: string; title: string; isActive?: boolean; };

type Call = { 
  id: string; caller: string; phone: string; type: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; time: string; location: string; status: 'Active' | 'Queued' | 'Resolved' | 'Ringing';
  transcript: TranscriptLine[];
  summary: string;
  sequence: SequenceEvent[];
};
type Incident = { id: string; type: string; location: string; time: string; status: 'Active' | 'Dispatched' | 'Resolved'; severity: string; units: string[]; latitude?: number; longitude?: number; victims?: number; hazards?: string[]; summary?: string; confidence?: number; transcript?: TranscriptLine[]; };
type Log = { id: string; time: string; user: string; action: string; resource: string; status: 'Success' | 'Failed'; };
type Note = { id: string; title: string; content: string; author: string; date: string; color: string; };

interface LiveDataContextType {
  calls: Call[];
  incidents: Incident[];
  logs: Log[];
  notes: Note[];
  dispatchUnit: (incidentId: string, unit: string) => void;
  resolveIncident: (incidentId: string) => void;
  addNote: (note: Omit<Note, 'id' | 'date'>) => void;
}

const defaultCalls: Call[] = [
  { id: 'EMRG-2025-0415', caller: 'John D.', phone: '+1 (555) 234-5678', type: 'Traffic Accident', severity: 'CRITICAL', time: '10:18:35 AM', location: 'Springfield, IL', status: 'Active',
    transcript: [
      { time: '10:21:03:44', speaker: 'TARGET_CALLER', text: "I think there's been a car accident... Two cars hit each other near the Main Street and 5th Avenue." },
      { time: '10:21:08:12', speaker: 'COPILOT_SYS', text: "I'm sorry to hear that. Are there any injuries?" },
      { time: '10:21:15:01', speaker: 'TARGET_CALLER', text: "Yes, at least one person is hurt. They are bleeding." }
    ],
    summary: "Two-vehicle collision reported near the intersection of Main Street and 5th Avenue. Caller indicates at least one person is injured and bleeding. The vehicles are currently blocking the roadway. Dispatching EMS and Police units immediately for medical assistance and traffic control.",
    sequence: [
      { id: 'seq-1', time: 'T-00:00', title: 'Intercept Initiated' },
      { id: 'seq-2', time: 'T+00:27', title: 'AI Copilot Engaged' },
    ]
  },
  { id: 'EMRG-2025-0416', caller: 'Sarah M.', phone: '+1 (555) 987-6543', type: 'Medical Emergency', severity: 'HIGH', time: '10:25:00 AM', location: 'Oakhaven', status: 'Queued',
    transcript: [
      { time: '10:25:01:10', speaker: 'TARGET_CALLER', text: "My husband just collapsed, he's clutching his chest!" },
      { time: '10:25:05:00', speaker: 'COPILOT_SYS', text: "Help is on the way. Is he breathing?" }
    ],
    summary: "Possible cardiac arrest. Caller's husband collapsed and is clutching his chest.",
    sequence: [
      { id: 'seq-1', time: 'T-00:00', title: 'Intercept Initiated' }
    ]
  },
];

const defaultIncidents: Incident[] = [
  { id: 'INC-2025-881', type: 'Structure Fire', location: '742 Evergreen Terrace', time: '10:15:00 AM', status: 'Active', severity: 'CRITICAL', units: ['Engine 4', 'Ladder 2'] },
  { id: 'INC-2025-882', type: 'Traffic Collision', location: 'I-95 Northbound', time: '10:20:00 AM', status: 'Dispatched', severity: 'HIGH', units: ['Unit 42', 'Ambulance 3'] },
];

const defaultLogs: Log[] = [
  { id: 'AL-901', user: 'System', action: 'Automated Backup', resource: 'Database', status: 'Success', time: new Date().toLocaleTimeString() },
  { id: 'AL-902', user: 'Arjun S.', action: 'Dispatched Unit', resource: 'Unit 42', status: 'Success', time: new Date().toLocaleTimeString() },
];

const defaultNotes: Note[] = [
  { id: '1', title: 'Shift Handover', content: 'Sector 4 is experiencing heavy traffic.', author: 'Sarah J.', date: 'Today, 08:00 AM', color: 'var(--accent-red-light)' },
];

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

export function LiveDataProvider({ children }: { children: React.ReactNode }) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const dispatchUnit = (incidentId: string, unit: string) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: 'Dispatched', units: [...inc.units, unit] } : inc));
    setLogs(prev => [{ id: `AL-${Math.floor(Math.random()*1000)}`, time: new Date().toLocaleTimeString(), user: 'Current User', action: 'Dispatch Unit', resource: unit, status: 'Success' }, ...prev]);
  };

  const resolveIncident = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: 'Resolved' } : inc));
    setLogs(prev => [{ id: `AL-${Math.floor(Math.random()*1000)}`, time: new Date().toLocaleTimeString(), user: 'Current User', action: 'Resolve Incident', resource: incidentId, status: 'Success' }, ...prev]);
  };

  const addNote = (note: Omit<Note, 'id' | 'date'>) => {
    setNotes(prev => [{ ...note, id: Math.random().toString(), date: new Date().toLocaleTimeString() }, ...prev]);
  };

  const eventHistory = useRef<EventEnvelope[]>([]);

  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | null = null;
    const projectEvents = (events: EventEnvelope[]): void => {
      eventHistory.current = events;
      const grouped = new Map<string, EventEnvelope[]>();
      events.forEach((event) => grouped.set(event.call_id, [...(grouped.get(event.call_id) ?? []), event]));
      const payload = (event: EventEnvelope | undefined): Record<string, unknown> => (event?.payload ?? {}) as Record<string, unknown>;
      const nextCalls: Call[] = [...grouped.entries()].map(([id, callEvents]) => {
        const started = callEvents.find((event) => event.event === 'call.started');
        const incident = [...callEvents].reverse().find((event) => event.event === 'incident.updated');
        const ended = callEvents.some((event) => event.event === 'call.ended');
        const start = payload(started);
        const details = payload(incident);
        const severity = String(details.severity ?? 'unknown').toUpperCase();
        const transcript = callEvents.filter((event) => event.event === 'transcript.updated').map((event) => {
          const item = payload(event);
          return { time: new Date(event.occurred_at).toLocaleTimeString(), speaker: item.speaker === 'assistant' ? 'COPILOT_SYS' as const : 'TARGET_CALLER' as const, text: String(item.message ?? '') };
        });
        return { id, caller: 'Caller', phone: String(start.caller_number ?? 'Unknown'), type: String(details.incident_type ?? 'Collecting details'), severity: (['CRITICAL', 'HIGH', 'MEDIUM'].includes(severity) ? severity : 'LOW') as Call['severity'], time: started ? new Date(started.occurred_at).toLocaleTimeString() : '', location: String(details.location ?? 'Not confirmed'), status: ended ? 'Resolved' : 'Active', transcript, summary: String(details.summary ?? 'Incident details are being collected.'), sequence: callEvents.map((event) => ({ id: event.event_id, time: new Date(event.occurred_at).toLocaleTimeString(), title: event.event })) };
      });
      const nextIncidents: Incident[] = [...grouped.entries()].flatMap(([id, callEvents]) => {
        const incidentEvent = [...callEvents].reverse().find((event) => event.event === 'incident.updated');
        if (!incidentEvent) return [];
        const item = payload(incidentEvent);
        const ended = callEvents.some((event) => event.event === 'call.ended');
        const handoff = callEvents.some((event) => event.event === 'ai.status' && String(payload(event).status) === 'handoff_requested');
        const incidentType = String(item.incident_type ?? 'Unknown');
        const hazards = Array.isArray(item.hazards) ? item.hazards.map(String) : [];
        const units = /fire|smoke|gas/i.test(`${incidentType} ${hazards.join(' ')}`) ? ['Fire Engine', 'Fire Brigade'] : /medical|injur|collapse/i.test(incidentType) ? ['Ambulance', 'EMS'] : ['Emergency Response Unit'];
        return [{ id, type: String(item.incident_type ?? 'Unknown'), location: String(item.location ?? 'Not confirmed'), time: new Date(incidentEvent.occurred_at).toLocaleTimeString(), status: handoff ? 'Dispatched' : ended ? 'Resolved' : 'Active', severity: String(item.severity ?? 'unknown').toUpperCase(), units, latitude: Number(item.latitude) || undefined, longitude: Number(item.longitude) || undefined, victims: Number(item.victims) || undefined, hazards: Array.isArray(item.hazards) ? item.hazards.map(String) : [], summary: String(item.summary ?? item.reply ?? ''), confidence: Number(item.ai_confidence ?? item.confidence) || undefined, transcript: nextCalls.find((call) => call.id === id)?.transcript ?? [] }];
      });
      const nextLogs: Log[] = events.slice().reverse().map((event) => ({ id: event.event_id, time: new Date(event.occurred_at).toLocaleTimeString(), user: event.event.startsWith('ai.') ? 'AI Copilot' : 'System', action: event.event, resource: event.call_id, status: 'Success' }));
      if (!cancelled) { setCalls(nextCalls); setIncidents(nextIncidents); setLogs(nextLogs); }
    };
    const connect = async (): Promise<void> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
      const login = await fetch(`${apiUrl}/api/v1/auth/dev-session`, { method: 'POST' });
      if (!login.ok || cancelled) return;
      const session = (await login.json()) as { token: string };
      const history = await fetch(`${apiUrl}/api/v1/dashboard/events`, { headers: { Authorization: `Bearer ${session.token}` } });
      if (history.ok) projectEvents((await history.json()) as EventEnvelope[]);
      socket = connectDispatcherEvents(session.token, (event) => projectEvents([...eventHistory.current, event]));
    };
    void connect();
    return () => { cancelled = true; socket?.close(); };
  }, []);

  return (
    <LiveDataContext.Provider value={{ calls, incidents, logs, notes, dispatchUnit, resolveIncident, addNote }}>
      {children}
    </LiveDataContext.Provider>
  );
}

export function useLiveData() {
  const context = useContext(LiveDataContext);
  if (context === undefined) throw new Error('useLiveData must be used within a LiveDataProvider');
  return context;
}
