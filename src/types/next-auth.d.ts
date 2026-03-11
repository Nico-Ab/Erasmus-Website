import { UserApprovalStatus, UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      status: UserApprovalStatus;
    };
  }

  interface User {
    role?: UserRole;
    status?: UserApprovalStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    status?: UserApprovalStatus;
  }
}
