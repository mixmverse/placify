// src/app/dashboard/curator/earnings/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

export default function EarningsPage() {
  const [stats, setStats] = useState<{ totalReviews: number; onTimeRate: number; priceCents: number } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/curator/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch {
      // stay null
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const pricePerPitch = stats ? (stats.priceCents / 100).toFixed(2) : "0.00";

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Earnings</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Total Reviews</p>
          <p className="text-4xl font-bold">{stats?.totalReviews ?? "—"}</p>
          <p className="mt-1 text-sm text-zinc-400">On-time rate: {stats?.onTimeRate ?? 0}%</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Your Price Per Pitch</p>
          <p className="text-4xl font-bold">${pricePerPitch}</p>
          <p className="mt-1 text-sm text-zinc-400">Artists pay you directly for each accepted pitch</p>
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
        <h2 className="font-semibold">How Earnings Work</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Artists pay you directly via your preferred payment method (PayPal, Stripe, CashApp, Venmo, or bank transfer).
          You keep 100% of your listed fee. Set your payment details in{" "}
          <a href="/dashboard/curator/settings" className="underline">Settings</a>.
        </p>
      </div>
    </div>
  );
}
