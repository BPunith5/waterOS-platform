import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { OceanBackground } from '@/components/water/OceanBackground';
import { LiquidTabBar } from '@/components/navigation/LiquidTabBar';
import { ToastStack } from '@/components/glass/Toast';
import { CursorGlow } from '@/components/effects/CursorGlow';

const ROUTE_ORDER: Record<string, number> = {
  '/app': 0,
  '/tanks': 1,
  '/tanks/new': 2,
  '/devices': 1,
  '/devices/add': 2,
  '/analytics': 1,
  '/alerts': 1,
  '/map': 1,
  '/profile': 1,
  '/settings': 1,
};

function getRouteDepth(path: string): number {
  if (ROUTE_ORDER[path] !== undefined) return ROUTE_ORDER[path];
  if (path.match(/^\/tanks\/.+\/edit/)) return 3;
  if (path.match(/^\/tanks\/.+/)) return 2;
  return 1;
}

export function AppShell() {
  const location = useLocation();
  const prevDepth = useRef(getRouteDepth(location.pathname));
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const current = getRouteDepth(location.pathname);
    setDirection(current >= prevDepth.current ? 1 : -1);
    prevDepth.current = current;
  }, [location.pathname]);

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir * 48,
      scale: 0.975,
      filter: 'blur(6px)',
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir * -48,
      scale: 0.975,
      filter: 'blur(6px)',
    }),
  };

  return (
    <div className="relative min-h-screen">
      <OceanBackground />
      <CursorGlow />

      <main className="relative px-4 pb-32 pt-6 md:pl-20 md:pb-10 md:pr-8 md:pt-8">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={location.pathname}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.38,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
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
