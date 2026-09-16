// src/app/(marketing)/curators/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import db from "@/lib/db";
import { CuratorGrid } from "@/components/marketing/CuratorGrid";

export const dynamic = "force-dynamic";

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
        thumbnailUrl: p.thumbnailUrl,
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
      <section className="relative overflow-hidden bg-black px-6 py-20 lg:py-28">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-sm text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {stats.curators}+ verified curators
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Verified Playlist{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Curators
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/50">
            Every curator on Placify is verified to have real followers on their playlists.
            No bots, no fake playlists — just real curators who love discovering music.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register?role=curator"
              className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
            >
              Join as Curator — Free
            </Link>
            <Link
              href="/register?role=artist"
              className="rounded-full border border-white/10 px-8 py-3 text-base font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white/80"
            >
              Start Pitching as Artist
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-white/[0.02] px-6 py-8">
        <div className="mx-auto flex max-w-3xl justify-center gap-12">
          {[
            { value: `${stats.curators}+`, label: "Verified Curators", color: "text-emerald-400" },
            { value: `${stats.playlists}+`, label: "Active Playlists", color: "text-violet-400" },
            { value: `${stats.genres}+`, label: "Genres Covered", color: "text-cyan-400" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-white/30">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Curators */}
      <section className="relative bg-black px-6 py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px]" />
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-violet-500/5 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-white">
            Browse Our Curators
          </h2>
          <p className="mt-2 text-white/40">
            Real curators with real Spotify playlists. Each card shows their playlist artwork.
          </p>

          <div className="mt-8">
            <CuratorGrid curators={curators} />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-white/5 bg-white/[0.02] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-white">Why Curators Love Placify</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              { icon: "🆓", title: "Always Free", desc: "No subscription, no credit card, ever. List unlimited playlists." },
              { icon: "💰", title: "Get Paid for Reviewing", desc: "Earn directly from artists — you keep 100% of your fee." },
              { icon: "🎛️", title: "Set Your Preferences", desc: "Choose which genres you accept and set your response pace." },
              { icon: "🎵", title: "Quality Submissions", desc: "Every track comes from a verified Spotify link. No spam." },
              { icon: "📊", title: "Dashboard Analytics", desc: "Track submissions, earnings, and response times from one dashboard." },
              { icon: "⭐", title: "Founding Curator Status", desc: "Early curators get permanent badges and priority in searches." },
            ].map((b) => (
              <div key={b.title} className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="text-2xl">{b.icon}</div>
                <div>
                  <h3 className="font-medium text-white">{b.title}</h3>
                  <p className="mt-1 text-sm text-white/40">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-black px-6 py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white">Ready to join the network?</h2>
          <p className="mt-2 text-white/40">Always free. Earn from day one. Set your own terms.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register?role=curator"
              className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
            >
              Join as Curator — Free
            </Link>
          </div>
          <p className="mt-3 text-sm text-white/20">
            Already have an account? <Link href="/login" className="underline hover:text-white/40">Sign In</Link>
          </p>
        </div>
      </section>
    </>
  );
}
