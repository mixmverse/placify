// src/app/api/playlists/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPlaylist } from "@/lib/spotify";
import { playlistSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const { spotifyPlaylistId, name, description } = playlistSchema.parse(body);

  // Queue for verification: starts UNDER_REVIEW
  const playlist = await db.playlist.create({
    data: {
      curatorUserId: "demo-curator-id", // In production: session.user.id
      spotifyPlaylistId,
      name,
      description,
      status: "UNDER_REVIEW",
    },
  });

  // Trigger verification (async — update status to ACTIVE/REJECTED)
  verifyPlaylist(spotifyPlaylistId, playlist.curatorUserId).then(async (result) => {
    await db.playlist.update({
      where: { id: playlist.id },
      data: {
        status: result.status,
        isVerified: result.verified,
        followerCount: result.followerCount,
        verifiedAt: result.verified ? new Date() : null,
      },
    });
  });

  return NextResponse.json(playlist);
}
