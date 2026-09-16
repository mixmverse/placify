// src/app/curator/accept-invite/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function validateToken() {
      try {
        const res = await fetch(`/api/curators/validate-invite?token=${token}`);
        const data = await res.json();
        setEmail(data.email ?? "");
        setTokenValid(data.valid);
      } catch {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    }
    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/curators/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="text-center">
        <p className="text-zinc-500">Validating invitation...</p>
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Invalid Invitation</h1>
        <p className="mt-4 text-zinc-500">This invitation link is invalid or has expired.</p>
        <Link href="/login" className="mt-6 inline-block text-sm underline">Go to Login</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-emerald-600">Account Created!</h1>
        <p className="mt-4 text-zinc-500">Welcome to Placify. You can now log in to review pitches.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm text-white dark:bg-white dark:text-black"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-black dark:text-white">Set Up Your Account</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Welcome to Placify! Set up your password to start reviewing music pitches.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
            placeholder="Repeat your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-black px-5 py-2.5 text-sm text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <Suspense fallback={<div className="text-center text-zinc-500">Loading...</div>}>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </main>
  );
}
