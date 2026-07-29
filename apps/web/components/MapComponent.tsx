'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Base coordinates (Springfield, IL mock)
const baseCoords: [number, number] = [39.7817, -89.6501];
// Pre-defined random offsets for variety
const stations = [{ name: 'Springfield Central Station', position: [39.795, -89.650] as [number, number] }, { name: 'North Station', position: [39.820, -89.650] as [number, number] }, { name: 'Riverside Response Station', position: [39.780, -89.635] as [number, number] }];
const nearestStation = (position: [number, number]): string => stations.reduce((nearest, station) => { const distance = Math.hypot(position[0] - station.position[0], position[1] - station.position[1]); return distance < nearest.distance ? { station, distance } : nearest; }, { station: stations[0], distance: Number.POSITIVE_INFINITY }).station.name;

export default function MapComponent({ incidents, minimap = false, center = baseCoords }: { incidents: any[], minimap?: boolean, center?: [number, number] }) {
  return (
    <div style={{ height: minimap ? '180px' : '600px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: minimap ? 'none' : '1px solid var(--border-color)', position: 'relative', zIndex: 1 }}>
      <MapContainer 
        center={center} 
        zoom={minimap ? 15 : 13} 
        zoomControl={!minimap}
        scrollWheelZoom={!minimap}
        dragging={!minimap}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution={minimap ? '' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((incident, idx) => {
          const pos: [number, number] = typeof incident.latitude === 'number' && typeof incident.longitude === 'number' ? [incident.latitude, incident.longitude] : center;
          return (
            <Marker key={incident.id} position={pos}>
              {!minimap && (
                <Popup>
                  <div style={{ fontFamily: 'var(--font-primary), sans-serif' }}>
                    <div style={{ fontWeight: 800, color: 'var(--accent-red)' }}>{incident.id}</div>
                    <div style={{ fontWeight: 600 }}>{incident.type}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Severity: {incident.severity}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Status: {incident.status}</div><div style={{ fontSize: '0.8rem', color: '#666' }}>Nearest response station: {nearestStation(pos)}</div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
      
      {minimap && (
        <>
          <div style={{ position: 'absolute', width: '100%', height: '2px', background: 'var(--accent-red)', top: '50%', opacity: 0.3, boxShadow: '0 0 10px var(--accent-red)', zIndex: 2, pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', height: '100%', width: '2px', background: 'var(--accent-red)', left: '50%', opacity: 0.3, boxShadow: '0 0 10px var(--accent-red)', zIndex: 2, pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,51,102,0.2)', borderRadius: '50%', transform: 'scale(1.5)', zIndex: 2, pointerEvents: 'none', animation: 'pulse 2s infinite' }}></div>
        </>
      )}
    </div>
  );
}
