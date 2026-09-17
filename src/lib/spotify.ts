// src/lib/spotify.ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SpotifyWebApi = require("spotify-web-api-node");

let spotify: ReturnType<typeof SpotifyWebApi> | null = null;

function getSpotifyClient(): ReturnType<typeof SpotifyWebApi> {
  if (!spotify) {
    spotify = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
    });
  }
  return spotify;
}

async function ensureToken(): Promise<void> {
  const hasCreds = process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET;
  if (!hasCreds) return;
  const client = getSpotifyClient();
  const { body } = await client.clientCredentialsGrant();
  client.setAccessToken(body.access_token);
}

export async function validateTrackLink(spotifyTrackId: string): Promise<{
  title: string;
  artistName: string;
  artworkUrl: string | null;
  durationMs: number;
  genres: string[];
}> {
  const hasCreds = process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET;
  if (!hasCreds) {
    return { title: "Demo Track", artistName: "Demo Artist", artworkUrl: null, durationMs: 180000, genres: ["pop", "indie"] };
  }

  try {
    await ensureToken();
    const client = getSpotifyClient();
    const { body: track } = await client.getTrack(spotifyTrackId);
    if (!track || !track.id) throw new Error("Track not found");

    // Get artist genres via the first artist
    let genres: string[] = [];
    if (track.artists[0]?.id) {
      const { body: artist } = await client.getArtist(track.artists[0].id);
      genres = artist.genres ?? [];
    }

    return {
      title: track.name,
      artistName: track.artists[0].name,
      artworkUrl: track.album?.images?.[0]?.url ?? null,
      durationMs: track.duration_ms,
      genres,
    };
  } catch {
    throw new Error("Invalid Spotify track link");
  }
}

export async function getTrackGenres(spotifyTrackId: string): Promise<string[]> {
  const hasCreds = process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET;
  if (!hasCreds) return ["pop", "indie", "alternative"];

  try {
    await ensureToken();
    const client = getSpotifyClient();
    const { body: track } = await client.getTrack(spotifyTrackId);
    if (track.artists[0]?.id) {
      const { body: artist } = await client.getArtist(track.artists[0].id);
      return artist.genres ?? [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function verifyPlaylist(
  spotifyPlaylistId: string,
  _curatorUserId: string,
): Promise<{
  name: string;
  followerCount: number;
  verified: boolean;
  status: "ACTIVE" | "REJECTED";
}> {
  const hasCreds = process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET;
  if (!hasCreds) {
    return { name: "Demo Playlist", followerCount: 120, verified: true, status: "ACTIVE" };
  }

  try {
    await ensureToken();
    const client = getSpotifyClient();
    const { body: playlist } = await client.getPlaylist(spotifyPlaylistId);
    const followerCount = playlist.followers.total;

    if (followerCount >= 50) {
      return { name: playlist.name, followerCount, verified: true, status: "ACTIVE" };
    }
    return { name: playlist.name, followerCount, verified: false, status: "REJECTED" };
  } catch {
    throw new Error("Could not verify playlist");
  }
}

export async function checkPlaylistRetention(spotifyPlaylistId: string, trackId: string): Promise<boolean> {
  const hasCreds = process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET;
  if (!hasCreds) return true;

  try {
    await ensureToken();
    const client = getSpotifyClient();
    const { body } = await client.getPlaylist(spotifyPlaylistId);
    return body.tracks.items.some((item: { track?: { id?: string } }) => item.track?.id === trackId);
  } catch {
    return false;
  }
}

export async function searchPlaylistsByGenre(genre: string, limit: number = 10): Promise<
  Array<{ id: string; name: string; followers: number; url: string; ownerName: string }>
> {
  const hasCreds = process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET;
  if (!hasCreds) {
    // Demo mode: return mock playlists
    return [
      { id: "demo1", name: `${genre} Vibes`, followers: 500, url: "https://open.spotify.com/playlist/demo1", ownerName: "Demo Curator" },
      { id: "demo2", name: `${genre} Central`, followers: 1200, url: "https://open.spotify.com/playlist/demo2", ownerName: "Demo Curator 2" },
    ];
  }

  try {
    await ensureToken();
    const client = getSpotifyClient();
    const { body } = await client.searchPlaylists(genre, { limit });
    return (body.playlists?.items ?? []).map((p: { id: string; name: string; followers?: { total?: number }; external_urls?: { spotify?: string }; owner?: { display_name?: string } }) => ({
      id: p.id,
      name: p.name,
      followers: p.followers?.total ?? 0,
      url: p.external_urls?.spotify ?? `https://open.spotify.com/playlist/${p.id}`,
      ownerName: p.owner?.display_name ?? "Unknown",
    }));
  } catch {
    return [];
  }
}
