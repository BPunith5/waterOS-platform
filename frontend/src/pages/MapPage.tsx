import { useCallback, useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { DeviceMap, type MapPoint } from '@/components/map/DeviceMap';
import { FilterPill } from '@/components/glass/FilterPill';
import { GlassSurface } from '@/components/glass/GlassSurface';
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
          ? { ...p, lat: telemetry.lat!, lng: telemetry.lng!, level: telemetry.waterLevel, active: device.status === 'active', lastSeen: device.lastSeen }
          : p,
      ),
    );
  }, []);

  useDeviceUpdates(handleDeviceUpdate);

  const types = Array.from(new Set(points.map((p) => p.type)));
  const filtered = typeFilter === 'all' ? points : points.filter((p) => p.type === typeFilter);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          Map
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          Live device locations
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
        <GlassSurface borderRadius={radius.xl} className="h-[420px] animate-pulse" />
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <div className="flex flex-col gap-2 lg:max-h-[480px] lg:overflow-y-auto lg:pr-1">
            {filtered.map((point) => {
              const meta = tankTypeMeta[point.type];
              const Icon = meta.icon;
              const isSelected = point.id === selectedId;
              return (
                <PressableScale key={point.id} onClick={() => setSelectedId(point.id)} scaleTo={0.99} className="w-full">
                  <GlassSurface borderRadius={radius.lg} bordered={!isSelected} className="flex items-center gap-3 p-3" style={isSelected ? { boxShadow: `0 0 0 1px ${meta.accent}` } : undefined}>
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
                        {Math.round(point.level * 100)}% · {point.active ? 'Active' : 'Offline'}
                      </p>
                    </div>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: point.active ? colors.success : colors.textTertiary }}
                    />
                  </GlassSurface>
                </PressableScale>
              );
            })}
          </div>

          <GlassSurface borderRadius={radius.xl} className="h-[420px] overflow-hidden p-0 lg:h-[480px]">
            <DeviceMap points={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          </GlassSurface>
        </div>
      )}
    </div>
  );
}
