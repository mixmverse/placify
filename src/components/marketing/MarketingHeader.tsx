// src/components/marketing/MarketingHeader.tsx
"use client";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/about", label: "Why Us" },
  { href: "/pricing", label: "Pricing" },
  { href: "/curators", label: "Curators" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <svg viewBox="0 0 40 40" width="32" height="32" className="drop-shadow-lg">
            <defs>
              <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399"/>
                <stop offset="40%" stopColor="#10b981"/>
                <stop offset="100%" stopColor="#059669"/>
              </linearGradient>
              <radialGradient id="hs" cx="35%" cy="30%" r="60%">
                <stop offset="0%" stopColor="white" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <ellipse cx="20" cy="36" rx="7" ry="1.5" fill="#059669" opacity="0.3"/>
            <path d="M20 4 C14.5 4 10 8.5 10 14 C10 21 20 31 20 31 C20 31 30 21 30 14 C30 8.5 25.5 4 20 4Z" fill="url(#hg)"/>
            <path d="M20 4 C14.5 4 10 8.5 10 14 C10 18 13 22 16.5 25.5 L20 4Z" fill="url(#hs)"/>
            <path d="M20 4 C25.5 4 30 8.5 30 14 C30 17.5 28.5 21 26.5 24 L25.5 24.8 C27.5 21.5 29 18 29 14 C29 8.8 25 4.5 20 4.5Z" fill="white" opacity="0.08"/>
            <ellipse cx="16" cy="18.8" rx="2.2" ry="1.8" fill="white" transform="rotate(-15, 16, 18.8)"/>
            <rect x="17.8" y="10" width="0.6" height="9" rx="0.3" fill="white"/>
            <path d="M18.4 10 C18.4 10 21.5 9.2 21.5 11.2 C21.5 12.8 19.6 13.2 18.4 12.8" fill="white" opacity="0.9"/>
          </svg>
          Placify
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-5 bg-white transition-all ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-5 bg-white transition-all ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-5 bg-white transition-all ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-black/95 px-6 pb-6 pt-4 backdrop-blur-xl">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-white/60 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-full border border-white/20 px-4 py-2 text-center text-sm text-white/80">
              Sign In
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-center text-sm font-semibold text-white">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
