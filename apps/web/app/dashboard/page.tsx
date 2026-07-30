'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bot, Camera, Clock, MapPin, Navigation, Phone, Radio, ShieldAlert, User, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLiveData } from '../../context/LiveDataContext';

const DynamicMap = dynamic(() => import('../../components/MapComponent'), { ssr: false, loading: () => <div style={{ height: 220, borderRadius: 14, background: 'var(--bg-secondary)' }} /> });

type CameraId = 'camera_1' | 'camera_2';
type Evidence = { id: string; cameraId: CameraId; cameraName: string; detectedSituation: string; urgency: string; confidence: number; hazards: string[]; recommendedResponse: string };

function LiveClock(): React.JSX.Element {
  const [time, setTime] = useState('');
  useEffect(() => { const update = () => setTime(new Date().toLocaleTimeString()); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, []);
  return <span style={{ fontFamily: 'var(--font-mono), monospace' }}>{time || '—'}</span>;
}

function CctvPanel({ incidentId, analyses }: { incidentId: string; analyses: Evidence[] }): React.JSX.Element {
  const [images, setImages] = useState<Partial<Record<CameraId, string>>>({});
  const [running, setRunning] = useState<CameraId | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

  useEffect(() => {
    let active = true; const urls: string[] = [];
    void (async () => { try {
      const login = await fetch(`${apiUrl}/api/v1/auth/dev-session`, { method: 'POST' }); if (!login.ok) return;
      const { token } = await login.json() as { token: string };
      const results = await Promise.all((['camera_1', 'camera_2'] as CameraId[]).map(async (cameraId) => {
        const response = await fetch(`${apiUrl}/api/v1/incidents/${incidentId}/cctv/${cameraId}/image`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) return [cameraId, undefined] as const; const url = URL.createObjectURL(await response.blob()); urls.push(url); return [cameraId, url] as const;
      }));
      if (active) setImages(Object.fromEntries(results.filter((item): item is readonly [CameraId, string] => item[1] !== undefined)));
    } catch { if (active) setMessage('Camera previews are unavailable.'); } })();
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, [apiUrl, incidentId]);

  const analyze = async (cameraId: CameraId): Promise<void> => {
    setRunning(cameraId); setMessage(null);
    try {
      const login = await fetch(`${apiUrl}/api/v1/auth/dev-session`, { method: 'POST' }); const { token } = await login.json() as { token: string };
      const response = await fetch(`${apiUrl}/api/v1/incidents/${incidentId}/cctv/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ camera_id: cameraId }) });
      if (!response.ok) throw new Error((await response.json() as { detail?: string }).detail ?? 'Analysis failed.'); setMessage('Analysis saved. Evidence will update live.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Analysis failed.'); } finally { setRunning(null); }
  };

  return <section style={{ display: 'grid', gap: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '.08em' }}>CCTV EVIDENCE</p><strong style={{ color: 'var(--text-primary)' }}>Static camera feeds</strong></div><Camera size={19} color="var(--accent-red)" /></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{(['camera_1', 'camera_2'] as CameraId[]).map((id, index) => <div key={id} style={{ overflow: 'hidden', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>{images[id] ? <img src={images[id]} alt={`Static camera ${index + 1}`} style={{ width: '100%', height: 112, display: 'block', objectFit: 'cover' }} /> : <div style={{ height: 112, display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Loading feed…</div>}<button onClick={() => void analyze(id)} disabled={running !== null} style={{ width: '100%', border: 0, padding: '9px', fontWeight: 800, color: '#fff', background: 'var(--accent-red)', cursor: running ? 'wait' : 'pointer' }}>{running === id ? 'Analyzing…' : `Analyze Cam ${index + 1}`}</button></div>)}</div>{message && <p role="status" style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12 }}>{message}</p>}{analyses.slice(-2).reverse().map((item) => <div key={item.id} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-secondary)', borderLeft: `3px solid ${item.urgency === 'critical' || item.urgency === 'high' ? 'var(--accent-red)' : '#f59e0b'}` }}><strong style={{ fontSize: 13 }}>{item.cameraName}: {item.detectedSituation}</strong><p style={{ margin: '5px 0', fontSize: 12, color: 'var(--text-secondary)' }}>Hazards: {item.hazards.join(', ') || 'None observed'} · {Math.round(item.confidence * 100)}% confidence</p><small style={{ color: 'var(--text-muted)' }}>{item.recommendedResponse}</small></div>)}</section>;
}

export default function DashboardOverview(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('transcript');
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [showAllCalls, setShowAllCalls] = useState(false);
  const { calls, incidents } = useLiveData();
  const activeCall = calls.find((call) => call.id === selectedCallId) ?? calls.find((call) => call.status === 'Active') ?? calls[0];
  const activeIncident = incidents.find((incident) => incident.id === activeCall?.id);
  // The dispatcher view intentionally uses a two-tier priority model.
  // Non-critical reports are escalated to HIGH rather than displaying LOW or MEDIUM.
  const severity: 'HIGH' | 'CRITICAL' = activeCall?.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
  const severityColor = severity === 'CRITICAL' ? 'var(--accent-red)' : '#f59e0b';
  const latestCallerLine = [...(activeCall?.transcript ?? [])].reverse().find((line) => line.speaker === 'TARGET_CALLER');
  const structuredSummary = activeIncident?.summary || activeCall?.summary || '';
  const conversationSummary = structuredSummary && structuredSummary !== 'Incident details are being collected.'
    ? structuredSummary
    : latestCallerLine
      ? `Latest caller update: ${latestCallerLine.text}`
      : 'Waiting for the caller conversation to provide incident details.';
  const visibleCalls = showAllCalls ? calls : calls.slice(0, 4);
  const hiddenCallCount = Math.max(calls.length - 4, 0);
  const dispatch = async (): Promise<void> => { if (!activeCall) return; setDispatchStatus('Starting dispatcher call…'); const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'; const login = await fetch(`${apiUrl}/api/v1/auth/dev-session`, { method: 'POST' }); const { token } = await login.json() as { token: string }; const response = await fetch(`${apiUrl}/api/v1/dispatch/call`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ incident_id: activeCall.id, incident_type: activeCall.type, severity, location: activeCall.location, victims: String(activeIncident?.victims ?? 'Unknown'), hazards: activeIncident?.hazards ?? [], summary: conversationSummary }) }); setDispatchStatus(response.ok ? 'Dispatcher call started.' : 'Dispatcher call failed.'); };

  if (!activeCall) return <main style={{ padding: 32, color: 'var(--text-secondary)' }}>Waiting for a reported incident…</main>;

  return <main style={{ maxWidth: 1680, height: 'calc(100vh - 64px)', overflowY: 'auto', paddingRight: 8, scrollbarWidth: 'thin', margin: '0 auto', display: 'grid', gap: 20 }}>
    <header style={{ padding: '20px 24px', borderRadius: 18, color: '#fff', background: 'linear-gradient(115deg, #121a2d, #20233b)', boxShadow: '0 18px 40px rgba(15,23,42,.16)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}><div><p style={{ margin: 0, color: '#fca5a5', fontSize: 12, fontWeight: 800, letterSpacing: '.1em' }}>LIVE EMERGENCY OPERATIONS</p><h1 style={{ margin: '6px 0 0', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>{activeCall.type}</h1><p style={{ margin: '5px 0 0', color: '#cbd5e1' }}>{activeCall.location} · {activeCall.id}</p></div><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ padding: '8px 12px', borderRadius: 99, background: 'rgba(255,255,255,.1)', fontFamily: 'var(--font-mono), monospace' }}><Radio size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: '#f87171' }} /><LiveClock /></span><button onClick={() => void dispatch()} style={{ border: 0, borderRadius: 10, background: '#ef4444', color: '#fff', padding: '11px 15px', fontWeight: 800, cursor: 'pointer' }}>Dispatch response</button></div></div>{dispatchStatus && <p role="status" style={{ margin: '12px 0 0', color: '#fecaca' }}>{dispatchStatus}</p>}</header>
    <nav aria-label="Switch active call" style={{ padding: 14, borderRadius: 14, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}><strong>Switch active call</strong><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{calls.length} calls available</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
        {visibleCalls.map((call) => {
          const isSelected = call.id === activeCall.id;
          return <button key={call.id} type="button" aria-pressed={isSelected} onClick={() => { setSelectedCallId(call.id); setActiveTab('transcript'); setDispatchStatus(null); }} style={{ minWidth: 0, textAlign: 'left', borderRadius: 12, padding: '12px 14px', border: isSelected ? '2px solid var(--accent-red)' : '1px solid var(--border-color)', background: isSelected ? '#fff1f2' : 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', boxShadow: isSelected ? '0 4px 12px rgba(239,68,68,.12)' : 'none' }}><span style={{ display: 'block', fontSize: 12, color: call.status === 'Active' ? '#16a34a' : 'var(--text-muted)', fontWeight: 800 }}>● {call.status.toUpperCase()}</span><strong style={{ display: 'block', marginTop: 4, fontSize: 14 }}>{call.type}</strong><span style={{ display: 'block', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-secondary)' }}>{call.location}</span></button>;
        })}
      </div>
      {hiddenCallCount > 0 && <button type="button" onClick={() => setShowAllCalls((showAll) => !showAll)} style={{ display: 'block', width: '100%', marginTop: 10, padding: '10px 14px', borderRadius: 10, border: '1px dashed var(--accent-red)', background: '#fff7f7', color: '#be123c', cursor: 'pointer', fontWeight: 800, fontSize: 14 }}>{showAllCalls ? 'Show fewer calls' : `+${hiddenCallCount} more calls`}</button>}
    </nav>
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>
      <aside style={{ display: 'grid', gap: 16 }}>
        <section style={{ padding: 18, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '.08em' }}>CALLER & LOCATION</p>
          <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
            {[[Phone, activeCall.phone], [User, activeCall.caller], [MapPin, activeCall.location]].map(([Icon, value], index) => {
              const Component = Icon as typeof Phone;
              return <div key={index} style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span style={{ padding: 8, borderRadius: 9, background: 'var(--bg-secondary)' }}><Component size={17} color="var(--accent-red)" /></span><strong style={{ fontSize: 14 }}>{String(value)}</strong></div>;
            })}
          </div>
        </section>
        <section style={{ padding: 18, borderRadius: 16, background: 'linear-gradient(145deg, #fff7f7, var(--card-bg))', border: '1px solid #fecdd3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Bot size={18} color="var(--accent-red)" /><p style={{ margin: 0, fontSize: 12, color: '#be123c', fontWeight: 800, letterSpacing: '.08em' }}>AI INCIDENT SUMMARY</p></div>
          <p style={{ margin: '12px 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.55 }}>{conversationSummary}</p>
          <small style={{ display: 'block', marginTop: 10, color: 'var(--text-muted)' }}>Review and verify before dispatching.</small>
        </section>
        <section style={{ padding: 18, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '.08em' }}>INCIDENT PRIORITY</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}><strong style={{ fontSize: 24, color: severityColor }}>{severity}</strong><AlertTriangle size={25} color={severityColor} /></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{(activeIncident?.hazards ?? []).map((hazard) => <span key={hazard} style={{ padding: '5px 8px', borderRadius: 99, background: '#fff1f2', color: '#be123c', fontSize: 12, fontWeight: 700 }}>{hazard}</span>)}</div>
        </section>
      </aside>
      <section style={{ minHeight: 610, display: 'grid', gridTemplateRows: 'auto 1fr auto', borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}><div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>{(['transcript', 'summary'] as const).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: 14, textTransform: 'capitalize', border: 0, borderBottom: activeTab === tab ? '3px solid var(--accent-red)' : '3px solid transparent', background: 'transparent', color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer' }}>{tab === 'transcript' ? 'Live transcript' : 'AI summary'}</button>)}</div><div style={{ padding: 20, overflowY: 'auto', display: 'grid', alignContent: 'start', gap: 12 }}>{activeTab === 'transcript' ? activeCall.transcript.map((line, index) => <div key={`${line.time}-${index}`} style={{ maxWidth: '88%', justifySelf: line.speaker === 'COPILOT_SYS' ? 'end' : 'start', padding: '12px 14px', borderRadius: line.speaker === 'COPILOT_SYS' ? '14px 14px 2px 14px' : '14px 14px 14px 2px', background: line.speaker === 'COPILOT_SYS' ? '#fff1f2' : 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}><strong style={{ fontSize: 11, color: line.speaker === 'COPILOT_SYS' ? '#be123c' : 'var(--text-secondary)' }}>{line.speaker === 'COPILOT_SYS' ? 'AI COPILOT' : 'CALLER'} · {line.time}</strong><p style={{ margin: '5px 0 0', lineHeight: 1.5 }}>{line.text}</p></div>) : <div style={{ padding: 20, borderRadius: 14, background: 'var(--bg-secondary)' }}><Bot color="var(--accent-red)" /><h2 style={{ marginBottom: 8 }}>AI incident synthesis</h2><p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{conversationSummary}</p>{latestCallerLine && <p style={{ margin: '14px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>Updated from caller conversation at {latestCallerLine.time}.</p>}</div>}</div><div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 12 }}><span><Radio size={13} style={{ verticalAlign: 'middle', color: 'var(--accent-red)' }} /> Live intake active</span><span>Human approval required</span></div></section>
      <aside style={{ display: 'grid', gap: 16 }}><section style={{ padding: 16, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><strong>Incident map</strong><Navigation size={18} color="var(--accent-red)" /></div><DynamicMap minimap incidents={activeIncident ? [activeIncident] : activeCall ? [{ id: activeCall.id, type: activeCall.type, location: activeCall.location, severity: activeCall.severity, status: activeCall.status }] : []} /><p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{activeCall.location}</p></section>{activeIncident && <section style={{ padding: 16, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}><CctvPanel incidentId={activeIncident.id} analyses={activeIncident.cctvAnalyses} /></section>}<section style={{ padding: 16, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><ShieldAlert size={18} color="var(--accent-red)" /><strong>Response guidance</strong></div><p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>Verify AI findings, confirm caller location, then dispatch the required response unit.</p></section></aside>
    </section>
  </main>;
}
