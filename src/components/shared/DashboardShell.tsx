// src/components/shared/DashboardShell.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ARTIST_LINKS = [
  { href: "/dashboard/artist", label: "Dashboard" },
  { href: "/dashboard/artist/pitch", label: "Pitch Music", primary: true },
  { href: "/dashboard/artist/tracks", label: "My Tracks" },
  { href: "/dashboard/artist/submissions", label: "Submissions" },
  { href: "/dashboard/artist/credits", label: "Credits" },
];

const CURATOR_LINKS = [
  { href: "/dashboard/curator", label: "Dashboard" },
  { href: "/dashboard/curator/playlists", label: "My Playlists" },
  { href: "/dashboard/curator/submissions", label: "Incoming" },
  { href: "/dashboard/curator/earnings", label: "Earnings" },
  { href: "/dashboard/curator/analytics", label: "Analytics" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCurator = pathname.startsWith("/dashboard/curator");
  const links = isCurator ? CURATOR_LINKS : ARTIST_LINKS;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:block">
        <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link href="/" className="text-lg font-bold text-black dark:text-white">Placify</Link>
          <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
            {isCurator ? "Curator" : "Artist"}
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-950">
            <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
              <Link href="/" className="text-lg font-bold text-black dark:text-white">Placify</Link>
            </div>
            <nav className="flex flex-col gap-1 p-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="mr-3 lg:hidden" aria-label="Open menu">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex-1" />
          <Link href="/" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">
            Back to site
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
