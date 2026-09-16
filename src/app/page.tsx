// src/app/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

const TIERS = [
  { credits: 25, price: 5, curators: "~50", label: "Starter" },
  { credits: 75, price: 12, curators: "~150", label: "Pro" },
  { credits: 200, price: 25, curators: "~400", label: "Label" },
];

const WHY_US = [
  {
    icon: "⚡",
    title: "72-Hour Response",
    desc: "Curators must respond within 72 hours. Miss the deadline? Your credit is auto-refunded.",
  },
  {
    icon: "🎯",
    title: "Genre Matching",
    desc: "Paste your Spotify link. We detect your genre and show curators who play your kind of music.",
  },
  {
    icon: "💰",
    title: "Start at $5",
    desc: "Other platforms charge $280+. We start at $5. Curators keep 100% of their fee.",
  },
  {
    icon: "🛡️",
    title: "Artist Protection",
    desc: "Every pitch is protected. No response = automatic refund. Zero risk.",
  },
  {
    icon: "🌍",
    title: "Global Curators",
    desc: "297 verified curators across 170+ genres. We don't block countries like other platforms.",
  },
  {
    icon: "🎵",
    title: "Spotify Only",
    desc: "Paste a Spotify link. We handle the rest. No file uploads, no complicated setup.",
  },
];

const COMPARISON = [
  { feature: "Starting price", placify: "$5", playlistPush: "$280", submithub: "$1–$10" },
  { feature: "Curator keeps", placify: "100%", playlistPush: "~40%", submithub: "~50%" },
  { feature: "Response time", placify: "72 hours", playlistPush: "14 days", submithub: "7 days" },
  { feature: "Auto-refund", placify: "✓ Yes", playlistPush: "✗ No", submithub: "✗ No" },
  { feature: "Genre matching", placify: "✓ Automatic", playlistPush: "✓ Manual", submithub: "✗ None" },
  { feature: "Global access", placify: "✓ All countries", playlistPush: "✗ 49 blocked", submithub: "✓ Most" },
];

export default function HomePage() {
  const [tier, setTier] = useState(1);
  const selected = TIERS[tier];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white px-6 py-20 dark:bg-black lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
            297 verified curators • 172 genres • From $5
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl lg:text-6xl dark:text-white">
            Paste your track.
            <br />
            Pick curators.
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">Get placed.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            The simplest way to get your music on Spotify playlists.
            We match your track to the right curators — you just click submit.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-black px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              Get Started — From $5
            </Link>
            <Link
              href="/curators"
              className="rounded-full border border-zinc-300 px-8 py-3.5 text-base font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
            >
              Browse 297 Curators
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Flow */}
      <section className="border-y border-zinc-200 bg-zinc-50 px-6 py-16 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-black dark:text-white">
            3 clicks. That&apos;s it.
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              { num: "1", title: "Paste your Spotify link", desc: "We detect your genre, mood, and sound automatically." },
              { num: "2", title: "Pick your curators", desc: "See matching curators with prices, follower counts, and response rates." },
              { num: "3", title: "Submit & relax", desc: "Curators review within 72 hours. No response? Credit refunded." },
            ].map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-bold text-white dark:bg-white dark:text-black">
                  {s.num}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-black dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaign Calculator */}
      <section className="bg-white px-6 py-20 dark:bg-black">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
            How many curators can you reach?
          </h2>
          <p className="mt-3 text-zinc-500">Slide to pick your plan</p>
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-950">
            <input
              type="range"
              min={0}
              max={TIERS.length - 1}
              value={tier}
              onChange={(e) => setTier(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-black dark:text-white">${selected.price}</div>
                <div className="text-sm text-zinc-500">per month</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{selected.credits}</div>
                <div className="text-sm text-zinc-500">pitches</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black dark:text-white">{selected.curators}</div>
                <div className="text-sm text-zinc-500">curators reached</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-400">
              ${(selected.price / selected.credits).toFixed(2)} per pitch — curators keep 100%
            </p>
            <Link
              href="/register"
              className="mt-6 inline-block rounded-full bg-emerald-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Start with {selected.label} — ${selected.price}
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-black dark:text-white">
            Why artists choose Placify
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-4 text-lg font-semibold text-black dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-white px-6 py-20 dark:bg-black">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-black dark:text-white">
            Placify vs the competition
          </h2>
          <p className="mt-3 text-center text-zinc-500">See how we compare on what matters</p>
          <div className="mt-10 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                  <th className="px-6 py-4 font-medium text-zinc-500">Feature</th>
                  <th className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">Placify</th>
                  <th className="px-6 py-4 font-medium text-zinc-500">Playlist Push</th>
                  <th className="px-6 py-4 font-medium text-zinc-500">SubmitHub</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i < COMPARISON.length - 1 ? "border-b border-zinc-100 dark:border-zinc-900" : ""}>
                    <td className="px-6 py-4 font-medium text-black dark:text-white">{row.feature}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">{row.placify}</td>
                    <td className="px-6 py-4 text-zinc-500">{row.playlistPush}</td>
                    <td className="px-6 py-4 text-zinc-500">{row.submithub}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-black dark:text-white">
            For artists and curators
          </h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Artist side */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-xl font-semibold text-black dark:text-white">🎵 Artist</h3>
              <ol className="mt-6 space-y-5">
                {[
                  { t: "Paste your Spotify link", d: "We auto-detect genre and mood." },
                  { t: "See matching curators", d: "Browse by genre, price, followers." },
                  { t: "Submit with 1 credit", d: "Each pitch costs just 1 credit." },
                  { t: "Get a decision in 72h", d: "Accept, decline, or auto-refund." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{i + 1}</div>
                    <div>
                      <p className="font-medium text-black dark:text-white">{s.t}</p>
                      <p className="text-sm text-zinc-500">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {/* Curator side */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-xl font-semibold text-black dark:text-white">🎧 Curator</h3>
              <ol className="mt-6 space-y-5">
                {[
                  { t: "Join free — no credit card", d: "List your playlists in 2 minutes." },
                  { t: "Set your price", d: "Free, $0.50, $1, or $2 per pitch." },
                  { t: "Review within 72h", d: "Accept or decline with feedback." },
                  { t: "Get paid directly", d: "Artists pay you via PayPal, Stripe, etc." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{i + 1}</div>
                    <div>
                      <p className="font-medium text-black dark:text-white">{s.t}</p>
                      <p className="text-sm text-zinc-500">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-6 py-20 dark:bg-black">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
            Ready to get your music heard?
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Join 297 verified curators and start pitching from $5.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-emerald-600 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Get Started Free
            </Link>
            <Link
              href="/curators"
              className="rounded-full border border-zinc-300 px-8 py-3.5 text-base font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700"
            >
              Browse Curators
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-zinc-600">Sign in</Link>
          </p>
        </div>
      </section>
    </>
  );
}
