// src/app/page.tsx
import Link from "next/link";

const STATS = [
  { value: "760+", label: "Verified Curators" },
  { value: "2,900+", label: "Active Playlists" },
  { value: "31,000+", label: "Playlist Placements" },
  { value: "8M+", label: "Spotify Reach" },
  { value: "250+", label: "Genres Covered" },
];

const FEATURES = [
  {
    title: "Submit Your Music",
    description: "Upload your track and pitch it directly to curators who match your genre and style.",
    icon: "🎵",
  },
  {
    title: "Connect with Curators",
    description: "Browse verified playlist curators actively looking for fresh music to feature.",
    icon: "🤝",
  },
  {
    title: "Grow Your Audience",
    description: "Pitch to matching curators and grow from real playlist adds.",
    icon: "📈",
  },
  {
    title: "Fast Responses",
    description: "Curators aim to respond within 72 hours. If they miss the window, that credit comes back.",
    icon: "⚡",
  },
  {
    title: "Verified Playlists",
    description: "Every curator must have at least 50 followers. No bots, no fake playlists.",
    icon: "✅",
  },
  {
    title: "Best Prices",
    description: "Plans from $5/month with 25 submissions included. Extra credits as low as $0.30 each.",
    icon: "💰",
  },
];

const STEPS = [
  {
    side: "Artist",
    steps: [
      { num: 1, title: "Choose matching curators", desc: "Filter by genre, size, and fit to target the right playlists." },
      { num: 2, title: "Send pitch + track submission", desc: "Every submission has status visibility and clear response expectations." },
      { num: 3, title: "Get a decision in 72 hours", desc: "Status stays visible and you get a note. If the curator misses the window, that credit comes back." },
    ],
  },
  {
    side: "Curator",
    steps: [
      { num: 1, title: "List your playlists", desc: "50+ followers, unlimited lists, always free." },
      { num: 2, title: "Review within 72 hours", desc: "Curators review submissions quickly with quality feedback expectations." },
      { num: 3, title: "Give feedback + decide fit", desc: "Provide thoughtful feedback and place tracks that match your playlist direction." },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white px-6 py-20 dark:bg-black lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl lg:text-6xl dark:text-white">
            Get Your Music on
            <br />
            the Right Playlists
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Connect with verified Spotify playlist curators who are actively looking for music
            like yours. Pitch smart, grow fast.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register?role=artist"
              className="rounded-full bg-black px-8 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              Join as Artist
            </Link>
            <Link
              href="/register?role=curator"
              className="rounded-full border border-zinc-300 px-8 py-3 text-base font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
            >
              Join as Curator — always free
            </Link>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            <Link href="/pricing" className="underline hover:text-zinc-600">See how it works</Link>
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-zinc-200 bg-zinc-50 px-6 py-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-black dark:text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-black dark:text-white">
            Why Artists Love Placify
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-600 dark:text-zinc-400">
            Pitch with confidence using clear pricing, verified curators, and transparent response expectations.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-4 text-lg font-semibold text-black dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white px-6 py-20 dark:bg-black">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-black dark:text-white">
            From Pitch to Playlist
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-zinc-600 dark:text-zinc-400">
            Artists pitch to verified curators, curators review within 72 hours, and both sides get clear value from every submission.
          </p>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {STEPS.map((side) => (
              <div key={side.side}>
                <h3 className="mb-6 text-xl font-semibold text-black dark:text-white">
                  {side.side} side
                </h3>
                <ol className="space-y-6">
                  {side.steps.map((step) => (
                    <li key={step.num} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white dark:bg-white dark:text-black">
                        {step.num}
                      </div>
                      <div>
                        <p className="font-medium text-black dark:text-white">{step.title}</p>
                        <p className="mt-1 text-sm text-zinc-500">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">The best value in playlist pitching. Period.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Artist plans */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-left dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-black dark:text-white">For Artists</h3>
              <p className="mt-1 text-sm text-zinc-500">from $5/month</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>25–200 submissions per month</li>
                <li>Access to all verified curators</li>
                <li>72-hour response guarantee</li>
                <li>Genre-based curator matching</li>
              </ul>
              <Link
                href="/register?role=artist"
                className="mt-6 inline-block rounded-full bg-black px-5 py-2.5 text-sm text-white dark:bg-white dark:text-black"
              >
                Start as Artist
              </Link>
            </div>
            {/* Curator */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-left dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-black dark:text-white">For Curators</h3>
              <p className="mt-1 text-sm text-zinc-500">FREE forever</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>No subscription, no credit card, ever</li>
                <li>Unlimited playlists, 50+ followers</li>
                <li>Get paid for reviewing</li>
                <li>Revenue share from monthly pool</li>
              </ul>
              <Link
                href="/register?role=curator"
                className="mt-6 inline-block rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium dark:border-zinc-700"
              >
                Join as Curator — Free
              </Link>
            </div>
          </div>
          <Link href="/pricing" className="mt-6 inline-block text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300">
            See full pricing details →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-6 py-20 dark:bg-black">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">
            Ready to join the Placify network?
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Artists get transparent submission flow, and curators get high-fit tracks with structured reviews. Built for both sides.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register?role=curator"
              className="rounded-full border border-zinc-300 px-8 py-3 text-base font-medium dark:border-zinc-700"
            >
              Join as Curator — always free
            </Link>
            <Link
              href="/register?role=artist"
              className="rounded-full bg-black px-8 py-3 text-base font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              Join as Artist
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-zinc-600">Sign In</Link>
          </p>
        </div>
      </section>
    </>
  );
}
