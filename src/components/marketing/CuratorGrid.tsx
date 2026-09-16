"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

type Curator = {
  userId: string;
  displayName: string;
  bio: string | null;
  verified: boolean;
  priceCents: number;
  totalReviews: number;
  onTimeRate: number | null;
  genres: string[];
  playlists: { name: string; spotifyPlaylistId: string; followerCount: number; isVerified: boolean }[];
};

export function CuratorGrid({ curators }: { curators: Curator[] }) {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string>("ANY");

  // Extract all unique genres from all curators
  const allGenres = useMemo(() => {
    const genreMap = new Map<string, number>();
    for (const c of curators) {
      for (const g of c.genres) {
        genreMap.set(g, (genreMap.get(g) ?? 0) + 1);
      }
    }
    return [...genreMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([name, count]) => ({ name, count }));
  }, [curators]);

  const filtered = useMemo(() => {
    return curators.filter((c) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchName = c.displayName.toLowerCase().includes(q);
        const matchGenre = c.genres.some((g) => g.toLowerCase().includes(q));
        if (!matchName && !matchGenre) return false;
      }
      // Genre filter
      if (selectedGenre && !c.genres.includes(selectedGenre)) return false;
      // Price filter
      const price = c.priceCents / 100;
      if (selectedPrice === "FREE" && price > 0) return false;
      if (selectedPrice === "UNDER1" && price >= 1) return false;
      if (selectedPrice === "UNDER5" && price >= 5) return false;
      return true;
    });
  }, [curators, search, selectedGenre, selectedPrice]);

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by curator name or genre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-zinc-600"
        />
      </div>

      {/* Genre chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGenre(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            selectedGenre === null
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          All Genres
        </button>
        {allGenres.map((g) => (
          <button
            key={g.name}
            onClick={() => setSelectedGenre(selectedGenre === g.name ? null : g.name)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              selectedGenre === g.name
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {g.name} ({g.count})
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="mb-6 flex gap-2">
        {[
          { value: "ANY", label: "Any Price" },
          { value: "FREE", label: "Free" },
          { value: "UNDER1", label: "Under $1" },
          { value: "UNDER5", label: "Under $5" },
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => setSelectedPrice(p.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              selectedPrice === p.value
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-zinc-500">
        Showing {filtered.length} of {curators.length} curators
      </p>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <div
            key={c.userId}
            className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-black dark:text-white">{c.displayName}</p>
                <p className="text-sm text-zinc-500">
                  {c.totalReviews} reviews · {Math.round((c.onTimeRate ?? 0) * 100)}% on-time
                </p>
              </div>
              {c.verified && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  ✓ Verified
                </span>
              )}
            </div>

            {c.genres.length > 0 && (
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
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    +{c.genres.length - 4} more
                  </span>
                )}
              </div>
            )}

            {c.playlists.length > 0 && (
              <div className="mt-3 space-y-1">
                {c.playlists.slice(0, 2).map((p) => (
                  <a
                    key={p.spotifyPlaylistId}
                    href={`https://open.spotify.com/playlist/${p.spotifyPlaylistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <span className="truncate text-zinc-700 dark:text-zinc-300">{p.name}</span>
                    <span className="ml-2 shrink-0 text-xs text-zinc-400">
                      {p.followerCount.toLocaleString()} followers
                    </span>
                  </a>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-black dark:text-white">
                {c.priceCents === 0 ? "Free per pitch" : `$${(c.priceCents / 100).toFixed(2)} per pitch`}
              </span>
              <Link
                href="/register?role=artist"
                className="rounded-full bg-black px-4 py-1.5 text-xs text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
              >
                Pitch →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center text-zinc-400">
          <p>No curators match your filters. Try broadening your search.</p>
        </div>
      )}
    </div>
  );
}
