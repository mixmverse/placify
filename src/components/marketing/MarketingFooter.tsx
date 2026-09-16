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
              <svg viewBox="0 0 40 40" width="28" height="28">
                <defs>
                  <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399"/>
                    <stop offset="40%" stopColor="#10b981"/>
                    <stop offset="100%" stopColor="#059669"/>
                  </linearGradient>
                </defs>
                <path d="M20 4 C14.5 4 10 8.5 10 14 C10 21 20 31 20 31 C20 31 30 21 30 14 C30 8.5 25.5 4 20 4Z" fill="url(#fg)"/>
                <ellipse cx="16" cy="18.8" rx="2.2" ry="1.8" fill="white" transform="rotate(-15, 16, 18.8)"/>
                <rect x="17.8" y="10" width="0.6" height="9" rx="0.3" fill="white"/>
                <path d="M18.4 10 C18.4 10 21.5 9.2 21.5 11.2 C21.5 12.8 19.6 13.2 18.4 12.8" fill="white" opacity="0.9"/>
              </svg>
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
