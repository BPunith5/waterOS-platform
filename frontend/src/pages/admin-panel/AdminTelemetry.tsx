import { useEffect, useState } from 'react';
import { api, type DeviceRecord, type TelemetryRecord } from '@/lib/api';

export function AdminTelemetry() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [logs, setLogs] = useState<TelemetryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.admin.listDevices().then(d => {
      setDevices(d);
      if (d.length > 0) setSelectedId(d[0]._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    api.admin.getTelemetry(selectedId, 50)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedId]);

  const metrics: Array<{ key: keyof TelemetryRecord; label: string; unit: string; format?: (v: number) => string }> = [
    { key: 'waterLevel', label: 'Water Level', unit: '%', format: v => `${(v * 100).toFixed(1)}%` },
    { key: 'ph', label: 'pH', unit: '', format: v => v.toFixed(2) },
    { key: 'temperature', label: 'Temperature', unit: '°C', format: v => `${v.toFixed(1)}°C` },
    { key: 'dissolvedOxygen', label: 'Dissolved O₂', unit: '%', format: v => `${(v * 100).toFixed(0)}%` },
    { key: 'turbidity', label: 'Turbidity', unit: 'NTU', format: v => `${v.toFixed(2)} NTU` },
    { key: 'battery', label: 'Battery', unit: '%', format: v => `${v}%` },
    { key: 'signal', label: 'Signal', unit: '%', format: v => `${v}%` },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold mb-6" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>Telemetry History</h1>

      {/* Device selector */}
      <div className="mb-5">
        <select
          className="rounded-xl px-3 py-2.5 text-sm outline-none w-full max-w-sm"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          {devices.map(d => (
            <option key={d._id} value={d._id} style={{ background: '#03142E' }}>
              {d.deviceName}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>Loading…</div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl py-20 text-center" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>No telemetry data yet</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th className="text-left px-4 py-2.5 font-semibold uppercase tracking-wider" style={{ color: 'rgba(244,251,255,0.4)', fontFamily: 'var(--font-body)' }}>Time</th>
                  {metrics.map(m => (
                    <th key={m.key} className="text-left px-4 py-2.5 font-semibold uppercase tracking-wider" style={{ color: 'rgba(244,251,255,0.4)', fontFamily: 'var(--font-body)' }}>{m.label}</th>
                  ))}
                  <th className="text-left px-4 py-2.5 font-semibold uppercase tracking-wider" style={{ color: 'rgba(244,251,255,0.4)', fontFamily: 'var(--font-body)' }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log._id} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    {metrics.map(m => {
                      const raw = log[m.key];
                      const val = typeof raw === 'number' ? (m.format ? m.format(raw) : `${raw}${m.unit}`) : '—';
                      return (
                        <td key={m.key} className="px-4 py-2.5" style={{ color: '#F4FBFF', fontFamily: 'var(--font-body)' }}>{val}</td>
                      );
                    })}
                    <td className="px-4 py-2.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          background: (log as unknown as { source?: string }).source === 'manual' ? 'rgba(251,191,36,0.12)' : 'rgba(52,216,166,0.1)',
                          color: (log as unknown as { source?: string }).source === 'manual' ? '#FBBF24' : '#34D8A6',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {(log as unknown as { source?: string }).source ?? 'hardware'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
