// src/app/dashboard/artist/submissions/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

type Submission = {
  id: string;
  trackTitle: string;
  artistName: string;
  playlistName: string;
  curatorName: string;
  status: string;
  createdAt: string;
  deadlineAt: string;
  decidedAt: string | null;
  feedbackText: string | null;
  curatorPrice: number | null;
  curatorPaymentMethod: string | null;
  curatorPaymentInfo: string | null;
};

const ALL_FILTERS = ["all", "AWAITING_PAYMENT", "PAID", "PENDING", "ACCEPTED", "DECLINED", "EXPIRED"] as const;

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions ?? []);
      }
    } catch {
      // Use empty array
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);

  async function confirmPayment(submissionId: string) {
    setConfirmingId(submissionId);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/confirm-payment`, { method: "POST" });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? { ...s, status: "PAID" } : s)),
        );
      }
    } catch {
      // silent
    } finally {
      setConfirmingId(null);
    }
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "AWAITING_PAYMENT": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "PAID": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "PENDING": return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
      case "ACCEPTED": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "DECLINED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "EXPIRED": return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
      default: return "bg-zinc-100 text-zinc-500";
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "AWAITING_PAYMENT": return "💰";
      case "PAID": return "💳";
      case "PENDING": return "⏳";
      case "ACCEPTED": return "✅";
      case "DECLINED": return "❌";
      case "EXPIRED": return "⏰";
      default: return "📋";
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "AWAITING_PAYMENT": return "Awaiting Payment";
      case "PAID": return "Paid — Reviewing";
      case "PENDING": return "Reviewing";
      case "ACCEPTED": return "Accepted";
      case "DECLINED": return "Declined";
      case "EXPIRED": return "Expired";
      default: return status;
    }
  }

  function getTimeRemaining(deadline: string) {
    const now = new Date();
    const end = new Date(deadline);
    const hoursLeft = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60)));
    if (hoursLeft === 0) return "Expired";
    if (hoursLeft < 24) return `${hoursLeft}h left`;
    return `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h left`;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white">Submissions</h1>
        <p className="mt-2 text-zinc-500">Track your pitches and curator responses</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {ALL_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {f === "all" ? "All" : getStatusLabel(f)}
            {f !== "all" && (
              <span className="ml-1 text-xs opacity-70">
                ({submissions.filter((s) => s.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      {loading ? (
        <div className="text-center py-8 text-zinc-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl">📭</div>
          <p className="mt-4 text-zinc-500">
            {submissions.length === 0
              ? "No submissions yet. Go to Pitch Music to get started!"
              : "No submissions match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getStatusIcon(s.status)}</span>
                    <div>
                      <p className="font-medium text-black dark:text-white">{s.playlistName}</p>
                      <p className="text-sm text-zinc-500">by {s.curatorName}</p>
                    </div>
                  </div>
                  <div className="mt-2 ml-9">
                    <p className="text-sm text-zinc-500">
                      Track: <span className="text-black dark:text-white">{s.trackTitle}</span>
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Submitted: {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(s.status)}`}>
                  {getStatusLabel(s.status)}
                </span>
              </div>

              {/* AWAITING_PAYMENT — show payment info + confirm button */}
              {s.status === "AWAITING_PAYMENT" && (
                <div className="mt-3 ml-9 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/10">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    💰 Pay the curator directly, then confirm below
                  </p>
                  {s.curatorPaymentMethod && (
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
                      Payment method: <span className="font-medium">{s.curatorPaymentMethod}</span>
                    </p>
                  )}
                  {s.curatorPaymentInfo && (
                    <p className="mt-1 text-sm font-mono text-amber-700 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/20 rounded px-3 py-1.5 inline-block">
                      {s.curatorPaymentInfo}
                    </p>
                  )}
                  {s.curatorPrice != null && s.curatorPrice > 0 && (
                    <p className="mt-2 text-lg font-bold text-black dark:text-white">
                      Amount: ${(s.curatorPrice / 100).toFixed(2)}
                    </p>
                  )}
                  <button
                    onClick={() => confirmPayment(s.id)}
                    disabled={confirmingId === s.id}
                    className="mt-3 rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {confirmingId === s.id ? "Confirming..." : "I Paid ✓"}
                  </button>
                </div>
              )}

              {/* PAID — waiting for curator to review */}
              {s.status === "PAID" && (
                <div className="mt-3 ml-9 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/10">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    💳 Payment confirmed — curator will review within 7 days
                  </p>
                </div>
              )}

              {/* PENDING — reviewing (free curators) */}
              {s.status === "PENDING" && (
                <div className="mt-3 ml-9 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    ⏳ Curator reviewing — {getTimeRemaining(s.deadlineAt)}
                  </p>
                </div>
              )}

              {s.status === "ACCEPTED" && (
                <div className="mt-3 ml-9 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/10">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    🎉 Your track was accepted! It&apos;s been added to the playlist.
                  </p>
                  {s.feedbackText && (
                    <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-500 italic">
                      &quot;{s.feedbackText}&quot;
                    </p>
                  )}
                </div>
              )}

              {s.status === "DECLINED" && (
                <div className="mt-3 ml-9 rounded-lg bg-red-50 p-3 dark:bg-red-900/10">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    ❌ Declined by curator.
                  </p>
                  {s.feedbackText && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500 italic">
                      &quot;{s.feedbackText}&quot;
                    </p>
                  )}
                  <p className="mt-1 text-xs text-red-500">Credit refunded to your account.</p>
                </div>
              )}

              {s.status === "EXPIRED" && (
                <div className="mt-3 ml-9 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                  <p className="text-sm text-zinc-500">
                    ⏰ Curator didn&apos;t respond within 7 days. Credit refunded.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
