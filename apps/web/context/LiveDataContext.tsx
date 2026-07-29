'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type TranscriptLine = { time: string; speaker: 'TARGET_CALLER' | 'COPILOT_SYS'; text: string; };
type SequenceEvent = { id: string; time: string; title: string; isActive?: boolean; };

type Call = { 
  id: string; caller: string; phone: string; type: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; time: string; location: string; status: 'Active' | 'Queued' | 'Resolved'; 
  transcript: TranscriptLine[];
  summary: string;
  sequence: SequenceEvent[];
};
type Incident = { id: string; type: string; location: string; time: string; status: 'Active' | 'Dispatched' | 'Resolved'; severity: string; units: string[]; };
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

  // Simulate incoming data
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newCall: Call = {
          id: `EMRG-2025-0${417 + Math.floor(Math.random()*100)}`,
          caller: 'Unknown', phone: '+1 (555) 000-0000', type: 'Disturbance', severity: 'LOW', time: new Date().toLocaleTimeString(), location: 'Sector 7', status: 'Queued',
          transcript: [
            { time: new Date().toLocaleTimeString(), speaker: 'TARGET_CALLER', text: "There's a lot of noise coming from my neighbor's house." }
          ],
          summary: "Noise complaint / possible disturbance in Sector 7.",
          sequence: [
            { id: 'seq-1', time: 'T-00:00', title: 'Call Received' }
          ]
        };
        setCalls(prev => [newCall, ...prev]);
        setLogs(prev => [{ id: `AL-${Math.floor(Math.random()*1000)}`, time: new Date().toLocaleTimeString(), user: 'System', action: 'New Call Received', resource: newCall.id, status: 'Success' }, ...prev]);
      }
    }, 15000);
    return () => clearInterval(interval);
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
