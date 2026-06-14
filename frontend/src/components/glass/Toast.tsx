import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';
import { GlassSurface } from './GlassSurface';
import { useAlertUpdates, useTanksSubscription } from '@/context/SocketContext';
import { api, type AlertRecord } from '@/lib/api';
import { colors, radius } from '@/theme/tokens';

const severityMeta = {
  info: { icon: Info, color: colors.info },
  warning: { icon: AlertTriangle, color: colors.warning },
  critical: { icon: AlertOctagon, color: colors.danger },
} as const;

const AUTO_DISMISS_MS = 6000;

/**
 * Listens for `alert:new` socket events across all of the user's tanks
 * and surfaces them as transient glass toasts in the top-right corner.
 */
export function ToastStack() {
  const [tankIds, setTankIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<AlertRecord[]>([]);

  useEffect(() => {
    api.tanks
      .list()
      .then((tanks) => setTankIds(tanks.map((t) => t._id)))
      .catch(() => {});
  }, []);

  useTanksSubscription(tankIds);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const handleNewAlert = useCallback(
    (alert: AlertRecord) => {
      setToasts((prev) => [alert, ...prev]);
      window.setTimeout(() => dismiss(alert._id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  useAlertUpdates(handleNewAlert);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:right-6 sm:top-6">
      <AnimatePresence>
        {toasts.map((alert) => {
          const meta = severityMeta[alert.severity];
          const Icon = meta.icon;
          return (
            <motion.div
              key={alert._id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="pointer-events-auto"
            >
              <GlassSurface borderRadius={radius.lg} className="flex items-start gap-3 p-3" style={{ borderLeft: `3px solid ${meta.color}` }}>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${meta.color}22` }}
                >
                  <Icon size={16} color={meta.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                    {alert.title}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
                    {alert.description}
                  </p>
                </div>
                <button type="button" onClick={() => dismiss(alert._id)} className="shrink-0" aria-label="Dismiss">
                  <X size={14} color={colors.textTertiary} />
                </button>
              </GlassSurface>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
