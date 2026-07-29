'use client';
import React from 'react';
import { AlertTriangle, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';

export default function IncidentsPage() {
  const { incidents } = useLiveData();


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Active Incidents</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Overview of all ongoing emergency responses.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '6px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Filter</button>
          <button style={{ background: 'var(--text-primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', color: 'var(--card-bg)', fontWeight: 600, cursor: 'pointer' }}>+ New Incident</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {incidents.map((inc, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: inc.severity === 'CRITICAL' ? '#991b1b' : inc.severity === 'HIGH' ? 'var(--accent-red)' : inc.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{inc.type}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{inc.id}</span>
              </div>
              <span style={{ 
                padding: '4px 10px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                background: inc.severity === 'CRITICAL' ? '#fee2e2' : inc.severity === 'HIGH' ? 'var(--accent-red-light)' : inc.severity === 'MEDIUM' ? '#fef3c7' : '#dbeafe',
                color: inc.severity === 'CRITICAL' ? '#991b1b' : inc.severity === 'HIGH' ? 'var(--accent-red)' : inc.severity === 'MEDIUM' ? '#b45309' : '#1d4ed8'
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

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '-10px' }}>
                {inc.units.map((_, u) => (
                  <div key={u} style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-tertiary)', border: '2px solid var(--card-bg)', marginLeft: u > 0 ? '-8px' : '0' }}></div>
                ))}
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                View Details <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
