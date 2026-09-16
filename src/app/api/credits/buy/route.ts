// src/app/api/credits/buy/route.ts
import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.json();
  const { plan, priceCents } = body;

  const { url } = await createCheckoutSession("demo-artist-id", priceCents, plan);
  return NextResponse.json({ url });
}
