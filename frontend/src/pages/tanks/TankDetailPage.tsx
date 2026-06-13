import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  Thermometer,
  FlaskConical,
  Leaf,
  Sparkles,
  Activity,
  BarChart3,
  Wrench,
  Pencil,
  Trash2,
} from 'lucide-react';
import { IconButton } from '@/components/glass/IconButton';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { StatusPill } from '@/components/glass/StatusPill';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { ActionSheet } from '@/components/glass/ActionSheet';
import { WaterVessel } from '@/components/water/WaterVessel';
import { MetricOrbCard } from '@/components/water/MetricOrbCard';
import { HistoryBarChart } from '@/components/water/HistoryBarChart';
import { api } from '@/lib/api';
import { toDisplayTank, generateHistory } from '@/lib/placeholder';
import { formatLiters } from '@/lib/format';
import { colors, radius, tankTypeMeta } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';
import type { Tank } from '@/types';

const trendMeta: Record<Tank['trend'], { icon: typeof TrendingUp; color: string; label: string }> = {
  rising: { icon: TrendingUp, color: colors.success, label: 'Rising' },
  falling: { icon: TrendingDown, color: colors.danger, label: 'Falling' },
  stable: { icon: Minus, color: colors.textTertiary, label: 'Stable' },
};

export function TankDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tank, setTank] = useState<Tank | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.tanks
      .get(id)
      .then((record) => setTank(toDisplayTank(record)))
      .catch(() => navigate('/tanks', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <GlassSurface className="h-56 animate-pulse" borderRadius={radius.xl} />
      </div>
    );
  }

  if (!tank) return null;

  const meta = tankTypeMeta[tank.type];
  const TypeIcon = meta.icon;
  const trend = trendMeta[tank.trend];
  const TrendIcon = trend.icon;
  const levelHistory = generateHistory(tank.currentLevel, 0.18);

  async function handleRemove() {
    if (!id) return;
    await api.tanks.remove(id);
    navigate('/tanks', { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <IconButton icon={ChevronLeft} onClick={() => navigate('/tanks')} />
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-base font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            {tank.name}
          </p>
          <p className="truncate text-xs" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {tank.location}
          </p>
        </div>
        <IconButton icon={MoreHorizontal} onClick={() => setMenuOpen(true)} />
      </div>

      {/* Hero */}
      <GlassSurface borderRadius={radius.xl} className="mb-8 flex items-center gap-6 p-5">
        <WaterVessel width={120} height={232} percentage={tank.currentLevel} color={meta.accent} radius={32} />
        <div className="min-w-0 flex-1">
          <span
            className="relative mb-2 inline-flex items-center gap-1 overflow-hidden rounded-pill px-2.5 py-[5px]"
            style={{ backgroundImage: linearGradient(meta.gradient) }}
          >
            <TypeIcon size={12} color={colors.textInverse} />
            <span className="text-[10px] font-bold tracking-wide" style={{ fontFamily: 'var(--font-body)', color: colors.textInverse }}>
              {meta.label}
            </span>
          </span>

          <p className="text-4xl font-bold leading-tight" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            {Math.round(tank.currentLevel * 100)}%
          </p>
          <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
            Current Level
          </p>

          <div className="my-3 h-px" style={{ backgroundColor: colors.glassBorder }} />

          <p className="text-base font-medium" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            {formatLiters(tank.capacityLiters * tank.currentLevel)}
          </p>
          <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
            of {formatLiters(tank.capacityLiters)} capacity
          </p>

          <div className="mt-4 flex items-center justify-between">
            <StatusPill status={tank.status} />
            <div className="flex items-center gap-1">
              <TrendIcon size={14} color={trend.color} />
              <span className="text-xs font-semibold" style={{ color: trend.color, fontFamily: 'var(--font-body)' }}>
                {trend.label}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
            {tank.lastUpdated}
          </p>
        </div>
      </GlassSurface>

      {/* Live readings */}
      <div className="mb-8">
        <SectionHeader title="Live Readings" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricOrbCard
            icon={<Thermometer size={22} color={colors.warning} />}
            label="Temperature"
            value={tank.temperature.toFixed(1)}
            unit="°C"
            percentage={tank.temperature / 40}
            color={colors.warning}
          />
          <MetricOrbCard
            icon={<FlaskConical size={22} color={colors.seafoam} />}
            label="pH Level"
            value={tank.ph.toFixed(1)}
            percentage={tank.ph / 14}
            color={colors.seafoam}
          />
          <MetricOrbCard
            icon={<Leaf size={22} color={colors.success} />}
            label="Dissolved O₂"
            value={`${Math.round(tank.dissolvedOxygen * 100)}`}
            unit="%"
            percentage={tank.dissolvedOxygen}
            color={colors.success}
          />
          <MetricOrbCard
            icon={<Sparkles size={22} color={colors.electricBlue} />}
            label="Water Quality"
            value={`${Math.round(tank.quality * 100)}`}
            unit="%"
            percentage={tank.quality}
            color={colors.electricBlue}
          />
          <MetricOrbCard
            icon={<Activity size={22} color={colors.aqua} />}
            label="Tank Health"
            value={`${Math.round(tank.health * 100)}`}
            unit="%"
            percentage={tank.health}
            color={colors.aqua}
          />
        </div>
      </div>

      {/* History */}
      <div className="mb-8">
        <SectionHeader title="7-Day Level Trend" />
        <HistoryBarChart data={levelHistory} color={meta.accent} />
      </div>

      {/* Actions */}
      <div className="mb-10 flex flex-col gap-3">
        <LiquidButton
          label="View Analytics"
          variant="primary"
          icon={<BarChart3 size={18} color={colors.textInverse} />}
          onClick={() => navigate('/analytics')}
          fullWidth
        />
        <LiquidButton
          label="Schedule Maintenance"
          variant="ghost"
          icon={<Wrench size={18} color={colors.textPrimary} />}
          onClick={() => {}}
          fullWidth
        />
      </div>

      <ActionSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={tank.name}
        items={[
          { key: 'edit', label: 'Edit Tank', icon: Pencil, onClick: () => navigate(`/tanks/${tank.id}/edit`) },
          { key: 'remove', label: 'Remove Tank', icon: Trash2, destructive: true, onClick: handleRemove },
        ]}
      />
    </div>
  );
}
