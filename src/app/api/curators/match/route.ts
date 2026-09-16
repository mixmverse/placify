// src/app/api/curators/match/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

// POST /api/curators/match — find curators matching track genres
export async function POST(request: Request) {
  const body = await request.json();
  const { genres, excludePlaylistIds } = body as { genres: string[]; excludePlaylistIds?: string[] };

  if (!genres || genres.length === 0) {
    return NextResponse.json({ curators: [], genres: [] });
  }

  // Find genre IDs for the requested genres
  const genreRecords = await db.genre.findMany({
    where: { slug: { in: genres } },
    select: { id: true, slug: true, name: true },
  });
  const genreIds = genreRecords.map((g) => g.id);

  if (genreIds.length === 0) {
    return NextResponse.json({ curators: [], genres, matchedSlugs: [] });
  }

  // Find curators who have ANY of these genre preferences
  const curatorPrefs = await db.curatorGenrePref.findMany({
    where: { genreId: { in: genreIds } },
    select: { curatorUserId: true },
  });
  const curatorUserIds = [...new Set(curatorPrefs.map((p) => p.curatorUserId))];

  if (curatorUserIds.length === 0) {
    return NextResponse.json({ curators: [], genres, matchedSlugs: genreRecords.map((g) => g.slug) });
  }

  // Get full curator profiles with playlists and genre prefs
  const curators = await db.user.findMany({
    where: {
      id: { in: curatorUserIds },
      isCurator: true,
    },
    select: {
      id: true,
      curatorProfile: {
        select: {
          displayName: true,
          bio: true,
          avatarUrl: true,
          verified: true,
          totalReviews: true,
          onTimeReviews: true,
          responseHours: true,
        },
      },
      curatorGenrePrefs: {
        select: {
          genre: { select: { slug: true, name: true } },
        },
      },
      playlists: {
        where: {
          status: "ACTIVE",
          isVerified: true,
          ...(excludePlaylistIds?.length ? { id: { notIn: excludePlaylistIds } } : {}),
        },
        select: {
          id: true,
          name: true,
          followerCount: true,
          spotifyPlaylistId: true,
        },
      },
    },
  });

  const result = curators
    .filter((c) => c.curatorProfile && c.playlists.length > 0)
    .map((c) => ({
      userId: c.id,
      displayName: c.curatorProfile!.displayName,
      bio: c.curatorProfile!.bio,
      avatarUrl: c.curatorProfile!.avatarUrl,
      verified: c.curatorProfile!.verified,
      totalReviews: c.curatorProfile!.totalReviews,
      onTimeRate: c.curatorProfile!.totalReviews > 0
        ? c.curatorProfile!.onTimeReviews / c.curatorProfile!.totalReviews
        : 0,
      responseHours: c.curatorProfile!.responseHours,
      genres: c.curatorGenrePrefs.map((g) => g.genre.slug),
      matchingGenres: c.curatorGenrePrefs
        .map((g) => g.genre.slug)
        .filter((slug) => genres.includes(slug)),
      playlists: c.playlists.map((p) => ({
        id: p.id,
        name: p.name,
        followerCount: p.followerCount,
      })),
    }));

  return NextResponse.json({
    curators: result,
    genres,
    matchedSlugs: genreRecords.map((g) => g.slug),
    totalCurators: result.length,
    totalPlaylists: result.reduce((sum, c) => sum + c.playlists.length, 0),
  });
}
