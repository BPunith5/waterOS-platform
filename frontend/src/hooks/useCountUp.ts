import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, duration = 900, decimals = 0) {
  const [value, setValue] = useState(0);
  const frame = useRef(0);
  const start = useRef(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    cancelAnimationFrame(frame.current);
    start.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const factor = Math.pow(10, decimals);
      setValue(Math.round(eased * target * factor) / factor);
      if (progress < 1) frame.current = requestAnimationFrame(animate);
    };

    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, decimals]);

  return value;
}
