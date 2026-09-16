// src/app/dashboard/curator/playlists/page.tsx
"use client";
import { useState } from "react";

export default function PlaylistsPage() {
  const [, setShowAdd] = useState(false);
  const playlists = [
    { id: "1", name: "Night Drive", followers: 340, verified: true, status: "ACTIVE" as const },
    { id: "2", name: "Chill Vibes", followers: 180, verified: true, status: "ACTIVE" as const },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Playlists</h1>
        <button onClick={() => setShowAdd(true)} className="rounded-full bg-black px-5 py-2.5 text-sm text-white dark:bg-white dark:text-black">
          Add Playlist
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {playlists.map((p) => (
          <div key={p.id} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-zinc-500">{p.followers} followers</p>
              </div>
              {p.verified && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">✓ Verified</span>}
            </div>
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${
              p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
