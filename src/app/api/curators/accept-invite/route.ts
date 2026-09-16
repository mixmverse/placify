// src/app/api/curators/accept-invite/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  // Find and validate token
  const record = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 400 });
  }

  // Find user by email
  const user = await db.user.findUnique({
    where: { email: record.identifier },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.passwordHash) {
    return NextResponse.json({ error: "Account already has a password" }, { status: 400 });
  }

  // Hash password and update user
  const passwordHash = await hash(password, 12);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Delete the token (one-time use)
  await db.verificationToken.delete({
    where: { token },
  });

  return NextResponse.json({ success: true });
}
