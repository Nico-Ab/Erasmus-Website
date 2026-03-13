import { UserRole } from "@prisma/client";
import { z } from "zod";

export const adminUserActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve")
  }),
  z.object({
    action: z.literal("reject"),
    confirmationText: z.string().trim().min(1, "Type the user's email to confirm rejection.")
  }),
  z.object({
    action: z.literal("changeRole"),
    role: z.nativeEnum(UserRole),
    confirmationText: z.string().trim().min(1, "Type the user's email to confirm the role change.")
  }),
  z.object({
    action: z.literal("deactivate"),
    confirmationText: z.string().trim().min(1, "Type the user's email to confirm deactivation.")
  })
]);

export type AdminUserActionInput = z.infer<typeof adminUserActionSchema>;