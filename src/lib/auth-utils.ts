// src/lib/auth-utils.ts
import type { Session } from "next-auth";

export function isArtist(session: Session | null): boolean {
  return (session?.user as { isArtist?: boolean }).isArtist ?? false;
}

export function isCurator(session: Session | null): boolean {
  return (session?.user as { isCurator?: boolean }).isCurator ?? false;
}

export function requireArtist(session: Session | null) {
  if (!session || !isArtist(session)) throw new Error("Forbidden: artist only");
  return session.user;
}

export function requireCurator(session: Session | null) {
  if (!session || !isCurator(session)) throw new Error("Forbidden: curator only");
  return session.user;
}
