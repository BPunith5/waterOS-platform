import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { IconButton } from '@/components/glass/IconButton';
import { FilterPill } from '@/components/glass/FilterPill';
import { Reveal } from '@/components/glass/Reveal';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { TankListCard } from '@/components/water/TankListCard';
import { api } from '@/lib/api';
import { toDisplayTank } from '@/lib/placeholder';
import { mergeLiveTank } from '@/lib/live';
import { colors, gradients, tankTypeMeta } from '@/theme/tokens';
import type { Tank, TankType } from '@/types';

type Filter = 'all' | TankType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Tanks' },
  { key: 'drinking', label: tankTypeMeta.drinking.label },
  { key: 'aquaculture', label: tankTypeMeta.aquaculture.label },
  { key: 'industrial', label: tankTypeMeta.industrial.label },
  { key: 'irrigation', label: tankTypeMeta.irrigation.label },
];

export function TanksPage() {
  const navigate = useNavigate();
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    (async () => {
      try {
        const records = await api.tanks.list();
        let displayTanks = records.map(toDisplayTank);

        try {
          const devices = await api.devices.list();
          displayTanks = await Promise.all(
            displayTanks.map(async (tank, i) => {
              const device = devices.find((d) => d.tankId === records[i]._id);
              if (!device) return tank;
              try {
                const logs = await api.telemetry.logs(device.deviceId, 1);
                return logs[0] ? mergeLiveTank(tank, device, logs[0]) : tank;
              } catch {
                return tank;
              }
            }),
          );
        } catch {
          // live data unavailable; fall back to placeholder readings
        }

        setTanks(displayTanks);
      } finally {
        setLoading(false);
      }
    })();
  }

  const filteredTanks = filter === 'all' ? tanks : tanks.filter((t) => t.type === filter);
  const activeCount = tanks.filter((t) => t.status !== 'critical').length;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            Your Tanks
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {tanks.length} tank{tanks.length === 1 ? '' : 's'} · {activeCount} active
          </p>
        </div>
        <IconButton icon={Plus} onClick={() => navigate('/tanks/new')} />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <FilterPill
            key={f.key}
            label={f.label}
            active={filter === f.key}
            onClick={() => setFilter(f.key)}
            gradient={f.key === 'all' ? gradients.aquaGlow : tankTypeMeta[f.key as TankType].gradient}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : filteredTanks.length === 0 ? (
        <GlassSurface className="flex flex-col items-center gap-2 p-10 text-center">
          <p className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            {tanks.length === 0 ? 'No tanks yet' : 'No tanks match this filter'}
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {tanks.length === 0 ? 'Add your first tank to start monitoring.' : 'Try a different tank type filter.'}
          </p>
        </GlassSurface>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredTanks.map((tank, i) => (
            <Reveal key={tank.id} index={i}>
              <TankListCard tank={tank} onClick={() => navigate(`/tanks/${tank.id}`)} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
