// src/app/api/submissions/route.ts
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { spendCredit } from "@/lib/credits";

export async function POST(request: Request) {
  const body = await request.json();
  const { trackId, playlistId, message } = body as {
    trackId: string;
    playlistId: string;
    message?: string;
  };

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playlist = await db.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist || playlist.status !== "ACTIVE") {
    return NextResponse.json({ error: "Playlist not available for pitches" }, { status: 400 });
  }

  const existing = await db.submission.findFirst({
    where: { trackId, playlistId, status: { in: ["PENDING", "AWAITING_PAYMENT", "PAID"] } },
  });
  if (existing) {
    return NextResponse.json({ error: "Pitch already pending for this playlist" }, { status: 400 });
  }

  const curator = await db.curatorProfile.findUnique({
    where: { userId: playlist.curatorUserId },
  });
  const responseHours = curator?.responseHours ?? 72;
  const hasFee = curator && curator.priceCents > 0;

  try {
    await spendCredit(session.user.id);
  } catch (e) {
    if (e instanceof Error && e.name === "InsufficientCreditsError") {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }
    throw e;
  }

  const submission = await db.submission.create({
    data: {
      trackId,
      playlistId,
      artistUserId: session.user.id,
      curatorUserId: playlist.curatorUserId,
      status: hasFee ? "AWAITING_PAYMENT" : "PENDING",
      message: message ?? null,
      deadlineAt: new Date(Date.now() + responseHours * 60 * 60 * 1000),
    },
  });

  await db.notification.create({
    data: {
      userId: playlist.curatorUserId,
      type: "SUBMISSION_RECEIVED",
      payload: JSON.stringify({ trackId, artistUserId: session.user.id, playlistId }),
    },
  });

  return NextResponse.json(submission);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await db.submission.findMany({
    where: {
      OR: [
        { artistUserId: session.user.id },
        { curatorUserId: session.user.id },
      ],
    },
    include: {
      track: { select: { title: true, artistName: true } },
      playlist: { select: { name: true } },
      curatorUser: {
        select: { curatorProfile: { select: { displayName: true, priceCents: true, paymentMethod: true, paymentInfo: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const formatted = submissions.map((s) => ({
    id: s.id,
    trackTitle: s.track.title,
    artistName: s.track.artistName,
    playlistName: s.playlist.name,
    curatorName: s.curatorUser.curatorProfile?.displayName ?? "Curator",
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    deadlineAt: s.deadlineAt.toISOString(),
    decidedAt: s.decidedAt?.toISOString() ?? null,
    feedbackText: s.feedbackText,
    curatorPrice: s.curatorUser.curatorProfile?.priceCents ?? 0,
    curatorPaymentMethod: s.curatorUser.curatorProfile?.paymentMethod ?? null,
    curatorPaymentInfo: s.curatorUser.curatorProfile?.paymentInfo ?? null,
  }));

  return NextResponse.json({ submissions: formatted });
}
