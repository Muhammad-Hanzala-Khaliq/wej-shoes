import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./lib/db";
import { loginSchema } from "./validators/auth.validators";
import { checkRateLimit, incrementAttempts, resetAttempts } from "./lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        // Rate limit check (belt-and-suspenders — also checked in signIn callback)
        const rateCheck = checkRateLimit(normalizedEmail);
        if (!rateCheck.allowed) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          incrementAttempts(normalizedEmail);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.passwordHash,
        );
        if (!isPasswordValid) {
          incrementAttempts(normalizedEmail);
          return null;
        }

        // Successful login — reset rate limit
        resetAttempts(normalizedEmail);

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // Rate limit check in signIn callback (for redirect-based error flow)
    // When this throws, NextAuth redirects to pages.error with ?error=<message>
    async signIn({ user, account }) {
      if (account?.provider !== "credentials" || !user?.email) {
        return true;
      }

      const identifier = user.email.toLowerCase().trim();
      const rateCheck = checkRateLimit(identifier);

      if (!rateCheck.allowed) {
        const minutes = Math.ceil(
          (rateCheck.retryAfter.getTime() - Date.now()) / 60000
        );
        throw new Error(
          `Too many login attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`
        );
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
