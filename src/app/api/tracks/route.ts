// src/app/api/tracks/route.ts
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { validateTrackLink } from "@/lib/spotify";
import { trackSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { spotifyTrackId } = trackSchema.parse(body);
  const trackData = await validateTrackLink(spotifyTrackId);

  const track = await db.track.create({
    data: {
      userId,
      spotifyTrackId,
      title: trackData.title,
      artistName: trackData.artistName,
      artworkUrl: trackData.artworkUrl,
      durationMs: trackData.durationMs,
    },
  });
  return NextResponse.json(track);
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tracks = await db.track.findMany({ where: { userId }, take: 50 });
  return NextResponse.json(tracks);
}
