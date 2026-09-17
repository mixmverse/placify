// src/app/dashboard/artist/pitch/page.tsx
"use client";
import { useState, useEffect } from "react";

const POPULAR_GENRES = [
  "afrobeat", "amapiano", "dancehall", "hip-hop", "house", "indie",
  "k-pop", "latin", "lofi", "pop", "r&b", "reggaeton", "trap",
  "electronic", "jazz", "soul", "rock", "folk", "edm", "punk",
];

type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  followerCount: number;
  trackCount: number;
  ownerName: string;
  spotifyUrl: string;
  matchedGenre: string;
  isOwn: boolean;
  isRegistered: boolean;
  priceCents: number;
  responseHours: number;
  totalReviews: number;
  onTimeRate: number;
  curatorUserId: string | null;
  alreadySubmitted?: boolean;
};

type SubmissionResult = {
  id: string;
  curatorPrice: number;
  curatorPaymentMethod: string | null;
  curatorPaymentInfo: string | null;
  curatorName: string | null;
  status: string;
};

export default function PitchPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [detectedGenres, setDetectedGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [genreSearch, setGenreSearch] = useState("");
  const [customGenres, setCustomGenres] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<"search" | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [searchSource, setSearchSource] = useState("");
  const [submissionResults, setSubmissionResults] = useState<SubmissionResult[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [trackInfo, setTrackInfo] = useState<{ title: string; artistName: string } | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pitchMessage, setPitchMessage] = useState(
    "Hi! I came across your playlist and I really like the vibe. I wanted to submit my song for your consideration. I hope you enjoy it!",
  );

  const filteredGenres = genreSearch
    ? POPULAR_GENRES.filter((g) => g.includes(genreSearch.toLowerCase()))
    : POPULAR_GENRES;

  // Fetch credit balance and user ID on mount
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        setCreditBalance(d.creditBalance ?? 0);
        setUserId(d.id ?? null);
      })
      .catch(() => setCreditBalance(0));
  }, []);

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  }

  async function analyzeTrack() {
    if (!spotifyUrl) {
      setError("Paste a Spotify track link to continue");
      return;
    }
    setError("");
    setLoading("search");
    try {
      const trackId = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/)?.[1];
      if (!trackId) {
        setError("Invalid Spotify link — paste a track link (open.spotify.com/track/...)");
        setLoading(null);
        return;
      }
      const res = await fetch(`/api/tracks/analyze?trackId=${trackId}`);
      const data = await res.json();
      const track = data.track ?? null;
      // Don't auto-select genres — artist picks manually
      setDetectedGenres(track?.genres ?? data.genres ?? []);
      setSelectedGenres(new Set());
      setTrackInfo(track ? { title: track.title, artistName: track.artistName } : null);
      setStep(2);
    } catch {
      setError("Could not load track. You can pick genres manually below.");
      setDetectedGenres([]);
      setSelectedGenres(new Set());
      setTrackInfo(null);
      setStep(2);
    } finally {
      setLoading(null);
    }
  }

  async function searchCurators() {
    if (selectedGenres.size === 0) {
      setError("Select at least one genre");
      return;
    }
    setError("");
    setLoading("search");
    setPlaylists([]);
    setSelected(new Set());
    try {
      const genresParam = Array.from(selectedGenres).join(",");
      const trackId = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/)?.[1] ?? "";
      const params = new URLSearchParams({ genres: genresParam });
      if (trackId) params.set("trackId", trackId);
      if (userId) params.set("artistId", userId);
      const res = await fetch(`/api/curators/search-spotify?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setPlaylists(data.playlists ?? []);
      setSearchSource(data.source ?? "");
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(null);
    }
  }

  function togglePlaylist(id: string) {
    const pl = playlists.find((p) => p.id === id);
    if (!pl || !pl.curatorUserId || pl.alreadySubmitted) return; // can't select demo or already-submitted
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const selectable = playlists.filter((p) => p.curatorUserId && !p.alreadySubmitted);
    if (selected.size === selectable.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectable.map((p) => p.id)));
    }
  }

  async function submitPitches() {
    if (selected.size === 0) return;
    setLoading("search");
    setError("");
    try {
      const selectedPlaylists = playlists.filter((p) => selected.has(p.id));
      const realCurators = selectedPlaylists.filter((p) => p.curatorUserId);
      if (realCurators.length === 0) {
        setError("No registered curators selected. Only verified curators can receive pitches. Try different genres to find registered curators.");
        setLoading(null);
        return;
      }
      const trackId = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/)?.[1] ?? "";
      const res = await fetch("/api/submissions/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotifyTrackId: trackId,
          trackInfo: {
            title: trackInfo?.title ?? "My Track",
            artistName: trackInfo?.artistName ?? "Artist",
            artworkUrl: null,
            durationMs: 180000,
            genres: Array.from(selectedGenres),
          },
          curatorUserIds: realCurators.map((p) => p.curatorUserId),
          message: pitchMessage || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }
      const data = await res.json();
      setSubmissionResults(data.submissions ?? []);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function confirmPayment(submissionId: string) {
    setConfirmingId(submissionId);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/confirm-payment`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to confirm");
      }
      setSubmissionResults((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, status: "PAID" } : s)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to confirm payment");
    } finally {
      setConfirmingId(null);
    }
  }

  function formatFollowers(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
  }

  function formatPrice(cents: number): string {
    if (cents === 0) return "FREE";
    return `$${(cents / 100).toFixed(2)}`;
  }

  const totalCost = playlists
    .filter((p) => selected.has(p.id))
    .reduce((sum, p) => sum + p.priceCents, 0);

  const selectedPaidCount = playlists
    .filter((p) => selected.has(p.id) && p.priceCents > 0)
    .length;

  const selectedFreeCount = playlists
    .filter((p) => selected.has(p.id) && p.priceCents === 0)
    .length;

  // Every curator costs 1 credit, regardless of price
  const creditsNeeded = selected.size;
  const hasEnoughCredits = creditBalance === null || creditsNeeded <= creditBalance;

  const STEP_LABELS = ["Paste", "Pick Genres", "Choose Curators"];

  // ─── SUBMITTED SCREEN ─────────────────────────────────────
  if (submitted) {
    const freeSubs = submissionResults.filter((s) => s.curatorPrice === 0);
    const paidSubs = submissionResults.filter((s) => s.curatorPrice > 0);
    const allPaid = paidSubs.every((s) => s.status === "PAID");

    return (
      <div className="relative mx-auto max-w-3xl space-y-6 p-4 lg:p-8">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <div className="relative text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-4xl">🎉</div>
          <h1 className="mt-4 text-2xl font-bold text-white">Pitches sent!</h1>
          <p className="mt-2 text-white/50">
            Your track has been sent to {submissionResults.length} curator{submissionResults.length > 1 ? "s" : ""}.
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-400">
            🛡️ Artist Protection active — 7-day response guarantee
          </p>
        </div>

        {freeSubs.length > 0 && (
          <div className="relative rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 backdrop-blur-sm">
            <h3 className="font-semibold text-emerald-400">
              ✓ {freeSubs.length} free curator{freeSubs.length > 1 ? "s" : ""} — reviewing now
            </h3>
            <p className="mt-1 text-sm text-emerald-400/60">
              These curators will review within 7 days. No payment needed.
            </p>
          </div>
        )}

        {paidSubs.length > 0 && (
          <div className="relative rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 backdrop-blur-sm">
            <h3 className="font-semibold text-amber-400">
              💰 {paidSubs.length} curator{paidSubs.length > 1 ? "s" : ""} require payment
            </h3>
            <p className="mt-1 text-sm text-amber-400/60">
              Pay each curator directly, then confirm below. They&apos;ll start reviewing after payment.
            </p>
            <div className="mt-4 space-y-3">
              {paidSubs.map((sub) => (
                <div key={sub.id} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{sub.curatorName ?? "Curator"}</p>
                      <p className="text-sm text-white/40">
                        {sub.curatorPaymentMethod ? `Pay via ${sub.curatorPaymentMethod}` : "Payment method not set"}
                      </p>
                      {sub.curatorPaymentInfo && (
                        <p className="mt-1 font-mono text-sm text-white/60">{sub.curatorPaymentInfo}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">${(sub.curatorPrice / 100).toFixed(2)}</p>
                      {sub.status === "PAID" ? (
                        <span className="text-sm font-medium text-emerald-400">✓ Paid</span>
                      ) : (
                        <button
                          onClick={() => confirmPayment(sub.id)}
                          disabled={confirmingId === sub.id}
                          className="mt-1 rounded-full bg-amber-500/80 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50"
                        >
                          {confirmingId === sub.id ? "Confirming..." : "I Paid ✓"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative text-center">
          <p className="mb-4 text-sm text-white/40">
            {allPaid || paidSubs.length === 0
              ? "All done! Curators will review within 7 days."
              : "Pay curators above, then check your Submissions page for updates."}
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setSpotifyUrl("");
              setDetectedGenres([]);
              setSelectedGenres(new Set());
              setPlaylists([]);
              setSelected(new Set());
              setSubmissionResults([]);
              setTrackInfo(null);
              setCustomGenres(false);
              setPitchMessage("Hi! I came across your playlist and I really like the vibe. I wanted to submit my song for your consideration. I hope you enjoy it!");
            }}
            className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
          >
            Pitch Another Track
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN FLOW ────────────────────────────────────────────
  return (
    <div className="relative mx-auto max-w-3xl space-y-6 p-4 lg:p-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative">
        <h1 className="text-3xl font-bold text-white">Pitch Your Music</h1>
        <p className="mt-2 text-white/50">
          Paste your link. Pick curators. Get placed. It&apos;s that simple.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="relative flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
              step > s
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : step === s
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-white/5 text-white/30 border border-white/10"
            }`}>
              {step > s ? "✓" : s}
            </div>
            <span className={`text-sm font-medium ${step >= s ? "text-white" : "text-white/30"}`}>
              {STEP_LABELS[s - 1]}
            </span>
            {s < 3 && <div className={`mx-1 h-px w-6 ${step > s ? "bg-emerald-500/50" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Paste Spotify Link */}
      {step === 1 && (
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          {/* Subtle gradient top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-t-2xl" />

          <h2 className="text-lg font-semibold text-white">Paste your Spotify track link</h2>
          <p className="mt-1 text-sm text-white/40">
            We&apos;ll load your track info. You pick the genres and curators.
          </p>
          <input
            type="url"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeTrack()}
            placeholder="https://open.spotify.com/track/..."
            autoFocus
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-emerald-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-emerald-500/20"
          />
          <button
            onClick={analyzeTrack}
            disabled={!spotifyUrl || loading === "search"}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 disabled:shadow-none"
          >
            {loading === "search" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Analyzing...
              </span>
            ) : (
              "Analyze Track →"
            )}
          </button>
          <p className="mt-3 text-center text-xs text-white/30">
            🛡️ Artist Protection: 7-day response guarantee on every pitch
          </p>
        </div>
      )}

      {/* Step 2: Pick Genres */}
      {step === 2 && (
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-t-2xl" />

          {trackInfo && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-lg">🎵</div>
              <div>
                <p className="text-sm font-medium text-white">{trackInfo.title}</p>
                <p className="text-xs text-white/40">{trackInfo.artistName}</p>
              </div>
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-[#1DB954]/70 hover:text-[#1DB954]"
              >
                Open in Spotify ↗
              </a>
            </div>
          )}

          <h2 className="text-lg font-semibold text-white">Pick genres for your track</h2>
          <p className="mt-1 text-sm text-white/40">
            Select genres that match your music — these help us find the right curators for you.
          </p>
          {detectedGenres.length > 0 && (
            <p className="mt-1 text-xs text-white/30">
              Tip: your track may fit genres like {detectedGenres.join(", ")}
            </p>
          )}

          <input
            type="text"
            value={genreSearch}
            onChange={(e) => setGenreSearch(e.target.value)}
            placeholder="Search genres..."
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
          <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto">
            {filteredGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedGenres.has(genre)
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : detectedGenres.includes(genre)
                      ? "border border-emerald-500/20 text-emerald-400/60 hover:border-emerald-500/40 hover:text-emerald-400"
                      : "border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                }`}
              >
                {detectedGenres.includes(genre) && !selectedGenres.has(genre) ? "✦ " : ""}
                {genre}
              </button>
            ))}
          </div>

          {selectedGenres.size > 0 && (
            <p className="mt-3 text-xs text-emerald-400/60">
              ✓ {selectedGenres.size} genre{selectedGenres.size > 1 ? "s" : ""} selected
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/50 transition-colors hover:border-white/20 hover:text-white/70"
            >
              ← Back
            </button>
            <button
              onClick={searchCurators}
              disabled={selectedGenres.size === 0 || loading === "search"}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 disabled:shadow-none"
            >
              {loading === "search" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Searching...
                </span>
              ) : (
                "Find Curators →"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Choose Curators */}
      {step === 3 && (
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-t-2xl" />

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Choose curators</h2>
              <p className="text-sm text-white/40">
                {playlists.filter((p) => p.curatorUserId && !p.alreadySubmitted).length} available · {playlists.filter((p) => !p.curatorUserId).length} demo
                {playlists.filter((p) => p.alreadySubmitted).length > 0 && ` · ${playlists.filter((p) => p.alreadySubmitted).length} already submitted`}
                {searchSource === "demo" && (
                  <span className="ml-2 text-amber-400/60">(Demo — add Spotify API keys for live results)</span>
                )}
                <span className="ml-2 text-white/30">· Each curator costs 1 credit</span>
              </p>
            </div>
            <button
              onClick={toggleAll}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white/70"
            >
              {selected.size === playlists.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="mt-4 max-h-[500px] space-y-2 overflow-y-auto">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
                  pl.alreadySubmitted
                    ? "border-amber-500/20 bg-amber-500/5 opacity-70"
                    : selected.has(pl.id)
                      ? "border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/5"
                      : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                }`}
              >
                {/* Checkbox */}
                <div
                  onClick={() => togglePlaylist(pl.id)}
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                    !pl.curatorUserId
                      ? "cursor-not-allowed border-white/10 bg-white/5 opacity-40"
                      : pl.alreadySubmitted
                        ? "cursor-not-allowed border-amber-500/30 bg-amber-500/10"
                        : selected.has(pl.id)
                          ? "cursor-pointer border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : "cursor-pointer border-white/20 hover:border-white/40"
                  }`}
                >
                  {!pl.curatorUserId ? (
                    <span className="text-xs text-white/30">—</span>
                  ) : pl.alreadySubmitted ? (
                    <span className="text-xs text-amber-400">⚠</span>
                  ) : selected.has(pl.id) ? (
                    <span className="text-xs">✓</span>
                  ) : null}
                </div>

                {/* Image */}
                {pl.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pl.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-lg">🎵</div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-white">{pl.name}</p>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/40">
                      {pl.matchedGenre}
                    </span>
                    {pl.alreadySubmitted ? (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                        ⚠ Already Submitted
                      </span>
                    ) : pl.isRegistered ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        ✓ Verified
                      </span>
                    ) : !pl.curatorUserId ? (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-white/30">
                        Demo — Not Registered
                      </span>
                    ) : null}
                    {!pl.alreadySubmitted && pl.priceCents === 0 && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-white/30">
                    {formatFollowers(pl.followerCount)} followers
                    {pl.totalReviews > 0 && ` · ${pl.totalReviews} reviews`}
                    {pl.priceCents > 0 && ` · ${formatPrice(pl.priceCents)} submission fee`}
                  </p>
                  {pl.alreadySubmitted ? (
                    <p className="mt-2 text-xs text-amber-400/70">
                      You already submitted this track to this curator
                    </p>
                  ) : (
                    /* Prominent Spotify preview link */
                    pl.spotifyUrl && (
                      <a
                        href={pl.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#1DB954]/10 px-3 py-1 text-xs font-medium text-[#1DB954] transition-colors hover:bg-[#1DB954]/20"
                      >
                        🎧 Listen on Spotify — preview playlist before selecting ↗
                      </a>
                    )
                  )}
                </div>

                {/* Price */}
                {!pl.alreadySubmitted && (
                  <div className="shrink-0 text-right">
                    <span className={`text-base font-bold ${
                      pl.priceCents === 0 ? "text-blue-400" : "text-white"
                    }`}>
                      {formatPrice(pl.priceCents)}
                    </span>
                    <p className="mt-0.5 text-[10px] text-white/20">1 credit</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message to curator */}
          {selected.size > 0 && (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-white/60">
                Message to curators <span className="text-white/30">(optional — you can edit this)</span>
              </label>
              <textarea
                value={pitchMessage}
                onChange={(e) => setPitchMessage(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none"
                placeholder="Hi! I came across your playlist and wanted to submit my song..."
              />
              <p className="mt-1 text-xs text-white/20">
                This message is included in the email sent to each curator.
              </p>
            </div>
          )}

          {/* Submit bar */}
          {selected.size > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-sm">
              <div>
                <p className="text-sm font-medium text-white">
                  {selected.size} curator{selected.size > 1 ? "s" : ""} selected
                </p>
                <p className="text-sm text-white/40">
                  Costs <span className="font-medium text-amber-400">{creditsNeeded} credit{creditsNeeded > 1 ? "s" : ""}</span>
                  {creditBalance !== null && (
                    <span className="ml-1">· You have {creditBalance} credit{creditBalance !== 1 ? "s" : ""}</span>
                  )}
                  {totalCost > 0 && (
                    <span className="ml-1">· ${totalCost / 100} direct payment to curator{totalCost / 100 > 1 ? "s" : ""}</span>
                  )}
                </p>
              </div>
              <button
                onClick={submitPitches}
                disabled={loading === "search" || !hasEnoughCredits}
                className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 disabled:shadow-none"
              >
                {loading === "search" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Submitting...
                  </span>
                ) : !hasEnoughCredits ? (
                  `Need ${creditsNeeded - (creditBalance ?? 0)} more credit${creditsNeeded - (creditBalance ?? 0) > 1 ? "s" : ""}`
                ) : (
                  `Submit to ${selected.size}`
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            className="mt-4 text-sm text-white/30 underline hover:text-white/50"
          >
            ← Change genres
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="relative rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Artist Protection badge */}
      <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center backdrop-blur-sm">
        <p className="text-sm text-white/30">
          🛡️ <span className="font-medium text-white/50">Artist Protection</span> — Every pitch has a 7-day response guarantee. No response = automatic credit refund.
        </p>
      </div>
    </div>
  );
}
