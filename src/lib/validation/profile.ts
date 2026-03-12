import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80, "First name must be 80 characters or fewer"),
  lastName: z.string().trim().min(1, "Last name is required").max(80, "Last name must be 80 characters or fewer"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  academicTitleOptionId: z.string().trim().min(1, "Academic title is required"),
  facultyId: z.string().trim().min(1, "Faculty is required"),
  departmentId: z.string().trim().min(1, "Department is required")
});

export type ProfileInput = z.infer<typeof profileSchema>;