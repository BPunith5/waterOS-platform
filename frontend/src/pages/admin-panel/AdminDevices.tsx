import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RefreshCw, RotateCw } from 'lucide-react';
import { api, type DeviceRecord } from '@/lib/api';

function SecretCell({ value }: { value: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="font-mono text-xs rounded-lg px-2 py-1 cursor-pointer select-none"
        style={{ background: 'rgba(255,255,255,0.04)', color: revealed ? 'rgba(244,251,255,0.8)' : 'rgba(244,251,255,0.3)', fontFamily: 'monospace', letterSpacing: revealed ? '0' : '0.1em' }}
        onClick={() => setRevealed(v => !v)}
        title="Click to reveal"
      >
        {revealed ? value : '••••••••••••••••'}
      </span>
      <button onClick={copy} className="p-1 rounded hover:bg-white/5 transition-colors">
        {copied ? <Check size={12} color="#34D8A6" /> : <Copy size={12} color="rgba(244,251,255,0.4)" />}
      </button>
    </div>
  );
}

export function AdminDevices() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setDevices(await api.admin.listDevices()); }
    catch { /* noop */ }
    finally { setLoading(false); }
  }

  async function handleRotateKey(deviceId: string) {
    if (!confirm('Rotate secret key? IoT firmware must be updated.')) return;
    setRotating(deviceId);
    try {
      const res = await api.admin.rotateKey(deviceId);
      setDevices(prev => prev.map(d => d._id === deviceId ? { ...d, secretKey: res.secretKey } : d));
    } catch { /* noop */ }
    finally { setRotating(null); }
  }

  const statusColors: Record<string, string> = {
    active: '#34D8A6', offline: '#FB7185', unclaimed: '#FBBF24', pending: '#60A5FA',
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>My Assigned Devices</h1>
        <button onClick={load} className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium hover:bg-white/5 transition-colors" style={{ color: 'rgba(244,251,255,0.5)', fontFamily: 'var(--font-body)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>Loading…</div>
      ) : devices.length === 0 ? (
        <div className="rounded-2xl py-20 text-center" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>No devices assigned to you yet</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(244,251,255,0.28)', fontFamily: 'var(--font-body)' }}>Contact super admin to get devices assigned</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((d, i) => (
            <motion.div
              key={d._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>{d.deviceName}</p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'monospace' }}>{d.deviceId}</p>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0" style={{ background: `${statusColors[d.status] ?? '#60A5FA'}18`, color: statusColors[d.status] ?? '#60A5FA', fontFamily: 'var(--font-body)' }}>
                  {d.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(244,251,255,0.4)', fontFamily: 'var(--font-body)' }}>Registration Code</p>
                  {d.registrationCode ? (
                    <span className="font-mono text-xs" style={{ color: '#22D3EE', fontFamily: 'monospace' }}>{d.registrationCode}</span>
                  ) : (
                    <span className="text-xs" style={{ color: 'rgba(244,251,255,0.3)', fontFamily: 'var(--font-body)' }}>Legacy device</span>
                  )}
                </div>

                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(244,251,255,0.4)', fontFamily: 'var(--font-body)' }}>Secret Key</p>
                  {d.secretKey ? (
                    <SecretCell value={d.secretKey} />
                  ) : (
                    <span className="text-xs" style={{ color: 'rgba(244,251,255,0.3)', fontFamily: 'var(--font-body)' }}>Hidden</span>
                  )}
                </div>

                <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(244,251,255,0.4)', fontFamily: 'var(--font-body)' }}>Battery / Signal</p>
                    <p className="text-xs" style={{ color: 'rgba(244,251,255,0.68)', fontFamily: 'var(--font-body)' }}>{d.battery ?? '—'}% / {d.signal ?? '—'}%</p>
                  </div>
                  <button
                    onClick={() => handleRotateKey(d._id)}
                    disabled={rotating === d._id}
                    className="p-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors"
                    title="Rotate secret key"
                  >
                    <RotateCw size={14} color="#FBBF24" className={rotating === d._id ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
