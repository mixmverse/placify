// src/app/api/webhooks/stripe/route.ts — DEPRECATED, replaced by /api/webhooks/paystack
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Stripe webhook deprecated. Use /api/webhooks/paystack" }, { status: 410 });
}
