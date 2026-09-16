// src/app/api/webhooks/flutterwave/route.ts
import { NextResponse } from "next/server";
import { verifyWebhookSignature, handleFlutterwaveWebhook } from "@/lib/flutterwave";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("verif-hash") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);
    await handleFlutterwaveWebhook(event);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
