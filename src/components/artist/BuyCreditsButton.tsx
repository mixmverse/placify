// src/components/artist/BuyCreditsButton.tsx
"use client";
import { useRouter } from "next/navigation";

export function BuyCreditsButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/dashboard/artist/credits/checkout?plan=STARTER")}
      className="rounded-full bg-black px-5 py-2.5 text-sm text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black"
    >
      Buy Credits →
    </button>
  );
}
