// src/app/dashboard/artist/page.tsx
"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export default function ArtistDashboard() {
  const [stats, setStats] = useState<{ activePitches: number; creditBalance: number; totalTracks: number } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/user/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // stay null → show loading
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Artist Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Active Pitches</p>
          <p className="text-4xl font-bold">{stats !== null ? stats.activePitches : "—"}</p>
          <Link href="/dashboard/artist/submissions" className="text-sm text-black underline dark:text-white">
            View all →
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Credits</p>
          <p className="text-4xl font-bold">{stats !== null ? stats.creditBalance : "—"} ⚡</p>
          <Link href="/dashboard/artist/credits" className="text-sm text-black underline dark:text-white">
            Buy credits →
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Tracks</p>
          <p className="text-4xl font-bold">{stats !== null ? stats.totalTracks : "—"}</p>
          <Link href="/dashboard/artist/tracks" className="text-sm text-black underline dark:text-white">
            Manage →
          </Link>
        </div>
      </div>
    </div>
  );
}
