// src/app/dashboard/artist/tracks/page.tsx
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

type Track = {
  id: string;
  title: string;
  artistName: string;
  artworkUrl: string | null;
  spotifyTrackId: string;
  durationMs: number;
};

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tracks")
      .then((r) => r.json())
      .then((data) => setTracks(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!spotifyUrl) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotifyTrackId: spotifyUrl }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Failed to add track");
        setAdding(false);
        return;
      }
      const track = await res.json();
      setTracks((prev) => [track, ...prev]);
      setSpotifyUrl("");
    } catch {
      setError("Failed to add track");
    }
    setAdding(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Tracks</h1>
        <p className="mt-2 text-white/40">Add your Spotify tracks to pitch them to curators</p>
      </div>

      {/* Add Track Form */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🎵</span>
          <input
            type="text"
            placeholder="Paste Spotify track URL or ID"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/30 focus:bg-white/[0.04] focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={adding || !spotifyUrl}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50"
        >
          {adding ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Adding...
            </span>
          ) : (
            "Add Track"
          )}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      {/* Track List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20">
          <div className="text-5xl">🎵</div>
          <p className="mt-4 text-lg font-medium text-white/60">No tracks yet</p>
          <p className="mt-2 text-sm text-white/30">Add a Spotify track link above to get started</p>
          <p className="mt-1 text-xs text-white/20">Paste any Spotify track URL and we&apos;ll fetch the details</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t) => (
            <div
              key={t.id}
              className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                {t.artworkUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.artworkUrl} alt={t.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl">🎵</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{t.title}</p>
                <p className="truncate text-xs text-white/40">{t.artistName}</p>
                <a
                  href={`https://open.spotify.com/track/${t.spotifyTrackId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-emerald-400/70 transition-colors hover:text-emerald-400"
                >
                  Open in Spotify →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Pitch CTA */}
      {tracks.length > 0 && (
        <Link
          href="/dashboard/artist/pitch"
          className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/10"
        >
          🎯 Pitch a track to curators →
        </Link>
      )}
    </div>
  );
}
