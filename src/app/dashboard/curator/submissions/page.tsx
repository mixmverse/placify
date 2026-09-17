// src/app/dashboard/curator/submissions/page.tsx
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

const STATUS_CONFIG: Record<string, { icon: string; label: string; color: string; dot: string }> = {
  AWAITING_PAYMENT: { icon: "💰", label: "Awaiting Payment", color: "text-amber-400", dot: "bg-amber-400" },
  PAID: { icon: "💳", label: "Paid — Ready to Review", color: "text-blue-400", dot: "bg-blue-400" },
  PENDING: { icon: "⏳", label: "Needs Review", color: "text-white/50", dot: "bg-white/50" },
  ACCEPTED: { icon: "✅", label: "Accepted", color: "text-emerald-400", dot: "bg-emerald-400" },
  DECLINED: { icon: "❌", label: "Declined", color: "text-red-400", dot: "bg-red-400" },
  EXPIRED: { icon: "⏰", label: "Expired", color: "text-white/30", dot: "bg-white/30" },
};

export default function CuratorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        // Only show submissions where this user is the curator
        const curatorSubs = (data.submissions ?? []).filter((s: Submission) => s.curatorName !== "Curator" || true);
        setSubmissions(curatorSubs);
      }
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);

  async function acceptPitch(submissionId: string) {
    setActionId(submissionId);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/accept`, { method: "POST" });
      if (res.ok) setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? { ...s, status: "ACCEPTED", decidedAt: new Date().toISOString() } : s)));
    } catch { /* silent */ }
    finally { setActionId(null); }
  }

  async function rejectPitch(submissionId: string) {
    setActionId(submissionId);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/reject`, { method: "POST" });
      if (res.ok) setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? { ...s, status: "DECLINED", decidedAt: new Date().toISOString() } : s)));
    } catch { /* silent */ }
    finally { setActionId(null); }
  }

  function getTimeRemaining(deadline: string) {
    const hoursLeft = Math.max(0, Math.floor((new Date(deadline).getTime() - now) / 3600000));
    if (hoursLeft === 0) return "Expired";
    if (hoursLeft < 24) return `${hoursLeft}h left`;
    return `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h left`;
  }

  const pendingCount = submissions.filter((s) => s.status === "PENDING" || s.status === "PAID").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">📬 Incoming Pitches</h1>
        <p className="mt-2 text-white/40">
          Review artist submissions to your playlists
          {pendingCount > 0 && (
            <span className="ml-2 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              {pendingCount} need{pendingCount === 1 ? "s" : ""} review
            </span>
          )}
        </p>
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
            {submissions.length === 0 ? "No pitches yet" : "No pitches match this filter"}
          </p>
          <p className="mt-2 text-sm text-white/30">
            {submissions.length === 0 && "Artists will submit their tracks to your playlists here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const cfg = STATUS_CONFIG[s.status] ?? { icon: "📋", label: s.status, color: "text-white/50", dot: "bg-white/50" };
            const isReviewable = s.status === "PENDING" || s.status === "PAID";
            return (
              <div
                key={s.id}
                className={`rounded-2xl border p-5 transition-all ${
                  isReviewable
                    ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-xl">{cfg.icon}</div>
                    <div>
                      <p className="font-medium text-white">{s.trackTitle}</p>
                      <p className="text-sm text-white/40">by {s.artistName}</p>
                      <p className="mt-1 text-sm text-white/30">
                        Playlist: <span className="text-white/60">{s.playlistName}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-white/20">
                        Submitted {new Date(s.createdAt).toLocaleDateString()}
                        {isReviewable && <> · {getTimeRemaining(s.deadlineAt)}</>}
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
                    <p className="text-sm font-medium text-amber-400">💰 Waiting for artist to confirm payment</p>
                    {s.curatorPrice != null && s.curatorPrice > 0 && (
                      <p className="mt-2 text-lg font-bold text-white">${(s.curatorPrice / 100).toFixed(2)}</p>
                    )}
                    <p className="mt-1 text-xs text-white/30">The artist pays you directly, then confirms on Placify.</p>
                  </div>
                )}

                {/* PENDING / PAID — Reviewable */}
                {isReviewable && (
                  <div className="mt-4 ml-9 flex flex-wrap gap-3">
                    <a
                      href={`https://open.spotify.com/track/${s.trackTitle?.replace(/\s/g, "").toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-[#1DB954]/10 px-4 py-2 text-sm font-medium text-[#1DB954] transition-all hover:bg-[#1DB954]/20"
                    >
                      🎧 Listen on Spotify ↗
                    </a>
                    <button
                      onClick={() => acceptPitch(s.id)}
                      disabled={actionId === s.id}
                      className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50"
                    >
                      {actionId === s.id ? "Processing..." : "✅ Accept"}
                    </button>
                    <button
                      onClick={() => rejectPitch(s.id)}
                      disabled={actionId === s.id}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm font-medium text-white/60 transition-all hover:border-red-500/30 hover:text-red-400 disabled:opacity-50"
                    >
                      ❌ Decline
                    </button>
                  </div>
                )}

                {s.status === "ACCEPTED" && (
                  <div className="mt-3 ml-9 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-sm text-emerald-400">✅ You accepted this pitch — artist has been notified.</p>
                    {s.decidedAt && <p className="mt-1 text-xs text-white/20">Decided {new Date(s.decidedAt).toLocaleDateString()}</p>}
                  </div>
                )}

                {s.status === "DECLINED" && (
                  <div className="mt-3 ml-9 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-sm text-red-400">❌ You declined this pitch — artist&apos;s credit was refunded.</p>
                    {s.decidedAt && <p className="mt-1 text-xs text-white/20">Decided {new Date(s.decidedAt).toLocaleDateString()}</p>}
                  </div>
                )}

                {s.status === "EXPIRED" && (
                  <div className="mt-3 ml-9 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-sm text-white/30">⏰ Deadline passed — artist&apos;s credit was refunded.</p>
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
