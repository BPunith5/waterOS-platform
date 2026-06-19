import { useEffect, useState } from 'react';
import { Link2, Link2Off, RefreshCw } from 'lucide-react';
import { api, type AdminRecord, type DeviceRecord } from '@/lib/api';

export function ConsoleAssign() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [a, d] = await Promise.all([api.superadmin.listAdmins(), api.superadmin.listDevices()]);
      setAdmins(a);
      setDevices(d);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }

  async function handleAssign() {
    if (!selectedAdmin || !selectedDevice) return;
    setAssigning(true); setMsg(null);
    try {
      await api.superadmin.assignDevice(selectedDevice, selectedAdmin);
      setMsg({ type: 'ok', text: 'Device assigned' });
      load();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed' });
    } finally { setAssigning(false); }
  }

  async function handleUnassign(deviceId: string, adminId: string) {
    try { await api.superadmin.unassignDevice(deviceId, adminId); load(); }
    catch { /* noop */ }
  }

  // Build assignments view: each device → its assigned admins
  const assigned = devices.filter(d => d.assignedAdminIds && d.assignedAdminIds.length > 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold mb-6" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>Device Assignment</h1>

      {/* Assign Form */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'rgba(244,251,255,0.68)', fontFamily: 'var(--font-heading)' }}>Assign Device to Admin</h2>
        <div className="flex gap-3">
          <select
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
            value={selectedDevice}
            onChange={e => setSelectedDevice(e.target.value)}
          >
            <option value="">Select device…</option>
            {devices.map(d => (
              <option key={d._id} value={d._id} style={{ background: '#03142E' }}>
                {d.deviceName} ({d.status})
              </option>
            ))}
          </select>
          <select
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
            value={selectedAdmin}
            onChange={e => setSelectedAdmin(e.target.value)}
          >
            <option value="">Select admin…</option>
            {admins.map(a => (
              <option key={a._id} value={a._id} style={{ background: '#03142E' }}>
                {a.name} — {a.email}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={assigning || !selectedAdmin || !selectedDevice}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)', color: '#22D3EE', fontFamily: 'var(--font-body)' }}
          >
            <Link2 size={15} />
            {assigning ? 'Assigning…' : 'Assign'}
          </button>
        </div>
        {msg && (
          <p className="mt-2 text-sm" style={{ color: msg.type === 'ok' ? '#34D8A6' : '#FB7185', fontFamily: 'var(--font-body)' }}>{msg.text}</p>
        )}
      </div>

      {/* Current Assignments */}
      <div className="rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <span className="text-sm font-semibold" style={{ color: 'rgba(244,251,255,0.68)', fontFamily: 'var(--font-heading)' }}>Current Assignments</span>
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <RefreshCw size={14} color="rgba(244,251,255,0.42)" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>Loading…</div>
        ) : assigned.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>No assignments yet</div>
        ) : (
          assigned.map(device => (
            <div key={device._id} className="px-5 py-4 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#F4FBFF', fontFamily: 'var(--font-body)' }}>{device.deviceName}</p>
              <div className="flex flex-wrap gap-2">
                {(device.assignedAdminIds ?? []).map(adminId => {
                  const admin = admins.find(a => a._id === adminId);
                  return (
                    <span
                      key={adminId}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs"
                      style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.18)', color: '#22D3EE', fontFamily: 'var(--font-body)' }}
                    >
                      {admin?.name ?? adminId}
                      <button onClick={() => handleUnassign(device._id, adminId)}>
                        <Link2Off size={11} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
