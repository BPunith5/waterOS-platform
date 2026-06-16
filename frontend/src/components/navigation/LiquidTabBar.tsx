import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, Droplet, BarChart3, Bell, User, Cpu, Map as MapIcon, Settings } from 'lucide-react';
import { colors, gradients } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

const MAIN_TABS = [
  { path: '/', icon: LayoutGrid, label: 'Dashboard', color: colors.cyan },
  { path: '/tanks', icon: Droplet, label: 'Tanks', color: colors.teal },
  { path: '/devices', icon: Cpu, label: 'Sensors', color: colors.electricBlue },
  { path: '/map', icon: MapIcon, label: 'Map', color: colors.seafoam },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', color: colors.aqua },
  { path: '/alerts', icon: Bell, label: 'Alerts', color: colors.warning },
] as const;

const BOTTOM_TABS = [
  { path: '/profile', icon: User, label: 'Profile', color: colors.textSecondary },
  { path: '/settings', icon: Settings, label: 'Settings', color: colors.textSecondary },
] as const;

const MOBILE_TABS = [
  { path: '/', icon: LayoutGrid, label: 'Dashboard', color: colors.cyan },
  { path: '/tanks', icon: Droplet, label: 'Tanks', color: colors.teal },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', color: colors.aqua },
  { path: '/alerts', icon: Bell, label: 'Alerts', color: colors.warning },
  { path: '/profile', icon: User, label: 'Profile', color: colors.textSecondary },
] as const;

function isActive(tabPath: string, pathname: string) {
  return tabPath === '/' ? pathname === '/' : pathname.startsWith(tabPath);
}

export function LiquidTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* ── Mobile: bottom pill bar ── */}
      <div className="fixed inset-x-3 bottom-5 z-40 flex justify-center md:hidden">
        <div
          className="flex w-full max-w-sm items-center justify-around rounded-[28px] px-2 py-2"
          style={{
            background: 'rgba(3, 20, 46, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${colors.glassBorder}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.06)',
          }}
        >
          {MOBILE_TABS.map((tab) => {
            const active = isActive(tab.path, location.pathname);
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all"
                style={{ minWidth: 48 }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200"
                  style={{
                    background: active ? linearGradient(gradients.aquaGlow) : 'transparent',
                    boxShadow: active ? `0 0 12px ${tab.color}66` : 'none',
                  }}
                >
                  <Icon size={18} color={active ? colors.textInverse : colors.textTertiary} />
                </div>
                <span
                  className="text-[9px] font-semibold tracking-wide"
                  style={{
                    color: active ? tab.color : colors.textTertiary,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop: left sidebar full height ── */}
      <motion.div
        className="fixed left-0 top-0 z-40 hidden h-full flex-col md:flex"
        animate={{ width: expanded ? 220 : 68 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{ overflow: 'hidden' }}
      >
        <div
          className="flex h-full flex-col py-4"
          style={{
            background: 'rgba(2, 10, 28, 0.96)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRight: `1px solid ${colors.glassBorder}`,
          }}
        >
          {/* Logo */}
          <div className="mb-4 flex items-center gap-3 overflow-hidden px-4 pb-4" style={{ borderBottom: `1px solid ${colors.glassBorder}` }}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ background: linearGradient(gradients.aquaGlow), boxShadow: `0 0 16px ${colors.cyan}66` }}
            >
              <Droplet size={16} color={colors.textInverse} fill={colors.textInverse} />
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap text-sm font-bold"
                  style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
                >
                  WaterOS
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Main nav */}
          <div className="flex flex-1 flex-col gap-1 px-2">
            {MAIN_TABS.map((tab) => {
              const active = isActive(tab.path, location.pathname);
              const Icon = tab.icon;
              return (
                <SidebarItem
                  key={tab.path}
                  icon={Icon}
                  label={tab.label}
                  color={tab.color}
                  active={active}
                  expanded={expanded}
                  onClick={() => navigate(tab.path)}
                />
              );
            })}
          </div>

          {/* Divider */}
          <div className="mx-4 my-3 mt-auto" style={{ height: 1, backgroundColor: colors.glassBorder }} />

          {/* Bottom nav */}
          <div className="flex flex-col gap-1 px-2 pb-2">
            {BOTTOM_TABS.map((tab) => {
              const active = isActive(tab.path, location.pathname);
              const Icon = tab.icon;
              return (
                <SidebarItem
                  key={tab.path}
                  icon={Icon}
                  label={tab.label}
                  color={tab.color}
                  active={active}
                  expanded={expanded}
                  onClick={() => navigate(tab.path)}
                />
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  color,
  active,
  expanded,
  onClick,
}: {
  icon: typeof Droplet;
  label: string;
  color: string;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 overflow-hidden rounded-xl transition-all duration-150"
      style={{
        height: 44,
        paddingLeft: 10,
        paddingRight: expanded ? 12 : 10,
        background: active
          ? linearGradient(gradients.aquaGlow)
          : hovered
            ? 'rgba(255,255,255,0.08)'
            : 'transparent',
        boxShadow: active ? `0 0 20px ${color}44` : 'none',
        minWidth: 44,
      }}
    >
      <Icon
        size={20}
        color={active ? colors.textInverse : hovered ? color : colors.textTertiary}
        style={{ flexShrink: 0, transition: 'color 0.15s' }}
      />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.14 }}
            className="whitespace-nowrap text-sm font-semibold"
            style={{
              color: active ? colors.textInverse : hovered ? colors.textPrimary : colors.textSecondary,
              fontFamily: 'var(--font-body)',
              transition: 'color 0.15s',
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
