export function formatLiters(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M L`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K L`;
  return `${Math.round(value)} L`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}`;
}
