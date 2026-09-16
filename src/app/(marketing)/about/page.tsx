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
      <section className="relative overflow-hidden bg-black px-6 py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Artists and Curators
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Deserve a Fair Deal</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            We built Placify because playlist pitching became too expensive for artists
            and too undervalued for curators. We strive for a fairer model.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="bg-black px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-white">The Problem with Playlist Pitching Today</h2>
          <p className="mt-4 text-white/60">
            If you&apos;re an independent musician trying to get your music heard on Spotify, you already know
            how difficult the landscape is. Platforms like SubmitHub, DailyPlaylists, and Playlist Push were
            early pioneers — but over time, the economics shifted against the very artists these platforms
            were meant to serve.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-red-400">For Artists</h3>
              <p className="mt-2 text-sm text-white/60">
                Most platforms charge <strong className="text-white/80">$1 to $3 per individual submission</strong>. Pitching to just
                20 curators can cost $20 to $60 per month — an unsustainable expense for independent
                musicians already investing in recording, mixing, mastering, and distribution.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-red-400">For Curators</h3>
              <p className="mt-2 text-sm text-white/60">
                Playlist curators — the people doing the real listening and maintenance — often receive
                only a fraction of what artists pay. On some platforms, curators earn as little as
                <strong className="text-white/80"> $0.50 for reviewing</strong> while the platform keeps the rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="bg-black px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-white">Why We Built Placify</h2>
          <p className="mt-4 text-white/60">
            Placify was born from a simple belief: <strong className="text-white/80">independent musicians shouldn&apos;t have to
            choose between promoting their music and paying their rent.</strong> And curators who take
            the time to listen, review, and place great music should be rewarded for that effort.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: "For Artists", desc: "Lower-cost pitching with transparent, predictable pricing.", gradient: "from-emerald-500 to-teal-500" },
              { title: "For Curators", desc: "Meaningful compensation for real listening and review work.", gradient: "from-violet-500 to-purple-500" },
              { title: "For Both Sides", desc: "Quality standards like verification and response expectations help keep trust high.", gradient: "from-blue-500 to-cyan-500" },
            ].map((b) => (
              <div key={b.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${b.gradient}`} />
                <h3 className="mt-3 font-medium text-white">{b.title}</h3>
                <p className="mt-1 text-sm text-white/50">{b.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-white/60">
            Instead of charging per submission, we offer a simple, flat-rate plan:
            <strong className="text-white/80"> $5 per month for 25 submissions</strong> — that&apos;s $0.20 per pitch. Additional credits
            are as low as $0.30 each. We keep our margins lean because the value should flow to
            the people who make the ecosystem work.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-black px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-white">How We Compare</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4 font-medium text-white/50">Feature</th>
                  <th className="py-3 pr-4 font-semibold text-emerald-400">Placify</th>
                  <th className="py-3 pr-4 text-white/50">SubmitHub</th>
                  <th className="py-3 pr-4 text-white/50">DailyPlaylists</th>
                  <th className="py-3 text-white/50">Playlist Push</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-medium text-white/80">{row.feature}</td>
                    <td className="py-3 pr-4 font-medium text-white">{row.pp}</td>
                    <td className="py-3 pr-4 text-white/40">{row.sub}</td>
                    <td className="py-3 pr-4 text-white/40">{row.daily}</td>
                    <td className="py-3 text-white/40">{row.push}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-white/30">
            *With Artist subscription (from $5/mo for 25 submissions = $0.20 each). Based on publicly available
            platform information; pricing and requirements can change.
          </p>
        </div>
      </section>
    </>
  );
}
