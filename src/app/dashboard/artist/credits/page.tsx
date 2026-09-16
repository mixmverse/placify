// src/app/dashboard/artist/credits/page.tsx
import { BuyCreditsButton } from "@/components/artist/BuyCreditsButton";

export default function CreditsPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Credits</h1>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">Balance</p>
            <p className="text-5xl font-bold">63 ⚡</p>
          </div>
          <BuyCreditsButton />
        </div>
        <div className="mt-4 text-sm text-zinc-500">
          <p>1 credit = 1 pitch. Unused credits roll over up to 25% per month.</p>
          <p className="mt-1">Plans: Starter $5/25 · Pro $12/75 · Label $25/200</p>
        </div>
      </div>
    </div>
  );
}
