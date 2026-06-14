import { useEffect, useState } from 'react';
import { Activity, Droplet, FlaskConical, Sparkles, Thermometer } from 'lucide-react';
import { FilterPill } from '@/components/glass/FilterPill';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { HistoryBarChart } from '@/components/water/HistoryBarChart';
import { MetricOrbCard } from '@/components/water/MetricOrbCard';
import { api, type AnalyticsResponse, type AnalyticsRange, type TankRecord } from '@/lib/api';
import { colors, gradients, radius, tankTypeMeta } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

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
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          Analytics
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          Trends across {tankId ? 'this tank' : 'your tanks'}
        </p>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {RANGES.map((r) => (
          <FilterPill key={r.key} label={r.label} active={range === r.key} onClick={() => setRange(r.key)} gradient={gradients.aquaGlow} />
        ))}
      </div>

      {tanks.length > 0 && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          <FilterPill label="All Tanks" active={!tankId} onClick={() => setTankId(undefined)} gradient={gradients.aquaGlow} />
          {tanks.map((t) => (
            <FilterPill key={t._id} label={t.tankName} active={tankId === t._id} onClick={() => setTankId(t._id)} gradient={tankTypeMeta[t.tankType].gradient} />
          ))}
        </div>
      )}

      {loading || !summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <GlassSurface key={i} className="h-[88px] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MetricOrbCard
              icon={<Droplet size={22} color={colors.cyan} />}
              label="Avg Water Level"
              value={summary.avgWaterLevel != null ? `${Math.round(summary.avgWaterLevel * 100)}` : '—'}
              unit="%"
              percentage={summary.avgWaterLevel ?? 0}
              color={colors.cyan}
            />
            <MetricOrbCard
              icon={<Sparkles size={22} color={colors.electricBlue} />}
              label="Avg Water Quality"
              value={summary.avgQuality != null ? `${Math.round(summary.avgQuality * 100)}` : '—'}
              unit="%"
              percentage={summary.avgQuality ?? 0}
              color={colors.electricBlue}
            />
            <MetricOrbCard
              icon={<Thermometer size={22} color={colors.warning} />}
              label="Avg Temperature"
              value={summary.avgTemperature != null ? summary.avgTemperature.toFixed(1) : '—'}
              unit="°C"
              percentage={(summary.avgTemperature ?? 0) / 40}
              color={colors.warning}
            />
            <MetricOrbCard
              icon={<FlaskConical size={22} color={colors.seafoam} />}
              label="Avg pH"
              value={summary.avgPh != null ? summary.avgPh.toFixed(1) : '—'}
              percentage={(summary.avgPh ?? 0) / 14}
              color={colors.seafoam}
            />
            <MetricOrbCard
              icon={<Activity size={22} color={colors.success} />}
              label="Device Uptime"
              value={`${Math.round(summary.deviceUptimePercent)}`}
              unit="%"
              percentage={summary.deviceUptimePercent / 100}
              color={colors.success}
            />
          </div>

          <div className="mb-8">
            <SectionHeader title="Water Level Trend" />
            {chartData.length > 0 ? (
              <HistoryBarChart data={chartData} color={colors.cyan} />
            ) : (
              <GlassSurface className="flex flex-col items-center gap-2 p-8 text-center">
                <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                  No data yet
                </p>
                <p className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  Connect a device to start collecting readings for this range.
                </p>
              </GlassSurface>
            )}
          </div>

          {data && data.distribution.length > 0 && (
            <div className="mb-8">
              <SectionHeader title="Tank Distribution" />
              <div className="flex flex-wrap gap-2">
                {data.distribution.map((d) => {
                  const meta = tankTypeMeta[d.type];
                  return (
                    <span
                      key={d.type}
                      className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-pill px-3 py-1.5"
                      style={{ backgroundImage: linearGradient(meta.gradient), borderRadius: radius.pill }}
                    >
                      <meta.icon size={12} color={colors.textInverse} />
                      <span className="text-xs font-bold" style={{ color: colors.textInverse, fontFamily: 'var(--font-body)' }}>
                        {meta.label} · {d.count}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
