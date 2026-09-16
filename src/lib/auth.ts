// src/lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : null;
        const password = typeof credentials?.password === "string" ? credentials.password : null;
        if (!email || !email.includes("@")) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        // If user has no password (Google-only account), reject
        if (!user.passwordHash || !password) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

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
          select: { isArtist: true, isCurator: true, email: true, country: true },
        });
        if (dbUser) {
          token.id = dbUser.email;
          token.isArtist = dbUser.isArtist;
          token.isCurator = dbUser.isCurator;
          token.email = dbUser.email;
          token.country = dbUser.country;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isArtist = token.isArtist as boolean;
        session.user.isCurator = token.isCurator as boolean;
        session.user.country = token.country as string | null;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For Google OAuth: auto-create user if they don't exist
      if (account?.provider === "google" && user?.email) {
        let dbUser = await db.user.findUnique({ where: { email: user.email } });
        if (!dbUser) {
          dbUser = await db.user.create({
            data: {
              email: user.email,
              isArtist: true,
              isCurator: false,
              creditBalance: 0,
            },
          });
        }
        user.id = dbUser.id;
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});
