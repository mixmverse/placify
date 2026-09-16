// src/app/api/curators/me/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

// GET /api/curators/me — get current curator's profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.curatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Not a curator" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

// PATCH /api/curators/me — update curator profile
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { displayName, bio, priceCents, responseHours, paymentMethod, paymentInfo } = body as {
    displayName?: string;
    bio?: string;
    priceCents?: number;
    responseHours?: number;
    paymentMethod?: string;
    paymentInfo?: string;
  };

  const profile = await db.curatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Not a curator" }, { status: 404 });
  }

  await db.curatorProfile.update({
    where: { userId: session.user.id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(priceCents !== undefined && { priceCents }),
      ...(responseHours !== undefined && { responseHours }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(paymentInfo !== undefined && { paymentInfo }),
    },
  });

  return NextResponse.json({ ok: true });
}
