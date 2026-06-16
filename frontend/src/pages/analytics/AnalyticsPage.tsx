import { useEffect, useState } from 'react';
import { Activity, Droplet, FlaskConical, Sparkles, Thermometer, TrendingUp } from 'lucide-react';
import { FilterPill } from '@/components/glass/FilterPill';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { StatCard } from '@/components/glass/StatCard';
import { HistoryBarChart } from '@/components/water/HistoryBarChart';
import { MetricOrbCard } from '@/components/water/MetricOrbCard';
import { api, type AnalyticsResponse, type AnalyticsRange, type TankRecord } from '@/lib/api';
import { colors, gradients, tankTypeMeta } from '@/theme/tokens';

const RANGES: { key: AnalyticsRange; label: string }[] = [
  { key: '7D', label: '7 Days' },
  { key: '30D', label: '30 Days' },
  { key: '90D', label: '90 Days' },
];

export function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>('7D');
  const [tankId, setTankId] = useState<string | undefined>(undefined);
  const [tanks, setTanks] = useState<TankRecord[]>([]);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tanks.list().then(setTanks);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setData(await api.analytics.get(range, tankId));
      } finally {
        setLoading(false);
      }
    })();
  }, [range, tankId]);

  const chartData = (data?.series ?? []).map((point) => ({
    label: new Date(point.date).toLocaleDateString(undefined, { weekday: 'short' }),
    value: point.waterLevel,
  }));

  const summary = data?.summary;

  return (
    <div className="w-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          Analytics
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          Trends across {tankId ? tanks.find((t) => t._id === tankId)?.tankName ?? 'this tank' : 'all tanks'}
        </p>
      </div>

      {/* ── Filters row ─────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap gap-2">
        <div className="flex gap-2 overflow-x-auto">
          {RANGES.map((r) => (
            <FilterPill key={r.key} label={r.label} active={range === r.key} onClick={() => setRange(r.key)} gradient={gradients.aquaGlow} />
          ))}
        </div>
        {tanks.length > 0 && (
          <>
            <div className="h-5 w-px self-center" style={{ backgroundColor: colors.glassBorder }} />
            <div className="flex gap-2 overflow-x-auto">
              <FilterPill label="All Tanks" active={!tankId} onClick={() => setTankId(undefined)} gradient={gradients.aquaGlow} />
              {tanks.map((t) => (
                <FilterPill key={t._id} label={t.tankName} active={tankId === t._id} onClick={() => setTankId(t._id)} gradient={tankTypeMeta[t.tankType].gradient} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Top stat row ────────────────────────────────────── */}
      {!loading && summary && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Droplet} value={summary.avgWaterLevel != null ? `${Math.round(summary.avgWaterLevel * 100)}%` : '—'} label="Avg Water Level" color={colors.cyan} />
          <StatCard icon={Sparkles} value={summary.avgQuality != null ? `${Math.round(summary.avgQuality * 100)}%` : '—'} label="Avg Quality" color={colors.electricBlue} />
          <StatCard icon={Thermometer} value={summary.avgTemperature != null ? `${summary.avgTemperature.toFixed(1)}°C` : '—'} label="Avg Temperature" color={colors.warning} />
          <StatCard icon={TrendingUp} value={`${Math.round(summary.deviceUptimePercent)}%`} label="Device Uptime" color={colors.success} />
        </div>
      )}
      {loading && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      )}

      {/* ── Two-column main ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* LEFT: Charts (2/3) */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div>
            <SectionHeader title="Water Level Trend" />
            {loading ? (
              <Skeleton className="h-48" />
            ) : chartData.length > 0 ? (
              <HistoryBarChart data={chartData} color={colors.cyan} />
            ) : (
              <GlassSurface borderRadius={12} className="flex flex-col items-center gap-2 p-10 text-center">
                <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                  No data yet
                </p>
                <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  Connect a device to start collecting readings for this range.
                </p>
              </GlassSurface>
            )}
          </div>

          {/* Tank distribution */}
          {!loading && data && data.distribution.length > 0 && (
            <div>
              <SectionHeader title="Fleet Distribution" />
              <GlassSurface borderRadius={12} className="flex flex-col divide-y" style={{ borderColor: colors.glassBorder }}>
                {data.distribution.map((d) => {
                  const meta = tankTypeMeta[d.type];
                  const pct = data.distribution.reduce((s, x) => s + x.count, 0);
                  return (
                    <div key={d.type} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${meta.accent}22` }}>
                        <meta.icon size={14} color={meta.accent} />
                      </div>
                      <span className="flex-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                        {meta.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ backgroundColor: colors.glassFill }}>
                          <div className="h-full rounded-full" style={{ width: `${(d.count / pct) * 100}%`, backgroundColor: meta.accent }} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: meta.accent, fontFamily: 'var(--font-heading)' }}>
                          {d.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </GlassSurface>
            </div>
          )}
        </div>

        {/* RIGHT: Metric orbs (1/3) */}
        <div className="flex flex-col gap-3">
          <SectionHeader title="Key Metrics" />
          {loading ? (
            <>
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[88px]" />)}
            </>
          ) : summary ? (
            <>
              <MetricOrbCard
                icon={<Droplet size={20} color={colors.cyan} />}
                label="Avg Water Level"
                value={summary.avgWaterLevel != null ? `${Math.round(summary.avgWaterLevel * 100)}` : '—'}
                unit="%"
                percentage={summary.avgWaterLevel ?? 0}
                color={colors.cyan}
              />
              <MetricOrbCard
                icon={<Sparkles size={20} color={colors.electricBlue} />}
                label="Avg Quality"
                value={summary.avgQuality != null ? `${Math.round(summary.avgQuality * 100)}` : '—'}
                unit="%"
                percentage={summary.avgQuality ?? 0}
                color={colors.electricBlue}
              />
              <MetricOrbCard
                icon={<Thermometer size={20} color={colors.warning} />}
                label="Avg Temperature"
                value={summary.avgTemperature != null ? summary.avgTemperature.toFixed(1) : '—'}
                unit="°C"
                percentage={(summary.avgTemperature ?? 0) / 40}
                color={colors.warning}
              />
              <MetricOrbCard
                icon={<FlaskConical size={20} color={colors.seafoam} />}
                label="Avg pH"
                value={summary.avgPh != null ? summary.avgPh.toFixed(1) : '—'}
                percentage={(summary.avgPh ?? 0) / 14}
                color={colors.seafoam}
              />
              <MetricOrbCard
                icon={<Activity size={20} color={colors.success} />}
                label="Device Uptime"
                value={`${Math.round(summary.deviceUptimePercent)}`}
                unit="%"
                percentage={summary.deviceUptimePercent / 100}
                color={colors.success}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
