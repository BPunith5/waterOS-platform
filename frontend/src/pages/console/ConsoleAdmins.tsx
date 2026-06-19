import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, RefreshCw } from 'lucide-react';
import { api, type AdminRecord } from '@/lib/api';

export function ConsoleAdmins() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setAdmins(await api.superadmin.listAdmins()); }
    catch { /* noop */ }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null); setCreating(true);
    try {
      await api.superadmin.createAdmin(form);
      setForm({ name: '', email: '', password: '' });
      setSuccess('Admin created successfully');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    } finally { setCreating(false); }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Remove admin ${email}?`)) return;
    try {
      await api.superadmin.deactivateAdmin(id);
      load();
    } catch { /* noop */ }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold mb-6" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>Admin Management</h1>

      {/* Create Admin Form */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'rgba(244,251,255,0.68)', fontFamily: 'var(--font-heading)' }}>Create Admin Account</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-3 gap-3">
          <input
            className="rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
            placeholder="Full name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            type="email"
            className="rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            type="password"
            className="rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F4FBFF', fontFamily: 'var(--font-body)' }}
            placeholder="Password (min 6)"
            minLength={6}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="col-span-3 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)', color: '#22D3EE', fontFamily: 'var(--font-body)' }}
          >
            <UserPlus size={15} />
            {creating ? 'Creating…' : 'Create Admin'}
          </button>
        </form>
        {error && <p className="mt-2 text-sm" style={{ color: '#FB7185', fontFamily: 'var(--font-body)' }}>{error}</p>}
        {success && <p className="mt-2 text-sm" style={{ color: '#34D8A6', fontFamily: 'var(--font-body)' }}>{success}</p>}
      </div>

      {/* Admin List */}
      <div className="rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <span className="text-sm font-semibold" style={{ color: 'rgba(244,251,255,0.68)', fontFamily: 'var(--font-heading)' }}>
            Admins ({admins.length})
          </span>
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <RefreshCw size={14} color="rgba(244,251,255,0.42)" />
          </button>
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>Loading…</div>
        ) : admins.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>No admins yet</div>
        ) : (
          admins.map((admin, i) => (
            <motion.div
              key={admin._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between px-5 py-3.5 border-b last:border-b-0"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: '#F4FBFF', fontFamily: 'var(--font-body)' }}>{admin.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>{admin.email}</p>
              </div>
              <button
                onClick={() => handleDelete(admin._id, admin.email)}
                className="p-2 rounded-xl hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={15} color="#FB7185" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
