// src/app/(marketing)/pricing/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Placify — Affordable Spotify Playlist Pitching from $5/month",
  description:
    "Simple, transparent pricing for artists from $5/month and always-free access for curators. See how we compare to SubmitHub, DailyPlaylists, and Playlist Push.",
};

const TIERS = [
  { name: "Starter", price: "$5", credits: 25, perPitch: "$0.20", popular: false },
  { name: "Pro", price: "$12", credits: 75, perPitch: "$0.16", popular: true },
  { name: "Label", price: "$25", credits: 200, perPitch: "$0.125", popular: false },
];

const CURATOR_FEATURES = [
  "Always free to join",
  "Paid for reviewing",
  "Unlimited playlist listings (50+ followers)",
  "Set your genres and response pace",
];

const ARTIST_FEATURES = [
  "25–200 submissions per month",
  "Access to all verified curators",
  "72-hour response guarantee",
  "Track submission status",
  "Curator feedback on every submission",
  "Genre-based curator matching",
];

const COMPARISON = [
  { feature: "Cost per submission", pp: "from $0.20*", sub: "$1–$3", daily: "Free–$2.00", push: "Campaign-based" },
  { feature: "Monthly plan", pp: "from $5/mo", sub: "No flat rate", daily: "$19.99/mo", push: "No flat rate" },
  { feature: "Response policy", pp: "No response → credit refund", sub: "Premium: 48h target", daily: "7-day feedback/refund", push: "No guarantee" },
  { feature: "Min. playlist followers", pp: "50+", sub: "1,000+", daily: "100+", push: "1,000+" },
  { feature: "Curator verification", pp: "Required", sub: "Screened / varies", daily: "Standard + Premium", push: "Application + review" },
];

const FAQS = [
  {
    q: "How do artist credits work?",
    a: "Plans start at $5/month and include monthly submission credits. Each credit equals one curator submission. Unused credits roll over up to 25% each month.",
  },
  {
    q: "How do curator payments work?",
    a: "Each month, 25% of artist subscription revenue goes into a curator earnings pool. Review activity and retention points determine your share. Settlements run on the 1st of each month (UTC). Monthly distributions below $5.00 roll forward until they cross that threshold.",
  },
  {
    q: "What happens if a curator doesn't respond?",
    a: "If a curator doesn't respond within 72 hours, your submission credit is automatically refunded and the curator doesn't get paid.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white px-6 py-20 dark:bg-black lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Curator network open · Curators always join free
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-black sm:text-5xl dark:text-white">
            Affordable for artists.
            <br />
            Rewarding for curators.
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Simple, transparent pricing for artists and always-free access for curators
            with built-in earning potential.
          </p>
        </div>
      </section>

      {/* Artist Plans */}
      <section className="bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-black dark:text-white">Artist Plans</h2>
            <p className="mt-1 text-sm text-zinc-500">For musicians &amp; producers · from $5/month</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-6 ${
                  tier.popular
                    ? "border-black bg-white shadow-lg dark:border-white dark:bg-zinc-900"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
                    Popular
                  </span>
                )}
                <p className="text-sm font-medium text-zinc-500">{tier.name}</p>
                <p className="mt-2 text-4xl font-bold text-black dark:text-white">
                  {tier.price}
                  <span className="text-base font-normal text-zinc-400">/mo</span>
                </p>
                <p className="mt-1 text-sm text-zinc-500">{tier.credits} credits · {tier.perPitch}/pitch</p>
                <Link
                  href="/register?role=artist"
                  className={`mt-6 block rounded-full py-2.5 text-center text-sm font-medium transition-colors ${
                    tier.popular
                      ? "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
                      : "border border-zinc-300 text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">
              One credit equals one pitch to one curator. Pitch one track to more than one curator
              if you want. Cancel anytime. Extra credits as low as $0.30.
            </p>
          </div>

          {/* Artist features list */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-black dark:text-white">All artist plans include</h3>
            <ul className="mt-4 space-y-2">
              {ARTIST_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="mt-0.5 text-emerald-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Curator Plan */}
      <section className="bg-white px-6 py-16 dark:bg-black">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-black dark:text-white">Curator Plan</h2>
            <p className="mt-1 text-sm text-zinc-500">For playlist curators · FREE forever</p>
            <p className="mt-2 text-sm text-zinc-500">No subscription, no credit card, ever.</p>
            <ul className="mt-6 space-y-2">
              {CURATOR_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="mt-0.5 text-emerald-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=curator"
              className="mt-6 inline-block rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium dark:border-zinc-700"
            >
              Join as Curator — Always Free
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-black dark:text-white">How we compare</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-3 pr-4 font-medium text-zinc-500">Feature</th>
                  <th className="py-3 pr-4 font-semibold text-black dark:text-white">Placify</th>
                  <th className="py-3 pr-4 text-zinc-500">SubmitHub</th>
                  <th className="py-3 pr-4 text-zinc-500">DailyPlaylists</th>
                  <th className="py-3 text-zinc-500">Playlist Push</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-3 pr-4 font-medium text-zinc-700 dark:text-zinc-300">{row.feature}</td>
                    <td className="py-3 pr-4 font-medium text-black dark:text-white">{row.pp}</td>
                    <td className="py-3 pr-4 text-zinc-500">{row.sub}</td>
                    <td className="py-3 pr-4 text-zinc-500">{row.daily}</td>
                    <td className="py-3 text-zinc-500">{row.push}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            *Based on publicly available platform information as of March 2026; pricing and requirements can change.
          </p>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="bg-white px-6 py-16 dark:bg-black">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-black dark:text-white">Pricing FAQs</h2>
          <div className="mt-6 space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-medium text-black dark:text-white">{faq.q}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white">Ready to join?</h2>
          <p className="mt-2 text-zinc-500">Choose your side: affordable submissions for artists and always-free access for curators.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register?role=artist" className="rounded-full bg-black px-6 py-2.5 text-sm text-white dark:bg-white dark:text-black">
              Join as Artist
            </Link>
            <Link href="/register?role=curator" className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm dark:border-zinc-700">
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
