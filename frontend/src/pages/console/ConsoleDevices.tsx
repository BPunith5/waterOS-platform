import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, RotateCw, Trash2, Download, Copy, Check, X, QrCode } from 'lucide-react';
import { api, type DeviceRecord, type ProvisionedDeviceResult } from '@/lib/api';

function CopyCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} className="flex items-center gap-1 font-mono text-xs rounded-lg px-2 py-1 hover:bg-white/5 transition-colors" style={{ color: 'rgba(244,251,255,0.68)', fontFamily: 'monospace' }}>
      {value}
      {copied ? <Check size={11} color="#34D8A6" /> : <Copy size={11} color="rgba(244,251,255,0.4)" />}
    </button>
  );
}

function CredRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="min-w-0 flex-1">
        <p className="text-[11px]" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>{label}</p>
        <p className="truncate text-sm font-semibold" style={{ color: '#F4FBFF', fontFamily: mono ? 'monospace' : 'var(--font-heading)', fontSize: mono ? 11 : undefined }}>
          {value}
        </p>
      </div>
      <button type="button" onClick={copy} className="ml-3 shrink-0">
        {copied ? <Check size={15} color="#34D8A6" /> : <Copy size={15} color="rgba(244,251,255,0.4)" />}
      </button>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const bgColors: Record<string, string> = {
    unclaimed: 'rgba(251,191,36,0.15)',
    active: 'rgba(52,216,166,0.15)',
    offline: 'rgba(251,113,133,0.15)',
    pending: 'rgba(96,165,250,0.15)',
    decommissioned: 'rgba(255,255,255,0.06)',
  };
  const textColors: Record<string, string> = {
    unclaimed: '#FBBF24', active: '#34D8A6', offline: '#FB7185', pending: '#60A5FA', decommissioned: 'rgba(244,251,255,0.42)',
  };
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: bgColors[status] ?? 'rgba(255,255,255,0.06)', color: textColors[status] ?? 'rgba(244,251,255,0.5)', fontFamily: 'var(--font-body)' }}>
      {status}
    </span>
  );
}

function QrModal({ device, onClose }: { device: DeviceRecord; onClose: () => void }) {
  function downloadQr() {
    if (!device.qrCode) return;
    const a = document.createElement('a');
    a.href = device.qrCode;
    a.download = `${device.deviceName}-qr.png`;
    a.click();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl p-6 w-full max-w-sm"
        style={{ background: '#03142E', border: '1px solid rgba(34,211,238,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 rounded-lg p-1 hover:bg-white/10">
          <X size={15} color="rgba(244,251,255,0.5)" />
        </button>
        <p className="text-base font-bold mb-1" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>{device.deviceName}</p>
        <p className="text-xs mb-4" style={{ color: 'rgba(244,251,255,0.4)', fontFamily: 'var(--font-body)' }}>Scan this QR code to register the device</p>

        {device.qrCode ? (
          <img src={device.qrCode} alt="QR code" className="w-48 h-48 mx-auto rounded-xl mb-4" style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#fff' }} />
        ) : (
          <div className="w-48 h-48 mx-auto rounded-xl mb-4 flex items-center justify-center" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs text-center" style={{ color: 'rgba(244,251,255,0.3)', fontFamily: 'var(--font-body)' }}>No QR — rotate code to generate</p>
          </div>
        )}

        <div className="flex flex-col gap-2 mb-4">
          <CredRow label="Registration Code" value={device.registrationCode ?? '—'} mono />
          <CredRow label="Device ID" value={device.deviceId} mono />
        </div>

        {device.qrCode && (
          <button
            onClick={downloadQr}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)', color: '#22D3EE', fontFamily: 'var(--font-body)' }}
          >
            <Download size={14} /> Download QR
          </button>
        )}
      </motion.div>
    </div>
  );
}

export function ConsoleDevices() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [provisionForm, setProvisionForm] = useState({ deviceName: '', adminId: '' });
  const [batchForm, setBatchForm] = useState({ namePrefix: '', count: 5, adminId: '' });
  const [provisioning, setProvisioning] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchCsv, setBatchCsv] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [singleResult, setSingleResult] = useState<ProvisionedDeviceResult | null>(null);
  const [qrDevice, setQrDevice] = useState<DeviceRecord | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setListError(null);
    try { setDevices(await api.superadmin.listDevices()); }
    catch { setListError('Failed to load devices. Check your connection and try again.'); }
    finally { setLoading(false); }
  }

  async function handleProvision(e: React.FormEvent) {
    e.preventDefault();
    setProvisioning(true);
    setSingleResult(null);
    try {
      const result = await api.superadmin.provisionDevice({
        deviceName: provisionForm.deviceName,
        adminId: provisionForm.adminId || undefined,
      });
      setSingleResult(result);
      setProvisionForm({ deviceName: '', adminId: '' });
      load();
    } catch { /* noop */ }
    finally { setProvisioning(false); }
  }

  async function handleBatch(e: React.FormEvent) {
    e.preventDefault();
    setBatchLoading(true);
    setBatchCsv(null);
    try {
      const res = await api.superadmin.batchProvision({
        namePrefix: batchForm.namePrefix,
        count: batchForm.count,
        adminId: batchForm.adminId || undefined,
      });
      setBatchCsv(res.csv);
      load();
    } catch { /* noop */ }
    finally { setBatchLoading(false); }
  }

  function downloadCsv() {
    if (!batchCsv) return;
    const blob = new Blob([batchCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquanigha-devices-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRotateCode(device: DeviceRecord) {
    try {
      const res = await api.superadmin.rotateCode(device._id);
      const updated = { ...device, registrationCode: res.registrationCode, qrCode: res.qrCodeDataUrl };
      setQrDevice(updated);
      load();
    } catch { /* noop */ }
  }

  async function handleDecommission(deviceId: string) {
    if (!confirm('Decommission this device? This cannot be undone.')) return;
    try { await api.superadmin.decommission(deviceId); load(); }
    catch { /* noop */ }
  }

  return (
    <div className="max-w-5xl">
      {qrDevice && <QrModal device={qrDevice} onClose={() => setQrDevice(null)} />}
      <h1 className="text-xl font-bold mb-6" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>Device Provisioning</h1>

      {/* Provision tabs */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex gap-2 mb-4">
          {(['single', 'batch'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSingleResult(null); setBatchCsv(null); }}
              className="rounded-xl px-4 py-1.5 text-sm font-medium transition-all capitalize"
              style={{
                background: activeTab === tab ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab ? '#22D3EE' : 'rgba(244,251,255,0.5)',
                border: `1px solid ${activeTab === tab ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.08)'}`,
                fontFamily: 'var(--font-body)',
              }}
            >
              {tab === 'single' ? 'Single Device' : 'Batch Provision'}
            </button>
          ))}
        </div>

        {activeTab === 'single' ? (
          <form onSubmit={handleProvision} className="flex gap-3">
            <input
              className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
              placeholder="Device name"
              value={provisionForm.deviceName}
              onChange={e => setProvisionForm(f => ({ ...f, deviceName: e.target.value }))}
              required
            />
            <input
              className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
              placeholder="Admin ID (optional)"
              value={provisionForm.adminId}
              onChange={e => setProvisionForm(f => ({ ...f, adminId: e.target.value }))}
            />
            <button
              type="submit"
              disabled={provisioning}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)', color: '#22D3EE', fontFamily: 'var(--font-body)' }}
            >
              <Plus size={15} />
              {provisioning ? 'Provisioning…' : 'Provision'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBatch} className="flex flex-wrap gap-3">
            <input
              className="flex-1 min-w-32 rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
              placeholder="Name prefix (e.g. Tank Sensor)"
              value={batchForm.namePrefix}
              onChange={e => setBatchForm(f => ({ ...f, namePrefix: e.target.value }))}
              required
            />
            <input
              type="number"
              min={1}
              max={50}
              className="w-24 rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
              value={batchForm.count}
              onChange={e => setBatchForm(f => ({ ...f, count: Number(e.target.value) }))}
            />
            <input
              className="flex-1 min-w-32 rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
              placeholder="Admin ID (optional)"
              value={batchForm.adminId}
              onChange={e => setBatchForm(f => ({ ...f, adminId: e.target.value }))}
            />
            <button
              type="submit"
              disabled={batchLoading}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)', color: '#22D3EE', fontFamily: 'var(--font-body)' }}
            >
              <Plus size={15} />
              {batchLoading ? 'Provisioning…' : 'Batch Provision'}
            </button>
          </form>
        )}

        {batchCsv && (
          <div className="mt-3 flex items-center gap-2 rounded-xl p-3" style={{ background: 'rgba(52,216,166,0.08)', border: '1px solid rgba(52,216,166,0.2)' }}>
            <p className="flex-1 text-sm" style={{ color: '#34D8A6', fontFamily: 'var(--font-body)' }}>Batch complete — CSV ready</p>
            <button
              onClick={downloadCsv}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
              style={{ background: 'rgba(52,216,166,0.15)', color: '#34D8A6', fontFamily: 'var(--font-body)' }}
            >
              <Download size={13} /> Download CSV
            </button>
          </div>
        )}
      </div>

      {/* Single provision result card */}
      {singleResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl p-5"
          style={{ background: 'rgba(52,216,166,0.06)', border: '1px solid rgba(52,216,166,0.2)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: 'rgba(52,216,166,0.15)' }}>
                <Check size={14} color="#34D8A6" />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#34D8A6', fontFamily: 'var(--font-heading)' }}>
                Device Provisioned — {singleResult.device.deviceName}
              </p>
            </div>
            <button onClick={() => setSingleResult(null)} className="rounded-lg p-1 hover:bg-white/5 transition-colors">
              <X size={15} color="rgba(244,251,255,0.4)" />
            </button>
          </div>

          <div className="flex gap-5 flex-wrap">
            {singleResult.qrCodeDataUrl && (
              <div className="shrink-0">
                <img
                  src={singleResult.qrCodeDataUrl}
                  alt="QR code"
                  className="h-36 w-36 rounded-xl"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <p className="mt-1 text-center text-[10px]" style={{ color: 'rgba(244,251,255,0.4)', fontFamily: 'var(--font-body)' }}>
                  Scan to activate
                </p>
              </div>
            )}
            <div className="flex-1 min-w-52 flex flex-col gap-2">
              <CredRow label="Device ID" value={singleResult.device.deviceId} mono />
              <CredRow label="Activation PIN" value={singleResult.device.activationPin ?? ''} />
              {singleResult.device.secretKey && (
                <CredRow label="Secret Key" value={singleResult.device.secretKey} mono />
              )}
              <p className="mt-1 text-[11px]" style={{ color: 'rgba(244,251,255,0.35)', fontFamily: 'var(--font-body)' }}>
                Save these credentials — they are used to activate the physical device.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Devices table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-sm font-semibold" style={{ color: 'rgba(244,251,255,0.68)', fontFamily: 'var(--font-heading)' }}>
            All Devices ({devices.length})
          </span>
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <RefreshCw size={14} color="rgba(244,251,255,0.42)" />
          </button>
        </div>

        {listError ? (
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm" style={{ color: '#FB7185', fontFamily: 'var(--font-body)' }}>{listError}</p>
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)', color: '#FB7185', fontFamily: 'var(--font-body)' }}
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>Loading…</div>
        ) : devices.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>No devices provisioned yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Name', 'Device ID', 'Reg Code', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(244,251,255,0.4)', fontFamily: 'var(--font-body)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devices.map((d, i) => (
                  <motion.tr
                    key={d._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-t hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: '#F4FBFF', fontFamily: 'var(--font-body)' }}>{d.deviceName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <CopyCell value={d.deviceId} />
                    </td>
                    <td className="px-4 py-3">
                      {d.registrationCode ? <CopyCell value={d.registrationCode} /> : <span className="text-xs" style={{ color: 'rgba(244,251,255,0.3)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={d.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setQrDevice(d)}
                          className="p-1.5 rounded-lg hover:bg-cyan-500/10 transition-colors"
                          title="View QR code"
                        >
                          <QrCode size={13} color="#22D3EE" />
                        </button>
                        {d.status === 'unclaimed' && (
                          <button
                            onClick={() => handleRotateCode(d)}
                            className="p-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors"
                            title="Rotate registration code"
                          >
                            <RotateCw size={13} color="#FBBF24" />
                          </button>
                        )}
                        {d.status !== 'decommissioned' && (
                          <button
                            onClick={() => handleDecommission(d._id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Decommission"
                          >
                            <Trash2 size={13} color="#FB7185" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
