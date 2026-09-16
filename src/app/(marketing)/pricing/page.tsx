// src/app/(marketing)/pricing/page.tsx
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
          Affordable pitching, meaningful payouts.
        </h1>
        <p className="text-lg text-zinc-500">
          Pay once per pitch. Curators keep 100% of their fee. No hidden charges.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Starter", price: "₦500", credits: 25, perPitch: "₦20", popular: false },
            { name: "Pro", price: "₦1,200", credits: 75, perPitch: "₦16", popular: true },
            { name: "Label", price: "₦2,500", credits: 200, perPitch: "₦12.50", popular: false },
          ].map((tier) => (
            <div key={tier.name} className={`rounded-2xl border p-6 ${tier.popular ? "border-black bg-zinc-100 dark:border-white dark:bg-zinc-800" : "border-zinc-200 bg-white dark:bg-zinc-950"}`}>
              {tier.popular && <span className="rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black">Popular</span>}
              <p className="mt-4 text-4xl font-bold">{tier.price}</p>
              <p className="text-sm text-zinc-500">{tier.credits} credits</p>
              <p className="mt-2 text-sm text-zinc-400">{tier.perPitch}/pitch</p>
              <Link href="/register" className="mt-4 block rounded-full bg-black px-5 py-2.5 text-sm text-white dark:bg-white dark:text-black">
                Get Started
              </Link>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="font-medium">Curators: always free</p>
          <p className="mt-2 text-sm text-zinc-500">No card required. Artists pay you directly for every accepted pitch. You keep 100%.</p>
        </div>
      </div>
    </main>
  );
}
