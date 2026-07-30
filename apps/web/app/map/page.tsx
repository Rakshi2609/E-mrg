'use client';

import React, { useState } from 'react';
import { Search, Filter, Layers, Navigation, Maximize2 } from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}>Loading Maps...</div>
});

export default function MapViewPage() {
  const { incidents } = useLiveData();
  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite' | 'dark'>('default');
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleLayerSwitch = () => {
    if (mapStyle === 'default') setMapStyle('satellite');
    else if (mapStyle === 'satellite') setMapStyle('dark');
    else setMapStyle('default');
  };

  const filteredIncidents = activeIncidents.filter(inc => {
    const searchLow = searchQuery.toLowerCase();
    const matchesSearch = (inc.location?.toLowerCase() || '').includes(searchLow) || 
                          (inc.type?.toLowerCase() || '').includes(searchLow) || 
                          (inc.id?.toLowerCase() || '').includes(searchLow);
    
    let matchesFilter = true;
    if (severityFilter === 'CRITICAL') {
      matchesFilter = inc.severity === 'CRITICAL';
    } else if (severityFilter === 'HIGH') {
      matchesFilter = inc.severity === 'HIGH' || inc.severity === 'CRITICAL';
    }
    
    return matchesSearch && matchesFilter;
  });

  const criticalIncidents = filteredIncidents.filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL').length;
  
  // Calculate total available units (mock logic based on incident assignment)
  const totalUnits = 24;
  const assignedUnits = filteredIncidents.reduce((acc, inc) => acc + inc.units.length, 0);
  const availableUnits = Math.max(0, totalUnits - assignedUnits);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
      {/* Actual Leaflet Map */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <DynamicMap incidents={filteredIncidents} mapStyle={mapStyle} />
      </div>
      
      {/* Search and Filters */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', gap: '1rem', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', boxShadow: 'var(--shadow-md)' }}>
          <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Search address, unit, or incident ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '300px', fontSize: '0.9rem', color: 'var(--text-primary)' }} 
          />
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowFilters(!showFilters)} style={{ background: severityFilter ? 'var(--accent-red)' : 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: severityFilter ? 'white' : 'var(--text-primary)', fontWeight: 600, boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
            <Filter size={18} /> Filters
          </button>
          {showFilters && (
            <div style={{ position: 'absolute', top: '100%', marginTop: '0.5rem', left: 0, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
              <div style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', background: severityFilter === null ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }} onClick={() => { setSeverityFilter(null); setShowFilters(false); }}>All Severities</div>
              <div style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', background: severityFilter === 'CRITICAL' ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }} onClick={() => { setSeverityFilter('CRITICAL'); setShowFilters(false); }}>Critical Only</div>
              <div style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', background: severityFilter === 'HIGH' ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }} onClick={() => { setSeverityFilter('HIGH'); setShowFilters(false); }}>High & Critical</div>
            </div>
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div style={{ position: 'absolute', bottom: '2rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1000 }}>
        <button onClick={handleLayerSwitch} title={`Switch map style (Current: ${mapStyle})`} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
          <Layers size={20} />
        </button>
        <button onClick={() => { setSearchQuery(''); setSeverityFilter(null); }} title="Reset View & Filters" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
          <Navigation size={20} />
        </button>
        <button onClick={handleFullscreen} title="Toggle Fullscreen" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Overlay Status */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '1.5rem', zIndex: 1000 }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', boxShadow: 'var(--shadow-md)', width: '300px' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>City-wide Activity</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active Incidents</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{filteredIncidents.length}</span>
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
