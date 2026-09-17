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
  } catch {
    // Return demo data instead of failing — the pitch page needs to proceed
    return NextResponse.json({
      track: {
        title: "Your Track",
        artistName: "Artist",
        artworkUrl: null,
        durationMs: 180000,
        genres: ["pop", "indie", "electronic"],
      },
      error: "Could not analyze track — using demo data. You can pick genres manually.",
    });
  }
}
