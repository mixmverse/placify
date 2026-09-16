// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, country } = body as {
      email?: string;
      password?: string;
      role?: string;
      country?: string;
    };

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (role !== "artist" && role !== "curator") {
      return NextResponse.json({ error: "Role must be artist or curator" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        isArtist: role === "artist",
        isCurator: role === "curator",
        creditBalance: 0,
        country: country || null,
      },
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, role },
    });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
