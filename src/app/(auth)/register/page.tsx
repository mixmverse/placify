// src/app/(auth)/register/page.tsx
"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const COUNTRIES = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "OTHER", name: "Other", flag: "🌍" },
];

function RegisterForm() {
  const params = useSearchParams();
  const roleParam = params.get("role") as "artist" | "curator" | null;
  const [role, setRole] = useState<"artist" | "curator" | null>(roleParam);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select a role first");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, country: country || null }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      await signIn("credentials", {
        email,
        password,
        callbackUrl: role === "curator" ? "/dashboard/curator" : "/dashboard/artist",
      });
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center px-6 py-12">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 text-xl font-bold tracking-tight text-white">
          <svg viewBox="0 0 40 40" width="28" height="28">
            <defs>
              <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399"/>
                <stop offset="40%" stopColor="#10b981"/>
                <stop offset="100%" stopColor="#059669"/>
              </linearGradient>
            </defs>
            <path d="M20 4 C14.5 4 10 8.5 10 14 C10 21 20 31 20 31 C20 31 30 21 30 14 C30 8.5 25.5 4 20 4Z" fill="url(#rg)"/>
            <ellipse cx="16" cy="18.8" rx="2.2" ry="1.8" fill="white" transform="rotate(-15, 16, 18.8)"/>
            <rect x="17.8" y="10" width="0.6" height="9" rx="0.3" fill="white"/>
            <path d="M18.4 10 C18.4 10 21.5 9.2 21.5 11.2 C21.5 12.8 19.6 13.2 18.4 12.8" fill="white" opacity="0.9"/>
          </svg>
          Placify
        </Link>

        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-t-2xl" />

          <h1 className="text-center text-2xl font-semibold text-white">Create your account</h1>
          <p className="mt-2 text-center text-sm text-white/40">
            {role === "curator"
              ? "Join as a curator — always free"
              : role === "artist"
                ? "Start pitching to verified curators"
                : "Choose how you want to join"}
          </p>

          {!role && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setRole("artist")}
                className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-xl">🎵</div>
                <div>
                  <p className="font-medium text-white">I&apos;m an Artist</p>
                  <p className="text-xs text-white/40">Pitch tracks to verified curators from $0.20/pitch</p>
                </div>
              </button>
              <button
                onClick={() => setRole("curator")}
                className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 text-xl">🎧</div>
                <div>
                  <p className="font-medium text-white">I&apos;m a Curator</p>
                  <p className="text-xs text-white/40">List playlists, review music, earn from the revenue pool — always free</p>
                </div>
              </button>
            </div>
          )}

          {role && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <span className="text-sm text-white/40">Joining as:</span>
                <span className="font-medium text-white">
                  {role === "artist" ? "🎵 Artist" : "🎧 Curator"}
                </span>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-white/60">Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-emerald-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="reg-country" className="block text-sm font-medium text-white/60">Country</label>
                  <select
                    id="reg-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  >
                    <option value="" className="bg-zinc-900 text-white/40">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-zinc-900 text-white">{c.flag} {c.name}</option>
                    ))}
                  </select>
                  {country && (
                    <p className="mt-1 text-xs text-white/30">
                      Prices will be shown in your local currency
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-white/60">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="mt-1.5 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-emerald-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="reg-confirm" className="block text-sm font-medium text-white/60">Confirm Password</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="mt-1.5 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-emerald-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-transparent px-3 text-white/20">or</span></div>
              </div>

              <button
                onClick={() => signIn("google", { callbackUrl: role === "curator" ? "/dashboard/curator" : "/dashboard/artist" })}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/60 transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white/80"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-white/30">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-white/15">
          Secure login powered by industry-standard encryption
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-full items-center justify-center bg-black text-white/30">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
