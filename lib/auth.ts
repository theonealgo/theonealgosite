//lib/auth.ts
// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// ONLY Google login supported here (Firebase handles everything else)
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
    error: "/auth?error=1",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      session.user =
        (token as any).user || {
          id: token.sub!,
          name: token.name!,
          email: token.email!,
          image: token.picture!,
        };
      return session;
    },
  },
};
