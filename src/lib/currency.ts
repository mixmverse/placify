// src/lib/currency.ts
// Multi-currency support for Paystack (6 African currencies + USD + GBP)

export interface CurrencyConfig {
  code: string;       // ISO 4217
  symbol: string;     // ₦, GH₵, R, K, $, £
  name: string;       // Nigerian Naira, etc.
  paystackSubaccount: string; // for split payments (future)
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  NG: { code: "NGN", symbol: "₦", name: "Nigerian Naira", paystackSubaccount: "" },
  GH: { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", paystackSubaccount: "" },
  ZA: { code: "ZAR", symbol: "R", name: "South African Rand", paystackSubaccount: "" },
  KE: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", paystackSubaccount: "" },
  US: { code: "USD", symbol: "$", name: "US Dollar", paystackSubaccount: "" },
  GB: { code: "GBP", symbol: "£", name: "British Pound", paystackSubaccount: "" },
  // Fallback
  DEFAULT: { code: "NGN", symbol: "₦", name: "Nigerian Naira", paystackSubaccount: "" },
};

export function getCurrency(countryCode: string | null | undefined): CurrencyConfig {
  if (!countryCode) return CURRENCIES.DEFAULT;
  return CURRENCIES[countryCode.toUpperCase()] ?? CURRENCIES.DEFAULT;
}

// Plan prices per currency (in local currency, smallest unit)
// Paystack amounts are in smallest unit (kobo for NGN, pesewas for GHS, cents for USD/GBP)
export const PLAN_PRICES: Record<string, Record<string, { display: string; amount: number }>> = {
  // NGN: amounts in kobo (₦1 = 100 kobo)
  NGN: {
    STARTER: { display: "₦500", amount: 500_00 },
    PRO:     { display: "₦1,200", amount: 1200_00 },
    LABEL:   { display: "₦2,500", amount: 2500_00 },
  },
  // GHS: amounts in pesewas (GH₵1 = 100 pesewas)
  GHS: {
    STARTER: { display: "GH₵5", amount: 5_00 },
    PRO:     { display: "GH₵12", amount: 12_00 },
    LABEL:   { display: "GH₵25", amount: 25_00 },
  },
  // ZAR: amounts in cents (R1 = 100 cents)
  ZAR: {
    STARTER: { display: "R10", amount: 10_00 },
    PRO:     { display: "R25", amount: 25_00 },
    LABEL:   { display: "R50", amount: 50_00 },
  },
  // KES: amounts in cents (KSh1 = 100 cents)
  KES: {
    STARTER: { display: "KSh65", amount: 65_00 },
    PRO:     { display: "KSh160", amount: 160_00 },
    LABEL:   { display: "KSh325", amount: 325_00 },
  },
  // USD: amounts in cents ($1 = 100 cents)
  USD: {
    STARTER: { display: "$1", amount: 1_00 },
    PRO:     { display: "$2.50", amount: 2_50 },
    LABEL:   { display: "$5", amount: 5_00 },
  },
  // GBP: amounts in pence (£1 = 100 pence)
  GBP: {
    STARTER: { display: "£0.80", amount: 80 },
    PRO:     { display: "£2", amount: 2_00 },
    LABEL:   { display: "£4", amount: 4_00 },
  },
};

export function getPlanPrice(plan: string, currencyCode: string) {
  const prices = PLAN_PRICES[currencyCode] ?? PLAN_PRICES.NGN;
  return prices[plan] ?? prices.STARTER;
}

// Per-pitch cost display
export function getPerPitchDisplay(plan: string, currencyCode: string): string {
  const prices = PLAN_PRICES[currencyCode] ?? PLAN_PRICES.NGN;
  const planPrice = prices[plan];
  if (!planPrice) return "";
  const credits = plan === "STARTER" ? 25 : plan === "PRO" ? 75 : 200;
  const perPitch = planPrice.amount / credits / 100; // convert to major units
  return `${perPitch.toFixed(2)}`;
}
