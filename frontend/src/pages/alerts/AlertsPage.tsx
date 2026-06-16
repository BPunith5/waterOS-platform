import { useCallback, useEffect, useState } from 'react';
import { AlertOctagon, AlertTriangle, Bell, Check, Info } from 'lucide-react';
import { AlertCard } from '@/components/alerts/AlertCard';
import { FilterPill } from '@/components/glass/FilterPill';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { Reveal } from '@/components/glass/Reveal';
import { SectionHeader } from '@/components/glass/SectionHeader';
import { StatCard } from '@/components/glass/StatCard';
import { api, type AlertRecord, type AlertSeverity } from '@/lib/api';
import { useAlertUpdates, useTanksSubscription } from '@/context/SocketContext';
import { colors, gradients } from '@/theme/tokens';

type Filter = 'all' | AlertSeverity;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warning' },
  { key: 'info', label: 'Info' },
];

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [tankIds, setTankIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([api.alerts.list(), api.tanks.list()])
      .then(([alertRecords, tanks]) => {
        setAlerts(alertRecords);
        setTankIds(tanks.map((t) => t._id));
      })
      .finally(() => setLoading(false));
  }, []);

  useTanksSubscription(tankIds);

  const handleNewAlert = useCallback((alert: AlertRecord) => {
    setAlerts((prev) => [alert, ...prev.filter((a) => a._id !== alert._id)]);
  }, []);

  useAlertUpdates(handleNewAlert);

  async function markRead(id: string) {
    setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, read: true } : a)));
    try {
      await api.alerts.markRead(id, true);
    } catch {
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, read: false } : a)));
    }
  }

  async function markAllRead() {
    const unread = alerts.filter((a) => !a.read);
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    try {
      await Promise.all(unread.map((a) => api.alerts.markRead(a._id, true)));
    } catch { /* revert on failure is complex, skip */ }
  }

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);
  const unread = filtered.filter((a) => !a.read);
  const read = filtered.filter((a) => a.read);

  const totalCount = alerts.length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="w-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            Alerts
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ borderColor: colors.glassBorder, color: colors.textSecondary, fontFamily: 'var(--font-body)' }}
          >
            <Check size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* ── Stat bar ────────────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Bell} value={`${totalCount}`} label="Total Alerts" color={colors.cyan} />
        <StatCard icon={AlertOctagon} value={`${criticalCount}`} label="Critical" color={criticalCount > 0 ? colors.danger : colors.textTertiary} />
        <StatCard icon={AlertTriangle} value={`${warningCount}`} label="Warnings" color={warningCount > 0 ? colors.warning : colors.textTertiary} />
        <StatCard icon={Info} value={`${infoCount}`} label="Info" color={colors.info} />
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <FilterPill key={f.key} label={f.label} active={filter === f.key} onClick={() => setFilter(f.key)} gradient={gradients.aquaGlow} />
        ))}
      </div>

      {/* ── Two-column content ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* LEFT: New alerts (full or 2/3 of space) */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : filtered.length === 0 ? (
            <GlassSurface borderRadius={12} className="flex flex-col items-center gap-2 p-10 text-center">
              <p className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                {alerts.length === 0 ? 'All clear' : 'No alerts match this filter'}
              </p>
              <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                {alerts.length === 0 ? "You're all caught up. We'll notify you if anything needs attention." : 'Try a different filter.'}
              </p>
            </GlassSurface>
          ) : (
            <>
              {unread.length > 0 && (
                <div className="mb-5">
                  <SectionHeader title={`New · ${unread.length}`} />
                  <div className="flex flex-col gap-2">
                    {unread.map((alert, i) => (
                      <Reveal key={alert._id} index={i}>
                        <AlertCard alert={alert} onMarkRead={() => markRead(alert._id)} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
              {read.length > 0 && (
                <div className="mb-5">
                  <SectionHeader title="Earlier" />
                  <div className="flex flex-col gap-2">
                    {read.map((alert, i) => (
                      <Reveal key={alert._id} index={i}>
                        <AlertCard alert={alert} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT: Severity breakdown panel */}
        <div className="flex flex-col gap-4">
          <div>
            <SectionHeader title="Severity Breakdown" />
            <GlassSurface borderRadius={12} className="flex flex-col gap-0 overflow-hidden">
              {[
                { label: 'Critical', count: criticalCount, color: colors.danger, icon: AlertOctagon },
                { label: 'Warning', count: warningCount, color: colors.warning, icon: AlertTriangle },
                { label: 'Info', count: infoCount, color: colors.info, icon: Info },
              ].map(({ label, count, color, icon: Icon }, i) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: i < 2 ? `1px solid ${colors.glassBorder}` : undefined }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${color}22` }}>
                      <Icon size={14} color={color} />
                    </div>
                    <span className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                      {label}
                    </span>
                  </div>
                  <span className="text-base font-bold" style={{ color: count > 0 ? color : colors.textTertiary, fontFamily: 'var(--font-heading)' }}>
                    {count}
                  </span>
                </div>
              ))}
            </GlassSurface>
          </div>

          <div>
            <SectionHeader title="Alert Rate" />
            <GlassSurface borderRadius={12} className="p-4">
              {/* Simple bar chart of severity proportions */}
              {totalCount > 0 ? (
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Critical', count: criticalCount, color: colors.danger },
                    { label: 'Warning', count: warningCount, color: colors.warning },
                    { label: 'Info', count: infoCount, color: colors.info },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>{label}</span>
                        <span className="text-xs font-semibold" style={{ color, fontFamily: 'var(--font-body)' }}>
                          {totalCount > 0 ? Math.round((count / totalCount) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: colors.glassFill }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${totalCount > 0 ? (count / totalCount) * 100 : 0}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
                  No data yet
                </p>
              )}
            </GlassSurface>
          </div>
        </div>
      </div>
    </div>
  );
}
