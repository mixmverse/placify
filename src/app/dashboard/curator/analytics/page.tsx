// src/app/dashboard/curator/analytics/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<{ totalReviews: number; onTimeRate: number; missedDeadlines: number } | null>(null);

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

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Total Reviews</p>
          <p className="text-4xl font-bold">{stats?.totalReviews ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">On-time Rate</p>
          <p className="text-4xl font-bold">{stats?.onTimeRate ?? 0}%</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Missed Deadlines</p>
          <p className="text-4xl font-bold">{stats?.missedDeadlines ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
