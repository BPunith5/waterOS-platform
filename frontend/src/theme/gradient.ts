export function linearGradient(colors: readonly string[], angle = 135) {
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
}
