// src/app/api/curator/stats/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, isCurator: true },
  });

  if (!user || !user.isCurator) {
    return NextResponse.json({ error: "Not a curator" }, { status: 403 });
  }

  // Pending pitches (waiting for review)
  const pendingSubmissions = await db.submission.findMany({
    where: {
      curatorUserId: user.id,
      status: { in: ["PENDING", "PAID"] },
    },
    include: { track: true },
    orderBy: { createdAt: "desc" },
  });

  // Stats
  const totalReviews = await db.submission.count({
    where: { curatorUserId: user.id, status: { in: ["ACCEPTED", "DECLINED"] } },
  });

  const onTimeReviews = await db.submission.count({
    where: {
      curatorUserId: user.id,
      status: { in: ["ACCEPTED", "DECLINED"] },
      decidedAt: { not: null },
    },
  });

  // Get profile for earnings data
  const profile = await db.curatorProfile.findUnique({
    where: { userId: user.id },
    select: { totalReviews: true, onTimeReviews: true, priceCents: true, missedDeadlines: true },
  });

  return NextResponse.json({
    pendingSubmissions: pendingSubmissions.map((s) => ({
      id: s.id,
      trackTitle: s.track?.title ?? "Unknown Track",
      artistEmail: s.artistUserId,
      hoursLeft: s.deadlineAt
        ? Math.max(0, Math.round((new Date(s.deadlineAt).getTime() - Date.now()) / 3600000))
        : null,
      createdAt: s.createdAt,
      status: s.status,
    })),
    stats: {
      totalReviews: profile?.totalReviews ?? totalReviews,
      onTimeReviews: profile?.onTimeReviews ?? onTimeReviews,
      onTimeRate: profile && profile.totalReviews > 0
        ? Math.round((profile.onTimeReviews / profile.totalReviews) * 100)
        : 0,
      missedDeadlines: profile?.missedDeadlines ?? 0,
      priceCents: profile?.priceCents ?? 0,
    },
  });
}
