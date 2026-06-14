import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Droplet, BarChart3, Bell, User, Cpu, Map as MapIcon, Settings } from 'lucide-react';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { colors, gradients, radius, shadows } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

const TABS = [
  { path: '/', icon: LayoutGrid, label: 'Dashboard' },
  { path: '/tanks', icon: Droplet, label: 'Tanks' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/profile', icon: User, label: 'Profile' },
] as const;

const DESKTOP_TABS = [
  { path: '/', icon: LayoutGrid, label: 'Dashboard' },
  { path: '/tanks', icon: Droplet, label: 'Tanks' },
  { path: '/devices', icon: Cpu, label: 'Devices' },
  { path: '/map', icon: MapIcon, label: 'Map' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
] as const;

function findActiveIndex(tabs: readonly { path: string }[], pathname: string) {
  return Math.max(
    0,
    tabs.findIndex((t) => (t.path === '/' ? pathname === '/' : pathname.startsWith(t.path))),
  );
}

export function LiquidTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = findActiveIndex(TABS, location.pathname);
  const desktopActiveIndex = findActiveIndex(DESKTOP_TABS, location.pathname);

  return (
    <>
      {/* Mobile: fixed bottom pill bar */}
      <div className="fixed inset-x-4 bottom-7 z-40 flex justify-center pointer-events-none md:hidden">
        <GlassSurface
          borderRadius={radius.xl}
          intensity={50}
          className="pointer-events-auto w-full max-w-md"
          style={{ boxShadow: shadows.glow(colors.cyan, 0.25) }}
        >
          <div className="relative flex p-1.5">
            <motion.div
              className="absolute top-1.5 overflow-hidden"
              style={{ width: `${100 / TABS.length}%`, height: 52, borderRadius: radius.lg }}
              animate={{ x: `${activeIndex * 100}%` }}
              transition={{ type: 'spring', damping: 16, stiffness: 180 }}
            >
              <div className="h-full w-full" style={{ backgroundImage: linearGradient(gradients.aquaGlow) }} />
            </motion.div>
            {TABS.map((tab, i) => {
              const isActive = i === activeIndex;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() => !isActive && navigate(tab.path)}
                  className="relative z-10 flex flex-1 items-center justify-center gap-1.5"
                  style={{ height: 52 }}
                >
                  <Icon size={22} color={isActive ? colors.textInverse : colors.textSecondary} />
                  {isActive && (
                    <span
                      className="text-sm font-semibold"
                      style={{ color: colors.textInverse, fontFamily: 'var(--font-body)' }}
                    >
                      {tab.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </GlassSurface>
      </div>

      {/* Desktop: fixed left sidebar */}
      <div className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 md:flex">
        <GlassSurface
          borderRadius={radius.xl}
          intensity={50}
          className="flex flex-col p-1.5"
          style={{ boxShadow: shadows.glow(colors.cyan, 0.25) }}
        >
          <div className="relative flex flex-col">
            <motion.div
              className="absolute overflow-hidden"
              style={{ width: 52, height: 52, left: 4, top: 4, borderRadius: radius.lg }}
              animate={{ y: desktopActiveIndex * 60 }}
              transition={{ type: 'spring', damping: 16, stiffness: 180 }}
            >
              <div className="h-full w-full" style={{ backgroundImage: linearGradient(gradients.aquaGlow) }} />
            </motion.div>
            {DESKTOP_TABS.map((tab, i) => {
              const isActive = i === desktopActiveIndex;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.path}
                  type="button"
                  title={tab.label}
                  onClick={() => !isActive && navigate(tab.path)}
                  className="relative z-10 flex items-center justify-center"
                  style={{ width: 60, height: 60 }}
                >
                  <Icon size={22} color={isActive ? colors.textInverse : colors.textSecondary} />
                </button>
              );
            })}
          </div>
        </GlassSurface>
      </div>
    </>
  );
}
