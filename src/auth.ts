import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserApprovalStatus, UserRole } from "@prisma/client";
import { authErrorCodes } from "@/lib/auth/error-codes";
import {
  AccountDeactivatedError,
  AccountRejectedError,
  InvalidCredentialsError,
  PendingApprovalError
} from "@/lib/auth/errors";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { authenticateCredentials } from "@/lib/auth/service";
import { loginSchema } from "@/lib/validation/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  trustHost: env.trustHost,
  secret: env.AUTH_SECRET,
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      name: "University account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          throw new InvalidCredentialsError();
        }

        const result = await authenticateCredentials(parsed.data);

        if (result.status === authErrorCodes.pendingApproval) {
          throw new PendingApprovalError();
        }

        if (result.status === authErrorCodes.accountRejected) {
          throw new AccountRejectedError();
        }

        if (result.status === authErrorCodes.accountDeactivated) {
          throw new AccountDeactivatedError();
        }

        if (result.status !== "approved") {
          throw new InvalidCredentialsError();
        }

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          status: result.user.status
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.status = user.status;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, status: true }
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
        } else {
          token.role = UserRole.STAFF;
          token.status = UserApprovalStatus.DEACTIVATED;
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as UserRole | undefined) ?? UserRole.STAFF;
        session.user.status =
          (token.status as UserApprovalStatus | undefined) ?? UserApprovalStatus.PENDING;
      }

      return session;
    }
  }
});