// src/app/api/curators/invite/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  const { curatorUserId, submissionId: _submissionId } = await request.json();

  // Find the curator
  const user = await db.user.findUnique({
    where: { id: curatorUserId },
    include: { curatorProfile: true },
  });

  if (!user || !user.curatorProfile) {
    return NextResponse.json({ error: "Curator not found" }, { status: 404 });
  }

  // Only invite curators who haven't set up a password yet (PDF-imported)
  if (user.passwordHash) {
    return NextResponse.json({ message: "Curator already has an account", alreadyRegistered: true });
  }

  // Generate invitation token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store token (reuse VerificationToken model)
  await db.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      expires,
    },
  });

  // Build invitation link
  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/curator/accept-invite?token=${token}`;

  // Send email (using Resend if configured, otherwise log)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Placify <noreply@placify.com>",
        to: user.email,
        subject: "You've been invited to review music on Placify",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #111;">You've been invited to Placify</h2>
            <p>An artist wants to pitch their music to your playlist "<strong>${user.curatorProfile.displayName}</strong>".</p>
            <p>Placify connects artists with verified playlist curators. Review pitches, get paid for your time, and discover great music.</p>
            <div style="margin: 24px 0;">
              <a href="${inviteUrl}" style="background: #000; color: #fff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 500;">Accept Invitation</a>
            </div>
            <p style="color: #666; font-size: 14px;">This invitation expires in 7 days. If you didn't expect this email, you can ignore it.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Failed to send invitation email:", e);
      // Still return success — token is stored, user can manually visit the link
    }
  }

  return NextResponse.json({
    message: "Invitation sent",
    inviteUrl,
    email: user.email,
    name: user.curatorProfile.displayName,
  });
}
