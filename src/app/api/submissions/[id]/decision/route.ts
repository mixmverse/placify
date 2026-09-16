// src/app/api/submissions/[id]/decision/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { decisionSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { outcome, feedbackText } = decisionSchema.parse(body);

  const submission = await db.submission.findUnique({
    where: { id },
    include: { playlist: true },
  });
  if (!submission || submission.status !== "PENDING") {
    return NextResponse.json({ error: "Submission not found or already decided" }, { status: 400 });
  }
  if (submission.decidedAt && submission.decidedAt < new Date()) {
    // Past deadline — curator can still decide but it affects on-time rate
  }

  const isAccepted = outcome === "ACCEPTED";

  await db.$transaction(async (tx) => {
    // Update submission
    await tx.submission.update({
      where: { id: id },
      data: {
        status: isAccepted ? "ACCEPTED" : "DECLINED",
        feedbackText,
        decidedAt: new Date(),
      },
    });

    // Update curator profile stats
    await tx.curatorProfile.update({
      where: { userId: submission.curatorUserId },
      data: {
        totalReviews: { increment: 1 },
        onTimeReviews: { increment: submission.decidedAt && submission.decidedAt <= submission.deadlineAt ? 1 : 0 },
      },
    });

    // Notify artist
    await tx.notification.create({
      data: {
        userId: submission.artistUserId,
        type: "SUBMISSION_DECIDED",
        payload: JSON.stringify({
          submissionId: id,
          outcome,
          feedback: feedbackText,
          playlistName: submission.playlist.name,
        }),
      },
    });

    // If accepted, schedule retention checks (day 7, day 30)
    if (isAccepted) {
      // In production: enqueue day-7/day-30 jobs via Vercel cron/Inngest
      // For now, we mark that retention checks are needed
    }
  });

  return NextResponse.json({ submissionId: id, outcome });
}
