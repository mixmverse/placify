// src/app/api/webhooks/paystack/route.ts
import { NextResponse } from "next/server";
import { verifyWebhookSignature, handlePaystackWebhook } from "@/lib/paystack";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);
    await handlePaystackWebhook(event);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
