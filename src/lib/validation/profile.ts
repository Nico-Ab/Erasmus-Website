import { UserRole } from "@prisma/client";
import { z } from "zod";
import type { AppLocale } from "@/lib/i18n/config";

function getProfileValidationMessages(locale: AppLocale) {
  if (locale === "bg") {
    return {
      firstNameRequired: "Името е задължително",
      firstNameMax: "Името трябва да е до 80 знака",
      lastNameRequired: "Фамилията е задължителна",
      lastNameMax: "Фамилията трябва да е до 80 знака",
      emailRequired: "Имейлът е задължителен",
      emailInvalid: "Въведете валиден имейл адрес",
      academicTitleRequired: "Академичната титла е задължителна",
      facultyRequired: "Факултетът е задължителен за staff акаунти",
      departmentRequiresFaculty: "Изберете факултет, преди да изберете катедра"
    };
  }

  return {
    firstNameRequired: "First name is required",
    firstNameMax: "First name must be 80 characters or fewer",
    lastNameRequired: "Last name is required",
    lastNameMax: "Last name must be 80 characters or fewer",
    emailRequired: "Email is required",
    emailInvalid: "Enter a valid email address",
    academicTitleRequired: "Academic title is required",
    facultyRequired: "Faculty is required for staff accounts",
    departmentRequiresFaculty: "Select a faculty before choosing a department"
  };
}

export function createProfileSchema(role: UserRole, locale: AppLocale = "en") {
  const messages = getProfileValidationMessages(locale);
  const profileShape = {
    firstName: z.string().trim().min(1, messages.firstNameRequired).max(80, messages.firstNameMax),
    lastName: z.string().trim().min(1, messages.lastNameRequired).max(80, messages.lastNameMax),
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    academicTitleOptionId: z.string().trim().min(1, messages.academicTitleRequired),
    facultyId: z.string().trim(),
    departmentId: z.string().trim()
  } satisfies z.ZodRawShape;
  const profileSchemaBase = z.object(profileShape);

  return profileSchemaBase.superRefine((value, context) => {
    if (role === UserRole.STAFF && value.facultyId.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["facultyId"],
        message: messages.facultyRequired
      });
    }

    if (value.departmentId.length > 0 && value.facultyId.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["departmentId"],
        message: messages.departmentRequiresFaculty
      });
    }
  });
}

export const profileSchema = createProfileSchema(UserRole.STAFF);

export type ProfileInput = {
  firstName: string;
  lastName: string;
  email: string;
  academicTitleOptionId: string;
  facultyId: string;
  departmentId: string;
};
