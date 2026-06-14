import { LogOut, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { useAuth } from '@/context/AuthContext';
import { colors, radius } from '@/theme/tokens';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-1 text-base" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          Your dashboard is coming together.
        </p>
      </div>

      <GlassSurface borderRadius={radius.xl} className="p-6">
        <p className="mb-4 text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          Signed in as <span style={{ color: colors.textPrimary }}>{user?.email}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          <LiquidButton label="Manage Devices" variant="primary" icon={<Cpu size={18} color={colors.textInverse} />} onClick={() => navigate('/devices')} />
          <LiquidButton label="Log Out" variant="glass" icon={<LogOut size={18} color={colors.textPrimary} />} onClick={logout} />
        </div>
      </GlassSurface>
    </div>
  );
}
