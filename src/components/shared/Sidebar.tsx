// src/components/shared/Sidebar.tsx
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Sidebar({ session }: { session: boolean }) {
  const pathname = usePathname();
  const isCurator = pathname.includes("/curator");

  const artistLinks = [
    { href: "/dashboard/artist", label: "Dashboard" },
    { href: "/dashboard/artist/discover", label: "Discover Curators" },
    { href: "/dashboard/artist/tracks", label: "My Tracks" },
    { href: "/dashboard/artist/submissions", label: "Submissions" },
    { href: "/dashboard/artist/credits", label: "Credits" },
  ];

  const curatorLinks = [
    { href: "/dashboard/curator", label: "Review Queue" },
    { href: "/dashboard/curator/playlists", label: "My Playlists" },
    { href: "/dashboard/curator/earnings", label: "Earnings" },
    { href: "/dashboard/curator/analytics", label: "Analytics" },
    { href: "/dashboard/curator/settings", label: "Settings" },
  ];

  const links = isCurator ? curatorLinks : artistLinks;

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-8 text-xl font-bold">Placify</div>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm ${
              pathname === l.href
                ? "bg-zinc-100 font-medium dark:bg-zinc-800"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {!session && (
        <div className="mt-auto">
          <Link href="/login" className="rounded-full bg-black px-4 py-2 text-sm text-white">
            Sign In
          </Link>
        </div>
      )}
    </aside>
  );
}
