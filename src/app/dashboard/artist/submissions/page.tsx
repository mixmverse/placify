// src/app/dashboard/artist/submissions/page.tsx
"use client";
import Link from "next/link";
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

const STATUS_CONFIG: Record<string, { icon: string; label: string; color: string; dot: string }> = {
  AWAITING_PAYMENT: { icon: "💰", label: "Awaiting Payment", color: "text-amber-400", dot: "bg-amber-400" },
  PAID: { icon: "💳", label: "Paid — Reviewing", color: "text-blue-400", dot: "bg-blue-400" },
  PENDING: { icon: "⏳", label: "Reviewing", color: "text-white/50", dot: "bg-white/50" },
  ACCEPTED: { icon: "✅", label: "Accepted", color: "text-emerald-400", dot: "bg-emerald-400" },
  DECLINED: { icon: "❌", label: "Declined", color: "text-red-400", dot: "bg-red-400" },
  EXPIRED: { icon: "⏰", label: "Expired", color: "text-white/30", dot: "bg-white/30" },
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) setSubmissions((await res.json()).submissions ?? []);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);

  async function confirmPayment(submissionId: string) {
    setConfirmingId(submissionId);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/confirm-payment`, { method: "POST" });
      if (res.ok) setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? { ...s, status: "PAID" } : s)));
    } catch { /* silent */ }
    finally { setConfirmingId(null); }
  }

  function getTimeRemaining(deadline: string) {
    const hoursLeft = Math.max(0, Math.floor((new Date(deadline).getTime() - now) / 3600000));
    if (hoursLeft === 0) return "Expired";
    if (hoursLeft < 24) return `${hoursLeft}h left`;
    return `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h left`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Submissions</h1>
        <p className="mt-2 text-white/40">Track your pitches and curator responses</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {ALL_FILTERS.map((f) => {
          const active = filter === f;
          const count = f === "all" ? submissions.length : submissions.filter((s) => s.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/60"
              }`}
            >
              {f !== "all" && STATUS_CONFIG[f] && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[f].dot}`} />}
              {f === "all" ? "All" : STATUS_CONFIG[f]?.label ?? f}
              <span className={`text-xs ${active ? "text-black/40" : "text-white/20"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
          <div className="text-5xl">📭</div>
          <p className="mt-4 text-lg font-medium text-white/60">
            {submissions.length === 0 ? "No submissions yet" : "No submissions match this filter"}
          </p>
          <p className="mt-2 text-sm text-white/30">
            {submissions.length === 0 && "Pitch your first track to get started!"}
          </p>
          {submissions.length === 0 && (
            <Link
              href="/dashboard/artist/pitch"
              className="mt-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
            >
              🎯 Pitch Music
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const cfg = STATUS_CONFIG[s.status] ?? { icon: "📋", label: s.status, color: "text-white/50", dot: "bg-white/50" };
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-xl">{cfg.icon}</div>
                    <div>
                      <p className="font-medium text-white">{s.playlistName}</p>
                      <p className="text-sm text-white/40">by {s.curatorName}</p>
                      <p className="mt-1 text-sm text-white/30">
                        Track: <span className="text-white/60">{s.trackTitle}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-white/20">
                        Submitted {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-sm font-medium ${cfg.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                {/* AWAITING_PAYMENT */}
                {s.status === "AWAITING_PAYMENT" && (
                  <div className="mt-4 ml-9 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-sm font-medium text-amber-400">💰 Pay the curator directly, then confirm below</p>
                    {s.curatorPaymentMethod && (
                      <p className="mt-2 text-sm text-white/50">Method: <span className="text-white/70">{s.curatorPaymentMethod}</span></p>
                    )}
                    {s.curatorPaymentInfo && (
                      <p className="mt-1 inline-block rounded-lg bg-white/[0.04] px-3 py-1.5 font-mono text-sm text-amber-400/80">
                        {s.curatorPaymentInfo}
                      </p>
                    )}
                    {s.curatorPrice != null && s.curatorPrice > 0 && (
                      <p className="mt-3 text-xl font-bold text-white">${(s.curatorPrice / 100).toFixed(2)}</p>
                    )}
                    <button
                      onClick={() => confirmPayment(s.id)}
                      disabled={confirmingId === s.id}
                      className="mt-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 disabled:opacity-50"
                    >
                      {confirmingId === s.id ? "Confirming..." : "I Paid ✓"}
                    </button>
                  </div>
                )}

                {s.status === "PAID" && (
                  <div className="mt-3 ml-9 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                    <p className="text-sm text-blue-400">💳 Payment confirmed — curator will review within 7 days</p>
                  </div>
                )}

                {s.status === "PENDING" && (
                  <div className="mt-3 ml-9 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-sm text-white/50">⏳ Curator reviewing — {getTimeRemaining(s.deadlineAt)}</p>
                  </div>
                )}

                {s.status === "ACCEPTED" && (
                  <div className="mt-3 ml-9 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-sm text-emerald-400">🎉 Your track was accepted! It&apos;s been added to the playlist.</p>
                    {s.feedbackText && <p className="mt-1 text-sm text-emerald-400/70 italic">&quot;{s.feedbackText}&quot;</p>}
                  </div>
                )}

                {s.status === "DECLINED" && (
                  <div className="mt-3 ml-9 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-sm text-red-400">❌ Declined by curator.</p>
                    {s.feedbackText && <p className="mt-1 text-sm text-red-400/70 italic">&quot;{s.feedbackText}&quot;</p>}
                    <p className="mt-1 text-xs text-red-400/50">Credit refunded to your account.</p>
                  </div>
                )}

                {s.status === "EXPIRED" && (
                  <div className="mt-3 ml-9 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-sm text-white/30">⏰ Curator didn&apos;t respond within 7 days. Credit refunded.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
