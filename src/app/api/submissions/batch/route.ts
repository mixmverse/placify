// src/app/api/submissions/batch/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { spendCredit } from "@/lib/credits";
import crypto from "crypto";

// POST /api/submissions/batch
// Submits a track to multiple curators at once
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { spotifyTrackId, trackInfo, curatorUserIds } = body as {
    spotifyTrackId: string;
    trackInfo: { title: string; artistName: string; artworkUrl: string | null; durationMs: number; genres: string[] };
    curatorUserIds: string[];
  };

  if (!spotifyTrackId || !curatorUserIds?.length) {
    return NextResponse.json({ error: "spotifyTrackId and curatorUserIds required" }, { status: 400 });
  }

  const userId = session.user.id;

  // Check credit balance
  const user = await db.user.findUnique({ where: { id: userId }, select: { creditBalance: true } });
  if (!user || user.creditBalance < curatorUserIds.length) {
    return NextResponse.json({ error: "Not enough credits" }, { status: 400 });
  }

  // Find or create the track
  let track = await db.track.findUnique({
    where: { userId_spotifyTrackId: { userId, spotifyTrackId } },
  });

  if (!track) {
    track = await db.track.create({
      data: {
        userId,
        spotifyTrackId,
        title: trackInfo.title,
        artistName: trackInfo.artistName,
        artworkUrl: trackInfo.artworkUrl,
        durationMs: trackInfo.durationMs,
      },
    });

    // Link track genres
    for (const genreSlug of trackInfo.genres) {
      const genre = await db.genre.findUnique({ where: { slug: genreSlug } });
      if (genre) {
        await db.trackGenre.create({ data: { trackId: track.id, genreId: genre.id } }).catch(() => {});
      }
    }
  }

  // For each curator, find their active playlists and create submissions
  const submissions = [];
  let creditsUsed = 0;

  for (const curatorUserId of curatorUserIds) {
    // Find curator's verified active playlists and profile
    const playlists = await db.playlist.findMany({
      where: { curatorUserId, status: "ACTIVE", isVerified: true },
    });
    const curatorProfile = await db.curatorProfile.findUnique({
      where: { userId: curatorUserId },
    });

    for (const playlist of playlists) {
      // Check for existing active submission to this playlist
      const existing = await db.submission.findFirst({
        where: { trackId: track.id, playlistId: playlist.id, status: { in: ["PENDING", "AWAITING_PAYMENT", "PAID"] } },
      });
      if (existing) continue;

      // Spend one credit per submission
      try {
        await spendCredit(userId);
        creditsUsed++;
      } catch {
        return NextResponse.json({
          error: `Ran out of credits after ${creditsUsed} submissions`,
          submitted: submissions.length,
        }, { status: 400 });
      }

      // If curator charges a fee, start as AWAITING_PAYMENT; otherwise PENDING
      const hasFee = curatorProfile && curatorProfile.priceCents > 0;

      const submission = await db.submission.create({
        data: {
          trackId: track.id,
          playlistId: playlist.id,
          artistUserId: userId,
          curatorUserId,
          status: hasFee ? "AWAITING_PAYMENT" : "PENDING",
          message: null,
          deadlineAt: new Date(Date.now() + 168 * 60 * 60 * 1000),
        },
      });
      submissions.push({
        ...submission,
        curatorPrice: curatorProfile?.priceCents ?? 0,
        curatorPaymentMethod: curatorProfile?.paymentMethod ?? null,
        curatorPaymentInfo: curatorProfile?.paymentInfo ?? null,
        curatorName: curatorProfile?.displayName ?? null,
      });
    }
  }

  // Auto-invite curators who haven't signed up yet (PDF-imported, no password)
  const invitedCurators: string[] = [];
  for (const curatorUserId of curatorUserIds) {
    const curator = await db.user.findUnique({
      where: { id: curatorUserId },
      select: { email: true, passwordHash: true, curatorProfile: { select: { displayName: true } } },
    });

    if (curator && !curator.passwordHash && curator.curatorProfile) {
      // Check if invitation already sent
      const existingToken = await db.verificationToken.findFirst({
        where: { identifier: curator.email },
      });

      if (!existingToken) {
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.verificationToken.create({
          data: { identifier: curator.email, token, expires },
        });

        const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/curator/accept-invite?token=${token}`;

        // Send email if Resend is configured
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          try {
            const { Resend } = await import("resend");
            const resend = new Resend(resendKey);
            await resend.emails.send({
              from: "Placify <noreply@placify.com>",
              to: curator.email,
              subject: "You've been invited to review music on Placify",
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #111;">You've been invited to Placify</h2>
                  <p>An artist wants to pitch their music to your playlist "<strong>${curator.curatorProfile.displayName}</strong>".</p>
                  <p>Placify connects artists with verified playlist curators. Review pitches, get paid for your time, and discover great music.</p>
                  <div style="margin: 24px 0;">
                    <a href="${inviteUrl}" style="background: #000; color: #fff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 500;">Accept Invitation</a>
                  </div>
                  <p style="color: #666; font-size: 14px;">This invitation expires in 7 days. If you didn't expect this email, you can ignore it.</p>
                </div>
              `,
            });
            invitedCurators.push(curator.email);
          } catch (e) {
            console.error("Failed to send invitation email:", e);
          }
        }
      }
    }
  }

  return NextResponse.json({
    submitted: submissions.length,
    creditsUsed,
    trackId: track.id,
    invitedCurators,
  });
}
