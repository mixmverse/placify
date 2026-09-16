// src/app/api/credits/buy/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";

const PLANS = {
  STARTER: { name: "Starter", credits: 25, priceCents: 500 },
  PRO: { name: "Pro", credits: 75, priceCents: 1200 },
  LABEL: { name: "Label", credits: 200, priceCents: 2500 },
} as const;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { plan } = body;

  const planConfig = PLANS[plan as keyof typeof PLANS];
  if (!planConfig) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Look up user ID from email
  const db = (await import("@/lib/db")).default;
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { url } = await createCheckoutSession(user.id, planConfig.priceCents, plan);
  return NextResponse.json({ url });
}
