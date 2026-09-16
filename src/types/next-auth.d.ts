import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isArtist: boolean;
      isCurator: boolean;
      country?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isArtist?: boolean;
    isCurator?: boolean;
    country?: string | null;
  }
}
