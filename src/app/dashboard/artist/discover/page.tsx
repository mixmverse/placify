// src/app/dashboard/artist/discover/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CuratorPlaylist {
  id: string;
  name: string;
  followerCount: number;
  spotifyPlaylistId: string;
}

interface Curator {
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  verified: boolean;
  totalReviews: number;
  onTimeReviews: number;
  responseHours: number;
  priceCents: number;
  genres: string[];
  playlists: CuratorPlaylist[];
  onTimeRate: number;
}

export default function DiscoverPage() {
  const [curators, setCurators] = useState<Curator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCurators = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGenre !== "all") {
        params.set("genres", selectedGenre);
      }
      const res = await fetch(`/api/curators?${params.toString()}`);
      const data = await res.json();
      setCurators(data.curators ?? []);
    } catch {
      setCurators([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCurators();
  }, [fetchCurators]);

  // Get unique genres from all curators
  const allGenres = [...new Set(curators.flatMap((c) => c.genres))].sort();

  // Filter curators by price and search
  const filtered = curators.filter((c) => {
    if (priceFilter === "free" && c.priceCents > 0) return false;
    if (priceFilter === "under1" && c.priceCents >= 100) return false;
    if (priceFilter === "under5" && c.priceCents >= 500) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.displayName.toLowerCase().includes(q) ||
        c.genres.some((g) => g.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const formatPrice = (cents: number) => {
    if (cents === 0) return "Free";
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Discover Curators</h1>
        <p className="mt-1 text-zinc-500">
          {curators.length} verified curators with real Spotify playlists
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or genre..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
      />

      {/* Genre filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGenre("all")}
          className={`rounded-full px-4 py-1.5 text-sm ${
            selectedGenre === "all"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "border border-zinc-200 dark:border-zinc-800"
          }`}
        >
          All ({curators.length})
        </button>
        {allGenres.slice(0, 20).map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              selectedGenre === g
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "Any Price" },
          { value: "free", label: "Free" },
          { value: "under1", label: "Under $1" },
          { value: "under5", label: "Under $5" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setPriceFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              priceFilter === f.value
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Curator grid */}
      {loading ? (
        <div className="py-12 text-center text-zinc-500">Loading curators...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">
          No curators found matching your filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.userId}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div>
                    <p className="font-medium">{c.displayName}</p>
                    <p className="text-xs text-zinc-500">
                      {c.totalReviews} reviews · {Math.round(c.onTimeRate * 100)}% on-time
                    </p>
                  </div>
                </div>
                {c.verified && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Genres */}
              <div className="mt-3 flex flex-wrap gap-1">
                {c.genres.slice(0, 4).map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {g}
                  </span>
                ))}
                {c.genres.length > 4 && (
                  <span className="text-xs text-zinc-400">+{c.genres.length - 4} more</span>
                )}
              </div>

              {/* Playlists */}
              {c.playlists.length > 0 && (
                <div className="mt-3 space-y-1">
                  {c.playlists.slice(0, 2).map((p) => (
                    <a
                      key={p.id}
                      href={`https://open.spotify.com/playlist/${p.spotifyPlaylistId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="shrink-0 text-xs text-zinc-500">
                        {p.followerCount.toLocaleString()} followers
                      </span>
                    </a>
                  ))}
                  {c.playlists.length > 2 && (
                    <p className="text-xs text-zinc-400">+{c.playlists.length - 2} more playlists</p>
                  )}
                </div>
              )}

              {/* Price + pitch button */}
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-sm font-medium ${c.priceCents === 0 ? "text-emerald-600" : "text-black dark:text-white"}`}>
                  {formatPrice(c.priceCents)} per pitch
                </span>
                <Link
                  href="/dashboard/artist/pitch"
                  className="rounded-full bg-black px-4 py-1.5 text-sm text-white dark:bg-white dark:text-black"
                >
                  Pitch →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
