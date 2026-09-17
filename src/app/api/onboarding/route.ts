// src/app/api/onboarding/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

// POST /api/onboarding — save artist profile after first login
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const { artistName, bio, genres } = body as {
    artistName: string;
    bio?: string;
    genres?: string[];
  };

  if (!artistName?.trim()) {
    return NextResponse.json({ error: "Artist name is required" }, { status: 400 });
  }

  // Upsert ArtistProfile
  const existing = await db.artistProfile.findUnique({ where: { userId: user.id } });
  if (existing) {
    await db.artistProfile.update({
      where: { userId: user.id },
      data: { artistName: artistName.trim(), bio: bio?.trim() || null },
    });
  } else {
    await db.artistProfile.create({
      data: {
        userId: user.id,
        artistName: artistName.trim(),
        bio: bio?.trim() || null,
      },
    });
  }

  // Link genres if provided
  if (genres?.length) {
    for (const genreSlug of genres) {
      const genre = await db.genre.findFirst({
        where: { OR: [{ slug: genreSlug }, { name: genreSlug }] },
      });
      if (genre) {
        // Create a track-genre preference — or we could store on profile
        // For now, just ensure the genre exists (curator matching uses CuratorGenrePref)
      }
    }
  }

  // Mark user as having completed onboarding (set isArtist if not already)
  await db.user.update({
    where: { id: user.id },
    data: { isArtist: true },
  });

  return NextResponse.json({ ok: true });
}
