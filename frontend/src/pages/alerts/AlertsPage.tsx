import { useCallback, useEffect, useState } from 'react';
import { AlertCard } from '@/components/alerts/AlertCard';
import { FilterPill } from '@/components/glass/FilterPill';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { Skeleton } from '@/components/glass/Skeleton';
import { Reveal } from '@/components/glass/Reveal';
import { SectionHeader } from '@/components/glass/SectionHeader';
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

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);
  const unread = filtered.filter((a) => !a.read);
  const read = filtered.filter((a) => a.read);
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          Alerts
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <FilterPill key={f.key} label={f.label} active={filter === f.key} onClick={() => setFilter(f.key)} gradient={gradients.aquaGlow} />
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassSurface className="flex flex-col items-center gap-2 p-10 text-center">
          <p className="text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
            No alerts
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
            {alerts.length === 0 ? "You're all caught up. We'll let you know if anything needs attention." : 'No alerts match this filter.'}
          </p>
        </GlassSurface>
      ) : (
        <>
          {unread.length > 0 && (
            <div className="mb-6">
              <SectionHeader title="New" />
              <div className="flex flex-col gap-3">
                {unread.map((alert, i) => (
                  <Reveal key={alert._id} index={i}>
                    <AlertCard alert={alert} onMarkRead={() => markRead(alert._id)} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
          {read.length > 0 && (
            <div className="mb-6">
              <SectionHeader title="Earlier" />
              <div className="flex flex-col gap-3">
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
  );
}
