declare module "spotify-web-api-node" {
  class SpotifyApi {
    constructor(options?: { clientId?: string; clientSecret?: string; accessToken?: string });
    setAccessToken(token: string): void;
    clientCredentialsGrant(): Promise<{ body: { access_token: string; expires_in: number; token_type: string } }>;
    getTrack(id: string): Promise<{ body: { id: string; name: string; artists: Array<{ id: string; name: string }>; album: { images: Array<{ url: string }> }; duration_ms: number } }>;
    getArtist(id: string): Promise<{ body: { genres: string[] } }>;
    getPlaylist(playlistId: string): Promise<{ body: { name: string; followers: { total: number }; tracks: { items: Array<{ track: { id: string } | null }>; total: number } } }>;
    searchPlaylists(query: string, options?: { limit?: number; market?: string }): Promise<{ body: { playlists: { items: Array<{ name: string; id: string; followers: { total: number }; images: Array<{ url: string }>; owner: { display_name: string }; external_urls: { spotify: string }; description?: string; tracks?: { total: number } }> } } }>;
  }
  export { SpotifyApi };
  export default SpotifyApi;
}
