// src/app/dashboard/artist/credits/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

const PLANS = [
  { key: "STARTER", name: "Starter", price: "$5", credits: 25, perPitch: "$0.20", popular: false },
  { key: "PRO", name: "Pro", price: "$12", credits: 75, perPitch: "$0.16", popular: true },
  { key: "LABEL", name: "Label", price: "$25", credits: 200, perPitch: "$0.125", popular: false },
] as const;

export default function CreditsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/user/stats");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.creditBalance);
      }
    } catch {
      // stay null
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBalance();
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      setMessage("Payment successful! Credits added to your account.");
      fetchBalance();
    }
    if (params.get("canceled") === "1") {
      setMessage("Payment canceled. No charges were made.");
    }
  }, [fetchBalance]);

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
        // Stripe Checkout redirect — must leave the page entirely
        window.location.assign(data.url);
      } else {
        setMessage("Failed to create checkout session. Please try again.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Credits</h1>

      {/* Balance card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Balance</p>
        <p className="text-5xl font-bold">{balance !== null ? balance : "—"} ⚡</p>
        <p className="mt-3 text-sm text-zinc-500">1 credit = 1 pitch. Unused credits roll over up to 25% per month.</p>
      </div>

      {/* Success/cancel message */}
      {message && (
        <div className={`rounded-2xl p-4 text-sm font-medium ${message.includes("successful") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"}`}>
          {message}
        </div>
      )}

      {/* Plan cards */}
      <h2 className="text-xl font-semibold">Buy Credits</h2>
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
            <p className="mt-1 text-sm text-zinc-400">{plan.perPitch}/pitch</p>
            <button
              onClick={() => handleBuy(plan.key)}
              disabled={loading !== null}
              className={`mt-4 w-full rounded-full py-2.5 text-sm font-medium transition-colors ${
                plan.popular
                  ? "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  : "bg-zinc-100 text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              } disabled:opacity-50`}
            >
              {loading === plan.key ? "Redirecting to Stripe..." : "Buy Now →"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400">Payments processed securely via Stripe. You can cancel anytime.</p>
    </div>
  );
}
