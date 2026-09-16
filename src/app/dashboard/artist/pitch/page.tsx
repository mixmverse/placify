// src/app/dashboard/artist/pitch/page.tsx
"use client";
import { useState } from "react";

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

  const filteredGenres = genreSearch
    ? POPULAR_GENRES.filter((g) => g.includes(genreSearch.toLowerCase()))
    : POPULAR_GENRES;

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  }

  // Step 1 → 2: Analyze Spotify link
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
      if (!res.ok) throw new Error("Could not analyze track");
      const data = await res.json();

      const genres = data.genres ?? [];
      setDetectedGenres(genres);
      setSelectedGenres(new Set(genres));
      setTrackInfo(data.track ?? null);
      setStep(2);
    } catch {
      setError("Could not analyze track. You can pick genres manually below.");
      setDetectedGenres([]);
      setSelectedGenres(new Set());
      setCustomGenres(true);
      setStep(2);
    } finally {
      setLoading(null);
    }
  }

  // Step 2 → 3: Search curators
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
      const res = await fetch(`/api/curators/search-spotify?genres=${encodeURIComponent(genresParam)}&limit=40`);
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
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === playlists.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(playlists.map((p) => p.id)));
    }
  }

  async function submitPitches() {
    if (selected.size === 0) return;
    setLoading("search");
    setError("");

    try {
      const selectedPlaylists = playlists.filter((p) => selected.has(p.id));
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
          curatorUserIds: selectedPlaylists.map((p) => p.curatorUserId).filter(Boolean),
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

  // ─── SUBMITTED SCREEN ─────────────────────────────────────
  if (submitted) {
    const freeSubs = submissionResults.filter((s) => s.curatorPrice === 0);
    const paidSubs = submissionResults.filter((s) => s.curatorPrice > 0);
    const allPaid = paidSubs.every((s) => s.status === "PAID");

    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-8">
        <div className="text-center">
          <div className="text-6xl">🎉</div>
          <h1 className="mt-4 text-2xl font-bold text-black dark:text-white">Pitches sent!</h1>
          <p className="mt-2 text-zinc-500">
            Your track has been sent to {submissionResults.length} curator{submissionResults.length > 1 ? "s" : ""}.
          </p>
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            🛡️ Artist Protection active — 72h response guarantee
          </p>
        </div>

        {freeSubs.length > 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-900/20">
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-400">
              ✓ {freeSubs.length} free curator{freeSubs.length > 1 ? "s" : ""} — reviewing now
            </h3>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-500">
              These curators will review within 72 hours. No payment needed.
            </p>
          </div>
        )}

        {paidSubs.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-900/20">
            <h3 className="font-semibold text-amber-800 dark:text-amber-400">
              💰 {paidSubs.length} curator{paidSubs.length > 1 ? "s" : ""} require payment
            </h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
              Pay each curator directly, then confirm below. They&apos;ll start reviewing after payment.
            </p>

            <div className="mt-4 space-y-3">
              {paidSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black dark:text-white">
                        {sub.curatorName ?? "Curator"}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {sub.curatorPaymentMethod
                          ? `Pay via ${sub.curatorPaymentMethod}`
                          : "Payment method not set"}
                      </p>
                      {sub.curatorPaymentInfo && (
                        <p className="mt-1 text-sm font-mono text-zinc-700 dark:text-zinc-300">
                          {sub.curatorPaymentInfo}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-black dark:text-white">
                        ${(sub.curatorPrice / 100).toFixed(2)}
                      </p>
                      {sub.status === "PAID" ? (
                        <span className="text-sm text-emerald-600 font-medium">✓ Paid</span>
                      ) : (
                        <button
                          onClick={() => confirmPayment(sub.id)}
                          disabled={confirmingId === sub.id}
                          className="mt-1 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
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

        <div className="text-center">
          <p className="text-sm text-zinc-500 mb-4">
            {allPaid || paidSubs.length === 0
              ? "All done! Curators will review within 72 hours."
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
            }}
            className="rounded-full bg-black px-6 py-2.5 text-sm text-white dark:bg-white dark:text-black"
          >
            Pitch Another Track
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN FLOW ────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white">Pitch Your Music</h1>
        <p className="mt-2 text-zinc-500">
          Paste your link. Pick curators. Get placed. It&apos;s that simple.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step >= s
                ? "bg-emerald-600 text-white"
                : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
            }`}>
              {step > s ? "✓" : s}
            </div>
            <span className={step >= s ? "text-black dark:text-white font-medium" : "text-zinc-400"}>
              {s === 1 ? "Paste" : s === 2 ? "Pick Genres" : "Choose Curators"}
            </span>
            {s < 3 && <div className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" />}
          </div>
        ))}
      </div>

      {/* Step 1: Paste Spotify Link */}
      {step === 1 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-black dark:text-white">Paste your Spotify track link</h2>
          <p className="mt-1 text-sm text-zinc-500">
            We&apos;ll detect your genre automatically and find matching curators.
          </p>
          <input
            type="url"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeTrack()}
            placeholder="https://open.spotify.com/track/..."
            autoFocus
            className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-emerald-400"
          />
          <button
            onClick={analyzeTrack}
            disabled={!spotifyUrl || loading === "search"}
            className="mt-4 w-full rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading === "search" ? "Analyzing..." : "Analyze Track →"}
          </button>
          <p className="mt-3 text-center text-xs text-zinc-400">
            🛡️ Artist Protection: 72h response guarantee on every pitch
          </p>
        </div>
      )}

      {/* Step 2: Pick Genres */}
      {step === 2 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-black dark:text-white">Pick genres for your track</h2>
          {detectedGenres.length > 0 ? (
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
              ✓ Detected from your track: {detectedGenres.join(", ")}
            </p>
          ) : (
            <p className="mt-1 text-sm text-zinc-500">
              Select genres that match your music
            </p>
          )}

          {!customGenres && detectedGenres.length > 0 && (
            <button
              onClick={() => { setCustomGenres(true); setSelectedGenres(new Set()); }}
              className="mt-2 text-xs text-zinc-400 underline hover:text-zinc-600"
            >
              Pick different genres
            </button>
          )}

          {(customGenres || detectedGenres.length === 0) && (
            <>
              <input
                type="text"
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                placeholder="Search genres..."
                className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
              />
              <div className="mt-3 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {filteredGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedGenres.has(genre)
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "border border-zinc-300 text-zinc-600 hover:border-black dark:border-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </>
          )}

          {detectedGenres.length > 0 && !customGenres && (
            <div className="mt-4 flex flex-wrap gap-2">
              {detectedGenres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  ✓ {genre}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl border border-zinc-300 px-5 py-3 text-sm dark:border-zinc-700"
            >
              ← Back
            </button>
            <button
              onClick={searchCurators}
              disabled={selectedGenres.size === 0 || loading === "search"}
              className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading === "search" ? "Searching..." : "Find Curators →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Choose Curators */}
      {step === 3 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">Choose curators</h2>
              <p className="text-sm text-zinc-500">
                {playlists.length} matching playlist{playlists.length > 1 ? "s" : ""} found
                {searchSource === "demo" && (
                  <span className="ml-2 text-amber-500">(Demo — add Spotify API keys for live results)</span>
                )}
              </p>
            </div>
            <button
              onClick={toggleAll}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
            >
              {selected.size === playlists.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => togglePlaylist(pl.id)}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                  selected.has(pl.id)
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/20"
                    : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-800"
                }`}
              >
                <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selected.has(pl.id)
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}>
                  {selected.has(pl.id) && <span className="text-xs">✓</span>}
                </div>

                {pl.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pl.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-lg">🎵</div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-black dark:text-white truncate text-sm">{pl.name}</p>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {pl.matchedGenre}
                    </span>
                    {pl.isRegistered && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        ✓ Verified
                      </span>
                    )}
                    {pl.priceCents === 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {formatFollowers(pl.followerCount)} followers
                    {pl.totalReviews > 0 && ` · ${pl.totalReviews} reviews`}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`text-base font-bold ${
                    pl.priceCents === 0 ? "text-blue-600 dark:text-blue-400" : "text-black dark:text-white"
                  }`}>
                    {formatPrice(pl.priceCents)}
                  </span>
                  {pl.spotifyUrl && (
                    <a
                      href={pl.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 block text-xs text-[#1DB954] hover:underline"
                    >
                      Spotify ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit bar */}
          {selected.size > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/20">
              <div>
                <p className="text-sm font-medium text-black dark:text-white">
                  {selected.size} curator{selected.size > 1 ? "s" : ""} selected
                </p>
                <p className="text-sm text-zinc-500">
                  Cost: {totalCost === 0 ? (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">FREE</span>
                  ) : (
                    `$${(totalCost / 100).toFixed(2)} (pay curator directly)`
                  )}
                </p>
              </div>
              <button
                onClick={submitPitches}
                disabled={loading === "search"}
                className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading === "search" ? "Submitting..." : `Submit to ${selected.size}`}
              </button>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            className="mt-4 text-sm text-zinc-400 underline hover:text-zinc-600"
          >
            ← Change genres
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Artist Protection badge */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">
          🛡️ <span className="font-medium text-black dark:text-white">Artist Protection</span> — Every pitch has a 72-hour response guarantee. No response = automatic credit refund.
        </p>
      </div>
    </div>
  );
}
