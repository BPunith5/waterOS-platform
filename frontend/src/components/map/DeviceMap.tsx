import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { colors, tankTypeMeta } from '@/theme/tokens';
import { formatRelativeTime } from '@/lib/format';
import type { TankType } from '@/types';

export type MapPoint = {
  id: string;
  name: string;
  type: TankType;
  lat: number;
  lng: number;
  level: number;
  active: boolean;
  lastSeen: string | null;
};

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function createMarkerIcon(color: string, active: boolean, selected: boolean) {
  const html = `
    <div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
      ${active ? `<div class="device-marker-pulse" style="background:${color}33;"></div>` : ''}
      <div style="position:relative;width:16px;height:16px;border-radius:999px;background:${color};border:2px solid rgba(255,255,255,0.85);box-shadow:0 0 12px ${color}aa${selected ? `, 0 0 0 4px rgba(255,255,255,0.35)` : ''};"></div>
    </div>
  `;
  return L.divIcon({ html, className: '', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -15] });
}

function MapPan({ point }: { point?: MapPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (point) map.setView([point.lat, point.lng], Math.max(map.getZoom(), 13), { animate: true });
  }, [point, map]);

  return null;
}

type Props = {
  points: MapPoint[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export function DeviceMap({ points, selectedId, onSelect }: Props) {
  const selected = points.find((p) => p.id === selectedId) ?? null;
  const center: [number, number] = points[0] ? [points[0].lat, points[0].lng] : [12.9716, 77.5946];

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full" style={{ background: colors.deepNavy }}>
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <MapPan point={selected} />
      {points.map((point) => {
        const accent = tankTypeMeta[point.type].accent;
        return (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createMarkerIcon(accent, point.active, point.id === selectedId)}
            eventHandlers={{ click: () => onSelect?.(point.id) }}
          >
            <Popup>
              <div className="flex flex-col gap-1 text-sm" style={{ fontFamily: 'var(--font-body)', minWidth: 160 }}>
                <span className="font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {point.name}
                </span>
                <span style={{ color: colors.textSecondary }}>{tankTypeMeta[point.type].label}</span>
                <span style={{ color: accent }}>{Math.round(point.level * 100)}% full</span>
                <span style={{ color: colors.textTertiary, fontSize: 12 }}>
                  {point.active ? 'Active' : 'Offline'}
                  {point.lastSeen ? ` · ${formatRelativeTime(point.lastSeen)}` : ''}
                </span>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
