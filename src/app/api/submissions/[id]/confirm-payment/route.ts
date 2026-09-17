// src/app/api/submissions/[id]/confirm-payment/route.ts
// Artist confirms they've paid the curator directly
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: submissionId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      track: true,
      playlist: true,
      curatorUser: {
        select: {
          id: true,
          email: true,
          curatorProfile: { select: { displayName: true } },
        },
      },
      artistUser: { select: { id: true } },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  // Only the artist who submitted can confirm payment
  if (submission.artistUserId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Can only confirm AWAITING_PAYMENT submissions
  if (submission.status !== "AWAITING_PAYMENT") {
    return NextResponse.json({
      error: `Cannot confirm payment for a submission with status "${submission.status}"`,
    }, { status: 400 });
  }

  // Update status to PAID (curator can now review)
  await db.submission.update({
    where: { id: submissionId },
    data: { status: "PAID" },
  });

  // Notify the curator that payment is confirmed and they can review
  await db.notification.create({
    data: {
      userId: submission.curatorUserId,
      type: "PAYMENT_CONFIRMED",
      payload: JSON.stringify({
        submissionId: submission.id,
        trackTitle: submission.track.title,
        playlistName: submission.playlist.name,
        message: "The artist has confirmed payment. You can now review this pitch.",
      }),
    },
  });

  return NextResponse.json({
    ok: true,
    status: "PAID",
    message: "Payment confirmed. The curator will be notified to review your pitch.",
  });
}
