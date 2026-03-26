import { z } from "zod";
import type { AppLocale } from "@/lib/i18n/config";

function getAuthValidationMessages(locale: AppLocale) {
  if (locale === "bg") {
    return {
      emailRequired: "Имейлът е задължителен",
      emailInvalid: "Въведете валиден имейл адрес",
      passwordRequired: "Паролата е задължителна",
      passwordMinLogin: "Паролата трябва да е поне 8 символа",
      passwordMinRegister: "Паролата трябва да е поне 12 символа",
      confirmPasswordRequired: "Потвърдете паролата си",
      passwordsMatch: "Паролите трябва да съвпадат",
      firstNameRequired: "Името е задължително",
      lastNameRequired: "Фамилията е задължителна"
    };
  }

  return {
    emailRequired: "Email is required",
    emailInvalid: "Enter a valid email address",
    passwordRequired: "Password is required",
    passwordMinLogin: "Password must be at least 8 characters",
    passwordMinRegister: "Password must be at least 12 characters",
    confirmPasswordRequired: "Please confirm your password",
    passwordsMatch: "Passwords must match",
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required"
  };
}

export function createLoginSchema(locale: AppLocale = "en") {
  const messages = getAuthValidationMessages(locale);

  return z.object({
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z
      .string()
      .min(1, messages.passwordRequired)
      .min(8, messages.passwordMinLogin)
  });
}

export function createRegistrationSchema(locale: AppLocale = "en") {
  const messages = getAuthValidationMessages(locale);

  return z
    .object({
      firstName: z.string().trim().min(1, messages.firstNameRequired).max(80),
      lastName: z.string().trim().min(1, messages.lastNameRequired).max(80),
      email: z
        .string()
        .trim()
        .min(1, messages.emailRequired)
        .email(messages.emailInvalid),
      password: z
        .string()
        .min(1, messages.passwordRequired)
        .min(12, messages.passwordMinRegister),
      confirmPassword: z.string().min(1, messages.confirmPasswordRequired)
    })
    .refine((value) => value.password === value.confirmPassword, {
      path: ["confirmPassword"],
      message: messages.passwordsMatch
    });
}

export const loginSchema = createLoginSchema();
export const registrationSchema = createRegistrationSchema();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
