'use client';

import L from 'leaflet';
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Coordinates = [number, number];

interface MapIncident {
  id: string;
  type: string;
  location?: string;
  severity: string;
  status: string;
  latitude?: number;
  longitude?: number;
}

interface MapComponentProps {
  incidents: MapIncident[];
  minimap?: boolean;
  center?: Coordinates;
  mapStyle?: 'default' | 'dark' | 'satellite';
}

const baseCoords: Coordinates = [28.6139, 77.2090];
const stations = [
  { name: 'Connaught Place Central Station', position: [28.6304, 77.2177] as Coordinates },
  { name: 'North Delhi Station', position: [28.6800, 77.2000] as Coordinates },
  { name: 'South Delhi Response Station', position: [28.5500, 77.2200] as Coordinates },
];

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function getCoordinates(incident: MapIncident): Coordinates | undefined {
  const { latitude, longitude } = incident;
  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return undefined;
  return [latitude, longitude];
}

function nearestStation(position: Coordinates): string {
  return stations.reduce((nearest, station) => {
    const distance = Math.hypot(position[0] - station.position[0], position[1] - station.position[1]);
    return distance < nearest.distance ? { station, distance } : nearest;
  }, { station: stations[0], distance: Number.POSITIVE_INFINITY }).station.name;
}

function MapViewport({ positions, minimap }: { positions: Coordinates[]; minimap: boolean }): null {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    
    if (positions.length === 1 || minimap) {
      const newCenter = L.latLng(positions[0]);
      if (map.getCenter().distanceTo(newCenter) > 200 || map.getZoom() !== (minimap ? 15 : 13)) {
        map.flyTo(positions[0], minimap ? 15 : 13, { duration: 1.5 });
      }
    } else {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: true, duration: 1.5 });
    }
  }, [map, minimap, JSON.stringify(positions)]);
  return null;
}

export default function MapComponent({ incidents, minimap = false, center = baseCoords, mapStyle = 'default' }: MapComponentProps): React.JSX.Element {
  const [geocoded, setGeocoded] = useState<Record<string, Coordinates>>({});

  useEffect(() => {
    const controller = new AbortController();
    const unresolved = incidents.filter((incident) => !getCoordinates(incident) && incident.location?.trim() && incident.location !== 'Not confirmed');
    void Promise.all(unresolved.map(async (incident) => {
      try {
        // Keeping the source location intact avoids moving Springfield, IL incidents to India.
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(incident.location!)}`, { headers: { Accept: 'application/json' }, signal: controller.signal });
        if (!response.ok) return undefined;
        const results = await response.json() as Array<{ lat: string; lon: string }>;
        const latitude = Number(results[0]?.lat);
        const longitude = Number(results[0]?.lon);
        return Number.isFinite(latitude) && Number.isFinite(longitude) ? [incident.id, [latitude, longitude] as Coordinates] as const : undefined;
      } catch { return undefined; }
    })).then((results) => {
      if (!controller.signal.aborted) setGeocoded(Object.fromEntries(results.filter((result): result is readonly [string, Coordinates] => result !== undefined)));
    });
    return () => controller.abort();
  }, [incidents]);

  const markers = useMemo(() => incidents.flatMap((incident) => {
    const position = getCoordinates(incident) ?? geocoded[incident.id];
    return position ? [{ incident, position }] : [];
  }), [geocoded, incidents]);
  const positions = useMemo(() => markers.map(({ position }) => position), [markers]);

  const tileUrl = mapStyle === 'dark' 
    ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
    : mapStyle === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div style={{ height: minimap ? '180px' : '100%', width: '100%', borderRadius: '12px', overflow: 'hidden', border: minimap ? 'none' : '1px solid var(--border-color)', position: 'relative', zIndex: 1 }}>
      <MapContainer center={positions[0] ?? center} zoom={minimap ? 15 : 13} zoomControl={!minimap} scrollWheelZoom={!minimap} dragging={!minimap} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <MapViewport positions={positions} minimap={minimap} />
        <TileLayer attribution={minimap ? '' : '&copy; OpenStreetMap contributors'} url={tileUrl} />
        {markers.map(({ incident, position }) => <Marker key={incident.id} position={position}>{!minimap && <Popup><div style={{ fontFamily: 'var(--font-primary), sans-serif' }}><div style={{ fontWeight: 800, color: 'var(--accent-red)' }}>{incident.id}</div><div style={{ fontWeight: 600 }}>{incident.type}</div>{incident.location && <div style={{ fontSize: '0.8rem', color: '#666' }}>{incident.location}</div>}<div style={{ fontSize: '0.8rem', color: '#666' }}>Severity: {incident.severity}</div><div style={{ fontSize: '0.8rem', color: '#666' }}>Status: {incident.status}</div><div style={{ fontSize: '0.8rem', color: '#666' }}>Nearest response station: {nearestStation(position)}</div></div></Popup>}</Marker>)}
      </MapContainer>
      {minimap && <><div style={{ position: 'absolute', width: '100%', height: '2px', background: 'var(--accent-red)', top: '50%', opacity: 0.3, boxShadow: '0 0 10px var(--accent-red)', zIndex: 2, pointerEvents: 'none' }} /><div style={{ position: 'absolute', height: '100%', width: '2px', background: 'var(--accent-red)', left: '50%', opacity: 0.3, boxShadow: '0 0 10px var(--accent-red)', zIndex: 2, pointerEvents: 'none' }} /><div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,51,102,0.2)', borderRadius: '50%', transform: 'scale(1.5)', zIndex: 2, pointerEvents: 'none', animation: 'pulse 2s infinite' }} /></>}
    </div>
  );
}
