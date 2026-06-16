import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { OceanBackground } from '@/components/water/OceanBackground';
import { LiquidTabBar } from '@/components/navigation/LiquidTabBar';
import { ToastStack } from '@/components/glass/Toast';

export function AppShell() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen">
      <OceanBackground />
      <main className="relative px-4 pb-32 pt-6 md:pl-24 md:pb-10 md:pr-8 md:pt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <LiquidTabBar />
      <ToastStack />
    </div>
  );
}
