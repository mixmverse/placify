// src/app/(marketing)/pricing/page.tsx
import Link from "next/link";

export default function PricingPage() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-20 lg:py-28">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-sm text-emerald-400">
          💳 Simple, transparent pricing
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Affordable pitching, meaningful{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            payouts.
          </span>
        </h1>

        <p className="max-w-lg text-lg text-white/50">
          Pay once per pitch. Curators keep 100% of their fee. No hidden charges.
        </p>

        {/* Pricing cards */}
        <div className="grid w-full gap-6 md:grid-cols-3">
          {[
            { name: "Starter", price: "$5", credits: 25, perPitch: "$0.20", popular: false, icon: "🎤" },
            { name: "Pro", price: "$12", credits: 75, perPitch: "$0.16", popular: true, icon: "🔥" },
            { name: "Label", price: "$25", credits: 200, perPitch: "$0.125", popular: false, icon: "🏷️" },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 transition-all ${
                tier.popular
                  ? "border border-emerald-500/30 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10 scale-105"
                  : "border border-white/5 bg-white/[0.02] hover:border-white/15"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-500/25">
                  Most Popular
                </div>
              )}
              <div className="text-3xl">{tier.icon}</div>
              <p className="mt-4 text-4xl font-bold text-white">{tier.price}</p>
              <p className="mt-1 text-sm text-white/40">{tier.credits} credits</p>
              <p className="mt-1 text-xs text-emerald-400/60">{tier.perPitch}/pitch</p>
              <Link
                href="/register"
                className={`mt-6 block rounded-full py-2.5 text-sm font-medium transition-all ${
                  tier.popular
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                    : "border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* Curators note */}
        <div className="w-full rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
          <p className="font-medium text-white">🎧 Curators: always free</p>
          <p className="mt-2 text-sm text-white/40">
            No card required. Artists pay you directly for every accepted pitch. You keep 100%.
          </p>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/20">
          <span className="flex items-center gap-1.5">🛡️ 7-day Artist Protection</span>
          <span className="flex items-center gap-1.5">⚡ Auto-refund guarantee</span>
          <span className="flex items-center gap-1.5">🌍 Global curators</span>
        </div>
      </div>
    </section>
  );
}
