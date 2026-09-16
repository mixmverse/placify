// src/lib/flutterwave.ts
import crypto from "crypto";
import db from "./db";
import { grantCredits } from "./credits";
import { PLANS } from "./currency";

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY ?? "";
const FLW_BASE = "https://api.flutterwave.com/v3";

function getPlanCredits(plan: string): number {
  return PLANS.find((p) => p.key === plan)?.credits ?? 10;
}

function getPlanPriceUsd(plan: string): number {
  return PLANS.find((p) => p.key === plan)?.priceUsd ?? 5;
}

// ── Initialize a payment ──────────────────────────────────────
export async function initializePayment(
  email: string,
  plan: string,
  userId: string,
) {
  const priceUsd = getPlanPriceUsd(plan);
  const amountCents = priceUsd * 100; // Flutterwave uses cents for USD
  const txRef = `PLACIFY_${plan}_${userId.slice(0, 8)}_${Date.now()}`;

  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount: priceUsd, // Flutterwave uses major units (dollars), not cents
      currency: "USD",
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/artist/credits`,
      customer: { email },
      meta: { userId, plan, credits: getPlanCredits(plan) },
      payment_options: "card,banktransfer,ussd", // card + bank transfer
    }),
  });

  const data = await res.json();
  if (data.status !== "success") {
    throw new Error(data.message ?? "Payment initialization failed");
  }

  return {
    checkoutUrl: data.data.link as string,
    txRef,
    amountUsd: priceUsd,
  };
}

// ── Verify a transaction ──────────────────────────────────────
export async function verifyTransaction(txRef: string) {
  const res = await fetch(`${FLW_BASE}/transactions/${txRef}/verify`, {
    headers: { Authorization: `Bearer ${FLW_SECRET}` },
  });

  const data = await res.json();
  if (data.status !== "success") {
    throw new Error(data.message ?? "Verification failed");
  }

  return data.data as {
    status: string; // "successful" | "failed" | "abandoned"
    tx_ref: string;
    amount: number;
    currency: string;
    customer: { email: string };
    meta: Record<string, unknown>;
  };
}

// ── Handle webhook ────────────────────────────────────────────
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  // Flutterwave uses HMAC SHA512 with your secret key
  const hash = crypto.createHmac("sha512", FLW_SECRET).update(payload).digest("hex");
  return hash === signature;
}

export async function handleFlutterwaveWebhook(event: {
  event: string;
  data: {
    status: string;
    tx_ref: string;
    amount: number;
    currency: string;
    meta?: Record<string, unknown>;
  };
}) {
  if (event.event === "charge.completed" && event.data.status === "successful") {
    const meta = (event.data.meta ?? {}) as Record<string, string>;
    const userId = meta.userId;
    const plan = meta.plan;

    if (userId && plan) {
      const credits = getPlanCredits(plan);
      const user = await db.user.findUnique({ where: { id: userId }, select: { creditBalance: true } });
      if (user) {
        await grantCredits(userId, credits, "PACK_PURCHASE", event.data.tx_ref);
      }
    }
  }
}
