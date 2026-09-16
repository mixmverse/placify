// src/app/dashboard/artist/pitch/page.tsx
"use client";
import { useState } from "react";

// ─── All major Spotify genres ───────────────────────────────────
const ALL_GENRES = [
  "afrobeat", "afro pop", "amapiano", "azonto", "bongo flava", "bouyon",
  "brazilian", "brega funk", "coupé-décalé", "dancehall", "dembow",
  "desi", "funk", "gqom", "highlife", "hip-hop", "house", "igbo",
  "kizomba", "kwaito", "k-pop", "latin", "lovers rock",
  "merengue", "pop", "r&b", "raï", "reggae", "reggaeton",
  "salsa", "soca", "son cubano", "swing", "tango", "trap",
  "trip hop", "tropical", "zouk",
  "acoustic", "alternative", "ambient", "blues", "classical",
  "country", "disco", "drum and bass", "dubstep", "edm",
  "electronic", "emo", "folk", "funk", "garage", "grime",
  "indie", "indie rock", "jazz", "lofi", "metal", "punk",
  "soul", "techno", "trance", "world", "rock",
].sort();

// ─── Moods ──────────────────────────────────────────────────────
const MOODS = [
  { slug: "chill", label: "Chill", icon: "😌" },
  { slug: "energetic", label: "Energetic", icon: "⚡" },
  { slug: "upbeat", label: "Upbeat", icon: "🎉" },
  { slug: "dark", label: "Dark", icon: "🌑" },
  { slug: "mellow", label: "Mellow", icon: "🌅" },
  { slug: "dreamy", label: "Dreamy", icon: "💭" },
  { slug: "aggressive", label: "Aggressive", icon: "🔥" },
  { slug: "romantic", label: "Romantic", icon: "❤️" },
  { slug: "sad", label: "Sad", icon: "😢" },
  { slug: "happy", label: "Happy", icon: "😊" },
  { slug: "party", label: "Party", icon: "🥳" },
  { slug: "focus", label: "Focus", icon: "🎯" },
  { slug: "workout", label: "Workout", icon: "💪" },
  { slug: "sleep", label: "Sleep", icon: "😴" },
];

// ─── Price tiers ────────────────────────────────────────────────
const PRICE_FILTERS = [
  { key: "all", label: "Any Price" },
  { key: "free", label: "Free Only" },
  { key: "under1", label: "Under $1" },
  { key: "under5", label: "Under $5" },
] as const;

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
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set());
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "under1" | "under5">("all");
  const [genreSearch, setGenreSearch] = useState("");
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<"search" | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [searchSource, setSearchSource] = useState("");
  const [submissionResults, setSubmissionResults] = useState<SubmissionResult[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const filteredGenres = genreSearch
    ? ALL_GENRES.filter((g) => g.includes(genreSearch.toLowerCase()))
    : ALL_GENRES;

  // Apply price filter to displayed playlists
  const displayedPlaylists = playlists.filter((pl) => {
    if (priceFilter === "free") return pl.priceCents === 0;
    if (priceFilter === "under1") return pl.priceCents < 100;
    if (priceFilter === "under5") return pl.priceCents < 500;
    return true;
  });

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  }

  function toggleMood(mood: string) {
    setSelectedMoods((prev) => {
      const next = new Set(prev);
      if (next.has(mood)) next.delete(mood);
      else next.add(mood);
      return next;
    });
  }

  async function searchSpotify() {
    if (selectedGenres.size === 0) {
      setError("Please select at least one genre");
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
    if (selected.size === displayedPlaylists.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(displayedPlaylists.map((p) => p.id)));
    }
  }

  async function submitPitches() {
    if (selected.size === 0) return;
    setLoading("search");
    setError("");

    try {
      const selectedPlaylists = playlists.filter((p) => selected.has(p.id));
      const res = await fetch("/api/submissions/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotifyTrackId: spotifyUrl.match(/track\/([a-zA-Z0-9]+)/)?.[1] ?? "",
          trackInfo: {
            title: "My Track",
            artistName: "Artist",
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

  const totalCost = displayedPlaylists
    .filter((p) => selected.has(p.id))
    .reduce((sum, p) => sum + p.priceCents, 0);

  if (submitted) {
    const freeSubs = submissionResults.filter((s) => s.curatorPrice === 0);
    const paidSubs = submissionResults.filter((s) => s.curatorPrice > 0);
    const allPaid = paidSubs.every((s) => s.status === "PAID");

    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-8">
        <div className="text-center">
          <div className="text-6xl">🎉</div>
          <h1 className="mt-4 text-2xl font-bold text-black dark:text-white">Submitted!</h1>
          <p className="mt-2 text-zinc-500">
            Your track has been sent to {submissionResults.length} curator{submissionResults.length > 1 ? "s" : ""}.
          </p>
        </div>

        {/* Free curators — ready to review */}
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

        {/* Paid curators — need payment */}
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
              ? "All payments done! Curators will review within 72 hours."
              : "Pay curators above, then check your Submissions page for updates."}
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setSpotifyUrl("");
              setSelectedGenres(new Set());
              setSelectedMoods(new Set());
              setPlaylists([]);
              setSelected(new Set());
              setSubmissionResults([]);
            }}
            className="rounded-full bg-black px-6 py-2.5 text-sm text-white dark:bg-white dark:text-black"
          >
            Pitch Another Track
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white">Pitch Your Music</h1>
        <p className="mt-2 text-zinc-500">
          Pick your genre & mood, search for curator playlists, preview them on Spotify, then submit.
        </p>
      </div>

      {/* Step 1: Paste Spotify link */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-400">Step 1</h2>
        <p className="mt-1 text-lg font-medium text-black dark:text-white">Paste your Spotify track link</p>
        <input
          type="url"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          placeholder="https://open.spotify.com/track/..."
          className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
        />
        <p className="mt-2 text-xs text-zinc-400">Optional — helps us save your track details</p>
      </div>

      {/* Step 2: Pick genre + mood */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-400">Step 2</h2>
        <p className="mt-1 text-lg font-medium text-black dark:text-white">What&apos;s your song&apos;s genre & mood?</p>

        {/* Moods */}
        <div className="mt-4">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Mood</p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood.slug}
                onClick={() => toggleMood(mood.slug)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedMoods.has(mood.slug)
                    ? "bg-violet-100 text-violet-700 border border-violet-300 dark:bg-violet-900/30 dark:text-violet-400"
                    : "border border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
                }`}
              >
                <span>{mood.icon}</span>
                <span>{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Genre {selectedGenres.size > 0 && <span className="text-black dark:text-white">({selectedGenres.size} selected)</span>}
            </p>
          </div>
          <input
            type="text"
            value={genreSearch}
            onChange={(e) => setGenreSearch(e.target.value)}
            placeholder="Search genres (e.g. afrobeat, jazz, trap)..."
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          />
          <div className="mt-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
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
        </div>

        <button
          onClick={searchSpotify}
          disabled={selectedGenres.size === 0 || loading === "search"}
          className="mt-6 w-full rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading === "search" ? "Searching..." : `Search Curator Playlists`}
        </button>
      </div>

      {/* Loading */}
      {loading === "search" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-2xl">🔍</div>
          <p className="mt-2 text-sm text-zinc-500">Searching for curator playlists...</p>
        </div>
      )}

      {/* Step 3: Results */}
      {playlists.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-400">Step 3</h2>
              <p className="mt-1 text-lg font-medium text-black dark:text-white">
                Choose playlists to pitch to
              </p>
              <p className="text-sm text-zinc-500">
                {displayedPlaylists.length} of {playlists.length} playlist{playlists.length > 1 ? "s" : ""} shown
                {searchSource === "demo" && (
                  <span className="ml-2 text-amber-500">(Demo mode — add Spotify credentials for live results)</span>
                )}
              </p>
            </div>
            <button
              onClick={toggleAll}
              className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium dark:border-zinc-700"
            >
              {selected.size === displayedPlaylists.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          {/* Price filter */}
          <div className="mt-4 flex gap-2">
            {PRICE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setPriceFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  priceFilter === f.key
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Playlist cards */}
          <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">
            {displayedPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => togglePlaylist(pl.id)}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                  selected.has(pl.id)
                    ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-800"
                    : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-800"
                }`}
              >
                {/* Checkbox */}
                <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selected.has(pl.id)
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}>
                  {selected.has(pl.id) && <span className="text-xs">✓</span>}
                </div>

                {/* Image */}
                {pl.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pl.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl">
                    🎵
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-black dark:text-white truncate">{pl.name}</p>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {pl.matchedGenre}
                    </span>
                    {pl.isRegistered && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        ✓ Verified Curator
                      </span>
                    )}
                    {pl.priceCents === 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    by {pl.ownerName} · {formatFollowers(pl.followerCount)} followers
                    {pl.trackCount > 0 && ` · ${pl.trackCount} tracks`}
                    {pl.totalReviews > 0 && ` · ${pl.totalReviews} reviews`}
                  </p>
                  {pl.description && (
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-1">{pl.description}</p>
                  )}
                  {pl.onTimeRate > 0 && (
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {(pl.onTimeRate * 100).toFixed(0)}% on-time · {pl.responseHours}h response
                    </p>
                  )}
                </div>

                {/* Price + Spotify link */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className={`text-lg font-bold ${
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
                      className="rounded-full bg-[#1DB954] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1ed760]"
                    >
                      View on Spotify ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit bar */}
          {selected.size > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-black dark:text-white">{selected.size}</span> playlist{selected.size > 1 ? "s" : ""} selected
                </p>
                <p className="text-sm font-medium text-black dark:text-white">
                  Total cost: {totalCost === 0 ? (
                    <span className="text-blue-600 dark:text-blue-400">FREE</span>
                  ) : (
                    `$${(totalCost / 100).toFixed(2)}`
                  )}
                </p>
              </div>
              <button
                onClick={submitPitches}
                disabled={loading === "search"}
                className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {loading === "search" ? "Submitting..." : `Submit to ${selected.size} Playlist${selected.size > 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
