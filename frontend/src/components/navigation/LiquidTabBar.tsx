import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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

const SIDEBAR_COLLAPSED = 60;
const SIDEBAR_EXPANDED = 196;
const ROW_HEIGHT = 60;
const PILL_SIZE = 52;

export function LiquidTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarHovered, setSidebarHovered] = useState(false);

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

      {/* Desktop: fixed left sidebar, expands on hover to reveal labels */}
      <div
        className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 md:flex"
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <GlassSurface
          borderRadius={radius.xl}
          intensity={50}
          className="flex flex-col p-1.5"
          style={{ boxShadow: shadows.glow(colors.cyan, 0.25) }}
        >
          <motion.div
            className="relative flex flex-col"
            initial={false}
            animate={{ width: sidebarHovered ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
          >
            <motion.div
              className="absolute overflow-hidden"
              style={{ height: PILL_SIZE, left: 4, top: 4, borderRadius: radius.lg }}
              initial={false}
              animate={{ y: desktopActiveIndex * ROW_HEIGHT, width: sidebarHovered ? SIDEBAR_EXPANDED - 8 : PILL_SIZE }}
              transition={{ type: 'spring', damping: 18, stiffness: 200 }}
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
                  onClick={() => !isActive && navigate(tab.path)}
                  className="relative z-10 flex items-center overflow-hidden"
                  style={{ height: ROW_HEIGHT, width: '100%', paddingLeft: 19 }}
                >
                  <Icon size={22} color={isActive ? colors.textInverse : colors.textSecondary} style={{ flexShrink: 0 }} />
                  <AnimatePresence>
                    {sidebarHovered && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="ml-3 whitespace-nowrap text-sm font-semibold"
                        style={{ color: isActive ? colors.textInverse : colors.textSecondary, fontFamily: 'var(--font-body)' }}
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </motion.div>
        </GlassSurface>
      </div>
    </>
  );
}
