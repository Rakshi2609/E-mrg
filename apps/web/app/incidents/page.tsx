'use client';
import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';

type CameraId = 'camera_1' | 'camera_2';

function CctvEvidencePanel({ incidentId, analyses }: { incidentId: string; analyses: Array<{ id: string; cameraId: CameraId; cameraName: string; analyzedAt: string; model: string; detectedSituation: string; urgency: string; peopleEstimate?: number; vehiclesEstimate?: number; hazards: string[]; recommendedResponse: string; confidence: number; rationale: string; }> }) {
  const [images, setImages] = useState<Partial<Record<CameraId, string>>>({});
  const [runningCamera, setRunningCamera] = useState<CameraId | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

  useEffect(() => {
    let active = true;
    const objectUrls: string[] = [];
    const loadPreviews = async (): Promise<void> => {
      try {
        const login = await fetch(`${apiUrl}/api/v1/auth/dev-session`, { method: 'POST' });
        if (!login.ok) return;
        const { token } = await login.json() as { token: string };
        const previews = await Promise.all((['camera_1', 'camera_2'] as CameraId[]).map(async (cameraId) => {
          const response = await fetch(`${apiUrl}/api/v1/incidents/${incidentId}/cctv/${cameraId}/image`, { headers: { Authorization: `Bearer ${token}` } });
          if (!response.ok) return [cameraId, undefined] as const;
          const url = URL.createObjectURL(await response.blob());
          objectUrls.push(url);
          return [cameraId, url] as const;
        }));
        if (active) setImages(Object.fromEntries(previews.filter((item): item is readonly [CameraId, string] => item[1] !== undefined)));
      } catch { if (active) setMessage('Camera previews are unavailable.'); }
    };
    void loadPreviews();
    return () => { active = false; objectUrls.forEach((url) => URL.revokeObjectURL(url)); };
  }, [apiUrl, incidentId]);

  const analyze = async (cameraId: CameraId): Promise<void> => {
    setRunningCamera(cameraId);
    setMessage(null);
    try {
      const login = await fetch(`${apiUrl}/api/v1/auth/dev-session`, { method: 'POST' });
      if (!login.ok) throw new Error('Unable to start an authenticated analysis.');
      const { token } = await login.json() as { token: string };
      const response = await fetch(`${apiUrl}/api/v1/incidents/${incidentId}/cctv/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ camera_id: cameraId }) });
      if (!response.ok) throw new Error((await response.json() as { detail?: string }).detail ?? 'CCTV analysis failed.');
      setMessage('Analysis saved. The evidence card will update live.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'CCTV analysis failed.'); }
    finally { setRunningCamera(null); }
  };

  return <section style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
    <h3 style={{ margin: '0 0 0.25rem' }}>CCTV evidence</h3>
    <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Camera feeds and analytics</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
      {(['camera_1', 'camera_2'] as CameraId[]).map((cameraId, index) => <div key={cameraId} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        {images[cameraId] ? <img src={images[cameraId]} alt={`Camera ${index + 1} CCTV feed`} style={{ display: 'block', width: '100%', height: '140px', objectFit: 'cover' }} /> : <div style={{ height: '140px', display: 'grid', placeItems: 'center', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading camera…</div>}
        <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}><strong>Camera {index + 1}</strong><button onClick={() => void analyze(cameraId)} disabled={runningCamera !== null} style={{ background: 'var(--accent-red)', color: '#fff', border: 0, borderRadius: '6px', padding: '0.4rem 0.6rem', fontWeight: 700, cursor: runningCamera ? 'wait' : 'pointer', opacity: runningCamera && runningCamera !== cameraId ? 0.6 : 1 }}>{runningCamera === cameraId ? 'Analyzing…' : 'Analyze'}</button></div>
      </div>)}
    </div>
    {message && <p role="status" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p>}
    {analyses.length > 0 && <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>{analyses.slice().reverse().map((analysis) => <article key={analysis.id} style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0.85rem' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><strong>{analysis.cameraName}: {analysis.detectedSituation}</strong><span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, color: analysis.urgency === 'critical' || analysis.urgency === 'high' ? 'var(--accent-red)' : 'var(--text-secondary)' }}>{analysis.urgency}</span></div><p style={{ margin: '0.5rem 0', fontSize: '0.85rem' }}>{analysis.rationale}</p><p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}><strong>Hazards:</strong> {analysis.hazards.join(', ') || 'None observed'} · <strong>Recommended:</strong> {analysis.recommendedResponse} · <strong>Confidence:</strong> {Math.round(analysis.confidence * 100)}%</p><small style={{ color: 'var(--text-muted)' }}>{new Date(analysis.analyzedAt).toLocaleString()} · {analysis.model}</small></article>)}</div>}
  </section>;
}

export default function IncidentsPage() {
  const { incidents } = useLiveData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const selected = incidents.find((incident) => incident.id === selectedId);
  const dispatchSelected = async (): Promise<void> => {
    if (!selected) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const login = await fetch(`${apiUrl}/api/v1/auth/dev-session`, { method: 'POST' });
    const session = (await login.json()) as { token: string };
    const response = await fetch(`${apiUrl}/api/v1/dispatch/call`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` }, body: JSON.stringify({ incident_id: selected.id, incident_type: selected.type, severity: selected.severity, location: selected.location, victims: String(selected.victims ?? 'Unknown'), hazards: selected.hazards ?? [], summary: selected.summary ?? '' }) });
    setDispatchStatus(response.ok ? 'Dispatcher call started.' : (await response.json()).detail ?? 'Dispatcher call failed.');
  };


  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedIncidents = filteredIncidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Active Incidents</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Overview of all ongoing emergency responses.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search incidents..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}
          />
          <select 
            value={severityFilter} 
            onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button style={{ background: 'var(--text-primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', color: 'var(--card-bg)', fontWeight: 600, cursor: 'pointer' }}>+ New Incident</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {paginatedIncidents.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No incidents match your criteria.</p>}
        {paginatedIncidents.map((inc, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{inc.type}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{inc.id}</span>
              </div>
              <span className="hero-badge" style={{ 
                margin: 0, padding: '4px 10px', fontSize: '0.75rem', 
                background: inc.severity.toLowerCase() === 'critical' || inc.severity.toLowerCase() === 'high' ? 'var(--accent-red-light)' : inc.severity.toLowerCase() === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)',
                color: inc.severity.toLowerCase() === 'critical' || inc.severity.toLowerCase() === 'high' ? 'var(--accent-red)' : inc.severity.toLowerCase() === 'medium' ? '#d97706' : 'var(--text-secondary)',
                borderColor: 'transparent', boxShadow: 'none'
              }}>
                {inc.severity}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <MapPin size={16} /> {inc.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Clock size={16} /> Reported at {inc.time}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Users size={16} /> {inc.units.length} Units Dispatched
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}><strong>Transcript snippet:</strong> {inc.transcript?.length ? `${inc.transcript.at(-1)?.text}` : 'Waiting for audio...'}</div>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '-10px' }}>
                {inc.units.map((_, u) => (
                  <div key={u} style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-tertiary)', border: '2px solid var(--card-bg)', marginLeft: u > 0 ? '-8px' : '0' }}></div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><button onClick={() => setSelectedId(inc.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                View Details <ArrowRight size={14} />
              </button><button onClick={() => setSelectedId(inc.id)} style={{ background: 'var(--accent-red)', color: '#fff', border: 0, borderRadius: '6px', padding: '0.45rem 0.65rem', fontWeight: 700, cursor: 'pointer' }}>Dispatch</button></div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </div>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}

      {selected && <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setSelectedId(null)}>
        <article onClick={(event) => event.stopPropagation()} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '2rem', width: 'min(680px, 92vw)', maxHeight: '82vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><div><h2 style={{ margin: 0 }}>{selected.type}</h2><p style={{ color: 'var(--text-muted)' }}>{selected.id}</p></div><button onClick={() => setSelectedId(null)} aria-label="Close details">Close</button></div>
          <p>{selected.summary || 'Awaiting incident summary.'}</p>{selected.status === 'Dispatched' && <p style={{ color: 'var(--accent-red)', fontWeight: 700 }}>Handoff recorded. Unit dispatch still requires dispatcher action.</p>}
          <h3>Conversation transcript</h3>
          {selected.transcript?.length ? <ol>{selected.transcript.map((line, index) => <li key={`${line.time}-${index}`}><strong>{line.speaker === 'COPILOT_SYS' ? 'Dispatcher' : 'Caller'}:</strong> {line.text} <small>{line.time}</small></li>)}</ol> : <p>Waiting for audio stream.</p>}
          <button onClick={() => void dispatchSelected()} style={{ background: 'var(--accent-red)', color: 'white', border: 0, borderRadius: '8px', padding: '0.75rem 1rem', fontWeight: 700, cursor: 'pointer' }}>Call dispatcher</button>{dispatchStatus && <p role="status">{dispatchStatus}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}><div><strong>Location</strong><p>{selected.location}</p></div><div><strong>Status</strong><p>{selected.status}</p></div><div><strong>Severity</strong><p>{selected.severity}</p></div><div><strong>Victims</strong><p>{selected.victims ?? 'Unknown'}</p></div><div><strong>Recommended response</strong><p>{selected.units.join(', ')}</p></div><div><strong>Hazards</strong><p>{selected.hazards?.join(', ') || 'None reported'}</p></div><div><strong>AI confidence</strong><p>{selected.confidence ? `${Math.round(selected.confidence * 100)}%` : 'Unknown'}</p></div></div>
          <CctvEvidencePanel incidentId={selected.id} analyses={selected.cctvAnalyses} />
        </article>
      </div>}
    </div>
  );
}
