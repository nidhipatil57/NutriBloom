import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Handle Demo User auto-creation/login
        if (credentials.email === "demo@nutribloom.com" && credentials.password === "demopassword") {
          let user = await prisma.user.findUnique({ where: { email: "demo@nutribloom.com" } });
          if (!user) {
            try {
              const hashedPassword = await bcrypt.hash("demopassword", 12);
              user = await prisma.user.create({
                data: {
                  name: "Demo User",
                  email: "demo@nutribloom.com",
                  password: hashedPassword,
                },
              });
              // Initialize default Goals
              await prisma.goal.create({
                data: {
                  userId: user.id,
                  calorieTarget: 2000,
                  proteinTarget: 150,
                  carbTarget: 250,
                  fatTarget: 65,
                  dietType: "balanced",
                  waterTargetMl: 2500,
                },
              });
              // Initialize default Preferences
              await prisma.userPreference.create({
                data: {
                  userId: user.id,
                  cuisines: "[]",
                  allergies: "[]",
                  dislikedIngredients: "[]",
                  maxPrepTime: 60,
                },
              });
            } catch (dbErr) {
              console.error("Failed to auto-create demo user in DB:", dbErr);
              // Fallback to mock object even if DB write fails (e.g. read-only SQLite on Vercel)
              return {
                id: "demo-user-id",
                name: "Demo User",
                email: "demo@nutribloom.com",
                image: null,
              };
            }
          }
          return { id: user.id, name: user.name, email: user.email, image: user.image };
        }

        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } });
        if (!user?.password) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Use user.id directly if defined (e.g. fallback mock user), or find in DB
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (dbUser) {
          token.userId = dbUser.id;
        } else if (user.id) {
          token.userId = user.id;
        }
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

