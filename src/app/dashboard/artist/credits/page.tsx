// src/app/dashboard/artist/credits/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

const PLANS = [
  { key: "STARTER", name: "Starter", priceUsd: 5, credits: 25, icon: "🎵", desc: "Perfect for testing the waters", popular: false },
  { key: "PRO", name: "Pro", priceUsd: 12, credits: 75, icon: "🚀", desc: "Most popular for growing artists", popular: true },
  { key: "LABEL", name: "Label", priceUsd: 25, credits: 200, icon: "👑", desc: "For serious campaigns", popular: false },
];

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
      const [statsRes, meRes] = await Promise.all([fetch("/api/user/stats"), fetch("/api/me")]);
      if (statsRes.ok) setBalance((await statsRes.json()).creditBalance);
      if (meRes.ok) setCountry((await meRes.json()).user?.country ?? null);
    } catch { /* loading */ }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchData();
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") { setMessage("Payment successful! Credits added to your account."); fetchData(); }
    if (params.get("canceled") === "1") setMessage("Payment canceled. No charges were made.");
  }, [fetchData]);

  async function handleBuy(plan: string) {
    setLoading(plan);
    setMessage(null);
    try {
      const res = await fetch("/api/credits/buy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (data.url) window.location.assign(data.url);
      else setMessage("Failed to start payment. Please try again.");
    } catch { setMessage("Network error. Please try again."); }
    finally { setLoading(null); }
  }

  const localRate = country ? LOCAL_RATES[country] : null;

  return (
    <div className="space-y-8">
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10 p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium text-white/50">Your Balance</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-6xl font-bold text-white">{balance !== null ? balance : "—"}</span>
            <span className="text-2xl">⚡</span>
          </div>
          <p className="mt-3 text-sm text-white/40">1 credit = 1 pitch. Unused credits roll over up to 25% per month.</p>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-2xl border p-4 text-sm font-medium ${
          message.includes("successful")
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            : "border-amber-500/20 bg-amber-500/10 text-amber-400"
        }`}>
          {message}
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-xl font-bold text-white">Buy Credits</h2>
        <p className="mt-1 text-sm text-white/40">
          All prices in USD. Your bank handles the conversion.
          {localRate && <span className="ml-1 text-white/30">(Approx. {localRate.symbol}{(1 * localRate.rate).toLocaleString()} = $1)</span>}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const local = localRate ? `${localRate.symbol}${(plan.priceUsd * localRate.rate).toLocaleString()}` : null;
          return (
            <div
              key={plan.key}
              className={`group relative overflow-hidden rounded-2xl border p-6 transition-all hover:scale-[1.02] ${
                plan.popular
                  ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
              }`}
            >
              {plan.popular && (
                <div className="absolute right-4 top-4 rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-semibold text-emerald-400">
                  MOST POPULAR
                </div>
              )}
              <span className="text-3xl">{plan.icon}</span>
              <p className="mt-4 text-lg font-semibold text-white">{plan.name}</p>
              <p className="mt-1 text-xs text-white/40">{plan.desc}</p>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">${plan.priceUsd}</span>
                </div>
                {local && <p className="mt-1 text-sm text-white/30">≈ {local}</p>}
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-white/50">
                <span className="font-semibold text-white">{plan.credits}</span> credits
                <span className="text-white/20">·</span>
                <span>${(plan.priceUsd / plan.credits).toFixed(2)}/pitch</span>
              </div>

              <button
                onClick={() => handleBuy(plan.key)}
                disabled={loading !== null}
                className={`mt-6 w-full rounded-full py-3 text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                    : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                } disabled:opacity-50`}
              >
                {loading === plan.key ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Redirecting...
                  </span>
                ) : (
                  "Buy Now →"
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-white/20">Payments processed securely via Flutterwave. You can cancel anytime.</p>
    </div>
  );
}
