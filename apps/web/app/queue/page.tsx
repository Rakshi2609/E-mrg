'use client';
import React from 'react';
import { PhoneCall, AlertTriangle, Clock, MoreHorizontal, UserX, UserCheck } from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';

export default function CallQueuePage() {
  const { calls } = useLiveData();
  const queue = calls.filter(c => c.status === 'Queued');


  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: 'calc(100vh - 64px)', overflowY: 'auto', padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Active Call Queue</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>8 calls currently waiting for a dispatcher.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.75rem 1.5rem', borderRadius: '8px', textAlign: 'center', flex: '1 1 auto' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-red)' }}>03:45</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVG WAIT TIME</div>
          </div>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.75rem 1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>12</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVAILABLE AGENTS</div>
          </div>
        </div>
      </header>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Call ID</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Caller Info</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Wait Time</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Priority Prediction</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((call, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{call.id}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{call.phone}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{call.location}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <Clock size={16} /> {call.time}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className="hero-badge" style={{ 
                    margin: 0, padding: '4px 10px', fontSize: '0.75rem', 
                    background: call.severity === 'CRITICAL' || call.severity === 'HIGH' ? 'var(--accent-red-light)' : call.severity === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)',
                    color: call.severity === 'CRITICAL' || call.severity === 'HIGH' ? 'var(--accent-red)' : call.severity === 'MEDIUM' ? '#d97706' : 'var(--text-secondary)',
                    borderColor: 'transparent', boxShadow: 'none'
                  }}>
                    {call.severity}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                    <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: call.status === 'Active' ? 'var(--accent-red)' : '#10b981' }}></div>
                    {call.status}
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => window.location.href = '/dashboard'} className="btn-primary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.85rem', marginRight: '0.5rem' }}>
                    Answer
                  </button>
                  <button style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
