// src/app/dashboard/artist/page.tsx
"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export default function ArtistDashboard() {
  const [stats, setStats] = useState<{ activePitches: number; creditBalance: number; totalTracks: number } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/user/stats");
      if (res.ok) setStats(await res.json());
    } catch { /* loading */ }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const cards = [
    { label: "Active Pitches", value: stats?.activePitches ?? 0, icon: "🎯", href: "/dashboard/artist/submissions", color: "from-emerald-500/20 to-emerald-500/5", accent: "text-emerald-400" },
    { label: "Credits", value: stats?.creditBalance ?? 0, icon: "⚡", href: "/dashboard/artist/credits", color: "from-amber-500/20 to-amber-500/5", accent: "text-amber-400" },
    { label: "Tracks", value: stats?.totalTracks ?? 0, icon: "🎵", href: "/dashboard/artist/tracks", color: "from-violet-500/20 to-violet-500/5", accent: "text-violet-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10 p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white">Welcome back 🎤</h1>
          <p className="mt-2 max-w-lg text-white/50">
            Ready to get your music heard? Paste a Spotify link, pick your curators, and submit in seconds.
          </p>
          <Link
            href="/dashboard/artist/pitch"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
          >
            🎯 Pitch Music Now
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 transition-opacity group-hover:opacity-100`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-4xl font-bold ${card.accent}`}>{card.value}</span>
              </div>
              <p className="mt-4 text-sm font-medium text-white/50">{card.label}</p>
              <p className="mt-1 text-xs text-white/30 transition-colors group-hover:text-white/50">View all →</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/artist/pitch"
          className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-emerald-500/20 hover:bg-emerald-500/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
            🎯
          </div>
          <div>
            <p className="font-medium text-white">Pitch a new track</p>
            <p className="text-sm text-white/40">Paste a Spotify link and find matching curators</p>
          </div>
        </Link>
        <Link
          href="/dashboard/artist/credits"
          className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-amber-500/20 hover:bg-amber-500/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-xl">
            ⚡
          </div>
          <div>
            <p className="font-medium text-white">Buy more credits</p>
            <p className="text-sm text-white/40">Start from $5 for 25 pitches</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
