// src/app/api/tracks/analyze/route.ts
import { NextResponse } from "next/server";
import { validateTrackLink } from "@/lib/spotify";

// GET /api/tracks/analyze?trackId=xxx
// Analyzes a Spotify track and returns its info + artist genres
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");

  if (!trackId) {
    return NextResponse.json({ error: "trackId is required" }, { status: 400 });
  }

  try {
    const track = await validateTrackLink(trackId);
    return NextResponse.json({ track });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not analyze track" },
      { status: 400 },
    );
  }
}
