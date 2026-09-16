// src/app/api/me/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "auth required" }, { status: 401 });
}
