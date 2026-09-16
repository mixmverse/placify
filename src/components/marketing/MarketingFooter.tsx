// src/components/marketing/MarketingFooter.tsx
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-lg font-bold tracking-tight text-black dark:text-white">
              Placify
            </Link>
            <p className="mt-2 text-sm text-zinc-500">
              A platform where artists and curators connect through genuine music discovery.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-black dark:text-white">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">Why Us</Link></li>
              <li><Link href="/pricing" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">Pricing</Link></li>
              <li><Link href="/curators" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">Curators</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-black dark:text-white">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">FAQ</Link></li>
              <li><a href="mailto:support@placify.com" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-black dark:text-white">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 text-center text-sm text-zinc-400 dark:border-zinc-800">
          &copy; {new Date().getFullYear()} Placify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
