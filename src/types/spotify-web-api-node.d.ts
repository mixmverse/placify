// spotify-web-api-node augmented types (the package's types are incomplete)
import "spotify-web-api-node";

declare module "spotify-web-api-node" {
  interface SpotifyApi {
    getTrack(id: string): Promise<{ body: SpotifyApi.SingleTrackResponse }>;
    getArtist(id: string): Promise<{ body: SpotifyApi.ArtistObjectFull }>;
    getPlaylistTracks(
      playlistId: string,
      options?: { limit?: number; offset?: number },
    ): Promise<{ body: SpotifyApi.PlaylistTrackResponse }>;
    getPlaylist(
      playlistId: string,
      options?: { fields?: string },
    ): Promise<{ body: SpotifyApi.Playlist & { followers: { total: number } } }>;
    getPlaylistFollowers(
      playlistId: string,
    ): Promise<{ body: { followers: { total: number } } }>;
    searchPlaylists(
      query: string,
      options?: { limit?: number },
    ): Promise<{ body: SpotifyApi.SearchResult }>;
  }
}
