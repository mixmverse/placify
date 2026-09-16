// src/app/dashboard/curator/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

type PendingSubmission = {
  id: string;
  trackTitle: string;
  artistEmail: string;
  hoursLeft: number | null;
  status: string;
};

export default function CuratorDashboard() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [stats, setStats] = useState<{ totalReviews: number; onTimeRate: number } | null>(null);
  const [deciding, setDeciding] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/curator/stats");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.pendingSubmissions);
        setStats(data.stats);
      }
    } catch {
      // stay empty
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDecision(id: string, decision: "ACCEPTED" | "DECLINED") {
    setDeciding(id);
    try {
      await fetch(`/api/curator/submissions/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      fetchData();
    } catch {
      // error handling
    } finally {
      setDeciding(null);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Review Queue</h1>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500">Pending Pitches</p>
            <p className="text-2xl font-bold">{submissions.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500">Total Reviews</p>
            <p className="text-2xl font-bold">{stats.totalReviews}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500">On-time Rate</p>
            <p className="text-2xl font-bold">{stats.onTimeRate}%</p>
          </div>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:bg-zinc-950">
          <p className="text-zinc-500">No pending pitches. Artists will submit music for your review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.trackTitle}</p>
                  <p className="text-sm text-zinc-500">Submitted by artist</p>
                </div>
                {s.hoursLeft !== null && (
                  <span className={`rounded-full px-3 py-1 text-sm ${
                    s.hoursLeft < 24
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {s.hoursLeft}h left
                  </span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDecision(s.id, "ACCEPTED")}
                  disabled={deciding === s.id}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {deciding === s.id ? "..." : "Accept"}
                </button>
                <button
                  onClick={() => handleDecision(s.id, "DECLINED")}
                  disabled={deciding === s.id}
                  className="rounded-full bg-red-600 px-5 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deciding === s.id ? "..." : "Decline"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
