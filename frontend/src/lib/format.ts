export function formatLiters(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M L`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K L`;
  return `${Math.round(value)} L`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}`;
}

export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
