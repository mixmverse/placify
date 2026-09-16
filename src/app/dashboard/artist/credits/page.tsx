// src/app/dashboard/artist/credits/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

// Currency configs inline (avoids server/client boundary issues)
const CURRENCY_MAP: Record<string, { symbol: string; code: string }> = {
  NG: { symbol: "₦", code: "NGN" },
  GH: { symbol: "GH₵", code: "GHS" },
  ZA: { symbol: "R", code: "ZAR" },
  KE: { symbol: "KSh", code: "KES" },
  US: { symbol: "$", code: "USD" },
  GB: { symbol: "£", code: "GBP" },
};

const PLAN_PRICES: Record<string, Record<string, { display: string; amount: number }>> = {
  NGN: { STARTER: { display: "₦500", amount: 500_00 }, PRO: { display: "₦1,200", amount: 1200_00 }, LABEL: { display: "₦2,500", amount: 2500_00 } },
  GHS: { STARTER: { display: "GH₵5", amount: 5_00 }, PRO: { display: "GH₵12", amount: 12_00 }, LABEL: { display: "GH₵25", amount: 25_00 } },
  ZAR: { STARTER: { display: "R10", amount: 10_00 }, PRO: { display: "R25", amount: 25_00 }, LABEL: { display: "R50", amount: 50_00 } },
  KES: { STARTER: { display: "KSh65", amount: 65_00 }, PRO: { display: "KSh160", amount: 160_00 }, LABEL: { display: "KSh325", amount: 325_00 } },
  USD: { STARTER: { display: "$1", amount: 1_00 }, PRO: { display: "$2.50", amount: 2_50 }, LABEL: { display: "$5", amount: 5_00 } },
  GBP: { STARTER: { display: "£0.80", amount: 80 }, PRO: { display: "£2", amount: 2_00 }, LABEL: { display: "£4", amount: 4_00 } },
};

function getPlans(countryCode: string | null) {
  const cur = CURRENCY_MAP[countryCode ?? ""] ?? CURRENCY_MAP.NG;
  const prices = PLAN_PRICES[cur.code] ?? PLAN_PRICES.NGN;
  return [
    { key: "STARTER", name: "Starter", price: prices.STARTER.display, credits: 25, perPitch: `${(prices.STARTER.amount / 25 / 100).toFixed(2)}`, popular: false },
    { key: "PRO", name: "Pro", price: prices.PRO.display, credits: 75, perPitch: `${(prices.PRO.amount / 75 / 100).toFixed(2)}`, popular: true },
    { key: "LABEL", name: "Label", price: prices.LABEL.display, credits: 200, perPitch: `${(prices.LABEL.amount / 200 / 100).toFixed(2)}`, popular: false },
  ];
}

export default function CreditsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, meRes] = await Promise.all([
        fetch("/api/user/stats"),
        fetch("/api/me"),
      ]);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setBalance(data.creditBalance);
      }
      if (meRes.ok) {
        const data = await meRes.json();
        setCountry(data.user?.country ?? null);
      }
    } catch {
      // stay null
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchData();
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      setMessage("Payment successful! Credits added to your account.");
      fetchData();
    }
    if (params.get("canceled") === "1") {
      setMessage("Payment canceled. No charges were made.");
    }
  }, [fetchData]);

  const PLANS = getPlans(country);

  async function handleBuy(plan: string) {
    setLoading(plan);
    setMessage(null);
    try {
      const res = await fetch("/api/credits/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        setMessage("Failed to start payment. Please try again.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const currencySymbol = (CURRENCY_MAP[country ?? ""] ?? CURRENCY_MAP.NG).symbol;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Credits</h1>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Balance</p>
        <p className="text-5xl font-bold">{balance !== null ? balance : "—"} ⚡</p>
        <p className="mt-3 text-sm text-zinc-500">1 credit = 1 pitch. Unused credits roll over up to 25% per month.</p>
      </div>

      {message && (
        <div className={`rounded-2xl p-4 text-sm font-medium ${message.includes("successful") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"}`}>
          {message}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold">Buy Credits</h2>
        {country && (
          <p className="mt-1 text-sm text-zinc-500">Prices shown in your local currency ({(CURRENCY_MAP[country] ?? CURRENCY_MAP.NG).code})</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`relative rounded-2xl border p-6 transition-shadow hover:shadow-md ${
              plan.popular
                ? "border-black bg-zinc-50 shadow-sm dark:border-white dark:bg-zinc-900"
                : "border-zinc-200 bg-white dark:bg-zinc-950"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
                Most Popular
              </span>
            )}
            <p className="text-lg font-semibold">{plan.name}</p>
            <p className="mt-2 text-4xl font-bold">{plan.price}</p>
            <p className="text-sm text-zinc-500">{plan.credits} credits</p>
            <p className="mt-1 text-sm text-zinc-400">{currencySymbol}{plan.perPitch}/pitch</p>
            <button
              onClick={() => handleBuy(plan.key)}
              disabled={loading !== null}
              className={`mt-4 w-full rounded-full py-2.5 text-sm font-medium transition-colors ${
                plan.popular
                  ? "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  : "bg-zinc-100 text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              } disabled:opacity-50`}
            >
              {loading === plan.key ? "Redirecting to Paystack..." : "Buy Now →"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400">Payments processed securely via Paystack. You can cancel anytime.</p>
    </div>
  );
}
