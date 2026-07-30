'use client';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { EventEnvelope } from '@emergency-ai/contracts';
import { connectDispatcherEvents } from '../lib/websocket';

type TranscriptLine = { time: string; speaker: 'TARGET_CALLER' | 'COPILOT_SYS'; text: string; };
type SequenceEvent = { id: string; time: string; title: string; isActive?: boolean; };
type CctvAnalysis = { id: string; cameraId: 'camera_1' | 'camera_2'; cameraName: string; analyzedAt: string; model: string; detectedSituation: string; urgency: 'low' | 'medium' | 'high' | 'critical'; peopleEstimate?: number; vehiclesEstimate?: number; hazards: string[]; recommendedResponse: string; confidence: number; rationale: string; };

type Call = { 
  id: string; caller: string; phone: string; type: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; time: string; location: string; status: 'Active' | 'Queued' | 'Resolved' | 'Ringing';
  transcript: TranscriptLine[];
  summary: string;
  sequence: SequenceEvent[];
};
type Incident = { id: string; type: string; location: string; time: string; status: 'Active' | 'Dispatched' | 'Resolved'; severity: string; units: string[]; latitude?: number; longitude?: number; victims?: number; hazards?: string[]; summary?: string; confidence?: number; transcript?: TranscriptLine[]; cctvAnalyses: CctvAnalysis[]; };
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
  { id: 'EMRG-2025-0415', caller: 'Rahul M.', phone: '+91 98765 43210', type: 'Traffic Accident', severity: 'CRITICAL', time: '10:18:35 AM', location: 'Connaught Place, New Delhi', status: 'Active',
    transcript: [
      { time: '10:21:03:44', speaker: 'TARGET_CALLER', text: "I think there's been a car accident... Two cars hit each other near Connaught Place inner circle." },
      { time: '10:21:08:12', speaker: 'COPILOT_SYS', text: "I'm sorry to hear that. Are there any injuries?" },
      { time: '10:21:15:01', speaker: 'TARGET_CALLER', text: "Yes, at least one person is hurt. They are bleeding." }
    ],
    summary: "Two-vehicle collision reported near Connaught Place inner circle. Caller indicates at least one person is injured and bleeding. The vehicles are currently blocking the roadway. Dispatching EMS and Police units immediately for medical assistance and traffic control.",
    sequence: [
      { id: 'seq-1', time: 'T-00:00', title: 'Intercept Initiated' },
      { id: 'seq-2', time: 'T+00:27', title: 'AI Copilot Engaged' },
    ]
  },
  { id: 'EMRG-2025-0416', caller: 'Priya K.', phone: '+91 98765 00000', type: 'Medical Emergency', severity: 'HIGH', time: '10:25:00 AM', location: 'Koramangala, Bengaluru', status: 'Queued',
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
  { id: 'INC-2025-881', type: 'Structure Fire', location: 'Indiranagar 100ft Road, Bengaluru', time: '10:15:00 AM', status: 'Active', severity: 'CRITICAL', units: ['Fire Tender 4', 'Rescue 2'], cctvAnalyses: [] },
  { id: 'INC-2025-882', type: 'Traffic Collision', location: 'NH48 Highway, Delhi-Jaipur Expressway', time: '10:20:00 AM', status: 'Dispatched', severity: 'HIGH', units: ['PCR Van 42', 'Ambulance 3'], cctvAnalyses: [] },
  { id: 'INC-2025-883', type: 'Medical Emergency', location: 'Marine Drive, Mumbai', time: '10:30:00 AM', status: 'Active', severity: 'HIGH', units: ['Ambulance 12'], cctvAnalyses: [] },
  { id: 'INC-2025-884', type: 'Armed Robbery', location: 'T Nagar, Chennai', time: '10:45:00 AM', status: 'Active', severity: 'CRITICAL', units: [], cctvAnalyses: [] },
  { id: 'INC-2025-885', type: 'Gas Leak', location: 'Banjara Hills, Hyderabad', time: '11:00:00 AM', status: 'Active', severity: 'CRITICAL', units: ['Fire Tender 1', 'Hazmat 3'], cctvAnalyses: [] },
  { id: 'INC-2025-886', type: 'Public Disturbance', location: 'Park Street, Kolkata', time: '11:15:00 AM', status: 'Resolved', severity: 'LOW', units: ['PCR Van 18'], cctvAnalyses: [] },
];

const defaultLogs: Log[] = [
  { id: 'AL-901', user: 'System', action: 'Automated Backup', resource: 'Database', status: 'Success', time: new Date().toLocaleTimeString() },
  { id: 'AL-902', user: 'Arjun S.', action: 'Dispatched Unit', resource: 'Unit 42', status: 'Success', time: new Date().toLocaleTimeString() },
];

const defaultNotes: Note[] = [
  { id: '1', title: 'Shift Handover', content: 'Sector 4 is experiencing heavy traffic.', author: 'Sanya J.', date: 'Today, 08:00 AM', color: 'var(--accent-red-light)' },
];

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

export function LiveDataProvider({ children }: { children: React.ReactNode }) {
  const [calls, setCalls] = useState<Call[]>(defaultCalls);
  const [incidents, setIncidents] = useState<Incident[]>(defaultIncidents);
  const [logs, setLogs] = useState<Log[]>(defaultLogs);
  const [notes, setNotes] = useState<Note[]>(defaultNotes);

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
      const liveCalls: Call[] = [...grouped.entries()].map(([id, callEvents]) => {
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
      // Keep real calls first while preserving the built-in call cards for the
      // dashboard demo when the event stream only contains one active call.
      const nextCalls: Call[] = [
        ...liveCalls,
        ...defaultCalls.filter((defaultCall) => !liveCalls.some((liveCall) => liveCall.id === defaultCall.id)),
      ];
      const nextIncidents: Incident[] = [
        ...[...grouped.entries()].flatMap(([id, callEvents]) => {
          const incidentEvent = [...callEvents].reverse().find((event) => event.event === 'incident.updated');
          if (!incidentEvent) return [];
          const item = payload(incidentEvent);
          const ended = callEvents.some((event) => event.event === 'call.ended');
          const handoff = callEvents.some((event) => event.event === 'ai.status' && String(payload(event).status) === 'handoff_requested');
          const incidentType = String(item.incident_type ?? 'Unknown');
          const hazards = Array.isArray(item.hazards) ? item.hazards.map(String) : [];
          const units = /fire|smoke|gas/i.test(`${incidentType} ${hazards.join(' ')}`) ? ['Fire Tender', 'Rescue Unit'] : /medical|injur|collapse/i.test(incidentType) ? ['Ambulance', 'Paramedics'] : ['PCR Van'];
          const latitude = Number(item.latitude);
          const longitude = Number(item.longitude);
          const cctvAnalyses = callEvents.flatMap((event): CctvAnalysis[] => {
            if (event.event !== 'cctv.analysis.completed') return [];
            const evidence = payload(event);
            const analysis = (evidence.analysis ?? {}) as Record<string, unknown>;
            const confidence = Number(analysis.confidence);
            return [{ id: event.event_id, cameraId: evidence.camera_id === 'camera_2' ? 'camera_2' : 'camera_1', cameraName: String(evidence.camera_name ?? 'Camera'), analyzedAt: String(evidence.analyzed_at ?? event.occurred_at), model: String(evidence.model ?? 'Ollama'), detectedSituation: String(analysis.detected_situation ?? 'No finding returned.'), urgency: ['low', 'medium', 'high', 'critical'].includes(String(analysis.urgency)) ? String(analysis.urgency) as CctvAnalysis['urgency'] : 'medium', peopleEstimate: Number.isFinite(Number(analysis.people_estimate)) ? Number(analysis.people_estimate) : undefined, vehiclesEstimate: Number.isFinite(Number(analysis.vehicles_estimate)) ? Number(analysis.vehicles_estimate) : undefined, hazards: Array.isArray(analysis.hazards) ? analysis.hazards.map(String) : [], recommendedResponse: String(analysis.recommended_response ?? 'Dispatcher review required.'), confidence: Number.isFinite(confidence) ? confidence : 0, rationale: String(analysis.rationale ?? '') }];
          });
          return [{ id, type: String(item.incident_type ?? 'Unknown'), location: String(item.location ?? 'Not confirmed'), time: new Date(incidentEvent.occurred_at).toLocaleTimeString(), status: (handoff ? 'Dispatched' : ended ? 'Resolved' : 'Active') as Incident['status'], severity: String(item.severity ?? 'unknown').toUpperCase(), units, latitude: Number.isFinite(latitude) ? latitude : undefined, longitude: Number.isFinite(longitude) ? longitude : undefined, victims: Number(item.victims) || undefined, hazards: Array.isArray(item.hazards) ? item.hazards.map(String) : [], summary: String(item.summary ?? item.reply ?? ''), confidence: Number(item.ai_confidence ?? item.confidence) || undefined, transcript: nextCalls.find((call) => call.id === id)?.transcript ?? [], cctvAnalyses }];
        }),
        ...defaultIncidents.filter((defaultInc) => !liveCalls.some((liveCall) => liveCall.id === defaultInc.id))
      ];
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
