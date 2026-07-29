'use client';

import React from 'react';
import { Search, Filter, Layers, Navigation, AlertCircle, Maximize2 } from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}>Loading Maps...</div>
});

export default function MapViewPage() {
  const { incidents } = useLiveData();
  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
  const criticalIncidents = activeIncidents.filter(i => i.severity === 'High' || i.severity === 'Critical').length;
  
  // Calculate total available units (mock logic based on incident assignment)
  const totalUnits = 24;
  const assignedUnits = activeIncidents.reduce((acc, inc) => acc + inc.units.length, 0);
  const availableUnits = Math.max(0, totalUnits - assignedUnits);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
      {/* Actual Leaflet Map */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <DynamicMap incidents={activeIncidents} />
      </div>
      
      {/* Search and Filters */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', gap: '1rem', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', boxShadow: 'var(--shadow-md)' }}>
          <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
          <input type="text" placeholder="Search address, unit, or incident ID..." style={{ border: 'none', outline: 'none', background: 'transparent', width: '300px', fontSize: '0.9rem', color: 'var(--text-primary)' }} />
        </div>
        <button style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Map Controls */}
      <div style={{ position: 'absolute', bottom: '2rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 10 }}>
        <button style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
          <Layers size={20} />
        </button>
        <button style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
          <Navigation size={20} />
        </button>
        <button style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Dynamic Map Markers */}
      {activeIncidents.slice(0, 5).map((incident, i) => {
        // Generate pseudo-random positions based on ID to keep them stable
        const hash = incident.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const top = 20 + (hash % 60); // 20% to 80%
        const left = 20 + ((hash * 7) % 60); // 20% to 80%
        
        const isHighSeverity = incident.severity === 'High' || incident.severity === 'Critical';
        const color = isHighSeverity ? 'var(--accent-red)' : '#f59e0b';
        
        return (
          <div key={incident.id} style={{ position: 'absolute', top: `${top}%`, left: `${left}%`, transform: 'translate(-50%, -50%)', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)', marginBottom: '0.5rem', border: `1px solid ${color}`, whiteSpace: 'nowrap' }}>
              {incident.id} ({incident.type})
            </div>
            <div className={isHighSeverity ? "pulse-dot" : ""} style={{ width: 16, height: 16, borderRadius: '50%', background: color, border: '3px solid var(--card-bg)', boxShadow: `0 0 0 4px ${isHighSeverity ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}></div>
          </div>
        )
      })}
      
      {/* Overlay Status */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '1.5rem', zIndex: 10 }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', boxShadow: 'var(--shadow-md)', width: '300px' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>City-wide Activity</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active Incidents</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{activeIncidents.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Available Units</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{availableUnits}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Congestion Level</span>
            <span style={{ fontWeight: 700, color: criticalIncidents > 2 ? 'var(--accent-red)' : '#f59e0b' }}>
              {criticalIncidents > 2 ? 'High' : 'Moderate'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
