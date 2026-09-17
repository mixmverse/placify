// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/notifications?unread=true
// Returns notification count (or full list)
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";

  if (unreadOnly) {
    const unreadCount = await db.notification.count({
      where: { userId: session.user.id, readAt: null },
    });
    return NextResponse.json({ unreadCount });
  }

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notifications });
}

// PATCH /api/notifications — Mark all as read
export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
