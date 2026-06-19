import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import { api, type DeviceRecord, type AdminPushTelemetryInput } from '@/lib/api';

type FormState = {
  waterLevel: string;
  ph: string;
  temperature: string;
  dissolvedOxygen: string;
  turbidity: string;
  tds: string;
  battery: string;
  signal: string;
  note: string;
};

const EMPTY: FormState = {
  waterLevel: '', ph: '', temperature: '', dissolvedOxygen: '',
  turbidity: '', tds: '', battery: '', signal: '', note: '',
};

const FIELDS: Array<{ key: keyof Omit<FormState, 'note'>; label: string; placeholder: string; hint: string }> = [
  { key: 'waterLevel', label: 'Water Level (0–1)', placeholder: '0.75', hint: '0 = empty, 1 = full' },
  { key: 'ph', label: 'pH (0–14)', placeholder: '7.2', hint: 'Normal: 6.5–8.5' },
  { key: 'temperature', label: 'Temperature (°C)', placeholder: '22', hint: '-10 to 85' },
  { key: 'dissolvedOxygen', label: 'Dissolved O₂ (0–1)', placeholder: '0.85', hint: '0 = none, 1 = saturated' },
  { key: 'turbidity', label: 'Turbidity (NTU)', placeholder: '1.5', hint: 'Lower = clearer' },
  { key: 'tds', label: 'TDS (ppm)', placeholder: '250', hint: 'Total dissolved solids' },
  { key: 'battery', label: 'Battery (%)', placeholder: '85', hint: '0–100' },
  { key: 'signal', label: 'Signal (%)', placeholder: '90', hint: '0–100' },
];

export function AdminPush() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [pushing, setPushing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.listDevices().then(d => {
      setDevices(d);
      if (d.length > 0) setSelectedId(d[0]._id);
    }).catch(() => {});
  }, []);

  function parseField(v: string): number | undefined {
    const n = parseFloat(v);
    return isNaN(n) ? undefined : n;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setError(null); setSuccess(false); setPushing(true);

    const body: AdminPushTelemetryInput = {
      waterLevel: parseField(form.waterLevel),
      ph: parseField(form.ph),
      temperature: parseField(form.temperature),
      dissolvedOxygen: parseField(form.dissolvedOxygen),
      turbidity: parseField(form.turbidity),
      tds: parseField(form.tds),
      battery: parseField(form.battery),
      signal: parseField(form.signal),
      note: form.note || undefined,
    };

    // Strip undefined
    (Object.keys(body) as Array<keyof typeof body>).forEach(k => body[k] === undefined && delete body[k]);

    try {
      await api.admin.pushTelemetry(selectedId, body);
      setSuccess(true);
      setForm(EMPTY);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Push failed');
    } finally { setPushing(false); }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold mb-2" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>Push Manual Reading</h1>
      <p className="text-sm mb-6" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>
        Override sensor readings for testing, calibration, or demo purposes. Each push is annotated as "manual" in the audit log.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Device selector */}
        <div className="mb-5">
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'rgba(244,251,255,0.5)', fontFamily: 'var(--font-body)' }}>Target Device</label>
          <select
            className="rounded-xl px-3 py-2.5 text-sm outline-none w-full"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            required
          >
            {devices.map(d => (
              <option key={d._id} value={d._id} style={{ background: '#03142E' }}>{d.deviceName}</option>
            ))}
          </select>
        </div>

        {/* Metric fields */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: 'rgba(244,251,255,0.5)', fontFamily: 'var(--font-body)' }}>{f.label}</label>
              <input
                type="number"
                step="any"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              />
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(244,251,255,0.3)', fontFamily: 'var(--font-body)' }}>{f.hint}</p>
            </div>
          ))}
        </div>

        {/* Note field */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: 'rgba(244,251,255,0.5)', fontFamily: 'var(--font-body)' }}>Note (optional)</label>
          <input
            type="text"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
            placeholder="e.g. Calibration after maintenance"
            value={form.note}
            onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
          />
        </div>

        {error && <p className="mb-3 text-sm" style={{ color: '#FB7185', fontFamily: 'var(--font-body)' }}>{error}</p>}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(52,216,166,0.1)', border: '1px solid rgba(52,216,166,0.25)' }}
          >
            <CheckCircle size={16} color="#34D8A6" />
            <span className="text-sm" style={{ color: '#34D8A6', fontFamily: 'var(--font-body)' }}>Reading pushed successfully</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={pushing || !selectedId}
          className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)', color: '#22D3EE', fontFamily: 'var(--font-body)' }}
        >
          <Send size={15} />
          {pushing ? 'Pushing…' : 'Push Reading'}
        </button>
      </form>
    </div>
  );
}
