// src/app/api/seed-batch3/route.ts
// One-time endpoint to seed batch 3 curators through Vercel (DB unreachable locally)
// DELETE THIS FILE AFTER SEEDING
import { NextResponse } from "next/server";
import db from "@/lib/db";

const CURATORS = [
  {
    name: "Brandon Wolf Hill",
    location: "United States",
    genres: ["Pop", "Hip-Hop", "Future House", "Indie", "Alternative", "Electronic"],
    followers: 117100,
    description: "Verified curator on LetsSubmit with 28 Spotify playlists and 117K+ total reach. 100% approval rate. Active daily.",
    spotifyUrl: "https://open.spotify.com/user/7EYYR9anlJRktScur5Jbsd",
    submissionPage: "https://letssubmit.com/curator/austin",
    priceCents: 200,
  },
  {
    name: "Grubby",
    location: "United Kingdom",
    genres: ["Hip-Hop", "Rap", "Rock", "Electronic", "DnB", "Dubstep"],
    followers: 43200,
    description: "UK-based curator with 18 playlists and 43K+ total reach. Full listen + detailed feedback. No AI music.",
    spotifyUrl: "https://open.spotify.com/user/verygrubby",
    submissionPage: "https://letssubmit.com/curator/grubby",
    priceCents: 100,
  },
  {
    name: "FEEL THE ENERGY",
    location: "Philippines",
    genres: ["Pop", "Dance", "R&B", "Afrobeat", "Rock", "Jazz", "Country", "Folk", "Alternative"],
    followers: 85500,
    description: "Philippines-based curator with 28 playlists and 85K+ total reach. 78.5% approval rate. Very active.",
    spotifyUrl: "https://open.spotify.com/user/izzu8zy433r3k05y4a3kgtowv",
    submissionPage: "https://letssubmit.com/curator/feel-the-energy",
    priceCents: 200,
  },
  {
    name: "Hot Monkey Music",
    location: "Argentina",
    genres: ["Pop", "Rock", "Indie", "Alternative"],
    followers: 118700,
    description: "Argentinian curator with 3 playlists and 118K+ total reach on LetsSubmit.",
    spotifyUrl: "",
    submissionPage: "https://letssubmit.com/curator/lucas-becco",
    priceCents: 400,
  },
  {
    name: "113th Street Music",
    location: "United Kingdom",
    genres: ["Hip-Hop", "Rap", "Trap", "R&B", "Soul"],
    followers: 53700,
    description: "UK-based curator with 12 playlists and 53K+ total reach on LetsSubmit.",
    spotifyUrl: "",
    submissionPage: "https://letssubmit.com/curator/113thstreetmusic",
    priceCents: 200,
  },
  {
    name: "BESTEMMING RECORDS",
    location: "Mexico",
    genres: ["Pop", "Hip-Hop", "Electronic", "Latin", "Reggaeton"],
    followers: 58700,
    description: "Mexican curator, influencer, and record label with 6 playlists and 58K+ reach.",
    spotifyUrl: "",
    submissionPage: "https://letssubmit.com/curator/bestemming-records",
    priceCents: 400,
  },
  {
    name: "New Peace Music",
    location: "Spain",
    genres: ["Electronic", "House", "Chill", "Ambient", "Downtempo"],
    followers: 29000,
    description: "Spanish curator, record label, and mixing/mastering engineer with 16 playlists and 29K reach.",
    spotifyUrl: "",
    submissionPage: "https://letssubmit.com/curator/new-peace-music",
    priceCents: 200,
  },
  {
    name: "vine media",
    location: "Nigeria",
    genres: ["Hip-Hop", "R&B", "Afrobeat", "Afro Pop"],
    followers: 15000,
    description: "Nigerian-focused curator on Heard. SH 35%, Medium activity. Features Tml Vibez, FOLA, Omah Lay, Seyi Vibez.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "unorthodox reviews",
    location: "",
    genres: ["Afrobeats", "Amapiano", "Afro Pop"],
    followers: 8000,
    description: "Curator on Heard focusing on Afrobeats, Amapiano, and Afro-Pop. SH 31%, Medium activity.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "Indie Idiots",
    location: "",
    genres: ["Rock", "Pop", "Indie Rock", "Indie"],
    followers: 13000,
    description: "High-quality indie curator on Heard. 13K playlist reach. High activity. Featured Aaron Taos, Showpony, Tyler Lindsay.",
    spotifyUrl: "https://open.spotify.com/user/31hilbrhfl6pkuhg7g4xeukvwevy",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "Unity Records",
    location: "",
    genres: ["Rock", "Alternative", "Pop", "Indie", "Electronic"],
    followers: 391000,
    description: "Major label curator on Heard. 391K playlist reach. Featured Joya Mooi, Monét Ngo, JONES.",
    spotifyUrl: "https://open.spotify.com/user/kjx8e5wj4vulaqas1hgvjujh7",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "Nine X",
    location: "",
    genres: ["Rock", "Pop", "Indie Rock", "Alternative"],
    followers: 15000,
    description: "Curator on Heard. 15K playlist reach. Featured The Killers, Nicky Youre, Ariana Grande, Macklemore.",
    spotifyUrl: "https://open.spotify.com/user/312jdtlwvhuzf2izvevenbx5ln6i",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "Sphere of Hip Hop",
    location: "",
    genres: ["Jazz", "Hip-Hop", "Lo-Fi", "Soul"],
    followers: 20000,
    description: "Curator on Heard. High activity, SH 13%. Jazz, Hip Hop, Lo-Fi, Soul.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "soundsdeli",
    location: "",
    genres: ["Electronic", "Soul", "Hip-Hop", "Folk", "World"],
    followers: 12000,
    description: "Curator on Heard. Featured Jungle, Khruangbin, Bad Bunny, berlioz. 151+ artists.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "purefiresounds",
    location: "",
    genres: ["Electronic", "Dance", "House", "Hip-Hop", "Reggaeton"],
    followers: 25000,
    description: "Curator on Heard. Featured Bad Bunny, Myke Towers, Daddy Yankee, Anuel AA. 191+ artists.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "groove galaxy",
    location: "",
    genres: ["Alternative", "Hip-Hop", "Trap", "Soul"],
    followers: 18000,
    description: "Curator on Heard. Featured Lil Uzi Vert, EARTHGANG, Smino, Lil Mosey.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "roadie music",
    location: "",
    genres: ["Rock", "Soul", "Hip-Hop", "Pop", "Alternative"],
    followers: 15000,
    description: "Curator on Heard. High activity, SH 38%. Rock, Soul, Hip Hop, Pop.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "roadie metal",
    location: "",
    genres: ["Rock", "Metal", "Hard Rock", "Punk"],
    followers: 10000,
    description: "Curator on Heard. High activity, SH 36%. Rock, Metal, Hard Rock, Punk.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "dj cosmin",
    location: "",
    genres: ["Electronic", "Rock", "Soul", "Pop", "Jazz"],
    followers: 30000,
    description: "Curator on Heard. Medium activity, 782+ artists featured.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "Cosmicleaf",
    location: "Greece",
    genres: ["Electronic", "Ambient", "Downtempo", "Chillhop", "Experimental"],
    followers: 12000,
    description: "Greek curator on Heard. High activity, SH 25%. Electronic, Ambient, Downtempo.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "rockrivermgmt",
    location: "",
    genres: ["Electronic", "Dance", "House", "Pop", "Hip-Hop"],
    followers: 35000,
    description: "Curator on Heard. Featured Drake, Mariah Carey, Noah Kahan, John Summit, Kygo. 218+ artists.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "pep garcia",
    location: "",
    genres: ["Electronic", "Dance", "House", "Pop", "Indie"],
    followers: 20000,
    description: "Curator on Heard. Featured horsegiirL, DJ Seinfeld, Modest Mouse, Olivia Rodrigo. 148+ artists.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "dunk vibes",
    location: "",
    genres: ["Electronic", "Dance", "House", "Hip-Hop", "Pop"],
    followers: 25000,
    description: "Curator on Heard. Featured Drake, Don Toliver, Pitbull. 246+ artists.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "cvsket pretty",
    location: "",
    genres: ["Hip-Hop", "Lo-Fi", "Downtempo", "Chillhop", "Experimental"],
    followers: 18000,
    description: "Curator on Heard. Featured Hamdi, Zingara, Tim Schaufert. 218+ artists.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "Christian Vibes",
    location: "United Kingdom",
    genres: ["Electronic", "Hip-Hop", "Pop", "Dance", "Rock"],
    followers: 15000,
    description: "UK curator on Heard. High activity. Electronic, Hip Hop, Pop, Dance, Rock.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "frequency state",
    location: "United Kingdom",
    genres: ["Electronic", "Experimental", "Ambient", "Minimal"],
    followers: 8000,
    description: "UK curator on Heard. High activity, SH 7%. Electronic, Experimental, Ambient.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "zone nights",
    location: "",
    genres: ["Electronic", "House", "Techno", "Deep House"],
    followers: 10000,
    description: "Curator on Heard. High activity, SH 65%. Electronic, House, Techno.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "zona emergente",
    location: "",
    genres: ["Rock", "Pop", "Alternative"],
    followers: 8000,
    description: "Curator on Heard. High activity, SH 53%. Rock and Pop.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "vinylhoops",
    location: "",
    genres: ["Rock", "Soul", "Hip-Hop", "Pop", "Jazz"],
    followers: 12000,
    description: "Curator on Heard. High activity, SH 30%.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "velveteen records",
    location: "",
    genres: ["Electronic", "House", "Country", "Indie", "Folk"],
    followers: 9000,
    description: "Curator on Heard. Medium activity, SH 46%. Electronic, House, Country.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "seven moons",
    location: "",
    genres: ["Alternative", "Pop", "R&B", "Indie", "Electronic"],
    followers: 10000,
    description: "Curator on Heard. High activity, SH 15%.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "r chy",
    location: "",
    genres: ["Electronic", "House", "Rock", "Techno", "Dance"],
    followers: 8000,
    description: "Curator on Heard. High activity, SH 26%.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "songpickr",
    location: "",
    genres: ["Rock", "Country", "Folk", "Indie"],
    followers: 10000,
    description: "Curator on Heard. High activity, SH 5%. Rock, Country, Folk. Americana specialist.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "ruslan yasynskyi",
    location: "",
    genres: ["Electronic", "House", "Techno", "Dance", "Deep House"],
    followers: 12000,
    description: "Curator on Heard. High activity, SH 20%. Electronic, House, Techno.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "plan arteria",
    location: "",
    genres: ["Rock", "Alternative", "Folk", "Indie", "Pop"],
    followers: 10000,
    description: "Curator on Heard. High activity, SH 7%. Rock, Alternative, Folk.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "rodmusic",
    location: "",
    genres: ["Electronic", "Pop", "Dance"],
    followers: 8000,
    description: "Curator on Heard. High activity, SH 2%. Electronic and Pop.",
    spotifyUrl: "",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "Florito",
    location: "",
    genres: ["Hip-Hop", "Downtempo", "Chillhop", "Jazz"],
    followers: 4700,
    description: "Curator on Heard. Medium activity, SH 25%, 4.7K reach.",
    spotifyUrl: "https://open.spotify.com/user/1142530492",
    submissionPage: "",
    priceCents: 0,
  },
  {
    name: "Going Solo",
    location: "",
    genres: ["Electronic", "Rock", "Pop", "Hip-Hop", "Indie"],
    followers: 5000,
    description: "Curator on Heard. High activity, SH 5%. Multi-genre.",
    spotifyUrl: "https://open.spotify.com/user/wearegoingsolo",
    submissionPage: "",
    priceCents: 0,
  },
];

function extractSpotifyId(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  if (match) return match[1];
  return null;
}

export async function GET() {
  try {
    let created = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    for (const c of CURATORS) {
      try {
        const email = `curator-${c.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}@mixmverse.com`;

        const user = await db.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            isCurator: true,
            creditBalance: 0,
          },
        });

        const existingProfile = await db.curatorProfile.findUnique({ where: { userId: user.id } });
        if (!existingProfile) {
          await db.curatorProfile.create({
            data: {
              userId: user.id,
              displayName: c.name,
              bio: c.description,
              priceCents: c.priceCents,
              verified: true,
              totalReviews: 0,
              onTimeReviews: 0,
              missedDeadlines: 0,
              retentionPoints: 0,
            },
          });
        } else {
          skipped++;
          continue;
        }

        if (c.spotifyUrl) {
          const spotifyId = extractSpotifyId(c.spotifyUrl);
          if (spotifyId) {
            const existing = await db.playlist.findUnique({ where: { spotifyPlaylistId: spotifyId } });
            if (!existing) {
              await db.playlist.create({
                data: {
                  curatorUserId: user.id,
                  spotifyPlaylistId: spotifyId,
                  name: c.name,
                  followerCount: c.followers,
                  isVerified: true,
                  status: "ACTIVE",
                },
              });
            }
          }
        }

        for (const genre of c.genres) {
          const dbGenre = await db.genre.findFirst({ where: { name: genre } });
          if (dbGenre) {
            await db.curatorGenrePref.upsert({
              where: {
                curatorUserId_genreId: {
                  curatorUserId: user.id,
                  genreId: dbGenre.id,
                },
              },
              update: {},
              create: {
                curatorUserId: user.id,
                genreId: dbGenre.id,
              },
            });
          }
        }

        created++;
      } catch (e) {
        errors++;
        errorDetails.push(`${c.name}: ${e instanceof Error ? e.message.slice(0, 80) : String(e).slice(0, 80)}`);
      }
    }

    const totalUsers = await db.user.count({ where: { isCurator: true } });
    const totalProfiles = await db.curatorProfile.count();
    const totalPlaylists = await db.playlist.count();
    const totalGenres = await db.genre.count();

    return NextResponse.json({
      ok: true,
      created,
      skipped,
      errors,
      errorDetails,
      totals: { users: totalUsers, profiles: totalProfiles, playlists: totalPlaylists, genres: totalGenres },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
