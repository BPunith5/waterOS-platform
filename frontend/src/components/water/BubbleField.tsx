import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

// Deterministic pseudo-random generator so the field looks the same
// across renders without needing real randomness.
function seeded(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

type BubbleSpec = {
  size: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
  startFrac: number;
};

function Bubble({
  size,
  left,
  duration,
  delay,
  opacity,
  startFrac,
  screenHeight,
  waterHeight,
  origin,
}: BubbleSpec & { screenHeight: number; waterHeight: number; origin: 'top' | 'bottom' }) {
  const seconds = duration / 1000;
  const delaySeconds = delay / 1000;
  // Bubbles spawn from somewhere within the body of water and rise up
  // through the surface, like water turning into bubbles.
  const startY = origin === 'bottom' ? screenHeight - waterHeight * startFrac : screenHeight * 0.15;

  return (
    <motion.div
      className="absolute overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        left,
        border: '1px solid rgba(255,255,255,0.25)',
        backgroundImage: 'linear-gradient(160deg, rgba(255,255,255,0.55), rgba(255,255,255,0.05))',
      }}
      initial={{ y: startY, x: 0, opacity: 0 }}
      animate={{
        y: -size * 2,
        x: [0, 14, 0, -14, 0],
        opacity: [0, opacity, opacity, 0],
      }}
      transition={{
        y: { duration: seconds, delay: delaySeconds, repeat: Infinity, ease: 'linear' },
        x: { duration: seconds, delay: delaySeconds, repeat: Infinity, ease: 'linear', times: [0, 0.25, 0.5, 0.75, 1] },
        opacity: { duration: seconds, delay: delaySeconds, repeat: Infinity, ease: 'linear', times: [0, 0.08, 0.85, 1] },
      }}
    />
  );
}

type BubbleFieldProps = {
  count?: number;
  seedOffset?: number;
  /** Where bubbles spawn from: 'bottom' rises from the water body for a "filling" feel. */
  origin?: 'top' | 'bottom';
  /** Height in px of the body of water at the bottom of the screen, used when origin is 'bottom'. */
  waterHeight?: number;
};

/** A field of slowly rising, glassy bubbles for ambient depth. */
export function BubbleField({ count = 14, seedOffset = 0, origin = 'top', waterHeight = 0 }: BubbleFieldProps) {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const bubbles = useMemo<BubbleSpec[]>(() => {
    return Array.from({ length: count }).map((_, i) => {
      const r1 = seeded(i + 1 + seedOffset);
      const r2 = seeded(i + 51 + seedOffset);
      const r3 = seeded(i + 101 + seedOffset);
      const r4 = seeded(i + 151 + seedOffset);
      const r5 = seeded(i + 201 + seedOffset);
      return {
        size: 6 + r1 * 26,
        left: r2 * (viewport.width - 30),
        duration: 9000 + r3 * 9000,
        delay: r4 * 9000,
        opacity: 0.15 + r1 * 0.35,
        startFrac: r5,
      };
    });
  }, [count, seedOffset, viewport.width]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {bubbles.map((b, i) => (
        <Bubble key={i} {...b} screenHeight={viewport.height} waterHeight={waterHeight} origin={origin} />
      ))}
    </div>
  );
}
