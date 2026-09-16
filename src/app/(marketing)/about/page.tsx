// src/app/(marketing)/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why Us | Placify — Affordable Spotify Playlist Pitching",
  description:
    "Independent musicians shouldn't have to choose between promoting their music and paying their rent. Learn why we built Placify.",
};

const COMPARISON = [
  { feature: "Cost per submission", pp: "from $0.20*", sub: "$1–$3", daily: "Free–$2.00", push: "Campaign-based" },
  { feature: "Monthly plan", pp: "from $5/mo", sub: "No flat rate", daily: "$19.99/mo", push: "No flat rate" },
  { feature: "Curator payout model", pp: "Revenue share", sub: "Per review (varies)", daily: "Premium split model", push: "Campaign compensation" },
  { feature: "Response policy", pp: "No response → credit refund", sub: "Premium: 48h target", daily: "Premium: 7-day feedback/refund", push: "No guarantee" },
  { feature: "Min. playlist followers", pp: "50+", sub: "1,000+", daily: "100+ (standard)", push: "1,000+" },
  { feature: "Curator verification", pp: "Required", sub: "Screened / varies", daily: "Standard + Premium tiers", push: "Application + review" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white px-6 py-20 dark:bg-black lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl dark:text-white">
            Artists and Curators
            <br />
            Deserve a Fair Deal
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            We built Placify because playlist pitching became too expensive for artists
            and too undervalued for curators. We strive for a fairer model.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-black dark:text-white">The Problem with Playlist Pitching Today</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            If you&apos;re an independent musician trying to get your music heard on Spotify, you already know
            how difficult the landscape is. Platforms like SubmitHub, DailyPlaylists, and Playlist Push were
            early pioneers — but over time, the economics shifted against the very artists these platforms
            were meant to serve.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-red-600 dark:text-red-400">For Artists</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Most platforms charge <strong>$1 to $3 per individual submission</strong>. Pitching to just
                20 curators can cost $20 to $60 per month — an unsustainable expense for independent
                musicians already investing in recording, mixing, mastering, and distribution.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-red-600 dark:text-red-400">For Curators</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Playlist curators — the people doing the real listening and maintenance — often receive
                only a fraction of what artists pay. On some platforms, curators earn as little as
                <strong> $0.50 for reviewing</strong> while the platform keeps the rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="bg-white px-6 py-16 dark:bg-black">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-black dark:text-white">Why We Built Placify</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Placify was born from a simple belief: <strong>independent musicians shouldn&apos;t have to
            choose between promoting their music and paying their rent.</strong> And curators who take
            the time to listen, review, and place great music should be rewarded for that effort.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="font-medium text-black dark:text-white">For Artists</h3>
              <p className="mt-1 text-sm text-zinc-500">Lower-cost pitching with transparent, predictable pricing.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="font-medium text-black dark:text-white">For Curators</h3>
              <p className="mt-1 text-sm text-zinc-500">Meaningful compensation for real listening and review work.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="font-medium text-black dark:text-white">For Both Sides</h3>
              <p className="mt-1 text-sm text-zinc-500">Quality standards like verification and response expectations help keep trust high.</p>
            </div>
          </div>
          <p className="mt-6 text-zinc-600 dark:text-zinc-400">
            Instead of charging per submission, we offer a simple, flat-rate plan:
            <strong> $5 per month for 25 submissions</strong> — that&apos;s $0.20 per pitch. Additional credits
            are as low as $0.30 each. We keep our margins lean because the value should flow to
            the people who make the ecosystem work.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-black dark:text-white">How We Compare</h2>
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
            *With Artist subscription (from $5/mo for 25 submissions = $0.20 each). Based on publicly available
            platform information; pricing and requirements can change.
          </p>
        </div>
      </section>
    </>
  );
}
