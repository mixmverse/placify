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
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-black dark:text-white">
          Placify
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black"
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
          <span className={`h-0.5 w-5 bg-black transition-all dark:bg-white ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-5 bg-black transition-all dark:bg-white ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-5 bg-black transition-all dark:bg-white ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white px-6 pb-6 pt-4 dark:border-zinc-800 dark:bg-black">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-full border border-zinc-300 px-4 py-2 text-center text-sm dark:border-zinc-700">
              Sign In
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-full bg-black px-4 py-2 text-center text-sm text-white dark:bg-white dark:text-black">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
