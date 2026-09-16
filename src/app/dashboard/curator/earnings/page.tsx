// src/app/dashboard/curator/earnings/page.tsx

export default function EarningsPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Earnings</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Pending</p>
          <p className="text-4xl font-bold">$4.20</p>
          <p className="mt-1 text-sm text-amber-600">$0.80 to threshold ($5.00)</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Available</p>
          <p className="text-4xl font-bold">$12.50</p>
          <PayoutButton />
        </div>
      </div>
    </div>
  );
}

function PayoutButton() {
  return (
    <button className="mt-2 rounded-full bg-emerald-600 px-5 py-2 text-sm text-white">
      Withdraw
    </button>
  );
}
