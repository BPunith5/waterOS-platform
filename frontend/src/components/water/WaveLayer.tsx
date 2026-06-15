import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type WaveLayerProps = {
  color: string;
  opacity?: number;
  amplitude?: number;
  baseline?: number;
  duration?: number;
  bottom?: number;
  height?: number;
  reverse?: boolean;
};

/**
 * A single seamless, infinitely-scrolling wave shape. Two copies of the
 * same periodic bezier path are placed side by side and the whole row
 * is translated by one tile width in a linear loop, producing a
 * perfectly looping wave with no visible seam.
 */
export function WaveLayer({
  color,
  opacity = 0.5,
  amplitude = 18,
  baseline = 0.6,
  duration = 12000,
  bottom = 0,
  height = 200,
  reverse = false,
}: WaveLayerProps) {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const W = width;
  const A = height * baseline;
  const B = amplitude;
  // Periodic path: starts and ends at (0,A) and (W,A) with matching
  // tangents via the smooth-quadratic "T" command, so it tiles cleanly.
  const d = `M0 ${A} Q ${W * 0.25} ${A - B}, ${W * 0.5} ${A} T ${W} ${A} L ${W} ${height} L 0 ${height} Z`;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-0"
      style={{ bottom, height, width: W * 2, transition: 'bottom 1.1s ease, height 1.1s ease' }}
      animate={{ x: reverse ? [-W, 0] : [0, -W] }}
      transition={{ duration: duration / 1000, ease: 'linear', repeat: Infinity }}
    >
      <svg width={W * 2} height={height} viewBox={`0 0 ${W * 2} ${height}`}>
        <motion.path d={d} fillOpacity={opacity} initial={false} animate={{ fill: color }} transition={{ duration: 0.8, ease: 'easeInOut' }} />
        <motion.path
          d={d}
          fillOpacity={opacity}
          transform={`translate(${W}, 0)`}
          initial={false}
          animate={{ fill: color }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </svg>
    </motion.div>
  );
}
