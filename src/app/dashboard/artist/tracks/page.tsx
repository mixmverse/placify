// src/app/dashboard/artist/tracks/page.tsx
"use client";
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
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">My Tracks</h1>

      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          placeholder="Paste Spotify track URL or ID"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={adding || !spotifyUrl}
          className="rounded-full bg-black px-5 py-2.5 text-sm text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {adding ? "Adding..." : "Add Track"}
        </button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading tracks...</p>
      ) : tracks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-500">No tracks yet. Add a Spotify track link above to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t) => (
            <div key={t.id} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:bg-zinc-950">
              <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                {t.artworkUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.artworkUrl} alt={t.title} className="h-12 w-12 rounded-lg object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="truncate text-xs text-zinc-500">{t.artistName}</p>
              </div>
              <a
                href={`https://open.spotify.com/track/${t.spotifyTrackId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Spotify →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
