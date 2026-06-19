import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, Droplet, BarChart3, Bell, User, Cpu, Map as MapIcon, Settings } from 'lucide-react';
import { colors, gradients } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

const MAIN_TABS = [
  { path: '/app',       icon: LayoutGrid, label: 'Dashboard', color: colors.cyan },
  { path: '/tanks',     icon: Droplet,    label: 'Tanks',     color: colors.teal },
  { path: '/devices',   icon: Cpu,        label: 'Sensors',   color: colors.electricBlue },
  { path: '/map',       icon: MapIcon,    label: 'Map',       color: colors.seafoam },
  { path: '/analytics', icon: BarChart3,  label: 'Analytics', color: colors.aqua },
  { path: '/alerts',    icon: Bell,       label: 'Alerts',    color: colors.warning },
] as const;

const BOTTOM_TABS = [
  { path: '/profile',  icon: User,     label: 'Profile',  color: colors.textSecondary },
  { path: '/settings', icon: Settings, label: 'Settings', color: colors.textSecondary },
] as const;

const MOBILE_TABS = [
  { path: '/app',       icon: LayoutGrid, label: 'Dashboard', color: colors.cyan },
  { path: '/tanks',     icon: Droplet,    label: 'Tanks',     color: colors.teal },
  { path: '/analytics', icon: BarChart3,  label: 'Analytics', color: colors.aqua },
  { path: '/alerts',    icon: Bell,       label: 'Alerts',    color: colors.warning },
  { path: '/profile',   icon: User,       label: 'Profile',   color: colors.textSecondary },
] as const;

function isActive(tabPath: string, pathname: string) {
  return tabPath === '/app' ? pathname === '/app' : pathname.startsWith(tabPath);
}

export function LiquidTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const activeMain = MAIN_TABS.findIndex((t) => isActive(t.path, location.pathname));

  return (
    <>
      {/* ── Mobile: bottom pill bar ── */}
      <div className="fixed inset-x-3 bottom-5 z-40 flex justify-center md:hidden">
        <div
          className="flex w-full max-w-sm items-center justify-around rounded-[28px] px-2 py-2"
          style={{
            background: 'rgba(3, 20, 46, 0.88)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: `1px solid ${colors.glassBorder}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.06)',
          }}
        >
          {MOBILE_TABS.map((tab) => {
            const active = isActive(tab.path, location.pathname);
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                whileTap={{ scale: 0.88 }}
                className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl"
                style={{ minWidth: 48 }}
              >
                <motion.div
                  animate={{
                    background: active ? linearGradient(gradients.aquaGlow) : 'transparent',
                    boxShadow: active ? `0 0 16px ${tab.color}80` : 'none',
                    scale: active ? 1.08 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                >
                  <Icon size={18} color={active ? colors.textInverse : colors.textTertiary} />
                </motion.div>
                <span
                  className="text-[9px] font-semibold tracking-wide"
                  style={{ color: active ? tab.color : colors.textTertiary, fontFamily: 'var(--font-body)' }}
                >
                  {tab.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute -bottom-1 left-1/2 h-0.5 w-4 rounded-full"
                    style={{ background: tab.color, x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop: left sidebar ── */}
      <motion.div
        className="fixed left-0 top-0 z-40 hidden h-full flex-col md:flex"
        animate={{ width: expanded ? 224 : 68 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{ overflow: 'hidden' }}
      >
        <div
          className="flex h-full flex-col py-4"
          style={{
            background: 'rgba(1, 6, 20, 0.97)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderRight: `1px solid ${colors.glassBorder}`,
            boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <div
            className="mb-4 flex items-center gap-3 overflow-hidden px-4 pb-4"
            style={{ borderBottom: `1px solid ${colors.glassBorder}` }}
          >
            <motion.div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ background: linearGradient(gradients.aquaGlow) }}
              animate={{ boxShadow: [`0 0 12px ${colors.cyan}55`, `0 0 24px ${colors.cyan}88`, `0 0 12px ${colors.cyan}55`] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Droplet size={16} color={colors.textInverse} fill={colors.textInverse} />
            </motion.div>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.16 }}
                  className="whitespace-nowrap text-sm font-bold tracking-wide"
                  style={{ color: colors.textPrimary, fontFamily: 'var(--font-heading)' }}
                >
                  WaterOS
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Main nav with sliding indicator */}
          <div className="relative flex flex-1 flex-col gap-0.5 px-2">
            {activeMain !== -1 && (
              <motion.div
                className="absolute left-0 w-0.5 rounded-full"
                style={{
                  height: 28,
                  background: MAIN_TABS[activeMain]?.color ?? colors.cyan,
                  boxShadow: `0 0 10px ${MAIN_TABS[activeMain]?.color ?? colors.cyan}`,
                }}
                animate={{ top: 6 + activeMain * 46 }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
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
          <div className="mx-4 my-2 mt-auto" style={{ height: 1, backgroundColor: colors.glassBorder }} />

          {/* Bottom nav */}
          <div className="flex flex-col gap-0.5 px-2 pb-2">
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
  icon: Icon, label, color, active, expanded, onClick,
}: {
  icon: typeof Droplet; label: string; color: string;
  active: boolean; expanded: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.94 }}
      className="flex items-center gap-3 overflow-hidden rounded-xl"
      style={{
        height: 44,
        paddingLeft: 10,
        paddingRight: expanded ? 12 : 10,
        minWidth: 44,
        position: 'relative',
      }}
    >
      {/* bg layer */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          background: active
            ? linearGradient(gradients.aquaGlow)
            : hovered
              ? 'rgba(255,255,255,0.07)'
              : 'transparent',
          boxShadow: active ? `0 0 20px ${color}44, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
        }}
        transition={{ duration: 0.2 }}
      />

      {/* icon */}
      <motion.div
        animate={{ scale: hovered && !active ? 1.18 : 1, rotate: hovered && !active ? -4 : 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 18 }}
        style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}
      >
        <Icon
          size={20}
          color={active ? colors.textInverse : hovered ? color : colors.textTertiary}
          style={{ transition: 'color 0.15s' }}
        />
      </motion.div>

      {/* label */}
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="relative z-[1] whitespace-nowrap text-sm font-semibold"
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

      {/* active glow behind icon */}
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(circle at 22px 50%, ${color}30, transparent 60%)` }}
        />
      )}
    </motion.button>
  );
}
