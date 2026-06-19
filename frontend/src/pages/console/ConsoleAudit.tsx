import { useEffect, useState } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import { api, type TelemetryRecord } from '@/lib/api';

export function ConsoleAudit() {
  const [logs, setLogs] = useState<(TelemetryRecord & { source?: string; note?: string; pushedBy?: unknown })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.superadmin.auditLog(100);
      setLogs(res.logs as typeof logs);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold mb-6" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>Manual Telemetry Audit Log</h1>

      <div className="rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-sm font-semibold" style={{ color: 'rgba(244,251,255,0.68)', fontFamily: 'var(--font-heading)' }}>
            Recent manual pushes ({logs.length})
          </span>
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <RefreshCw size={14} color="rgba(244,251,255,0.42)" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>Loading…</div>
        ) : logs.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2">
            <FileText size={28} color="rgba(244,251,255,0.2)" />
            <p className="text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>No manual pushes recorded yet</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={log._id} className="px-5 py-3.5 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono" style={{ color: '#22D3EE', fontFamily: 'monospace' }}>{log.deviceId}</span>
                    {log.note && (
                      <span className="text-xs rounded-full px-2 py-0.5" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', fontFamily: 'var(--font-body)' }}>
                        "{log.note}"
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>
                    {log.waterLevel != null && <span>Water: {(log.waterLevel * 100).toFixed(0)}%</span>}
                    {log.ph != null && <span>pH: {log.ph.toFixed(1)}</span>}
                    {log.temperature != null && <span>Temp: {log.temperature.toFixed(1)}°C</span>}
                    {log.battery != null && <span>Bat: {log.battery}%</span>}
                  </div>
                </div>
                <span className="shrink-0 text-xs" style={{ color: 'rgba(244,251,255,0.3)', fontFamily: 'var(--font-body)' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
