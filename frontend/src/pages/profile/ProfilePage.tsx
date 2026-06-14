import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  HelpCircle,
  Info,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  User as UserIcon,
  Waves,
} from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { IconButton } from '@/components/glass/IconButton';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { MenuRow } from '@/components/glass/MenuRow';
import { StatCard } from '@/components/glass/StatCard';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { colors, gradients, radius } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tankCount, setTankCount] = useState(0);
  const [avgHealth, setAvgHealth] = useState(0);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [tanks, devices, alerts] = await Promise.all([api.tanks.list(), api.devices.list(), api.alerts.list()]);
      setTankCount(tanks.length);
      const healthScores = devices.filter((d) => d.tankId).map((d) => d.healthScore / 100);
      setAvgHealth(healthScores.length > 0 ? healthScores.reduce((a, b) => a + b, 0) / healthScores.length : 0);
      setUnreadAlerts(alerts.filter((a) => !a.read).length);
      setLoading(false);
    })();
  }, []);

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          Profile
        </h1>
        <IconButton icon={SettingsIcon} onClick={() => navigate('/settings')} />
      </div>

      <GlassSurface borderRadius={radius.xl} className="mb-5 flex flex-col items-center gap-1 p-8 text-center">
        <span
          className="relative mb-2 inline-flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full"
          style={{ backgroundImage: linearGradient(gradients.aquaGlow), boxShadow: '0 0 24px rgba(34,211,238,0.5)' }}
        >
          <span className="text-xl font-bold" style={{ color: colors.textInverse, fontFamily: 'var(--font-heading)' }}>
            {initials}
          </span>
        </span>
        <p className="text-lg font-bold" style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}>
          {user?.name}
        </p>
        <p className="text-sm" style={{ color: colors.textSecondary, fontFamily: 'var(--font-body)' }}>
          {user?.email}
        </p>
        {memberSince && (
          <p className="mt-1 text-xs" style={{ color: colors.textTertiary, fontFamily: 'var(--font-body)' }}>
            Member since {memberSince}
          </p>
        )}
      </GlassSurface>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatCard icon={Waves} value={loading ? '—' : `${tankCount}`} label="Tanks Managed" color={colors.cyan} />
        <StatCard icon={Activity} value={loading ? '—' : `${Math.round(avgHealth * 100)}%`} label="Fleet Health" color={colors.aqua} />
        <StatCard icon={Bell} value={loading ? '—' : `${unreadAlerts}`} label="Alerts" color={colors.danger} />
      </div>

      <p className="mb-3 ml-1 text-sm font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-heading)' }}>
        Account
      </p>
      <GlassSurface borderRadius={radius.lg} className="mb-8 flex flex-col gap-0 px-4">
        <MenuRow icon={UserIcon} label="Edit Profile" />
        <div className="h-px" style={{ backgroundColor: colors.glassBorder, marginLeft: 48 }} />
        <MenuRow icon={Shield} label="Security & Privacy" />
        <div className="h-px" style={{ backgroundColor: colors.glassBorder, marginLeft: 48 }} />
        <MenuRow icon={SettingsIcon} label="App Settings" onClick={() => navigate('/settings')} />
      </GlassSurface>

      <p className="mb-3 ml-1 text-sm font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary, fontFamily: 'var(--font-heading)' }}>
        Support
      </p>
      <GlassSurface borderRadius={radius.lg} className="mb-8 flex flex-col gap-0 px-4">
        <MenuRow icon={HelpCircle} label="Help Center" />
        <div className="h-px" style={{ backgroundColor: colors.glassBorder, marginLeft: 48 }} />
        <MenuRow icon={Info} label="About WaterOS" value="v1.0.0" showChevron={false} />
      </GlassSurface>

      <LiquidButton
        label="Log Out"
        variant="ghost"
        icon={<LogOut size={18} color={colors.danger} />}
        onClick={handleLogout}
        fullWidth
      />
    </div>
  );
}
