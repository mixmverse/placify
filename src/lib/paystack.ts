// src/lib/paystack.ts
import crypto from "crypto";
import db from "./db";
import { grantCredits } from "./credits";
import { PLANS } from "./currency";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

function getPlanCredits(plan: string): number {
  const found = PLANS.find((p) => p.key === plan);
  return found?.credits ?? 10;
}

function getPlanPriceUsd(plan: string): number {
  const found = PLANS.find((p) => p.key === plan);
  return found?.priceUsd ?? 5;
}

// ── Initialize a payment (always USD) ─────────────────────────
export async function initializePayment(
  email: string,
  plan: string,
  userId: string,
) {
  const priceUsd = getPlanPriceUsd(plan);
  const amountCents = priceUsd * 100; // Paystack uses cents for USD
  const reference = `PLACIFY_${plan}_${userId.slice(0, 8)}_${Date.now()}`;

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountCents,
      currency: "USD",
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/artist/credits`,
      metadata: JSON.stringify({
        userId,
        plan,
        credits: getPlanCredits(plan),
        currency: "USD",
      }),
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
    amountUsd: priceUsd,
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
      const credits = getPlanCredits(plan);
      const user = await db.user.findUnique({ where: { id: userId }, select: { creditBalance: true } });
      if (user) {
        await grantCredits(userId, credits, "PACK_PURCHASE", event.data.reference);
      }
    }
  }
}
