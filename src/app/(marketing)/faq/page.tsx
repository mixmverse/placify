// src/app/(marketing)/faq/page.tsx
"use client";
import Link from "next/link";
import { useState } from "react";

type Tab = "general" | "artists" | "curators";

const FAQ_DATA: Record<Tab, { q: string; a: string }[]> = {
  general: [
    { q: "How does Placify keep submissions fair and safe?", a: "We use playlist verification, response tracking, and refund protection to reduce abuse and improve trust. Curators are expected to respond on time, and artists are protected when response requirements are not met." },
    { q: "Can I be both an artist and curator?", a: "Yes. One account can support both roles, and you can switch between profiles when both are enabled. You cannot submit to your own playlists." },
    { q: "Can I switch roles later?", a: "Yes. You can add the second role later and switch between artist and curator views from the same account when both profiles are enabled." },
    { q: "Where can I track submission status and feedback?", a: "You can track submission status from your dashboard, including pending, reviewed, and outcome states. Any curator feedback appears directly on the submission record." },
    { q: "What genres are supported?", a: "Placify supports a wide range of genres and subgenres so artists can target better-fit curators. You can filter by genre during submission and curators can set genre preferences." },
    { q: "What happens if a curator doesn't respond?", a: "If a curator doesn't respond within 72 hours, your submission credit is automatically refunded and the curator doesn't get paid." },
    { q: "What if I need help with billing?", a: "You can contact support from the Help/Contact flow, and our team can assist with billing, account questions, and submission-related issues." },
  ],
  artists: [
    { q: "How do credits work?", a: "Each credit equals one pitch to one curator. Plans start at $5/month for 25 credits. Unused credits roll over up to 25% each month." },
    { q: "What does a pitch cost?", a: "With the Starter plan ($5/month for 25 credits), each pitch costs $0.20. Pro and Label plans bring the per-pitch cost even lower." },
    { q: "Can I pitch the same track to multiple curators?", a: "Yes. Each credit is one pitch to one curator. You can pitch one track to as many curators as you have credits for." },
    { q: "What happens if I run out of credits?", a: "You can purchase additional credits or upgrade your plan at any time. Extra credits are as low as $0.30 each." },
    { q: "What do I need to submit a track?", a: "A valid Spotify track link. We verify it against Spotify's API to ensure it's a real, playable track." },
    { q: "How fast will I hear back?", a: "Curators aim to respond within 72 hours. If they miss the deadline, your credit is automatically refunded." },
  ],
  curators: [
    { q: "Is it really free?", a: "Yes. No subscription, no credit card, ever. You can list unlimited playlists and earn from the monthly revenue pool." },
    { q: "How do I earn money?", a: "25% of artist subscription revenue goes into a curator earnings pool. Your share is determined by review activity and retention points. Settlements happen on the 1st of each month (UTC)." },
    { q: "What's the minimum payout?", a: "Monthly distributions below $5.00 roll forward into your pending balance until they cross that threshold, then release to your available balance." },
    { q: "What are the requirements?", a: "At least one playlist with 50+ real followers. No bots, no fake playlists. We verify playlist authenticity." },
    { q: "How many playlists can I list?", a: "Unlimited. As long as each meets the 50+ follower requirement." },
    { q: "What if I don't respond in time?", a: "If you miss the 72-hour window, the artist gets their credit back and you don't receive payment for that submission." },
  ],
};

const TABS: { key: Tab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "artists", label: "For Artists" },
  { key: "curators", label: "For Curators" },
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <section className="bg-white px-6 py-20 dark:bg-black lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-600">
            Back to Pricing
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-black sm:text-5xl dark:text-white">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Quick answers about pricing, submissions, payouts, and how Placify works for both
            artists and curators.
          </p>
        </div>
      </section>

      <section className="bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl">
          {/* Tabs */}
          <div className="flex gap-1 rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setOpenIndex(null); }}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          <div className="mt-8 space-y-3">
            {FAQ_DATA[activeTab].map((faq, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-black dark:text-white">{faq.q}</span>
                  <span className="ml-4 shrink-0 text-zinc-400">{openIndex === i ? "−" : "+"}</span>
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white px-6 py-16 dark:bg-black">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white">Still have questions?</h2>
          <p className="mt-2 text-zinc-500">Reach out anytime, or jump straight into the platform.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register?role=artist" className="rounded-full bg-black px-6 py-2.5 text-sm text-white dark:bg-white dark:text-black">
              Join as Artist
            </Link>
            <Link href="/register?role=curator" className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm dark:border-zinc-700">
              Join as Curator — Free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
