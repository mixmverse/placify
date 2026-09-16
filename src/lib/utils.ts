// src/lib/utils.ts
export function centsToDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
