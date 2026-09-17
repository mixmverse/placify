// src/app/api/submissions/[id]/accept/route.ts
// Token-based accept (GET from email) + session-based accept (POST from dashboard)
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";

// POST — logged-in curator accepts from dashboard
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
      artistUser: { select: { email: true, artistProfile: { select: { artistName: true } } } },
      curatorUser: { select: { email: true, curatorProfile: { select: { displayName: true } } } },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.curatorUserId !== session.user.id) {
    return NextResponse.json({ error: "Not your submission" }, { status: 403 });
  }

  if (submission.status === "ACCEPTED" || submission.status === "REJECTED") {
    return NextResponse.json({ error: `Already ${submission.status.toLowerCase()}` }, { status: 409 });
  }

  await db.submission.update({
    where: { id: submissionId },
    data: { status: "ACCEPTED", decidedAt: new Date() },
  });

  // Clean up any pitch tokens
  await db.verificationToken.deleteMany({
    where: { identifier: `pitch:${submissionId}` },
  });

  // Notify artist
  await db.notification.create({
    data: {
      userId: submission.artistUserId,
      type: "PITCH_ACCEPTED",
      payload: JSON.stringify({
        submissionId: submission.id,
        trackTitle: submission.track.title,
        curatorName: submission.curatorUser.curatorProfile?.displayName ?? "Curator",
        playlistName: submission.playlist.name,
      }),
    },
  });

  return NextResponse.json({ ok: true, status: "ACCEPTED" });
}

// GET — token-based accept from email link (no login required)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: token } = await params;
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get("sid");

  if (!submissionId) {
    return new Response(`
      <html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center;padding:24px">
        <h2>Invalid link</h2><p>This acceptance link is malformed. Please use the link from your email.</p>
      </body></html>
    `, { status: 400, headers: { "Content-Type": "text/html" } });
  }

  // Verify token
  const verification = await db.verificationToken.findFirst({
    where: {
      identifier: `pitch:${submissionId}`,
      token,
    },
  });

  if (!verification) {
    return new Response(`
      <html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center;padding:24px">
        <h2>Invalid or expired link</h2><p>This acceptance link is no longer valid. It may have already been used or expired.</p>
      </body></html>
    `, { status: 404, headers: { "Content-Type": "text/html" } });
  }

  // Check expiry
  if (verification.expires < new Date()) {
    return new Response(`
      <html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center;padding:24px">
        <h2>Link expired</h2><p>This acceptance link has expired. The pitch deadline has passed.</p>
      </body></html>
    `, { status: 410, headers: { "Content-Type": "text/html" } });
  }

  // Find submission
  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    include: {
      track: true,
      playlist: true,
      artistUser: { select: { email: true, artistProfile: { select: { artistName: true } } } },
      curatorUser: { select: { email: true, curatorProfile: { select: { displayName: true } } } },
    },
  });

  if (!submission) {
    return new Response(`
      <html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center;padding:24px">
        <h2>Submission not found</h2><p>This pitch no longer exists.</p>
      </body></html>
    `, { status: 404, headers: { "Content-Type": "text/html" } });
  }

  // Check if already decided
  if (submission.status === "ACCEPTED" || submission.status === "REJECTED") {
    return new Response(`
      <html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center;padding:24px">
        <h2>Already ${submission.status.toLowerCase()}</h2><p>You already ${submission.status === "ACCEPTED" ? "accepted" : "declined"} this pitch.</p>
      </body></html>
    `, { status: 409, headers: { "Content-Type": "text/html" } });
  }

  // Update submission status
  await db.submission.update({
    where: { id: submissionId },
    data: {
      status: "ACCEPTED",
      decidedAt: new Date(),
    },
  });

  // Delete the token (one-time use)
  await db.verificationToken.deleteMany({
    where: { identifier: `pitch:${submissionId}`, token },
  });

  // Notify the artist
  await db.notification.create({
    data: {
      userId: submission.artistUserId,
      type: "PITCH_ACCEPTED",
      payload: JSON.stringify({
        submissionId: submission.id,
        trackTitle: submission.track.title,
        curatorName: submission.curatorUser.curatorProfile?.displayName ?? "Curator",
        playlistName: submission.playlist.name,
      }),
    },
  });

  const artistName = submission.artistUser.artistProfile?.artistName ?? "The artist";

  return new Response(`
    <html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center;padding:24px">
      <div style="font-size:48px;margin-bottom:16px">✅</div>
      <h2>Pitch Accepted!</h2>
      <p style="color:#555;margin:16px 0">You accepted <strong>${submission.track.title}</strong> by <strong>${artistName}</strong> for your playlist <strong>${submission.playlist.name}</strong>.</p>
      <p style="color:#888;font-size:14px">The artist has been notified. Add the track to your playlist on Spotify when you're ready.</p>
      <div style="margin-top:24px">
        <a href="https://open.spotify.com/track/${submission.track.spotifyTrackId}" style="background:#1DB954;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:600">🎧 Listen on Spotify</a>
      </div>
      <div style="margin-top:24px;font-size:12px;color:#aaa">Powered by Placify</div>
    </body></html>
  `, { status: 200, headers: { "Content-Type": "text/html" } });
}
