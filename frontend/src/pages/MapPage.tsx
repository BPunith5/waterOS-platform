import { useCallback, useEffect, useState } from 'react';
import { Battery, MapPin, Wifi } from 'lucide-react';
import { DeviceMap, type MapPoint } from '@/components/map/DeviceMap';
import { FilterPill } from '@/components/glass/FilterPill';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { PressableScale } from '@/components/glass/PressableScale';
import { colors, gradients, radius, tankTypeMeta } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';
import { useDeviceUpdates, useTanksSubscription } from '@/context/SocketContext';
import { api, type DeviceUpdatePayload } from '@/lib/api';
import type { TankType } from '@/types';

export function MapPage() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TankType | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [tanks, devices] = await Promise.all([api.tanks.list(), api.devices.list()]);

      const results = await Promise.all(
        devices.map(async (device) => {
          if (!device.tankId) return null;
          const tank = tanks.find((t) => t._id === device.tankId);
          if (!tank) return null;
          try {
            const [log] = await api.telemetry.logs(device.deviceId, 1);
            if (!log || log.lat == null || log.lng == null) return null;
            const point: MapPoint = {
              id: tank._id,
              name: tank.tankName,
              type: tank.tankType,
              lat: log.lat,
              lng: log.lng,
              level: log.waterLevel,
              active: device.status === 'active',
              lastSeen: device.lastSeen,
              battery: device.battery,
              signal: device.signal,
              healthScore: device.healthScore,
            };
            return point;
          } catch {
            return null;
          }
        }),
      );

      setPoints(results.filter((p): p is MapPoint => p !== null));
      setLoading(false);
    })();
  }, []);

  useTanksSubscription(points.map((p) => p.id));

  const handleDeviceUpdate = useCallback((payload: DeviceUpdatePayload) => {
    const { telemetry, device } = payload;
    if (!device.tankId || telemetry.lat == null || telemetry.lng == null) return;
    setPoints((prev) =>
      prev.map((p) =>
        p.id === device.tankId
          ? {
              ...p,
              lat: telemetry.lat!,
              lng: telemetry.lng!,
              level: telemetry.waterLevel,
              active: device.status === 'active',
              lastSeen: device.lastSeen,
              battery: device.battery,
              signal: device.signal,
              healthScore: device.healthScore,
            }
          : p,
      ),
    );
  }, []);
  useDeviceUpdates(handleDeviceUpdate);

  const types = Array.from(new Set(points.map((p) => p.type)));
  const filtered = typeFilter === 'all' ? points : points.filter((p) => p.type === typeFilter);

  return (
    <div className="w-full">
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          Live Map
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          {points.length} device location{points.length !== 1 ? 's' : ''} · {points.filter((p) => p.active).length} active
        </p>
      </div>

      {types.length > 0 && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          <FilterPill label="All" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} gradient={gradients.aquaGlow} />
          {types.map((type) => (
            <FilterPill key={type} label={tankTypeMeta[type].label} active={typeFilter === type} onClick={() => setTypeFilter(type)} gradient={tankTypeMeta[type].gradient} />
          ))}
        </div>
      )}

      {loading ? (
        <Skeleton borderRadius={radius.xl} className="h-[420px]" />
      ) : points.length === 0 ? (
        <GlassSurface borderRadius={radius.xl} className="flex flex-col items-center gap-2 p-10 text-center">
          <MapPin size={28} color={colors.textTertiary} />
          <p className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            No device locations yet
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            Connect a device to a tank to see it appear on the map.
          </p>
        </GlassSurface>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
          {/* Device list */}
          <div className="flex flex-col gap-2 lg:max-h-[500px] lg:overflow-y-auto lg:pr-1">
            {filtered.map((point) => {
              const meta = tankTypeMeta[point.type];
              const Icon = meta.icon;
              const isSelected = point.id === selectedId;
              const levelPct = Math.round(point.level * 100);
              const levelColor = levelPct > 50 ? colors.success : levelPct > 20 ? colors.warning : colors.danger;

              return (
                <PressableScale key={point.id} onClick={() => setSelectedId(point.id)} scaleTo={0.99} className="w-full">
                  <GlassSurface
                    borderRadius={12}
                    interactive
                    className="flex flex-col gap-2 p-3"
                    style={isSelected ? { boxShadow: `0 0 0 1.5px ${meta.accent}` } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-pill"
                        style={{ backgroundImage: linearGradient(meta.gradient) }}
                      >
                        <Icon size={16} color={colors.textInverse} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                          {point.name}
                        </p>
                        <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                          {meta.label}
                        </p>
                      </div>
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: point.active ? colors.success : colors.textTertiary }} />
                    </div>

                    {/* Level bar */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px]" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>Level</span>
                        <span className="text-[10px] font-semibold" style={{ color: levelColor }}>{levelPct}%</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full" style={{ backgroundColor: colors.glassFill }}>
                        <div className="h-full rounded-full" style={{ width: `${levelPct}%`, backgroundColor: levelColor }} />
                      </div>
                    </div>

                    {/* Battery + signal */}
                    {(point.battery !== undefined || point.signal !== undefined) && (
                      <div className="flex gap-3">
                        {point.battery !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <Battery size={10} color={colors.textTertiary} />
                            <span className="text-[10px]" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                              {Math.round(point.battery)}%
                            </span>
                          </span>
                        )}
                        {point.signal !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <Wifi size={10} color={colors.textTertiary} />
                            <span className="text-[10px]" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                              {Math.round(point.signal)}%
                            </span>
                          </span>
                        )}
                        {point.healthScore !== undefined && (
                          <span className="text-[10px] ml-auto" style={{ color: point.healthScore > 70 ? colors.success : colors.warning, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                            ❤ {point.healthScore}%
                          </span>
                        )}
                      </div>
                    )}
                  </GlassSurface>
                </PressableScale>
              );
            })}
          </div>

          {/* Map */}
          <GlassSurface borderRadius={radius.xl} className="h-[440px] overflow-hidden p-0 lg:h-[500px]">
            <DeviceMap points={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </GlassSurface>
        </div>
      )}
    </div>
  );
}
