// src/components/shared/CreditsPill.tsx
"use client";
export function CreditsPill({ session }: { session: boolean }) {
  if (!session) return null;
  return (
    <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium dark:bg-zinc-800">
      <span>⚡</span>
      <span>63 credits</span>
    </div>
  );
}
