// src/app/dashboard/curator/settings/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

type Profile = {
  displayName: string;
  bio: string;
  priceCents: number;
  responseHours: number;
  paymentMethod: string;
  paymentInfo: string;
};

const PAYMENT_METHODS = [
  { value: "paypal", label: "PayPal", placeholder: "your-email@paypal.com" },
  { value: "stripe", label: "Stripe", placeholder: "https://stripe.me/your-link" },
  { value: "cashapp", label: "Cash App", placeholder: "$yourcashtag" },
  { value: "venmo", label: "Venmo", placeholder: "@yourvenmo" },
  { value: "bank", label: "Bank Transfer", placeholder: "Bank details or instructions" },
  { value: "other", label: "Other", placeholder: "How artists can pay you" },
];

export default function CuratorSettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    displayName: "",
    bio: "",
    priceCents: 0,
    responseHours: 72,
    paymentMethod: "paypal",
    paymentInfo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/curators/me");
      if (res.ok) {
        const data = await res.json();
        setProfile({
          displayName: data.displayName ?? "",
          bio: data.bio ?? "",
          priceCents: data.priceCents ?? 0,
          responseHours: data.responseHours ?? 72,
          paymentMethod: data.paymentMethod ?? "paypal",
          paymentInfo: data.paymentInfo ?? "",
        });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, [loadProfile]);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/curators/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setMessage("Saved!");
      } else {
        setMessage("Failed to save");
      }
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">Settings</h1>
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-black dark:text-white">Settings</h1>

      {/* Profile */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h2 className="text-lg font-semibold text-black dark:text-white">Profile</h2>
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Display Name</label>
          <input
            type="text"
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h2 className="text-lg font-semibold text-black dark:text-white">Pricing</h2>
        <p className="text-sm text-zinc-500">
          Set your price per pitch. Artists pay this directly to you when they submit.
          Set to 0 if you accept songs for free.
        </p>
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Price per pitch ($)</label>
          <input
            type="number"
            min="0"
            step="0.50"
            value={(profile.priceCents / 100).toFixed(2)}
            onChange={(e) => setProfile({ ...profile, priceCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Response time</label>
          <select
            value={profile.responseHours}
            onChange={(e) => setProfile({ ...profile, responseHours: Number(e.target.value) })}
            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          >
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
            <option value={72}>72 hours (default)</option>
          </select>
        </div>
      </div>

      {/* Payment Details */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h2 className="text-lg font-semibold text-black dark:text-white">How Artists Pay You</h2>
        <p className="text-sm text-zinc-500">
          Artists will pay you directly using the method below. This info is shown to artists after they submit.
          We do not take any cut from your earnings.
        </p>

        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Payment method</label>
          <select
            value={profile.paymentMethod}
            onChange={(e) => setProfile({ ...profile, paymentMethod: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Payment details
          </label>
          <input
            type="text"
            value={profile.paymentInfo}
            onChange={(e) => setProfile({ ...profile, paymentInfo: e.target.value })}
            placeholder={PAYMENT_METHODS.find((m) => m.value === profile.paymentMethod)?.placeholder ?? ""}
            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Your PayPal email, Stripe link, CashApp tag, or other payment info
          </p>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {message && (
          <span className={`text-sm ${message === "Saved!" ? "text-emerald-600" : "text-red-500"}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
