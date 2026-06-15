import { useEffect, useState, type ReactNode } from 'react';
import { WaveLayer } from './WaveLayer';
import { BubbleField } from './BubbleField';
import { AuroraBlobs } from './AuroraBlobs';
import { colors, gradients } from '@/theme/tokens';
import { linearGradient } from '@/theme/gradient';

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

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // The body of water fills the bottom half of the page; waves ride
  // along its surface and bubbles rise up out of it.
  const waterHeight = viewportHeight * 0.5;
  const waveBottom = (height: number, baseline: number) => waterHeight - height * baseline;

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: linearGradient(variant === 'deep' ? gradients.oceanDeep : gradients.oceanSurface, 115) }}
      />
      <AuroraBlobs />
      {/* Body of water filling the bottom half of the page */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0"
        style={{
          height: waterHeight,
          backgroundImage: `linear-gradient(to bottom, rgba(34, 211, 238, 0.16), ${colors.oceanBlue} 18%, ${colors.abyss} 100%)`,
        }}
      />
      {waves && (
        <>
          <WaveLayer
            color={colors.oceanBlue}
            opacity={0.55}
            amplitude={22}
            baseline={0.82}
            duration={16000}
            height={waterHeight * 0.9}
            bottom={waveBottom(waterHeight * 0.9, 0.82)}
          />
          <WaveLayer
            color={colors.midOcean}
            opacity={0.45}
            amplitude={30}
            baseline={0.86}
            duration={11000}
            height={waterHeight * 0.85}
            bottom={waveBottom(waterHeight * 0.85, 0.86)}
            reverse
          />
          <WaveLayer
            color={colors.surfaceBlue}
            opacity={0.35}
            amplitude={18}
            baseline={0.9}
            duration={20000}
            height={waterHeight * 0.8}
            bottom={waveBottom(waterHeight * 0.8, 0.9)}
          />
        </>
      )}
      {/* Glowing waterline marking the surface, where bubbles emerge */}
      <div
        aria-hidden
        className="absolute inset-x-0"
        style={{
          bottom: waterHeight - 1,
          height: 90,
          backgroundImage: 'linear-gradient(to top, rgba(34, 211, 238, 0.35), rgba(45, 212, 191, 0.08) 60%, transparent 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0"
        style={{ bottom: waterHeight, height: 2, backgroundImage: 'linear-gradient(to right, transparent, rgba(125, 240, 255, 0.55), transparent)' }}
      />
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
