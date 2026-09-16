// src/components/marketing/MarketingFooter.tsx
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-bold text-white">P</span>
              Placify
            </Link>
            <p className="mt-2 text-sm text-white/40">
              A platform where artists and curators connect through genuine music discovery.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-white/40 hover:text-white transition-colors">Why Us</Link></li>
              <li><Link href="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/curators" className="text-sm text-white/40 hover:text-white transition-colors">Curators</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm text-white/40 hover:text-white transition-colors">FAQ</Link></li>
              <li><a href="mailto:support@placify.com" className="text-sm text-white/40 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-white/40 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/30">
          &copy; {new Date().getFullYear()} Placify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
