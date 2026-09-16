"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

type Playlist = {
  name: string;
  spotifyPlaylistId: string;
  followerCount: number;
  isVerified: boolean;
  thumbnailUrl: string | null;
};

type Curator = {
  userId: string;
  displayName: string;
  bio: string | null;
  verified: boolean;
  priceCents: number;
  totalReviews: number;
  onTimeRate: number | null;
  genres: string[];
  playlists: Playlist[];
};

// Deterministic gradient palette — each name maps to a unique color pair
const GRADIENTS: [string, string][] = [
  ["#6366f1", "#8b5cf6"], // indigo → violet
  ["#ec4899", "#f43f5e"], // pink → rose
  ["#f97316", "#eab308"], // orange → yellow
  ["#10b981", "#06b6d4"], // emerald → cyan
  ["#3b82f6", "#6366f1"], // blue → indigo
  ["#8b5cf6", "#ec4899"], // violet → pink
  ["#06b6d4", "#3b82f6"], // cyan → blue
  ["#f43f5e", "#f97316"], // rose → orange
  ["#14b8a6", "#22c55e"], // teal → green
  ["#a855f7", "#6366f1"], // purple → indigo
  ["#ef4444", "#f97316"], // red → orange
  ["#0ea5e9", "#6366f1"], // sky → indigo
  ["#22c55e", "#06b6d4"], // green → cyan
  ["#e11d48", "#9333ea"], // rose → purple
  ["#0891b2", "#2563eb"], // cyan → blue
  ["#7c3aed", "#db2777"], // violet → pink
  ["#059669", "#0284c7"], // emerald → sky
  ["#dc2626", "#ea580c"], // red → orange
  ["#7c3aed", "#2563eb"], // violet → blue
  ["#c026d3", "#7c3aed"], // fuchsia → violet
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getGradient(name: string): [string, string] {
  return GRADIENTS[hashName(name) % GRADIENTS.length];
}

function getInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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

export function CuratorGrid({ curators }: { curators: Curator[] }) {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string>("ANY");

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
      if (search) {
        const q = search.toLowerCase();
        const matchName = c.displayName.toLowerCase().includes(q);
        const matchGenre = c.genres.some((g) => g.toLowerCase().includes(q));
        if (!matchName && !matchGenre) return false;
      }
      if (selectedGenre && !c.genres.includes(selectedGenre)) return false;
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
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">🔍</span>
          <input
            type="text"
            placeholder="Search by curator name or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-emerald-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Genre chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGenre(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            selectedGenre === null
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
          }`}
        >
          All Genres
        </button>
        {allGenres.map((g) => (
          <button
            key={g.name}
            onClick={() => setSelectedGenre(selectedGenre === g.name ? null : g.name)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedGenre === g.name
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
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
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selectedPrice === p.value
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="mb-6 text-sm text-white/30">
        Showing <span className="text-white/50">{filtered.length}</span> of <span className="text-white/50">{curators.length}</span> curators
      </p>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => {
          const [g1, g2] = getGradient(c.displayName);
          const hasPlaylists = c.playlists.length > 0;

          return (
            <div
              key={c.userId}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] transition-all hover:border-white/15 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-black/20"
            >
              {/* Playlist artwork collage — the hero visual */}
              <div className="relative h-40 overflow-hidden">
                {/* Main gradient background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${g1}40 0%, ${g2}40 100%)`,
                  }}
                />

                {/* Gradient mesh overlay */}
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: `radial-gradient(circle at 20% 30%, ${g1}60 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${g2}60 0%, transparent 50%)`,
                  }}
                />

                {/* Playlist artwork grid — show up to 4 playlist covers */}
                {hasPlaylists ? (
                  <div className={`absolute inset-2 ${c.playlists.length >= 4 ? 'grid grid-cols-2 gap-1.5' : c.playlists.length >= 2 ? 'grid grid-cols-2 gap-1.5' : 'grid grid-cols-1'}`}>
                    {c.playlists.slice(0, 4).map((pl) => (
                      <a
                        key={pl.spotifyPlaylistId}
                        href={`https://open.spotify.com/playlist/${pl.spotifyPlaylistId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/pl relative overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105"
                        title={pl.name}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Gradient background as fallback */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${g1}90 0%, ${g2}90 100%)`,
                          }}
                        />
                        {/* Playlist initial */}
                        <div className="relative flex h-full w-full items-center justify-center">
                          <span className="text-lg font-bold text-white/80 drop-shadow-lg">
                            {getInitials(pl.name)}
                          </span>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/pl:opacity-100">
                          <span className="text-xs font-medium text-white">Open ↗</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  /* No playlists — show initials */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white/20">{getInitials(c.displayName)}</span>
                  </div>
                )}

                {/* Verified badge overlay */}
                {c.verified && (
                  <div className="absolute right-3 top-3 rounded-full bg-emerald-500/80 px-2 py-0.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
                    ✓ Verified
                  </div>
                )}

                {/* Price badge overlay */}
                <div className="absolute bottom-3 left-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-lg backdrop-blur-sm ${
                    c.priceCents === 0
                      ? "bg-blue-500/80 text-white"
                      : "bg-black/60 text-white"
                  }`}>
                    {formatPrice(c.priceCents)}
                  </span>
                </div>

                {/* Subtle noise texture */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {c.displayName}
                  </h3>
                </div>

                <p className="mt-1 text-xs text-white/30">
                  {c.totalReviews} reviews · {Math.round((c.onTimeRate ?? 0) * 100)}% on-time
                  {hasPlaylists && ` · ${c.playlists.length} playlist${c.playlists.length > 1 ? "s" : ""}`}
                </p>

                {/* Genres */}
                {c.genres.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {c.genres.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/40"
                      >
                        {g}
                      </span>
                    ))}
                    {c.genres.length > 3 && (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
                        +{c.genres.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Playlist follower counts */}
                {hasPlaylists && (
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-white/25">
                    {c.playlists.slice(0, 3).map((pl) => (
                      <span key={pl.spotifyPlaylistId} className="flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-emerald-400/40" />
                        {formatFollowers(pl.followerCount)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pitch CTA */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-white/20">
                    {hasPlaylists && c.playlists[0]?.followerCount
                      ? `${formatFollowers(c.playlists[0].followerCount)} followers`
                      : "New curator"}
                  </span>
                  <Link
                    href="/register?role=artist"
                    className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-1.5 text-xs font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 hover:scale-105"
                  >
                    Pitch →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">🎵</div>
          <p className="mt-4 text-white/30">No curators match your filters.</p>
          <p className="mt-1 text-sm text-white/20">Try broadening your search.</p>
        </div>
      )}
    </div>
  );
}
