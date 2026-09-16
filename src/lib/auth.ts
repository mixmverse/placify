// src/lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import db from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        if (typeof email !== "string" || !email.includes("@")) return null;

        // Find existing user or auto-register (local dev only)
        let user = await db.user.findUnique({ where: { email } });
        if (!user) {
          user = await db.user.create({
            data: {
              email,
              isArtist: true,
              isCurator: false,
              creditBalance: 10,
            },
          });
        }
        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { isArtist: true, isCurator: true, email: true },
        });
        if (dbUser) {
          token.id = dbUser.email;
          token.isArtist = dbUser.isArtist;
          token.isCurator = dbUser.isCurator;
          token.email = dbUser.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isArtist = token.isArtist as boolean;
        session.user.isCurator = token.isCurator as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
