import { useEffect, useId, useMemo, useRef } from 'react';
import { animate, motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { colors } from '@/theme/tokens';
import type { VesselShape } from '@/types';

type Props = {
  width?: number;
  height?: number;
  percentage: number; // 0-1
  color?: string;
  radius?: number;
  showBubbles?: boolean;
  shape?: VesselShape;
};

function seeded(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function buildPath(shape: VesselShape, w: number, h: number, r: number): string {
  switch (shape) {
    case 'pill': {
      const pr = Math.min(w / 2, h * 0.24);
      return `M ${pr},0 H ${w - pr} Q ${w},0 ${w},${pr} V ${h - pr} Q ${w},${h} ${w - pr},${h} H ${pr} Q 0,${h} 0,${h - pr} V ${pr} Q 0,0 ${pr},0 Z`;
    }
    case 'cone': {
      const tr = Math.min(7, w * 0.1);
      const bw = w * 0.34;
      const ch = h * 0.58;
      return [
        `M ${tr},0 H ${w - tr} Q ${w},0 ${w},${tr}`,
        `V ${ch} L ${w / 2 + bw / 2},${h - 1} L ${w / 2 - bw / 2},${h - 1} L 0,${ch}`,
        `V ${tr} Q 0,0 ${tr},0 Z`,
      ].join(' ');
    }
    case 'round':
      return ''; // handled with <ellipse>
    case 'rect':
    default: {
      const cr = Math.min(r, w / 2, h / 2);
      return `M ${cr},0 H ${w - cr} Q ${w},0 ${w},${cr} V ${h - cr} Q ${w},${h} ${w - cr},${h} H ${cr} Q 0,${h} 0,${h - cr} V ${cr} Q 0,0 ${cr},0 Z`;
    }
  }
}

export function WaterVessel({
  width = 120,
  height = 220,
  percentage,
  color = colors.cyan,
  radius = 24,
  showBubbles = true,
  shape = 'rect',
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
    phase.set(((t / 6000) * Math.PI * 2) % (Math.PI * 2));
    const amplitude = width * 0.03;
    const baseY = height * (1 - fill.get());
    const steps = 14;
    let d = `M -2 ${baseY.toFixed(2)}`;
    for (let i = 0; i <= steps; i++) {
      const x = ((width + 4) / steps) * i - 2;
      const y = baseY + Math.sin((x / width) * Math.PI * 4 + phase.get()) * amplitude;
      d += ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    d += ` L${width + 2} ${height + 2} L -2 ${height + 2} Z`;
    pathRef.current?.setAttribute('d', d);
  });

  const bubbles = useMemo(
    () =>
      Array.from({ length: showBubbles ? 3 : 0 }).map((_, i) => ({
        left: 10 + seeded(i + 7) * (width - 24),
        size: 3 + seeded(i + 21) * 5,
        duration: 3500 + seeded(i + 33) * 2600,
        delay: seeded(i + 44) * 2400,
      })),
    [width, showBubbles],
  );

  const isRound = shape === 'round';
  const shapePath = isRound ? '' : buildPath(shape, width, height, radius);

  return (
    <div style={{ width, height, position: 'relative', flexShrink: 0 }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id={`vclip-${id}`}>
            {isRound ? (
              <ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} />
            ) : (
              <path d={shapePath} />
            )}
          </clipPath>
          <linearGradient id={`vgrad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={0.9} />
            <stop offset="1" stopColor={color} stopOpacity={0.4} />
          </linearGradient>
        </defs>

        {/* glass shell background */}
        {isRound ? (
          <ellipse
            cx={width / 2}
            cy={height / 2}
            rx={width / 2 - 0.75}
            ry={height / 2 - 0.75}
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1.5}
          />
        ) : (
          <path d={shapePath} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
        )}

        {/* water fill */}
        <path ref={pathRef} fill={`url(#vgrad-${id})`} clipPath={`url(#vclip-${id})`} />

        {/* glass shell outline on top */}
        {isRound ? (
          <ellipse
            cx={width / 2}
            cy={height / 2}
            rx={width / 2 - 0.75}
            ry={height / 2 - 0.75}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1.5}
          />
        ) : (
          <path d={shapePath} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
        )}

        {/* gloss highlight */}
        <ellipse
          cx={width * 0.3}
          cy={height * 0.28}
          rx={width * 0.11}
          ry={height * 0.1}
          fill="rgba(255,255,255,0.08)"
          clipPath={`url(#vclip-${id})`}
        />
      </svg>

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
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute rounded-full"
      style={{
        left,
        bottom: 6,
        width: size,
        height: size,
        background: 'rgba(255,255,255,0.5)',
        border: '1px solid rgba(255,255,255,0.35)',
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: -(containerHeight + size), opacity: [0, 0.55, 0.55, 0] }}
      transition={{
        y: { duration: duration / 1000, delay: delay / 1000, repeat: Infinity, ease: 'linear' },
        opacity: { duration: duration / 1000, delay: delay / 1000, repeat: Infinity, ease: 'linear', times: [0, 0.1, 0.8, 1] },
      }}
    />
  );
}
