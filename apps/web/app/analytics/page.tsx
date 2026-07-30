'use client';
import React from 'react';
import { useLiveData } from '../../context/LiveDataContext';
import { TrendingUp, Users, Clock, AlertTriangle, Activity, BarChart3, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
  const { calls, incidents, logs } = useLiveData();
  const transcriptLines = calls.flatMap((call) => call.transcript.map((line) => ({ ...line, callId: call.id })));
  const critical = incidents.filter((incident) => ['CRITICAL', 'Critical', 'HIGH', 'High'].includes(incident.severity)).length;
  const stats = [
    { label: 'Total Calls', value: String(calls.length), change: 'MongoDB', up: true },
    { label: 'Persisted Events', value: String(logs.length), change: 'Live', up: true },
    { label: 'Critical Incidents', value: String(critical), change: 'Live', up: critical === 0 },
    { label: 'Active Incidents', value: String(incidents.filter((incident) => incident.status === 'Active').length), change: 'Live', up: true },
  ];
  return (
    <main style={{ maxWidth: 1680, height: 'calc(100vh - 64px)', overflowY: 'auto', paddingRight: 8, scrollbarWidth: 'thin', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ padding: '24px 28px', borderRadius: 18, color: '#fff', background: 'linear-gradient(115deg, #121a2d, #20233b)', boxShadow: '0 18px 40px rgba(15,23,42,.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ margin: 0, color: '#fca5a5', fontSize: 12, fontWeight: 800, letterSpacing: '.1em' }}>LIVE PERFORMANCE</p>
          <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>System Analytics</h1>
          <p style={{ color: '#cbd5e1', marginTop: '0.5rem', fontSize: '0.95rem' }}>Real-time metrics and historical performance data.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', borderRadius: '10px', color: '#fff', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
            <option style={{ color: '#000' }}>Last 24 Hours</option>
            <option style={{ color: '#000' }}>Last 7 Days</option>
            <option style={{ color: '#000' }}>Last 30 Days</option>
          </select>
          <button className="btn-primary" style={{ background: 'var(--accent-red)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,.3)' }}>Export Data</button>
        </div>
      </header>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
              <div style={{ color: 'var(--text-muted)' }}><Activity size={18} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</span>
              <span className="hero-badge" style={{ margin: 0, padding: '4px 8px', fontSize: '0.75rem', color: stat.up ? '#10b981' : 'var(--accent-red)', background: stat.up ? 'rgba(16,185,129,0.1)' : 'var(--accent-red-light)', borderColor: 'transparent', boxShadow: 'none' }}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <section style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Recent Conversation Transcript</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Live view of recent communications between AI and Callers across all active incidents.</p>
        </div>
        
        {transcriptLines.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {transcriptLines.slice(-12).map((line, index) => {
              const isAI = line.speaker === 'COPILOT_SYS';
              return (
                <div key={`${line.callId}-${index}`} style={{ display: 'flex', flexDirection: 'column', alignSelf: isAI ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ 
                    padding: '12px 16px', 
                    borderRadius: isAI ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isAI ? 'var(--accent-red)' : 'var(--bg-tertiary)',
                    color: isAI ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: 'var(--shadow-sm)',
                    border: isAI ? 'none' : '1px solid var(--border-color)'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{line.text}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: isAI ? 'flex-end' : 'flex-start', fontWeight: 600 }}>
                    <span>{line.callId}</span>
                    <span>&middot;</span>
                    <span style={{ color: isAI ? 'var(--accent-red)' : 'var(--text-secondary)' }}>{isAI ? 'AI Copilot' : 'Caller'}</span>
                    <span>&middot;</span>
                    <span>{line.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
            No persisted transcript events yet.
          </div>
        )}
      </section>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flex: 1, paddingBottom: '2rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Call Volume Trends</h3>
            <BarChart3 size={20} color="var(--text-muted)" />
          </div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            {[30, 45, 60, 40, 75, 90, 65, 55, 80, 100, 70, 50].map((h, i) => (
              <div key={i} style={{ flex: 1, background: i === 9 ? 'var(--accent-red)' : 'var(--bg-tertiary)', height: `${h}%`, borderRadius: '4px 4px 0 0', position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{i*2}h</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Incident Distribution</h3>
            <PieChart size={20} color="var(--text-muted)" />
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
            {[
              { label: 'Medical Emergency', value: 45, color: '#3b82f6' },
              { label: 'Traffic Collision', value: 25, color: '#f59e0b' },
              { label: 'Fire', value: 15, color: 'var(--accent-red)' },
              { label: 'Other', value: 15, color: 'var(--text-muted)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }}></div>
                    {item.label}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.value}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
// simple PhoneCall mock
const PhoneCall = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
