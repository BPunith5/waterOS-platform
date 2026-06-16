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
  battery?: number;
  signal?: number;
  healthScore?: number;
};

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function createMarkerIcon(color: string, active: boolean, selected: boolean) {
  const html = `
    <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
      ${active ? `<div class="device-marker-pulse" style="background:${color}33;"></div>` : ''}
      <div style="position:relative;width:18px;height:18px;border-radius:999px;background:${color};border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 0 14px ${color}aa${selected ? `, 0 0 0 5px rgba(255,255,255,0.3)` : ''};"></div>
    </div>
  `;
  return L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16] });
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
        const meta = tankTypeMeta[point.type];
        const accent = meta.accent;
        const levelPct = Math.round(point.level * 100);
        const levelColor = levelPct > 50 ? colors.success : levelPct > 20 ? colors.warning : colors.danger;

        return (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createMarkerIcon(accent, point.active, point.id === selectedId)}
            eventHandlers={{ click: () => onSelect?.(point.id) }}
          >
            <Popup>
              <div
                className="flex flex-col gap-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  minWidth: 180,
                  background: colors.deepNavy,
                  borderRadius: 10,
                  padding: '12px',
                  border: `1px solid ${colors.glassBorder}`,
                }}
              >
                {/* Name + type */}
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                      {point.name}
                    </p>
                    <p style={{ color: colors.textTertiary, fontSize: 11 }}>{meta.label}</p>
                  </div>
                </div>

                {/* Water level bar */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span style={{ color: colors.textTertiary, fontSize: 10 }}>Water Level</span>
                    <span style={{ color: levelColor, fontSize: 11, fontWeight: 600 }}>{levelPct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, backgroundColor: colors.glassFill, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${levelPct}%`, backgroundColor: levelColor, borderRadius: 999 }} />
                  </div>
                </div>

                {/* Metrics row */}
                <div className="flex gap-3">
                  {point.battery !== undefined && (
                    <MetaChip label="Battery" value={`${Math.round(point.battery)}%`} color={point.battery > 50 ? colors.success : point.battery > 20 ? colors.warning : colors.danger} />
                  )}
                  {point.signal !== undefined && (
                    <MetaChip label="Signal" value={`${Math.round(point.signal)}%`} color={point.signal > 60 ? colors.success : point.signal > 30 ? colors.warning : colors.danger} />
                  )}
                  {point.healthScore !== undefined && (
                    <MetaChip label="Health" value={`${point.healthScore}%`} color={point.healthScore > 70 ? colors.success : point.healthScore > 40 ? colors.warning : colors.danger} />
                  )}
                </div>

                {/* Status + last seen */}
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: point.active ? colors.success : colors.danger,
                    }}
                  >
                    ● {point.active ? 'Active' : 'Offline'}
                  </span>
                  {point.lastSeen && (
                    <span style={{ color: colors.textTertiary, fontSize: 10 }}>
                      {formatRelativeTime(point.lastSeen)}
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

function MetaChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span style={{ color, fontSize: 12, fontWeight: 700 }}>{value}</span>
      <span style={{ color: colors.textTertiary, fontSize: 9 }}>{label}</span>
    </div>
  );
}
