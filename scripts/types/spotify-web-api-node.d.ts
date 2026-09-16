// scripts/types/spotify-web-api-node.d.ts
// Type declarations for spotify-web-api-node (no official @types package)

declare module "spotify-web-api-node" {
  export class SpotifyApi {
    constructor(options: SpotifyApiOptions);
    setAccessToken(token: string): void;
    clientCredentialsGrant(): Promise<{ body: { access_token: string } }>;
    searchPlaylists(query: string, options?: SearchOptions): Promise<{ body: { playlists: { items: PlaylistSimplified[] } } }>;
    getPlaylist(id: string): Promise<{ body: PlaylistDetails }>;
  }

  export interface SpotifyApiOptions {
    clientId: string;
    clientSecret: string;
    refreshToken?: string;
    prefix?: string;
  }

  export interface SearchOptions {
    limit?: number;
    offset?: number;
    market?: string;
  }

  export interface PlaylistSimplified {
    id: string;
    name: string;
    description: string | null;
    images: Array<{ url: string }> | null;
    followers: { total: number } | null;
    href: string;
    external_urls: { spotify: string };
    owner: { id: string; display_name: string | null; images: Array<{ url: string }> | null };
  }

  export interface PlaylistDetails {
    id: string;
    name: string;
    description: string | null;
    images: Array<{ url: string }> | null;
    followers: { total: number } | null;
    owner: { id: string; display_name: string | null; images: Array<{ url: string }> | null };
  }
}
