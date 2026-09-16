import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock spotify-web-api-node — must use a class so `new SpotifyApi()` works
const mockGetTrack = vi.fn();
const mockGetArtist = vi.fn();
const mockGetPlaylist = vi.fn();
const mockGetPlaylistFollowers = vi.fn();
const mockSearchPlaylists = vi.fn();
const mockClientCredentialsGrant = vi.fn();
const mockSetAccessToken = vi.fn();

vi.mock("spotify-web-api-node", () => ({
  SpotifyApi: class MockSpotifyApi {
    constructor(_opts: unknown) {}
    getTrack = mockGetTrack;
    getArtist = mockGetArtist;
    getPlaylist = mockGetPlaylist;
    getPlaylistFollowers = mockGetPlaylistFollowers;
    searchPlaylists = mockSearchPlaylists;
    clientCredentialsGrant = mockClientCredentialsGrant;
    setAccessToken = mockSetAccessToken;
  },
}));

// Set credentials so hasSpotifyCreds() returns true
process.env.SPOTIFY_CLIENT_ID = "test-id";
process.env.SPOTIFY_CLIENT_SECRET = "test-secret";

import { validateTrackLink, verifyPlaylist, searchPlaylistsByGenre } from "../src/lib/spotify";

describe("spotify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientCredentialsGrant.mockResolvedValue({
      body: { access_token: "mock-token" },
    });
  });

  describe("validateTrackLink", () => {
    it("returns track data for a valid Spotify track ID", async () => {
      mockGetTrack.mockResolvedValue({
        body: {
          id: "track-123",
          name: "Test Song",
          artists: [{ id: "artist-1", name: "Test Artist" }],
          album: { images: [{ url: "https://example.com/cover.jpg" }] },
          duration_ms: 210000,
        },
      });
      mockGetArtist.mockResolvedValue({
        body: { id: "artist-1", genres: ["pop", "indie"] },
      });

      const result = await validateTrackLink("track-123");

      expect(result.title).toBe("Test Song");
      expect(result.artistName).toBe("Test Artist");
      expect(result.artworkUrl).toBe("https://example.com/cover.jpg");
      expect(result.durationMs).toBe(210000);
      expect(result.genres).toEqual(["pop", "indie"]);
    });

    it("throws on invalid track", async () => {
      mockGetTrack.mockRejectedValue(new Error("Not found"));

      await expect(validateTrackLink("bad-id")).rejects.toThrow("Invalid Spotify track link");
    });
  });

  describe("verifyPlaylist", () => {
    it("returns verified for playlists with 50+ followers", async () => {
      mockGetPlaylist.mockResolvedValue({
        body: { name: "Cool Playlist" },
      });
      mockGetPlaylistFollowers.mockResolvedValue({
        body: { followers: { total: 500 } },
      });

      const result = await verifyPlaylist("playlist-1", "curator-1");

      expect(result.name).toBe("Cool Playlist");
      expect(result.followerCount).toBe(500);
      expect(result.verified).toBe(true);
      expect(result.status).toBe("ACTIVE");
    });

    it("returns rejected for playlists with fewer than 50 followers", async () => {
      mockGetPlaylist.mockResolvedValue({
        body: { name: "Tiny Playlist" },
      });
      mockGetPlaylistFollowers.mockResolvedValue({
        body: { followers: { total: 10 } },
      });

      const result = await verifyPlaylist("playlist-2", "curator-2");

      expect(result.verified).toBe(false);
      expect(result.status).toBe("REJECTED");
    });
  });

  describe("searchPlaylistsByGenre", () => {
    it("returns mapped playlist results", async () => {
      mockSearchPlaylists.mockResolvedValue({
        body: {
          playlists: {
            items: [
              {
                id: "pl-1",
                name: "Indie Hits",
                description: "Best indie tracks",
                followers: { total: 1200 },
                owner: { display_name: "DJ Indie", id: "owner-1" },
                images: [{ url: "https://example.com/img.jpg" }],
              },
            ],
          },
        },
      });

      const result = await searchPlaylistsByGenre("indie", 10);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Indie Hits");
      expect(result[0].followers).toBe(1200);
      expect(result[0].ownerName).toBe("DJ Indie");
    });

    it("returns empty array on API error", async () => {
      mockSearchPlaylists.mockRejectedValue(new Error("API error"));

      const result = await searchPlaylistsByGenre("rock");

      expect(result).toEqual([]);
    });
  });
});
