import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, X } from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { formatRelativeTime } from '@/lib/format';
import { colors, radius } from '@/theme/tokens';
import type { DeviceRecord, DeviceStatus } from '@/lib/api';

const statusMeta: Record<DeviceStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: colors.success },
  pending: { label: 'Pending', color: colors.warning },
  offline: { label: 'Offline', color: colors.danger },
  unclaimed: { label: 'Unclaimed', color: colors.warning },
  decommissioned: { label: 'Decommissioned', color: colors.textTertiary },
};

type Props = {
  device: DeviceRecord | null;
  tankName?: string | null;
  onClose: () => void;
};

export function DeviceDetailsModal({ device, tankName, onClose }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((prev) => (prev === key ? null : prev)), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  }

  return (
    <AnimatePresence>
      {device && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(1, 4, 15, 0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm"
            initial={{ opacity: 0, scale: 0.95, y: '-48%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-48%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          >
            <GlassSurface borderRadius={radius.xl} tint="dark" className="flex flex-col items-center gap-4 p-6">
              <div className="flex w-full items-center justify-between gap-2">
                <p className="truncate text-base font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
                  {device.deviceName}
                </p>
                <button type="button" onClick={onClose} className="shrink-0">
                  <X size={20} color={colors.textTertiary} />
                </button>
              </div>

              <span
                className="inline-flex items-center gap-1.5 self-start rounded-pill border px-2.5 py-1"
                style={{ backgroundColor: `${statusMeta[device.status].color}22`, borderColor: `${statusMeta[device.status].color}55` }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusMeta[device.status].color }} />
                <span className="text-xs font-semibold" style={{ color: statusMeta[device.status].color, fontFamily: 'var(--font-body)' }}>
                  {statusMeta[device.status].label}
                </span>
              </span>

              {device.qrCode ? (
                <img src={device.qrCode} alt="Device QR code" className="h-44 w-44 rounded-lg" style={{ border: `1px solid ${colors.glassBorder}` }} />
              ) : (
                <div
                  className="flex h-44 w-44 items-center justify-center rounded-lg text-center text-xs"
                  style={{ border: `1px solid ${colors.glassBorder}`, color: colors.textTertiary, fontFamily: 'var(--font-body)' }}
                >
                  No QR code available
                </div>
              )}

              <div className="flex w-full flex-col gap-2">
                <DetailRow label="Device ID" value={device.deviceId} copyKey="id" copied={copied === 'id'} onCopy={copyValue} />
                {device.activationPin && (
                  <DetailRow label="Activation PIN" value={device.activationPin} copyKey="pin" copied={copied === 'pin'} onCopy={copyValue} />
                )}
                <DetailRow label="Connected Tank" value={tankName ?? 'Not connected'} />
                <DetailRow label="Battery" value={`${Math.round(device.battery)}%`} />
                <DetailRow label="Signal" value={`${Math.round(device.signal)}%`} />
                <DetailRow label="Health" value={`${Math.round(device.healthScore)} · ${device.healthLevel}`} />
                <DetailRow label="Last Seen" value={device.lastSeen ? formatRelativeTime(device.lastSeen) : '—'} />
              </div>
            </GlassSurface>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({
  label,
  value,
  copyKey,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copyKey?: string;
  copied?: boolean;
  onCopy?: (key: string, value: string) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
      style={{ backgroundColor: colors.glassFill, border: `1px solid ${colors.glassBorder}` }}
    >
      <span className="text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-semibold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          {value}
        </span>
        {copyKey && onCopy && (
          <button type="button" onClick={() => onCopy(copyKey, value)} className="shrink-0">
            {copied ? <Check size={14} color={colors.success} /> : <Copy size={14} color={colors.textTertiary} />}
          </button>
        )}
      </div>
    </div>
  );
}
