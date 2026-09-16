// src/app/dashboard/curator/page.tsx

const curatorItems = [
  { id: "1", track: "Golden Hour", artist: "Demo Artist", genres: ["electronic"], deadline: new Date(Date.now() + 40 * 3600000).toISOString() },
  { id: "2", track: "Summer Rain", artist: "Demo Artist", genres: ["indie"], deadline: new Date(Date.now() + 20 * 3600000).toISOString() },
].map((s) => ({
  ...s,
  hoursLeft: Math.round((new Date(s.deadline).getTime() - Date.now()) / 3600000),
}));

export default function CuratorDashboard() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Review Queue</h1>
      <p className="text-zinc-500">Review incoming pitches before the 72h deadline.</p>
      <div className="space-y-4">
        {curatorItems.map((s) => (
          <div key={s.id} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{s.track}</p>
                <p className="text-sm text-zinc-500">by {s.artist}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {s.hoursLeft}h left
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-full bg-emerald-600 px-5 py-2 text-sm text-white">Accept</button>
              <button className="rounded-full bg-red-600 px-5 py-2 text-sm text-white">Decline</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
