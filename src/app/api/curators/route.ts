// src/app/api/curators/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const _genre = searchParams.get("genre");
  const genres = searchParams.get("genres"); // comma-separated: "rock,pop"
  const _minFollowers = parseInt(searchParams.get("minFollowers") ?? "0");

  // If genres provided, find curators matching ANY of those genres
  if (genres) {
    const genreList = genres.split(",").map((g) => g.trim()).filter(Boolean);

    // Find genre IDs for the requested genres
    const genreRecords = await db.genre.findMany({
      where: { slug: { in: genreList } },
      select: { id: true, slug: true },
    });
    const genreIds = genreRecords.map((g) => g.id);

    if (genreIds.length === 0) {
      return NextResponse.json({ curators: [], genres: genreList, matched: [] });
    }

    // Find curators who have ANY of these genre preferences
    const curatorPrefs = await db.curatorGenrePref.findMany({
      where: { genreId: { in: genreIds } },
      select: { curatorUserId: true },
    });
    const curatorUserIds = [...new Set(curatorPrefs.map((p) => p.curatorUserId))];

    if (curatorUserIds.length === 0) {
      return NextResponse.json({ curators: [], genres: genreList, matched: [] });
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
            priceCents: true,
          },
        },
        curatorGenrePrefs: {
          select: {
            genre: { select: { slug: true, name: true } },
          },
        },
        playlists: {
          where: { status: "ACTIVE", isVerified: true },
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
      .filter((c) => c.curatorProfile)
      .map((c) => ({
        userId: c.id,
        ...c.curatorProfile,
        genres: c.curatorGenrePrefs.map((g) => g.genre.slug),
        playlists: c.playlists,
        onTimeRate: c.curatorProfile!.totalReviews > 0
          ? c.curatorProfile!.onTimeReviews / c.curatorProfile!.totalReviews
          : 0,
      }));

    return NextResponse.json({
      curators: result,
      genres: genreList,
      matched: genreRecords.map((g) => g.slug),
    });
  }

  // Fallback: all verified curators (same shape as genre-filtered path)
  const users = await db.user.findMany({
    where: { isCurator: true },
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
          priceCents: true,
        },
      },
      curatorGenrePrefs: {
        select: { genre: { select: { slug: true, name: true } } },
      },
      playlists: {
        where: { status: "ACTIVE", isVerified: true },
        select: { id: true, name: true, followerCount: true, spotifyPlaylistId: true },
      },
    },
    take: 500,
  });

  const result = users
    .filter((u) => u.curatorProfile)
    .map((u) => ({
      userId: u.id,
      ...u.curatorProfile,
      genres: u.curatorGenrePrefs.map((g) => g.genre.slug),
      playlists: u.playlists,
      onTimeRate: u.curatorProfile!.totalReviews > 0
        ? u.curatorProfile!.onTimeReviews / u.curatorProfile!.totalReviews
        : 0,
    }));

  return NextResponse.json({ curators: result });
}
