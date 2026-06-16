import { useEffect, useState } from 'react';
import { Activity, Battery, Droplet, FlaskConical, Sparkles, Thermometer, TrendingUp, Wifi } from 'lucide-react';
import { FilterPill } from '@/components/glass/FilterPill';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { StatCard } from '@/components/glass/StatCard';
import { MetricOrbCard } from '@/components/water/MetricOrbCard';
import { TrendChart } from '@/components/water/TrendChart';
import { api, type AnalyticsRange, type AnalyticsResponse, type TankRecord } from '@/lib/api';
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

  useEffect(() => { api.tanks.list().then(setTanks); }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setData(await api.analytics.get(range, tankId)); }
      finally { setLoading(false); }
    })();
  }, [range, tankId]);

  const series = data?.series ?? [];
  const summary = data?.summary;

  const dateLabels = series.map((p) =>
    new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  );

  // Extracted series arrays
  const levelData = series.map((p) => p.waterLevel * 100);
  const qualityData = series.map((p) => p.quality * 100);
  const tempData = series.map((p) => p.temperature);
  const doData = series.map((p) => p.dissolvedOxygen * 100);
  const batteryData = series.map((p) => p.battery);
  const signalData = series.map((p) => p.signal);
  const turbData = series.map((p) => p.turbidity);
  const phData = series.map((p) => p.ph);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          Analytics
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          {tankId ? tanks.find((t) => t._id === tankId)?.tankName ?? 'This tank' : 'All tanks'} · {range} overview
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <div className="flex gap-2">
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

      {/* Summary stat bar */}
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

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* LEFT: Charts */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {loading ? (
            <>
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
            </>
          ) : series.length === 0 ? (
            <GlassSurface borderRadius={12} className="flex flex-col items-center gap-2 p-10 text-center">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                No data for this period
              </p>
              <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                Connect a device and wait for readings to accumulate.
              </p>
            </GlassSurface>
          ) : (
            <>
              {/* Water Level */}
              <div>
                <SectionHeader title="Water Level" />
                <TrendChart
                  data={levelData}
                  labels={dateLabels}
                  color={colors.cyan}
                  height={160}
                  yMin={0}
                  yMax={100}
                  yFormat={(v) => `${Math.round(v)}%`}
                  title="Water Level"
                  unit="%"
                />
              </div>

              {/* Water Quality */}
              <div>
                <SectionHeader title="Water Quality" />
                <TrendChart
                  data={qualityData}
                  labels={dateLabels}
                  color={colors.success}
                  height={160}
                  yMin={0}
                  yMax={100}
                  yFormat={(v) => `${Math.round(v)}%`}
                  title="Water Quality Score"
                  unit="%"
                />
              </div>

              {/* Temperature */}
              <div>
                <SectionHeader title="Temperature" />
                <TrendChart
                  data={tempData}
                  labels={dateLabels}
                  color={colors.warning}
                  height={150}
                  yFormat={(v) => `${v.toFixed(1)}°`}
                  title="Temperature"
                  unit="°C"
                />
              </div>

              {/* Dissolved O2 */}
              <div>
                <SectionHeader title="Dissolved Oxygen" />
                <TrendChart
                  data={doData}
                  labels={dateLabels}
                  color={colors.seafoam}
                  height={150}
                  yMin={0}
                  yMax={100}
                  yFormat={(v) => `${Math.round(v)}%`}
                  title="Dissolved O₂ Saturation"
                  unit="%"
                />
              </div>

              {/* pH */}
              <div>
                <SectionHeader title="pH Level" />
                <TrendChart
                  data={phData}
                  labels={dateLabels}
                  color={colors.electricBlue}
                  height={140}
                  yMin={4}
                  yMax={10}
                  yFormat={(v) => v.toFixed(1)}
                  title="pH Level"
                />
              </div>

              {/* Device Performance: Battery + Signal */}
              <div>
                <SectionHeader title="Device Performance" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TrendChart
                    data={batteryData}
                    labels={dateLabels}
                    color={colors.aqua}
                    height={140}
                    yMin={0}
                    yMax={100}
                    yFormat={(v) => `${Math.round(v)}%`}
                    title="Battery Level"
                    unit="%"
                  />
                  <TrendChart
                    data={signalData}
                    labels={dateLabels}
                    color={colors.electricBlue}
                    height={140}
                    yMin={0}
                    yMax={100}
                    yFormat={(v) => `${Math.round(v)}%`}
                    title="Signal Strength"
                    unit="%"
                  />
                </div>
              </div>

              {/* Sensor Reliability: Turbidity */}
              <div>
                <SectionHeader title="Sensor Reliability — Turbidity" />
                <TrendChart
                  data={turbData}
                  labels={dateLabels}
                  color={colors.warning}
                  height={140}
                  yMin={0}
                  yFormat={(v) => `${v.toFixed(1)} NTU`}
                  title="Turbidity"
                  unit="NTU"
                />
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Metric orbs + fleet distribution */}
        <div className="flex flex-col gap-4">
          <SectionHeader title="Current Averages" />
          {loading ? (
            <>{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[88px]" />)}</>
          ) : summary ? (
            <>
              <MetricOrbCard icon={<Droplet size={20} color={colors.cyan} />} label="Avg Water Level" value={summary.avgWaterLevel != null ? `${Math.round(summary.avgWaterLevel * 100)}` : '—'} unit="%" percentage={summary.avgWaterLevel ?? 0} color={colors.cyan} />
              <MetricOrbCard icon={<Sparkles size={20} color={colors.electricBlue} />} label="Avg Quality" value={summary.avgQuality != null ? `${Math.round(summary.avgQuality * 100)}` : '—'} unit="%" percentage={summary.avgQuality ?? 0} color={colors.electricBlue} />
              <MetricOrbCard icon={<Thermometer size={20} color={colors.warning} />} label="Avg Temperature" value={summary.avgTemperature != null ? summary.avgTemperature.toFixed(1) : '—'} unit="°C" percentage={(summary.avgTemperature ?? 0) / 40} color={colors.warning} />
              <MetricOrbCard icon={<FlaskConical size={20} color={colors.seafoam} />} label="Avg pH" value={summary.avgPh != null ? summary.avgPh.toFixed(1) : '—'} percentage={(summary.avgPh ?? 0) / 14} color={colors.seafoam} />
              <MetricOrbCard icon={<Activity size={20} color={colors.success} />} label="Device Uptime" value={`${Math.round(summary.deviceUptimePercent)}`} unit="%" percentage={summary.deviceUptimePercent / 100} color={colors.success} />
            </>
          ) : null}

          {/* Fleet distribution */}
          {!loading && data && data.distribution.length > 0 && (
            <div>
              <SectionHeader title="Fleet Mix" />
              <GlassSurface borderRadius={12} className="flex flex-col overflow-hidden">
                {data.distribution.map((d, i) => {
                  const meta = tankTypeMeta[d.type];
                  const total = data.distribution.reduce((s, x) => s + x.count, 0);
                  return (
                    <div
                      key={d.type}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < data.distribution.length - 1 ? `1px solid ${colors.glassBorder}` : undefined }}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${meta.accent}22` }}>
                        <meta.icon size={14} color={meta.accent} />
                      </div>
                      <span className="flex-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                        {meta.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ backgroundColor: colors.glassFill }}>
                          <div className="h-full rounded-full" style={{ width: `${(d.count / total) * 100}%`, backgroundColor: meta.accent }} />
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

          {/* Device stats */}
          {!loading && series.length > 0 && (
            <div>
              <SectionHeader title="Sensor Stats" />
              <div className="flex flex-col gap-2">
                <MetricOrbCard icon={<Battery size={20} color={colors.aqua} />} label="Avg Battery" value={batteryData.length > 0 ? `${Math.round(batteryData.reduce((s, v) => s + v, 0) / batteryData.length)}` : '—'} unit="%" percentage={(batteryData.reduce((s, v) => s + v, 0) / (batteryData.length || 1)) / 100} color={colors.aqua} />
                <MetricOrbCard icon={<Wifi size={20} color={colors.electricBlue} />} label="Avg Signal" value={signalData.length > 0 ? `${Math.round(signalData.reduce((s, v) => s + v, 0) / signalData.length)}` : '—'} unit="%" percentage={(signalData.reduce((s, v) => s + v, 0) / (signalData.length || 1)) / 100} color={colors.electricBlue} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
