// src/components/artist/StatusPill.tsx
export function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    ACCEPTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    DECLINED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    EXPIRED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${colors[status] ?? colors.PENDING}`}>
      {status}
    </span>
  );
}
