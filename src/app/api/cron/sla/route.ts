// src/app/api/cron/sla/route.ts
import { NextResponse } from "next/server";
import { runSlaSweeper } from "@/lib/sla";
import { NextRequest } from "next/server";

// Protected by CRON_SECRET — verify in production
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runSlaSweeper();
  return NextResponse.json(result);
}
