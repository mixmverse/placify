// src/components/shared/Topbar.tsx
"use client";
import { CreditsPill } from "./CreditsPill";

export function Topbar({ session }: { session: boolean }) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <CreditsPill session={session} />
      <div className="text-sm text-zinc-500">Placify</div>
    </header>
  );
}
