import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { colors } from '@/theme/tokens';

export function CursorGlow() {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const springX = useSpring(mouseX, { stiffness: 160, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 160, damping: 22 });

  const isTouch = useRef(false);

  useEffect(() => {
    isTouch.current = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch.current) return;

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: springX,
        top: springY,
        x: '-50%',
        y: '-50%',
        width: 380,
        height: 380,
        background: `radial-gradient(circle, ${colors.cyan}12 0%, ${colors.teal}06 40%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(2px)',
        mixBlendMode: 'screen',
      }}
    />
  );
}
