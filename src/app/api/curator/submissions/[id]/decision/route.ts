// src/app/api/curator/submissions/[id]/decision/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { decision, feedback } = body;

  if (decision !== "ACCEPTED" && decision !== "DECLINED") {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, isCurator: true },
  });

  if (!user || !user.isCurator) {
    return NextResponse.json({ error: "Not a curator" }, { status: 403 });
  }

  // Verify the submission belongs to this curator
  const submission = await db.submission.findUnique({
    where: { id },
    select: { curatorUserId: true, status: true, artistUserId: true },
  });

  if (!submission || submission.curatorUserId !== user.id) {
    return NextResponse.json({ error: "Not your submission" }, { status: 404 });
  }

  if (submission.status !== "PENDING" && submission.status !== "PAID") {
    return NextResponse.json({ error: "Submission already decided" }, { status: 400 });
  }

  // Update submission
  await db.submission.update({
    where: { id },
    data: {
      status: decision,
      decidedAt: new Date(),
      feedbackText: feedback ?? null,
    },
  });

  // Update curator stats
  const now = new Date();
  const submissionData = await db.submission.findUnique({ where: { id }, select: { createdAt: true, deadlineAt: true } });
  const isOnTime = submissionData?.deadlineAt ? now <= new Date(submissionData.deadlineAt) : true;

  await db.curatorProfile.update({
    where: { userId: user.id },
    data: {
      totalReviews: { increment: 1 },
      onTimeReviews: isOnTime ? { increment: 1 } : undefined,
    },
  });

  // Create notification for artist
  await db.notification.create({
    data: {
      userId: submission.artistUserId,
      type: decision === "ACCEPTED" ? "SUBMISSION_ACCEPTED" : "SUBMISSION_DECLINED",
      payload: JSON.stringify({ submissionId: id, decision, feedback: feedback ?? "" }),
    },
  });

  return NextResponse.json({ success: true });
}
