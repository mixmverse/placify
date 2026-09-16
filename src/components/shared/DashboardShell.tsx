// src/components/shared/DashboardShell.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ARTIST_LINKS = [
  { href: "/dashboard/artist", label: "Dashboard", icon: "📊", primary: false },
  { href: "/dashboard/artist/pitch", label: "Pitch Music", icon: "🎯", primary: true },
  { href: "/dashboard/artist/tracks", label: "My Tracks", icon: "🎵", primary: false },
  { href: "/dashboard/artist/submissions", label: "Submissions", icon: "📬", primary: false },
  { href: "/dashboard/artist/credits", label: "Credits", icon: "⚡", primary: false },
];

const CURATOR_LINKS = [
  { href: "/dashboard/curator", label: "Dashboard", icon: "📊", primary: false },
  { href: "/dashboard/curator/playlists", label: "My Playlists", icon: "📋", primary: false },
  { href: "/dashboard/curator/submissions", label: "Incoming", icon: "📬", primary: false },
  { href: "/dashboard/curator/earnings", label: "Earnings", icon: "💰", primary: false },
  { href: "/dashboard/curator/analytics", label: "Analytics", icon: "📈", primary: false },
];

const LOGO_SVG = (
  <svg viewBox="0 0 40 40" width="24" height="24">
    <defs>
      <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399"/>
        <stop offset="40%" stopColor="#10b981"/>
        <stop offset="100%" stopColor="#059669"/>
      </linearGradient>
    </defs>
    <path d="M20 4 C14.5 4 10 8.5 10 14 C10 21 20 31 20 31 C20 31 30 21 30 14 C30 8.5 25.5 4 20 4Z" fill="url(#sg)"/>
    <ellipse cx="16" cy="18.8" rx="2.2" ry="1.8" fill="white" transform="rotate(-15, 16, 18.8)"/>
    <rect x="17.8" y="10" width="0.6" height="9" rx="0.3" fill="white"/>
    <path d="M18.4 10 C18.4 10 21.5 9.2 21.5 11.2 C21.5 12.8 19.6 13.2 18.4 12.8" fill="white" opacity="0.9"/>
  </svg>
);

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCurator = pathname.startsWith("/dashboard/curator");
  const links = isCurator ? CURATOR_LINKS : ARTIST_LINKS;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] bg-[#0a0a0c] lg:block">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-5">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-white">
            {LOGO_SVG}
            Placify
          </Link>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            {isCurator ? "Curator" : "Artist"}
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-500" />
                )}
                <span className="text-base">{link.icon}</span>
                {link.label}
                {link.primary && (
                  <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 border-r border-white/[0.06] bg-[#0a0a0c]">
            <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-5">
              <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-white" onClick={() => setMobileOpen(false)}>
                {LOGO_SVG}
                Placify
              </Link>
            </div>
            <nav className="flex flex-col gap-1 p-3">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center border-b border-white/[0.06] bg-[#0a0a0c]/80 px-4 backdrop-blur-xl lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="mr-3 text-white/40 lg:hidden" aria-label="Open menu">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex-1" />
          <Link href="/" className="flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white/70">
            ← Back to site
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
