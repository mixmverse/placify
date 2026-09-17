// src/app/(auth)/onboarding/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const GENRE_OPTIONS = [
  "Afrobeat", "Amapiano", "Dancehall", "Hip-Hop", "House", "Indie",
  "K-Pop", "Latin", "Lo-Fi", "Pop", "R&B", "Reggaeton", "Trap",
  "Electronic", "Jazz", "Soul", "Rock", "Folk", "EDM", "Punk",
  "Alternative", "Country", "Metal", "Blues", "Classical",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  }

  async function handleComplete() {
    if (!artistName.trim()) {
      setError("Artist/stage name is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistName: artistName.trim(),
          bio: bio.trim(),
          genres: Array.from(selectedGenres),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }
      router.push("/dashboard/artist");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-4xl">🎵</div>
          <h1 className="mt-4 text-2xl font-bold text-white">Set up your artist profile</h1>
          <p className="mt-2 text-white/50">
            Tell us about yourself so curators know who they&apos;re reviewing.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">Artist / Stage Name *</label>
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="e.g. DJ Luna, The Velvet Sound, Amara"
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">Short bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="One-liner about your sound (optional)"
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white/70">Your genres</label>
            <p className="mb-2 text-xs text-white/30">Pick the genres that best describe your music</p>
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
              {GENRE_OPTIONS.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedGenres.has(genre)
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleComplete}
          disabled={loading || !artistName.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? "Saving..." : "Continue to Dashboard →"}
        </button>
      </div>
    </div>
  );
}
