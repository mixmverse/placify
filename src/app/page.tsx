// src/app/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const TIERS = [
  { credits: 25, price: 5, curators: "~50", label: "Starter" },
  { credits: 75, price: 12, curators: "~150", label: "Pro" },
  { credits: 200, price: 25, curators: "~400", label: "Label" },
];

const WHY_US = [
  {
    icon: "⚡",
    title: "7-Day Response",
    desc: "Curators must respond within 7 days. Miss the deadline? Your credit is auto-refunded.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: "🎯",
    title: "Genre Matching",
    desc: "Paste your Spotify link. We detect your genre and show curators who play your kind of music.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: "💰",
    title: "Start at $5",
    desc: "Other platforms charge $280+. We start at $5. Curators keep 100% of their fee.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: "🛡️",
    title: "Artist Protection",
    desc: "Every pitch is protected. No response = automatic refund. Zero risk.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: "🌍",
    title: "Global Curators",
    desc: "297 verified curators across 172+ genres. We don't block countries like other platforms.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: "🎵",
    title: "Spotify Only",
    desc: "Paste a Spotify link. We handle the rest. No file uploads, no complicated setup.",
    color: "from-teal-500 to-emerald-600",
  },
];

const TESTIMONIALS = [
  { name: "Afro B.", role: "Artist, Lagos", text: "Got my track on 3 playlists in under a week. The genre matching is spot on." },
  { name: "DJ Mello", role: "Curator, 12K followers", text: "I keep 100% of my fee. Way better than other platforms where they take a cut." },
  { name: "Luna Ray", role: "Indie Artist, London", text: "Finally a platform that doesn't block African artists. Started at $5 and got real placements." },
];

function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold text-white sm:text-5xl">{count.toLocaleString()}+</div>
      <div className="mt-2 text-sm text-white/60">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const [tier, setTier] = useState(1);
  const selected = TIERS[tier];

  return (
    <>
      {/* Hero — gradient glow background */}
      <section className="relative overflow-hidden bg-black px-6 py-24 lg:py-36">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[128px]" />
          <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-violet-500/15 blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            297 verified curators • 172 genres • From $5
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Paste your track.
            <br />
            Pick curators.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Get placed.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60">
            The simplest way to get your music on Spotify playlists.
            We match your track to the right curators — you just click submit.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group relative rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-105"
            >
              Get Started — From $5
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/curators"
              className="rounded-full border border-white/20 px-8 py-4 text-base font-medium text-white/80 transition-all hover:border-white/40 hover:bg-white/5"
            >
              Browse 297 Curators
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar — animated counters */}
      <section className="border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 py-12 sm:grid-cols-4">
          <AnimatedCounter target={297} label="Verified Curators" />
          <AnimatedCounter target={193} label="Active Playlists" />
          <AnimatedCounter target={172} label="Genres Covered" />
          <AnimatedCounter target={5} label="Starting at $" />
        </div>
      </section>

      {/* 3-Step Flow — glass cards */}
      <section className="relative overflow-hidden bg-black px-6 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
            3 clicks. That&apos;s it.
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { num: "1", title: "Paste your Spotify link", desc: "We detect your genre, mood, and sound automatically.", gradient: "from-emerald-500 to-teal-500" },
              { num: "2", title: "Pick your curators", desc: "See matching curators with prices, follower counts, and response rates.", gradient: "from-violet-500 to-purple-500" },
              { num: "3", title: "Submit & relax", desc: "Curators review within 7 days. No response? Credit refunded.", gradient: "from-blue-500 to-cyan-500" },
            ].map((s) => (
              <div key={s.num} className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-xl font-bold text-white shadow-lg`}>
                  {s.num}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-3 text-sm text-white/50">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaign Calculator — glass card */}
      <section className="relative bg-black px-6 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How many curators can you reach?
          </h2>
          <p className="mt-3 text-white/50">Slide to pick your plan</p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <input
              type="range"
              min={0}
              max={TIERS.length - 1}
              value={tier}
              onChange={(e) => setTier(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-4xl font-bold text-white">${selected.price}</div>
                <div className="mt-1 text-sm text-white/40">per month</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{selected.credits}</div>
                <div className="mt-1 text-sm text-white/40">pitches</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">{selected.curators}</div>
                <div className="mt-1 text-sm text-white/40">curators reached</div>
              </div>
            </div>
            <p className="mt-6 text-sm text-white/40">
              ${(selected.price / selected.credits).toFixed(2)} per pitch — curators keep 100%
            </p>
            <Link
              href="/register"
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-105"
            >
              Start with {selected.label} — ${selected.price}
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us — gradient cards */}
      <section className="bg-black px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Why artists choose Placify
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${f.color} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} />
                <div className="relative">
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — social proof */}
      <section className="bg-black px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Loved by artists and curators
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex gap-1 text-amber-400">{"★★★★★"}</div>
                <p className="mt-4 text-sm text-white/70">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4">
                  <div className="font-medium text-white">{t.name}</div>
                  <div className="text-xs text-white/40">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — glass panels */}
      <section className="bg-black px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            For artists and curators
          </h2>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Artist side */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white">🎵 Artist</h3>
              <ol className="mt-6 space-y-5">
                {[
                  { t: "Paste your Spotify link", d: "We auto-detect genre and mood." },
                  { t: "See matching curators", d: "Browse by genre, price, followers." },
                  { t: "Submit with 1 credit", d: "Each pitch costs just 1 credit." },
                  { t: "Get a decision in 7 days", d: "Accept, decline, or auto-refund." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white">{i + 1}</div>
                    <div>
                      <p className="font-medium text-white">{s.t}</p>
                      <p className="text-sm text-white/40">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {/* Curator side */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white">🎧 Curator</h3>
              <ol className="mt-6 space-y-5">
                {[
                  { t: "Join free — no credit card", d: "List your playlists in 2 minutes." },
                  { t: "Set your price", d: "Free, $0.50, $1, or $2 per pitch." },
                  { t: "Review within 7 days", d: "Accept or decline with feedback." },
                  { t: "Get paid directly", d: "Artists pay you via PayPal, Stripe, etc." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-sm font-bold text-white">{i + 1}</div>
                    <div>
                      <p className="font-medium text-white">{s.t}</p>
                      <p className="text-sm text-white/40">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — big gradient */}
      <section className="relative overflow-hidden bg-black px-6 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to get your music heard?
          </h2>
          <p className="mt-6 text-lg text-white/60">
            Join 297 verified curators and start pitching from $5.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-105"
            >
              Get Started Free
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/curators"
              className="rounded-full border border-white/20 px-10 py-4 text-base font-medium text-white/80 transition-all hover:border-white/40 hover:bg-white/5"
            >
              Browse Curators
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/30">
            Already have an account?{" "}
            <Link href="/login" className="underline text-white/60 hover:text-white">Sign in</Link>
          </p>
        </div>
      </section>
    </>
  );
}
