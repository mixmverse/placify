// src/app/api/curators/validate-invite/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false });
  }

  const record = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.json({ valid: false });
  }

  // Find user by email (identifier)
  const user = await db.user.findUnique({
    where: { email: record.identifier },
    select: { email: true, passwordHash: true },
  });

  if (!user || user.passwordHash) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, email: user.email });
}
