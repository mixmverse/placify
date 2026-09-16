// src/app/api/user/stats/route.ts
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
    select: {
      id: true,
      creditBalance: true,
      isArtist: true,
      isCurator: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let activePitches = 0;
  let totalTracks = 0;

  if (user.isArtist) {
    activePitches = await db.submission.count({
      where: {
        artistUserId: user.id,
        status: { in: ["PENDING", "AWAITING_PAYMENT", "PAID"] },
      },
    });

    totalTracks = await db.track.count({
      where: { userId: user.id },
    });
  }

  return NextResponse.json({
    creditBalance: user.creditBalance,
    activePitches,
    totalTracks,
    isArtist: user.isArtist,
    isCurator: user.isCurator,
  });
}
