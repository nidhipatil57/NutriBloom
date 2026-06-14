import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } });
        if (!user?.password) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!existing) {
          const newUser = await prisma.user.create({
            data: { email: user.email!, name: user.name, image: user.image },
          });
          await prisma.goal.create({ data: { userId: newUser.id } });
          await prisma.userPreference.create({ data: { userId: newUser.id } });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (dbUser) token.userId = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) (session.user as any).id = token.userId;
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET!,
  trustHost: true,
});
