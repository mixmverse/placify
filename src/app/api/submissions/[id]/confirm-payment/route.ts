// src/app/api/submissions/[id]/confirm-payment/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

// POST /api/submissions/[id]/confirm-payment
// Artist confirms they have paid the curator directly
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const submission = await db.submission.findUnique({
    where: { id },
    include: { curatorUser: { include: { curatorProfile: true } } },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.artistUserId !== session.user.id) {
    return NextResponse.json({ error: "Not your submission" }, { status: 403 });
  }

  if (submission.status !== "AWAITING_PAYMENT") {
    return NextResponse.json({ error: "Submission is not awaiting payment" }, { status: 400 });
  }

  // Update status to PAID — curator can now review
  await db.submission.update({
    where: { id },
    data: { status: "PAID" },
  });

  // Create notification for curator
  await db.notification.create({
    data: {
      userId: submission.curatorUserId,
      type: "NEW_PITCH_PAID",
      payload: JSON.stringify({
        submissionId: submission.id,
        artistUserId: submission.artistUserId,
        trackId: submission.trackId,
        message: "Payment confirmed — review this pitch now",
      }),
    },
  });

  // Send email to curator if Resend configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && submission.curatorUser.email) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Placify <noreply@placify.com>",
        to: submission.curatorUser.email,
        subject: "Payment confirmed — New pitch to review",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #111;">Payment confirmed</h2>
            <p>An artist has paid for a pitch to your playlist.</p>
            <p>Log in to review the song and accept or decline.</p>
            <div style="margin: 24px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/curator" style="background: #000; color: #fff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 500;">Review Pitch</a>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.error("Failed to send payment confirmation email:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
