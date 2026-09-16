// src/app/dashboard/artist/credits/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

const PLANS = [
  { key: "STARTER", name: "Starter", priceUsd: 5, credits: 25 },
  { key: "PRO", name: "Pro", priceUsd: 12, credits: 75 },
  { key: "LABEL", name: "Label", priceUsd: 25, credits: 200 },
] as const;

// Approximate rates for display (actual charge is USD)
const LOCAL_RATES: Record<string, { symbol: string; rate: number }> = {
  NG: { symbol: "₦", rate: 1500 },
  GH: { symbol: "GH₵", rate: 12 },
  ZA: { symbol: "R", rate: 18 },
  KE: { symbol: "KSh", rate: 130 },
  GB: { symbol: "£", rate: 0.80 },
};

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

  const localRate = country ? LOCAL_RATES[country] : null;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Credits</h1>

      {/* Balance */}
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
        <p className="mt-1 text-sm text-zinc-500">
          All prices in USD. Your bank handles the conversion.
          {localRate && (
            <span className="ml-1 text-zinc-400">
              (Approx. {localRate.symbol}1 = $1 × {localRate.rate})
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan, i) => {
          const local = localRate ? `${localRate.symbol}${(plan.priceUsd * localRate.rate).toLocaleString()}` : null;
          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl border p-6 transition-shadow hover:shadow-md ${
                i === 1
                  ? "border-black bg-zinc-50 shadow-sm dark:border-white dark:bg-zinc-900"
                  : "border-zinc-200 bg-white dark:bg-zinc-950"
              }`}
            >
              {i === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
                  Most Popular
                </span>
              )}
              <p className="text-lg font-semibold">{plan.name}</p>

              {/* USD price */}
              <p className="mt-2 text-4xl font-bold">${plan.priceUsd}</p>

              {/* Local equivalent */}
              {local && (
                <p className="text-sm text-zinc-400">≈ {local}</p>
              )}

              <p className="text-sm text-zinc-500">{plan.credits} credits</p>
              <p className="mt-1 text-sm text-zinc-400">${(plan.priceUsd / plan.credits).toFixed(2)}/pitch</p>

              <button
                onClick={() => handleBuy(plan.key)}
                disabled={loading !== null}
                className={`mt-4 w-full rounded-full py-2.5 text-sm font-medium transition-colors ${
                  i === 1
                    ? "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    : "bg-zinc-100 text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                } disabled:opacity-50`}
              >
                {loading === plan.key ? "Redirecting to payment..." : "Buy Now →"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-400">Payments processed securely via Paystack. You can cancel anytime.</p>
    </div>
  );
}
