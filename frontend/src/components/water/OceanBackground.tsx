import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WaveLayer } from './WaveLayer';
import { BubbleField } from './BubbleField';
import { AuroraBlobs } from './AuroraBlobs';
import { colors, gradients, tankTypeMeta } from '@/theme/tokens';
import { linearGradient, mixColor } from '@/theme/gradient';
import { useOceanTheme } from '@/context/OceanThemeContext';

type OceanBackgroundProps = {
  children?: ReactNode;
  bubbles?: boolean;
  waves?: boolean;
  variant?: 'deep' | 'surface';
};

/**
 * Full-screen animated ocean backdrop: deep gradient, three parallax
 * wave layers, and an optional ambient bubble field. Mounted once at
 * the app root so it stays fixed behind every route.
 */
export function OceanBackground({ children, bubbles = true, waves = true, variant = 'deep' }: OceanBackgroundProps) {
  const [viewportHeight, setViewportHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800));
  const { tankType, waterLevel } = useOceanTheme();

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // The body of water fills the bottom half of the page by default.
  // While a tank is open, the water line rises and falls to reflect
  // that tank's current fill level. Waves ride along its surface and
  // bubbles rise up out of it.
  const MIN_WATER_FRAC = 0.04;
  const MAX_WATER_FRAC = 1;
  const waterFrac =
    waterLevel != null ? MIN_WATER_FRAC + (MAX_WATER_FRAC - MIN_WATER_FRAC) * Math.min(1, Math.max(0, waterLevel)) : 0.5;
  const waterHeight = viewportHeight * waterFrac;
  const waveBottom = (height: number, baseline: number) => waterHeight - height * baseline;

  // When a tank is open, retint the waves and water body toward that
  // tank type's accent color so the page feels "themed" to it.
  const accentMeta = tankType ? tankTypeMeta[tankType] : null;
  const accent = accentMeta?.accent ?? null;
  const tint = (base: string) => mixColor(base, accent, accent ? 0.45 : 0);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: linearGradient(variant === 'deep' ? gradients.oceanDeep : gradients.oceanSurface, 115) }}
      />
      <AnimatePresence>
        {accentMeta && (
          <motion.div
            key={tankType}
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundImage: linearGradient(accentMeta.gradient, 125) }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
      <AuroraBlobs />
      {/* Body of water — its height rises and falls with the open tank's level */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0"
        style={{
          height: waterHeight,
          transition: 'height 1.1s ease',
          backgroundImage: `linear-gradient(to bottom, transparent, rgba(34, 211, 238, 0.12) 10%, ${tint(colors.oceanBlue)} 28%, ${tint(colors.abyss)} 100%)`,
        }}
      />
      {waves && (
        <>
          <WaveLayer
            color={tint(colors.oceanBlue)}
            opacity={0.55}
            amplitude={22}
            baseline={0.82}
            duration={16000}
            height={waterHeight * 0.9}
            bottom={waveBottom(waterHeight * 0.9, 0.82)}
          />
          <WaveLayer
            color={tint(colors.midOcean)}
            opacity={0.45}
            amplitude={30}
            baseline={0.86}
            duration={11000}
            height={waterHeight * 0.85}
            bottom={waveBottom(waterHeight * 0.85, 0.86)}
            reverse
          />
          <WaveLayer
            color={tint(colors.surfaceBlue)}
            opacity={0.35}
            amplitude={18}
            baseline={0.9}
            duration={20000}
            height={waterHeight * 0.8}
            bottom={waveBottom(waterHeight * 0.8, 0.9)}
          />
        </>
      )}
      {bubbles && (
        <>
          <BubbleField count={18} origin="bottom" waterHeight={waterHeight} />
          <BubbleField count={16} seedOffset={777} origin="bottom" waterHeight={waterHeight} />
        </>
      )}
      {children}
    </div>
  );
}
