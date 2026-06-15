export function linearGradient(colors: readonly string[], angle = 135) {
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/** Linearly interpolates a `#rrggbb` base color toward an accent color by `amount` (0-1). */
export function mixColor(base: string, accent: string | null, amount: number) {
  if (!accent || amount <= 0) return base;
  const t = Math.min(1, Math.max(0, amount));
  const [br, bg, bb] = hexToRgbTuple(base);
  const [ar, ag, ab] = hexToRgbTuple(accent);
  const r = Math.round(br + (ar - br) * t);
  const g = Math.round(bg + (ag - bg) * t);
  const b = Math.round(bb + (ab - bb) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
