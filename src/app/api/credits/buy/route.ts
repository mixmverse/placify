// src/app/api/credits/buy/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initializePayment } from "@/lib/paystack";
import db from "@/lib/db";

const PLANS = ["STARTER", "PRO", "LABEL"] as const;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { plan } = body;

  if (!PLANS.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, country: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const { authorizationUrl, displayAmount } = await initializePayment(
      user.email,
      plan,
      user.id,
      user.country,
    );
    return NextResponse.json({ url: authorizationUrl, displayAmount });
  } catch {
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
