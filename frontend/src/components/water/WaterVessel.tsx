import { useEffect, useId, useMemo, useRef } from 'react';
import { animate, motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { colors } from '@/theme/tokens';

type Props = {
  width?: number;
  height?: number;
  percentage: number; // 0-1
  color?: string;
  radius?: number;
  showBubbles?: boolean;
};

function seeded(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/**
 * A vertical glass vessel (rounded rectangle) with an animated
 * sine-wave water fill — the core visual for tank cards and the
 * tank detail hero.
 */
export function WaterVessel({
  width = 120,
  height = 220,
  percentage,
  color = colors.cyan,
  radius = 28,
  showBubbles = true,
}: Props) {
  const id = useId().replace(/:/g, '');
  const fill = useMotionValue(0);
  const phase = useMotionValue(0);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const controls = animate(fill, Math.max(0, Math.min(1, percentage)), {
      duration: 1.6,
      ease: [0.215, 0.61, 0.355, 1],
    });
    return () => controls.stop();
  }, [percentage, fill]);

  useAnimationFrame((t) => {
    phase.set(((t / 4200) * Math.PI * 2) % (Math.PI * 2));

    const amplitude = width * 0.05;
    const baseY = height * (1 - fill.get());
    const steps = 12;
    let d = `M0 ${baseY.toFixed(2)}`;
    for (let i = 1; i <= steps; i++) {
      const x = (width / steps) * i;
      const y = baseY + Math.sin((x / width) * Math.PI * 4 + phase.get()) * amplitude;
      d += ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    d += ` L${width} ${height} L0 ${height} Z`;
    pathRef.current?.setAttribute('d', d);
  });

  const bubbles = useMemo(
    () =>
      Array.from({ length: showBubbles ? 4 : 0 }).map((_, i) => ({
        left: 10 + seeded(i + 7) * (width - 24),
        size: 4 + seeded(i + 21) * 7,
        duration: 3200 + seeded(i + 33) * 2600,
        delay: seeded(i + 44) * 2400,
      })),
    [width, showBubbles],
  );

  return (
    <div style={{ width, height, position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id={`vclip-${id}`}>
            <rect x={0} y={0} width={width} height={height} rx={radius} ry={radius} />
          </clipPath>
          <linearGradient id={`vgrad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={0.9} />
            <stop offset="1" stopColor={color} stopOpacity={0.45} />
          </linearGradient>
        </defs>
        {/* glass shell */}
        <rect
          x={0.75}
          y={0.75}
          width={width - 1.5}
          height={height - 1.5}
          rx={radius}
          ry={radius}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={1.5}
        />
        {/* water fill */}
        <path ref={pathRef} fill={`url(#vgrad-${id})`} clipPath={`url(#vclip-${id})`} />
        {/* glass shell outline on top */}
        <rect
          x={0.75}
          y={0.75}
          width={width - 1.5}
          height={height - 1.5}
          rx={radius}
          ry={radius}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1.5}
        />
      </svg>

      {/* glossy highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ top: 8, left: 8, bottom: 8, width: width * 0.32, borderRadius: radius, background: 'rgba(255,255,255,0.08)' }}
      />

      {/* rising bubbles inside the vessel */}
      {bubbles.map((b, i) => (
        <VesselBubble key={i} {...b} containerHeight={height} />
      ))}
    </div>
  );
}

function VesselBubble({
  left,
  size,
  duration,
  delay,
  containerHeight,
}: {
  left: number;
  size: number;
  duration: number;
  delay: number;
  containerHeight: number;
}) {
  const seconds = duration / 1000;
  const delaySeconds = delay / 1000;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute rounded-full"
      style={{
        left,
        bottom: 6,
        width: size,
        height: size,
        background: 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(255,255,255,0.4)',
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: -(containerHeight + size), opacity: [0, 0.6, 0.6, 0] }}
      transition={{
        y: { duration: seconds, delay: delaySeconds, repeat: Infinity, ease: 'linear' },
        opacity: { duration: seconds, delay: delaySeconds, repeat: Infinity, ease: 'linear', times: [0, 0.1, 0.8, 1] },
      }}
    />
  );
}
