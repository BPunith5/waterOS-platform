import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FilterPill } from '@/components/glass/FilterPill';
import { Reveal } from '@/components/glass/Reveal';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { Skeleton } from '@/components/glass/Skeleton';
import { TankGridCard } from '@/components/water/TankGridCard';
import { TankListCard } from '@/components/water/TankListCard';
import { api } from '@/lib/api';
import { toDisplayTank } from '@/lib/placeholder';
import { mergeLiveTank } from '@/lib/live';
import { colors, gradients, tankTypeMeta } from '@/theme/tokens';
import type { Tank, TankType } from '@/types';

type Filter = 'all' | TankType;
type ViewMode = 'grid' | 'list';

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
  const [view, setView] = useState<ViewMode>('grid');

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
        } catch { /* fall back */ }
        setTanks(displayTanks);
      } finally {
        setLoading(false);
      }
    })();
  }

  const filtered = filter === 'all' ? tanks : tanks.filter((t) => t.type === filter);
  const connectedCount = tanks.filter((t) => t.connected).length;
  const criticalCount = tanks.filter((t) => t.status === 'critical').length;

  return (
    <div className="w-full">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            Your Tanks
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {tanks.length} total · {connectedCount} connected
            {criticalCount > 0 && (
              <span style={{ color: colors.danger }}> · {criticalCount} critical</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Grid / List toggle */}
          <div
            className="flex overflow-hidden rounded-lg"
            style={{ border: `1px solid ${colors.glassBorder}`, backgroundColor: colors.glassFill }}
          >
            {(['grid', 'list'] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className="px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
                style={{
                  color: view === v ? colors.textInverse : colors.textSecondary,
                  backgroundColor: view === v ? colors.cyan : 'transparent',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <LiquidButton
            label="Add Tank"
            variant="primary"
            icon={<Plus size={16} color={colors.textInverse} />}
            onClick={() => navigate('/tanks/new')}
          />
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
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

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        <div className={view === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'flex flex-col gap-3'}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className={view === 'grid' ? 'h-44' : 'h-28'} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassSurface borderRadius={12} className="flex flex-col items-center gap-2 p-10 text-center">
          <p className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            {tanks.length === 0 ? 'No tanks yet' : 'No tanks match this filter'}
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {tanks.length === 0 ? 'Add your first tank to start monitoring.' : 'Try a different tank type filter.'}
          </p>
          {tanks.length === 0 && (
            <LiquidButton label="Add Tank" variant="primary" icon={<Plus size={16} color={colors.textInverse} />} onClick={() => navigate('/tanks/new')} />
          )}
        </GlassSurface>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((tank, i) => (
            <Reveal key={tank.id} index={i}>
              <TankGridCard tank={tank} onClick={() => navigate(`/tanks/${tank.id}`)} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filtered.map((tank, i) => (
            <Reveal key={tank.id} index={i}>
              <TankListCard tank={tank} onClick={() => navigate(`/tanks/${tank.id}`)} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
