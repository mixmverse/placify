// src/app/api/credits/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const credits = await db.creditLedger.findMany({
    where: { userId: "demo-artist-id" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(credits);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { plan, priceCents } = body;

  // In production: create Stripe Checkout session
  // For scaffolding, return a mock session URL
  return NextResponse.json({
    url: `/dashboard/credits/checkout?plan=${plan}`,
    plan,
    priceCents,
  });
}
