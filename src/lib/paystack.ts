// src/lib/paystack.ts
import crypto from "crypto";
import db from "./db";
import { grantCredits } from "./credits";
import { getCurrency, getPlanPrice } from "./currency";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

// ── Initialize a payment ──────────────────────────────────────
export async function initializePayment(
  email: string,
  plan: string,
  userId: string,
  countryCode: string | null,
) {
  const currency = getCurrency(countryCode);
  const price = getPlanPrice(plan, currency.code);
  const reference = `PLACIFY_${plan}_${userId.slice(0, 8)}_${Date.now()}`;

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: price.amount,  // in smallest currency unit (kobo/pesewas/cents/pence)
      currency: currency.code, // NGN, GHS, ZAR, KES, USD, GBP
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/artist/credits`,
      metadata: JSON.stringify({ userId, plan, credits: planToCredits(plan), currency: currency.code }),
    }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message ?? "Payment initialization failed");
  }

  return {
    authorizationUrl: data.data.authorization_url as string,
    accessCode: data.data.access_code as string,
    reference: data.data.reference as string,
    currency: currency.code,
    amount: price.amount,
    displayAmount: price.display,
  };
}

// ── Verify a transaction ──────────────────────────────────────
export async function verifyTransaction(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message ?? "Verification failed");
  }

  return data.data as {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer: { email: string };
    metadata: Record<string, unknown>;
  };
}

// ── Handle webhook ────────────────────────────────────────────
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(payload).digest("hex");
  return hash === signature;
}

export async function handlePaystackWebhook(event: {
  event: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
  };
}) {
  if (event.event === "charge.success" && event.data.status === "success") {
    const metadata = (event.data.metadata ?? {}) as Record<string, string>;
    const userId = metadata.userId;
    const plan = metadata.plan;

    if (userId && plan) {
      const credits = planToCredits(plan);
      const user = await db.user.findUnique({ where: { id: userId }, select: { creditBalance: true } });
      if (user) {
        await grantCredits(userId, credits, "PACK_PURCHASE", event.data.reference);
      }
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────
export function planToCredits(plan: string): number {
  switch (plan) {
    case "STARTER": return 25;
    case "PRO": return 75;
    case "LABEL": return 200;
    default: return 10;
  }
}
