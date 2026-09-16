// src/app/(marketing)/curators/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import db from "@/lib/db";
import { CuratorGrid } from "@/components/marketing/CuratorGrid";

export const metadata: Metadata = {
  title: "Curators | Placify — Verified Spotify Playlist Curators",
  description:
    "Browse verified Spotify playlist curators on Placify. Every curator has 50+ real followers. Join as a curator for free and earn from the monthly revenue pool.",
};

async function getCurators() {
  const users = await db.user.findMany({
    where: { isCurator: true },
    include: {
      curatorProfile: true,
      curatorGenrePrefs: { include: { genre: true } },
      playlists: true,
    },
    orderBy: { curatorProfile: { totalReviews: "desc" } },
  });

  return users
    .filter((u) => u.curatorProfile)
    .map((u) => ({
      userId: u.id,
      displayName: u.curatorProfile!.displayName || "Unnamed Curator",
      bio: u.curatorProfile!.bio,
      verified: u.curatorProfile!.verified,
      priceCents: u.curatorProfile!.priceCents,
      totalReviews: u.curatorProfile!.totalReviews,
      onTimeRate: u.curatorProfile!.totalReviews > 0
        ? u.curatorProfile!.onTimeReviews / u.curatorProfile!.totalReviews
        : 0,
      genres: u.curatorGenrePrefs.map((g) => g.genre.name),
      playlists: u.playlists.map((p) => ({
        name: p.name,
        spotifyPlaylistId: p.spotifyPlaylistId,
        followerCount: p.followerCount,
        isVerified: p.isVerified,
      })),
    }));
}

async function getStats() {
  const curatorCount = await db.user.count({ where: { isCurator: true } });
  const playlistCount = await db.playlist.count();
  const genreCount = await db.genre.count();
  return {
    curators: curatorCount,
    playlists: playlistCount,
    genres: genreCount,
  };
}

export default async function CuratorsPage() {
  const [curators, stats] = await Promise.all([getCurators(), getStats()]);

  return (
    <>
      {/* Hero */}
      <section className="bg-white px-6 py-20 dark:bg-black lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl dark:text-white">
            Verified Playlist Curators
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Every curator on Placify is verified to have real followers on their playlists.
            No bots, no fake playlists — just real curators who love discovering music.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register?role=curator"
              className="rounded-full bg-black px-8 py-3 text-base font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              Join as Curator — Free
            </Link>
            <Link
              href="/register?role=artist"
              className="rounded-full border border-zinc-300 px-8 py-3 text-base font-medium dark:border-zinc-700 dark:text-zinc-300"
            >
              Start Pitching as Artist
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-200 bg-zinc-50 px-6 py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-3xl justify-center gap-12">
          {[
            { value: `${stats.curators}+`, label: "Verified Curators" },
            { value: `${stats.playlists}+`, label: "Active Playlists" },
            { value: `${stats.genres}+`, label: "Genres Covered" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-black dark:text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Curators */}
      <section className="bg-white px-6 py-16 dark:bg-black">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Browse Our Curators
          </h2>
          <p className="mt-2 text-zinc-500">
            Real curators with real Spotify playlists. Click to pitch your music.
          </p>

          <div className="mt-8">
            <CuratorGrid curators={curators} />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-black dark:text-white">Why Curators Love Placify</h2>
          <div className="mt-8 space-y-6">
            {[
              { title: "Always Free", desc: "No subscription, no credit card, ever. List unlimited playlists with 50+ followers." },
              { title: "Get Paid for Reviewing", desc: "Earn a share of the monthly revenue pool based on your review activity and playlist retention." },
              { title: "Set Your Preferences", desc: "Choose which genres you accept and set your response pace. You control your queue." },
              { title: "Quality Submissions", desc: "Every track comes from a verified Spotify link. No spam, no filler — just real music." },
              { title: "Dashboard Analytics", desc: "Track your submissions, earnings, response times, and playlist performance from one dashboard." },
              { title: "Founding Curator Status", desc: "Early curators get permanent Founding Curator badges and priority placement in artist searches." },
            ].map((b) => (
              <div key={b.title} className="flex gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  ✓
                </div>
                <div>
                  <h3 className="font-medium text-black dark:text-white">{b.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-6 py-16 dark:bg-black">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white">Ready to join the network?</h2>
          <p className="mt-2 text-zinc-500">Always free. Earn from day one. Set your own terms.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register?role=curator" className="rounded-full bg-black px-6 py-2.5 text-sm text-white dark:bg-white dark:text-black">
              Join as Curator — Free
            </Link>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            Already have an account? <Link href="/login" className="underline">Sign In</Link>
          </p>
        </div>
      </section>
    </>
  );
}
