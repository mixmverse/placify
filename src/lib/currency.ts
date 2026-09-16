// src/lib/currency.ts
// All prices are in USD. Local equivalents shown for display only.
// Paystack charges in USD — user's bank handles conversion.

export const PLANS = [
  { key: "STARTER", name: "Starter", credits: 25, priceUsd: 5 },
  { key: "PRO", name: "Pro", credits: 75, priceUsd: 12 },
  { key: "LABEL", name: "Label", credits: 200, priceUsd: 25 },
] as const;

// Approximate exchange rates (USD → local) for display only
// These update automatically at checkout via Paystack
const EXCHANGE_RATES: Record<string, { symbol: string; rate: number; name: string }> = {
  NG: { symbol: "₦", rate: 1500, name: "Nigerian Naira" },
  GH: { symbol: "GH₵", rate: 12, name: "Ghanaian Cedi" },
  ZA: { symbol: "R", rate: 18, name: "South African Rand" },
  KE: { symbol: "KSh", rate: 130, name: "Kenyan Shilling" },
  US: { symbol: "$", rate: 1, name: "US Dollar" },
  GB: { symbol: "£", rate: 0.80, name: "British Pound" },
};

export function getLocalEquivalent(priceUsd: number, countryCode: string | null): string | null {
  if (!countryCode || countryCode === "US") return null;
  const config = EXCHANGE_RATES[countryCode.toUpperCase()];
  if (!config) return null;
  const local = priceUsd * config.rate;
  return `${config.symbol}${local.toLocaleString()}`;
}

export function getCurrencySymbol(countryCode: string | null): string {
  if (!countryCode) return "$";
  return EXCHANGE_RATES[countryCode.toUpperCase()]?.symbol ?? "$";
}

export function formatUsd(amount: number): string {
  return `$${amount}`;
}

export function getPerPitchUsd(priceUsd: number, credits: number): string {
  return (priceUsd / credits).toFixed(2);
}
