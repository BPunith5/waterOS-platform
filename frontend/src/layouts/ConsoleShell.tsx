import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Users, Cpu, Link2, FileText, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { OceanBackground } from '@/components/water/OceanBackground';

const NAV = [
  { to: '/console/admins', icon: Users, label: 'Admins' },
  { to: '/console/devices', icon: Cpu, label: 'Devices' },
  { to: '/console/assign', icon: Link2, label: 'Assign' },
  { to: '/console/audit', icon: FileText, label: 'Audit Log' },
];

export function ConsoleShell() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="relative flex min-h-screen">
      <OceanBackground />

      {/* Sidebar */}
      <aside
        className="relative z-10 flex w-56 flex-col border-r"
        style={{ background: 'rgba(1,4,15,0.92)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.3)' }}>
            <Shield size={16} color="#FB7185" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: '#F4FBFF', fontFamily: 'var(--font-heading)' }}>WaterOS</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#FB7185', fontFamily: 'var(--font-body)' }}>Super Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                fontFamily: 'var(--font-body)',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="px-3 text-[11px] truncate mb-2" style={{ color: 'rgba(244,251,255,0.42)', fontFamily: 'var(--font-body)' }}>{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/5"
            style={{ color: 'rgba(244,251,255,0.5)', fontFamily: 'var(--font-body)' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
