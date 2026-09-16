// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import { handleStripeWebhook } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.arrayBuffer();
  const payload = Buffer.from(body);
  const signature = request.headers.get("stripe-signature") ?? "";

  try {
    await handleStripeWebhook(payload, signature);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
