// src/app/dashboard/curator/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Reviews this month</p>
          <p className="text-4xl font-bold">14</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">On-time rate</p>
          <p className="text-4xl font-bold">93%</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Projected pool share</p>
          <p className="text-4xl font-bold">$8.30</p>
        </div>
      </div>
    </div>
  );
}
